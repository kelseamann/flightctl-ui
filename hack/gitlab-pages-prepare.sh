#!/usr/bin/env sh
# Copy standalone webpack output into GitLab Pages artifact directory (public/).
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="${ROOT}/apps/standalone/dist"
PUBLIC="${ROOT}/public"
ASSET_PATH="${ASSET_PATH:-/${CI_PROJECT_NAME:-rhem-current-state}/}"

if [ ! -d "${DIST}" ]; then
  echo "error: ${DIST} not found — run the UI production build first" >&2
  exit 1
fi

rm -rf "${PUBLIC}"
mkdir -p "${PUBLIC}"
cp -a "${DIST}/." "${PUBLIC}/"

# RHEM fork: prefer branded entry HTML when present.
if [ -f "${PUBLIC}/index-rhem.html" ]; then
  cp "${PUBLIC}/index-rhem.html" "${PUBLIC}/index.html"
fi

# SPA client-side routes (GitLab Pages serves 404.html for unknown paths).
cp "${PUBLIC}/index.html" "${PUBLIC}/404.html"

# Subpath hosting: fix <base href> for non-root Pages URLs.
if [ "${ASSET_PATH}" != "/" ]; then
  for html in "${PUBLIC}/index.html" "${PUBLIC}/404.html"; do
    sed \
      -e "s|<base href=\"/\">|<base href=\"${ASSET_PATH}\">|g" \
      -e "s|href=\"/images|href=\"${ASSET_PATH}images|g" \
      "${html}" > "${html}.tmp"
    mv "${html}.tmp" "${html}"
  done
fi

touch "${PUBLIC}/.nojekyll"
echo "Prepared GitLab Pages artifact in ${PUBLIC} (ASSET_PATH=${ASSET_PATH})"
