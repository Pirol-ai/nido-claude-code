# nido for Claude Code

**nido** runs code in isolated sandboxes: each one is a small virtual machine of its own, in the EU,
run by [Pirol](https://pirol.ai). This plugin teaches Claude Code when and how to use them — so you can
say *"try this in a sandbox"* or *"fine-tune this on a GPU"*, and Claude Code creates the sandbox, runs
the work there, copies the results back and cleans up.

Claude Code drives nido the way you would: with the `nido` command line on your computer, as you, with
your account and your budget. Nothing new runs in the background.

## What you need

The **nido command line**, version 0.7.4 or newer (Node 20 or newer), installed and logged in once:

```bash
npm install -g @pirol/nido
nido login
```

`nido login` opens your browser and you confirm with your Pirol account. Claude Code never sees a key.

> **Closed beta.** Sandboxes are open to invited accounts. Ask for access at
> [hello@pirol.ai](mailto:hello@pirol.ai).

## Install

In your terminal:

```bash
claude plugin marketplace add Pirol-ai/nido-claude-code && claude plugin install nido@nido-claude-code
```

Or inside Claude Code:

```
/plugin marketplace add Pirol-ai/nido-claude-code
/plugin install nido@nido-claude-code
```

Start a new session afterwards. The skill is called `nido`; Claude Code uses it on its own when a
task fits, and `/nido` calls it by name.

## Use it

Ask in plain words. A few prompts to start with:

- *"Run the test suite in a nido sandbox, not on my machine."*
- *"Clone this repo into a sandbox and check whether `npm install` runs any install scripts."*
- *"Start Postgres in one sandbox and our API in another, connected, and run the integration tests."*
- *"Fine-tune Qwen2.5-0.5B with LoRA on `data/tickets.jsonl` on an L4 GPU, then bring the adapter back."*
- *"Which sandboxes are still running? Remove the ones from today."*

Claude Code checks that nido is installed and logged in, asks before it installs nido or starts a GPU,
opens only the network hosts and secrets the task needs, and removes the sandboxes it created when
the work is done.

## Let it run nido without asking

Claude Code asks before every shell command. To skip the question for the commands that change
nothing, add them to `permissions.allow` in `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["Bash(nido --version)", "Bash(nido whoami)", "Bash(nido ls)", "Bash(nido logs *)"]
  }
}
```

Allow `Bash(nido *)` only if you are fine with Claude Code creating and removing sandboxes on its
own.

## What it runs, sends and stores

- **Runs:** only the `nido` command on your computer, when Claude Code decides to call it. This
  plugin adds instructions, no server and no background process.
- **Sends:** what you copy into a sandbox with `nido cp` goes to that sandbox, in the EU. What a
  command in the sandbox prints goes back to Claude Code and from there to its model, as with any
  command it runs.
- **Stores:** nothing of its own. nido keeps its login key in `~/.nido/config.json`.
- **Costs:** sandboxes are billed from your Pirol budget while they run; GPUs cost more. Prices:
  [pirol.ai/pricing](https://pirol.ai/pricing#sandboxes).

## The same skill for every agent

The skill in `plugins/nido/skills/nido` is the same in all five nido integrations:
[Claude Code](https://github.com/Pirol-ai/nido-claude-code),
[Codex](https://github.com/Pirol-ai/nido-codex),
[GitHub Copilot](https://github.com/Pirol-ai/nido-copilot),
[OpenCode](https://github.com/Pirol-ai/nido-opencode) and
[Qwen Code](https://github.com/Pirol-ai/nido-qwen-code).
Any other agent that runs shell commands can use it too: copy the folder to wherever it reads
skills.

## Checking it

`sh check.sh` walks the whole path in a throwaway `CLAUDE_CONFIG_DIR`, so your own Claude Code is
not touched: it validates both manifests, adds the marketplace, installs the plugin and then reads
what Claude Code puts in front of the model. That last step points Claude Code at a throwaway local
endpoint, so no account is used and no tokens are spent. It needs `claude` and `node`.
`node --test tests/*.test.mjs` checks the manifests alone and runs on every pull request.

## Support

Questions and problems: [github.com/Pirol-ai/nido-claude-code/issues](https://github.com/Pirol-ai/nido-claude-code/issues).
Documentation: [pirol.ai/docs/sandboxes](https://pirol.ai/docs/sandboxes) ·
Privacy: [pirol.ai/privacy](https://pirol.ai/privacy) · Terms: [pirol.ai/terms](https://pirol.ai/terms)

## License

MIT — see [LICENSE](LICENSE). The licence covers this plugin; the nido command line is licensed
separately.
