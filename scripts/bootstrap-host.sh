#!/bin/sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo sh scripts/bootstrap-host.sh" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ "$ROOT" != "/opt/ev-garage" ]; then
  echo "Place the GitHub checkout at /opt/ev-garage and run this script from there." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl git
  curl -fsSL https://get.docker.com | sh
fi

if ! id deploy >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash deploy
fi
usermod -aG docker deploy

install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
if [ ! -f /home/deploy/.ssh/authorized_keys ]; then
  touch /home/deploy/.ssh/authorized_keys
  chown deploy:deploy /home/deploy/.ssh/authorized_keys
  chmod 600 /home/deploy/.ssh/authorized_keys
fi

if [ ! -f /root/ev-garage-ci ]; then
  ssh-keygen -t ed25519 -f /root/ev-garage-ci -N "" -C "ev-garage-ci"
fi
grep -qxF "$(cat /root/ev-garage-ci.pub)" /home/deploy/.ssh/authorized_keys || cat /root/ev-garage-ci.pub >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /opt/ev-garage
chmod 755 /opt/ev-garage

if [ ! -f /opt/ev-garage/.env ]; then
  cp /opt/ev-garage/.env.example /opt/ev-garage/.env
  chown deploy:deploy /opt/ev-garage/.env
  chmod 600 /opt/ev-garage/.env
fi

echo
echo "1. GitHub → Settings → Secrets and variables → Actions."
echo "   SSH_USER=deploy"
echo "   SSH_HOST=<this server public IP>"
echo "   SSH_PRIVATE_KEY is the file /root/ev-garage-ci"
echo "   SSH_KNOWN_HOSTS: on your computer run  ssh-keyscan -H <this server public IP>"
echo
echo "2. Edit /opt/ev-garage/.env: real POSTGRES_PASSWORD, the same password inside DATABASE_URL, ADMIN_PASSWORD, SITE_ADDRESS."
echo "   DATABASE_URL host name inside compose is postgres, not 127.0.0.1."
echo "3. Push to main. GitHub Actions builds the image and the server pulls it."
echo "4. Delete /root/ev-garage-ci after the private key is saved in GitHub."
