#!/usr/bin/env bash
set -euo pipefail

repo="mwyuwono/m3-design-v2"
files=("src/styles/tokens.css" "src/styles/main.css" "dist/web-components.js")
variants=("@main" "" "@latest")

for f in "${files[@]}"; do
  for v in "${variants[@]}"; do
    curl -s "https://purge.jsdelivr.net/gh/${repo}${v}/${f}" >/dev/null
  done
done

bundle_url="https://cdn.jsdelivr.net/gh/${repo}@main/dist/web-components.js"
if [[ -n "${VERIFY_SNIPPET:-}" ]]; then
  if command -v rg >/dev/null 2>&1; then
    if curl -s "${bundle_url}" | rg -q "${VERIFY_SNIPPET}"; then
      echo "Verified: ${VERIFY_SNIPPET}"
    else
      echo "Missing: ${VERIFY_SNIPPET}"
      exit 1
    fi
  else
    if curl -s "${bundle_url}" | grep -q "${VERIFY_SNIPPET}"; then
      echo "Verified: ${VERIFY_SNIPPET}"
    else
      echo "Missing: ${VERIFY_SNIPPET}"
      exit 1
    fi
  fi
fi

echo "Purge complete: ${bundle_url}"
