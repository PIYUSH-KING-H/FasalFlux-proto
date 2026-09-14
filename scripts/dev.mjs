import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const apiServer = path.join(root, 'mock-api', 'server.mjs');

const children = [];

function startNode(script, label) {
  const child = spawn(process.execPath, [script], {
    cwd: root,
    stdio: 'inherit',
    windowsHide: false,
    env: { ...process.env },
  });
  children.push({ child, label });
  child.on('error', (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
    shutdown(1);
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (signal || code !== 0) {
      console.error(`[${label}] stopped unexpectedly.`);
      shutdown(code ?? 1);
    }
  });
  return child;
}

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { child } of children) {
    if (!child.killed) child.kill();
  }
  setTimeout(() => process.exit(code), 100);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => {
  for (const { child } of children) {
    if (!child.killed) child.kill();
  }
});

startNode(apiServer, 'mock-api');
startNode(viteCli, 'vite');
