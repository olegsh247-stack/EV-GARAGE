#!/bin/sh
set -eu
cd "$(dirname "$0")/.."

if [ -n "${1:-}" ]; then
  IMAGE_TAG="$1"
fi

if [ -z "${IMAGE_TAG:-}" ]; then
  echo "IMAGE_TAG is required: sh scripts/deploy-host.sh <git-sha>" >&2
  exit 1
fi

case "$IMAGE_TAG" in
  *[!0-9a-fA-F]*)
    echo "IMAGE_TAG must be a git commit sha" >&2
    exit 1
    ;;
esac

if [ ! -f .env ]; then
  echo ".env is missing. Copy .env.example to .env and set the passwords." >&2
  exit 1
fi

if grep -q '^ADMIN_PASSWORD=change-me$' .env || grep -q '^POSTGRES_PASSWORD=ev$' .env; then
  echo ".env still has example passwords. Set ADMIN_PASSWORD and POSTGRES_PASSWORD before deploying." >&2
  exit 1
fi

if [ -n "${GHCR_TOKEN:-}" ]; then
  if [ -z "${GHCR_USER:-}" ]; then
    echo "GHCR_USER is required when GHCR_TOKEN is set" >&2
    exit 1
  fi
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
fi

export IMAGE_TAG
docker compose --profile full pull app
docker compose --profile full up -d --no-build

i=0
while [ "$i" -lt 40 ]; do
  if curl -fsS "http://127.0.0.1:${APP_PORT:-3000}/api/brands" >/dev/null; then
    echo "ev-garage is up"
    exit 0
  fi
  i=$((i + 1))
  sleep 3
done

echo "ev-garage did not answer /api/brands in time" >&2
docker compose --profile full logs --tail 80 app >&2 || true
exit 1
