const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const config = require('./capture-config.json');
const sessions = path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'sessions');
const output = path.join(root, '.agent-logs');
const runtime = path.join(root, '.capture-runtime');
const normalize = p => path.resolve(p).toLowerCase();
const seen = new Map();
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(runtime, { recursive: true });

function* files(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(name);
    else if (name.endsWith('.jsonl')) yield name;
  }
}

function extract(source) {
  const stat = fs.statSync(source);
  const fingerprint = `${stat.size}:${stat.mtimeMs}`;
  if (seen.get(source) === fingerprint) return;
  const raw = fs.readFileSync(source, 'utf8');
  // Ignore a partially written last record; pick it up on the next poll.
  const rows = raw.slice(0, raw.lastIndexOf('\n')).split('\n').filter(Boolean).map(JSON.parse);
  const meta = rows.find(r => r.type === 'session_meta')?.payload;
  if (!meta || !meta.cwd || normalize(meta.cwd) !== normalize(root)) return;
  // Internal review threads are not user conversations.
  if (meta.parent_thread_id || typeof meta.source === 'object' || (meta.thread_source && meta.thread_source !== 'user')) return;
  const id = meta.id || meta.session_id;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error('Invalid session id');
  let model = rows.find(r => r.type === 'turn_context')?.payload.model;
  if (!model) return;
  const initialModel = model;
  let count = 0;
  const entries = [];
  const prompts = [];
  for (const row of rows) {
    if (row.type === 'turn_context' && row.payload.model) model = row.payload.model;
    if (row.type !== 'event_msg') continue;
    let event = row.payload;
    if (event.type === 'item_completed') {
      const item = event.item;
      if (item.type === 'UserMessage') event = { type: 'user_message', message: item.content.filter(c => c.type.toLowerCase() === 'text').map(c => c.text).join('\n') };
      else if (item.type === 'AgentMessage') event = { type: 'agent_message', message: item.content.filter(c => c.type.toLowerCase() === 'text').map(c => c.text).join('\n'), phase: item.phase };
    }
    if (event.type === 'user_message') {
      count++;
      prompts.push(row.timestamp);
      entries.push({ type: 'PROMPT', num: count, timestamp: row.timestamp, model, text: event.message });
    } else if (event.type === 'agent_message' && ['final', 'final_answer'].includes(event.phase) && count) {
      entries.push({ type: 'RESPONSE', num: count, timestamp: row.timestamp, model, text: event.message });
    }
  }
  if (!entries.length) return;
  const date = meta.timestamp.slice(0, 10);
  const short = id.slice(0, 8);
  const stamp = meta.timestamp.slice(0, 19).replace('T', '_').replace(/:/g, '-');
  const destination = path.join(output, `${stamp}_${id}.md`);
  const tool = meta.originator || 'codex';
  const header = `---\nsession_id: ${id}\ndate: ${date}\nauthor: ${config.author}\nmodel: ${initialModel}\ntool: ${tool}\nproject: ${config.project}\ntotal_exchanges: ${count}\nfirst_prompt_time: ${prompts[0]}\nlast_prompt_time: ${prompts.at(-1)}\n---\n\n# Session Log - ${date}\n\nSession: \`${short}\` | Project: \`${config.project}\` | Author: \`${config.author}\`\n\n---\n\n`;
  const body = entries.map(e => `[LOG_ENTRY type=${e.type} num=${e.num} session=${short}]\ntimestamp: ${e.timestamp}\nmodel: ${e.model}\n\n${e.text}\n\n\n`).join('');
  const content = header + body;
  if (fs.existsSync(destination)) {
    const previous = fs.readFileSync(destination, 'utf8');
    const oldBody = previous.slice(previous.indexOf('[LOG_ENTRY'));
    if (!body.startsWith(oldBody)) throw new Error(`Refusing to change existing entries: ${destination}`);
    if (previous === content) { seen.set(source, fingerprint); return; }
  }
  // Metadata totals are refreshed; existing entry text must remain an exact prefix.
  const temp = destination + '.tmp';
  fs.writeFileSync(temp, content, 'utf8');
  fs.renameSync(temp, destination);
  seen.set(source, fingerprint);
}

function sync() {
  for (const source of files(sessions)) extract(source);
  fs.writeFileSync(path.join(runtime, 'status.json'), JSON.stringify({ pid: process.pid, lastSync: new Date().toISOString(), sessions, root }));
}

if (process.argv.includes('--watch')) {
  const lock = path.join(runtime, 'watcher.pid');
  if (fs.existsSync(lock)) {
    const pid = Number(fs.readFileSync(lock, 'utf8'));
    try { process.kill(pid, 0); process.exit(0); } catch {}
  }
  fs.writeFileSync(lock, String(process.pid));
  const tick = () => { try { sync(); } catch (error) { console.error(new Date().toISOString(), error.stack); } };
  tick();
  setInterval(tick, config.pollIntervalMs);
} else sync();
