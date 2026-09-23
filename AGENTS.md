# Assignment workflow

Do not build the product until CAPTURE-TEST.md reports two successful real-session canaries.
Capture is performed automatically by scripts/capture.cjs watching native Codex transcripts.
At the beginning of a work session, check .capture-runtime/status.json for a recent heartbeat.
If the watcher is stopped (for example after a reboot), run:
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/start-capture.ps1`
Never manually fabricate, summarize, edit, or delete entries in .agent-logs/.
Commit .agent-logs/ with each meaningful implementation commit. Before committing,
`node scripts/capture.cjs` can flush pending transcript writes; automatic capture must remain running.
Capture configuration is in scripts/capture-config.json. Only this repository's user sessions are exported.
Keep the clone simple, close to Amazon's UI, and suitable for free Vercel deployment.
Wait for the user's build prompt after capture setup.
