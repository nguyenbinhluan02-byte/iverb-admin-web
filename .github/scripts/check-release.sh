#!/usr/bin/env bash
# Guards a production deploy. Usage: check-release.sh <branch> <confirmed version>
#
#   - branch must be release/vX.Y.Z
#   - the typed confirmation must equal that version exactly
#   - vX.Y.Z must not be older than the current production release
#     (highest `prod-vX.Y.Z` tag), and the branch must contain that release
#     so no migration already on production is missing.
#
# Prints the version on stdout; also writes version=… to $GITHUB_OUTPUT on CI.
set -euo pipefail

fail() {
  echo "::error::$1" >&2
  exit 1
}

branch="${1:-}"
confirm="${2:-}"

[[ "$branch" =~ ^release/(v[0-9]+\.[0-9]+\.[0-9]+)$ ]] ||
  fail "Production deploys only run from a release/vX.Y.Z branch (got '$branch')."
version="${BASH_REMATCH[1]}"

[[ "$confirm" == "$version" ]] ||
  fail "Typed version '$confirm' does not match the branch version '$version'."

current="$(git tag --list 'prod-v*' | sed 's/^prod-//' | sort -V | tail -n 1)"
if [[ -n "$current" ]]; then
  older="$(printf '%s\n%s\n' "$current" "$version" | sort -V | head -n 1)"
  [[ "$older" == "$current" ]] ||
    fail "$version is older than the current production release $current."
  git merge-base --is-ancestor "prod-$current" HEAD ||
    fail "release/$version does not contain prod-$current. Merge it into the branch first."
  echo "Current production release: $current" >&2
else
  echo "No production release yet (no prod-v* tag)." >&2
fi

[[ -n "${GITHUB_OUTPUT:-}" ]] && echo "version=$version" >> "$GITHUB_OUTPUT"
echo "$version"
