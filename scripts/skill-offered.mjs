// Is the skill actually put in front of the model?
//
// Installed is not offered: a skill can sit in an installed plugin and still never reach the
// model. Claude Code has no command that answers this, so this asks Claude Code itself: it points
// it at a throwaway local endpoint, runs one turn, and reads the request. No model answers, no
// account is used and no tokens are spent — the request is the evidence.
//
// It runs inside the CLAUDE_CONFIG_DIR check.sh has already set up, with the plugin installed.

import { spawn } from "node:child_process";
import { createServer } from "node:http";

const want = process.argv[2] ?? "nido:nido";

if (!process.env.CLAUDE_CONFIG_DIR) {
  console.error("CLAUDE_CONFIG_DIR is not set: run this through check.sh, not on your own Claude Code");
  process.exit(1);
}

let finished = false;
let claude;

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    res.writeHead(500, { "content-type": "application/json" });
    res.end('{"type":"error","error":{"type":"api_error","message":"this endpoint only listens"}}');
    // Claude Code may ask small side questions first; only the main turn carries the tools.
    if (req.url.startsWith("/v1/messages") && body.includes('"tools"')) done(body);
  });
});

const done = (body) => {
  if (finished) return;
  finished = true;
  clearTimeout(giveUp);
  claude.kill("SIGKILL");
  server.close();

  const texts = [];
  const walk = (value) => {
    if (typeof value === "string") texts.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(JSON.parse(body));

  const line = texts.flatMap((text) => text.split("\n")).find((l) => l.includes(want));
  if (!line) {
    console.error(`MISSING: "${want}" is not among the skills Claude Code offers the model`);
    process.exit(1);
  }
  console.log(`   offered: ${line.trim().slice(0, 100)}…`);
  process.exit(0);
};

const giveUp = setTimeout(() => {
  console.error("Claude Code never asked the endpoint anything within 120s");
  claude?.kill("SIGKILL");
  process.exit(1);
}, 120_000);

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  claude = spawn("claude", ["-p", "Run python3 --version in a fresh sandbox.", "--max-turns", "1"], {
    env: { ...process.env, ANTHROPIC_BASE_URL: `http://127.0.0.1:${port}`, ANTHROPIC_API_KEY: "none" },
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  claude.stderr.on("data", (chunk) => (stderr += chunk));
  claude.on("exit", () => {
    if (finished) return;
    clearTimeout(giveUp);
    server.close();
    console.error("Claude Code stopped before it asked the endpoint anything");
    if (stderr.trim()) console.error(stderr.trim().split("\n").slice(-5).join("\n"));
    process.exit(1);
  });
});
