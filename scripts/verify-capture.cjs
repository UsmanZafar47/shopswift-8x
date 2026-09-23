const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const status = JSON.parse(fs.readFileSync(path.join(root, '.capture-runtime/status.json'), 'utf8'));
assert(Date.now() - Date.parse(status.lastSync) < 15000, 'Capture watcher must be running');
const logDir = path.join(root, '.agent-logs');
const logs = fs
  .readdirSync(logDir)
  .filter((n) => n.endsWith('.md'))
  .map((name) => ({ name, text: fs.readFileSync(path.join(logDir, name), 'utf8') }));
const canaries = ['one', 'two'].map((number) => {
  const prompt = `CAPTURE TEST — 8x assignment, UsmanZafar47. Reply with exactly: Capture test ${number} received. Do not use tools or change any files.`;
  const response = `Capture test ${number} received.`;
  const log = logs.find(
    (l) =>
      l.text.includes(prompt) &&
      l.text.includes(`[LOG_ENTRY type=RESPONSE`) &&
      l.text.includes(`\n\n${response}\n`),
  );
  assert(log, `Missing completed canary ${number}`);
  const id = log.text.match(/^session_id: (.+)$/m)[1];
  const date = log.text.match(/^date: (.+)$/m)[1].split('-');
  const directory = path.join(status.sessions, ...date);
  const source = fs.readdirSync(directory).find((n) => n.endsWith(`${id}.jsonl`));
  const records = fs
    .readFileSync(path.join(directory, source), 'utf8')
    .trim()
    .split('\n')
    .map(JSON.parse);
  const items = records
    .filter((r) => r.type === 'event_msg' && r.payload.type === 'item_completed')
    .map((r) => r.payload.item);
  assert(
    items.some(
      (i) => i.type === 'UserMessage' && i.content.map((c) => c.text).join('\n') === prompt,
    ),
    'Prompt must match original transcript',
  );
  assert(
    items.some(
      (i) =>
        i.type === 'AgentMessage' &&
        i.phase === 'final_answer' &&
        i.content.map((c) => c.text).join('\n') === response,
    ),
    'Response must match original transcript',
  );
  assert.equal((log.text.match(/\[LOG_ENTRY type=PROMPT/g) || []).length, 1);
  assert.equal((log.text.match(/\[LOG_ENTRY type=RESPONSE/g) || []).length, 1);
  return { ...log, id, raw: log.text.slice(log.text.indexOf('[LOG_ENTRY')) };
});
assert.notEqual(canaries[0].id, canaries[1].id, 'Canaries must use different sessions');
const original = logs.find((l) => l.name.includes('01a0cd0f-b5ba-7131-91d5-91c9af927719'));
assert(
  original?.text.includes('okay so we need to make a clone of amazon.com'),
  'Original user prompt must be captured',
);
assert(
  !original.text.includes('I’ll read the capture setup instructions'),
  'Intermediate commentary must be excluded',
);
assert(
  logs.every((l) => !l.name.includes('01a0cd0f-b656')),
  'Internal approval thread must be excluded',
);
const proof = `# Capture test: PASS\n\nVerified: ${new Date().toISOString()}\n\n- Author: UsmanZafar47 (existing Git identity).\n- Planning and execution model: gpt-6-astra.\n- Main tool: Codex VS Code extension, bundled runtime 0.155.0-alpha.16.\n- Test tool: two independent sessions using that same bundled Codex executable.\n- Mechanism: a hidden Node.js background watcher reads native Codex JSONL sessions every second and exports only user prompts and final assistant responses for this repository. New sessions are discovered automatically. No per-turn manual logging is needed.\n- Configuration added: scripts/capture-config.json. Start command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-capture.ps1. No global Codex configuration was changed.\n- Capture implementation: scripts/capture.cjs; supports legacy user_message/agent_message events and item_completed events. Internal review threads, thinking, tools, and commentary are excluded. UTC timestamps and per-entry model names come from native records.\n- Entries are immutable: exporting refuses to modify an existing entry body. Session header totals are updated as turns arrive.\n- The watcher is currently running. After reboot, restart it with the command above; AGENTS.md requires checking its heartbeat before work. Retained native transcripts are recovered automatically on restart.\n- Both canaries below appeared automatically, and scripts/verify-capture.cjs checked their full text against the native transcripts. They have distinct session IDs.\n\n## Attempts and limitations\n\nThe web browsing tool could not load the assignment page; an HTTPS shell fetch succeeded after network approval. The separately installed Codex CLI 0.149.1 rejected gpt-6-astra because it required a newer client. Its failed prompt remains in .agent-logs/ without an invented response. Tests then used the existing newer VS Code executable, with no model change. Initial extraction handled the editor's legacy events; CLI testing revealed item_completed events, so support was added before verification. A process-inspection command was denied by the local sandbox; the watcher was restarted using its known process ID. Both successful CLI tests printed a terminal rollout-flush warning, but their prompt and final response records exist on disk and were verified.\n\nThis setup captures text prompts and final text replies. Image binaries are not embedded. It does not log other tools such as Cursor or Claude. The original setup prompt is preserved; the main session's final response will be captured automatically when this turn ends and included in the next commit. No product implementation has started.\n\nReferences: [8x setup](https://8x-internal.com/p/8x-agent-capture-setup), [Codex configuration](https://learn.chatgpt.com/docs/config-file/config-reference). Official configuration documents hooks and notify; the already-present native transcripts were selected so the active editor session could be captured immediately.\n\n${canaries.map((c, i) => `## Canary ${i + 1}\n\nLog: [.agent-logs/${c.name}](.agent-logs/${c.name})\n\n\`\`\`text\n${c.raw}\`\`\`\n`).join('\n')}`;
fs.writeFileSync(path.join(root, 'CAPTURE-TEST.md'), proof);
console.log(
  'PASS: two independent real sessions; exact prompts/final replies; automatic watcher active; original prompt retained; commentary and internal review excluded.',
);
