import { spawn } from 'node:child_process';

const procs = [];

function run(cmd, args, name) {
  const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  p.on('exit', (code) => {
    console.log(`[dev] ${name} exited (${code})`);
    shutdown();
  });
  procs.push(p);
  return p;
}

function shutdown() {
  for (const p of procs) {
    if (!p.killed) p.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

run('node', ['server/index.js'], 'ai-proxy');
run('npx', ['vite'], 'vite');
