#!/bin/sh
# Does this repository actually work as a Claude Code marketplace?
#
# Everything happens in a throwaway CLAUDE_CONFIG_DIR, so the person's own Claude Code is not
# touched. What is checked is the path a newcomer walks: add the marketplace, install the plugin,
# see the skill in the plugin's inventory, and see it reach the model.
#
# Run it from anywhere:  sh check.sh

set -eu

repo=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

CLAUDE_CONFIG_DIR="$work/claude"
mkdir -p "$CLAUDE_CONFIG_DIR"
export CLAUDE_CONFIG_DIR

fail() {
  echo "FAILED: $1" >&2
  exit 1
}

echo "1. the manifests"
claude plugin validate "$repo" >"$work/validate.txt" 2>&1 || fail "the marketplace manifest is not valid
$(cat "$work/validate.txt")"
claude plugin validate "$repo/plugins/nido" --profile directory >"$work/validate.txt" 2>&1 ||
  fail "the plugin would be refused by the plugin directory
$(cat "$work/validate.txt")"

echo "2. the marketplace and the install"
claude plugin marketplace add "$repo" >"$work/add.txt" 2>&1 || fail "claude would not add the marketplace
$(cat "$work/add.txt")"
grep -q 'nido-claude-code' "$work/add.txt" || fail "the marketplace is not called nido-claude-code
$(cat "$work/add.txt")"
claude plugin install nido@nido-claude-code >"$work/install.txt" 2>&1 || fail "the plugin would not install
$(cat "$work/install.txt")"

echo "3. the skill in the plugin"
claude plugin details nido@nido-claude-code >"$work/details.txt" 2>&1 || fail "claude plugin details did not run
$(cat "$work/details.txt")"
grep -q 'Skills (1) *nido' "$work/details.txt" || fail "the plugin does not carry the nido skill
$(cat "$work/details.txt")"

echo "4. the model is offered the skill"
# Installed is not offered. This asks Claude Code itself, through a throwaway local endpoint, so no
# account is used and no tokens are spent.
node "$repo/scripts/skill-offered.mjs" nido:nido ||
  fail "Claude Code does not put the nido skill in front of the model"

echo
echo "All four passed."
