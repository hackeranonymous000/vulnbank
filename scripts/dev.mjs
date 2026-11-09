#!/usr/bin/env node
/**
 * VulnBank dev runner — starts the API and the Vite frontend together.
 *
 *   API  → http://localhost:8823/api   (internal)
 *   App  → http://localhost:8822       (single public port, /api proxied)
 *
 * Developed by Alexis. Intentionally vulnerable: local use only.
 */
import { spawn } from "node:child_process";

const requestedAppPort = Number(process.env.PORT ?? 0);
const APP_PORT = String(requestedAppPort > 0 ? requestedAppPort : 8822);
const requestedApiPort = Number(process.env.API_PORT ?? 0);
const API_PORT = String(requestedApiPort > 0 ? requestedApiPort : 8823);
const isWindows = process.platform === "win32";

const children = [];

function start(name, args, color) {
  const child = spawn(isWindows ? "pnpm.cmd" : "pnpm", args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: { ...process.env, PORT: APP_PORT, API_PORT, NODE_ENV: "development" },
    shell: isWindows,
  });

  const write = (stream, chunk) => {
    const text = chunk.toString();
    for (const line of text.split(/\r?\n/)) {
      if (line.trim()) stream.write(`${color}[${name}]\x1b[0m ${line}\n`);
    }
  };

  child.stdout.on("data", (chunk) => write(process.stdout, chunk));
  child.stderr.on("data", (chunk) => write(process.stderr, chunk));
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\x1b[31m[${name}] exited with code ${code}\x1b[0m`);
    }
  });

  children.push(child);
  return child;
  
}

console.log(
  `\x1b[36mVulnBank testbed\x1b[0m — app on \x1b[1mhttp://localhost:${APP_PORT}\x1b[0m, api on port ${API_PORT}`,
);

start("api", ["--filter", "@workspace/api-server", "run", "dev"], "\x1b[35m");
start("web", ["--filter", "@workspace/fintech-app", "run", "dev"], "\x1b[36m");

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
