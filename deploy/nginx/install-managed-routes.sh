#!/usr/bin/env bash
set -euo pipefail

SOURCE=${1:?pass the managed nginx snippet path}
SNIPPET=/etc/nginx/snippets/damkemon-managed-routes.conf
MARKER='include /etc/nginx/snippets/damkemon-managed-routes.conf;'

SITE=$(sudo grep -RslE 'server_name[^;]*damkemon\.com' \
  /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -n 1 || true)

if [[ -z "$SITE" ]]; then
  echo 'Could not locate the active damkemon.com nginx site configuration.' >&2
  exit 1
fi

SITE=$(readlink -f "$SITE")
BACKUP="${SITE}.before-damkemon-managed-routes"
echo "Installing crawler routes in ${SITE}"

sudo install -d -m 0755 /etc/nginx/snippets
sudo install -m 0644 "$SOURCE" "$SNIPPET"

if ! sudo grep -Fq "$MARKER" "$SITE"; then
  if sudo grep -Eq 'location[[:space:]]+/product/' "$SITE"; then
    echo "${SITE} already has an unmanaged /product/ location; refusing to create a duplicate." >&2
    exit 1
  fi
  if ! sudo grep -Eq '^[[:space:]]*location[[:space:]]+/[[:space:]]*\{' "$SITE"; then
    echo "${SITE} has no SPA location block where the managed include can be installed." >&2
    exit 1
  fi

  sudo cp "$SITE" "$BACKUP"
  sudo sed -i \
    '/^[[:space:]]*location[[:space:]]*\/[[:space:]]*{/i\    include /etc/nginx/snippets/damkemon-managed-routes.conf;' \
    "$SITE"
fi

if ! sudo nginx -t; then
  if [[ -f "$BACKUP" ]]; then
    echo 'nginx validation failed; restoring the previous site configuration.' >&2
    sudo cp "$BACKUP" "$SITE"
    sudo nginx -t
  fi
  exit 1
fi

sudo systemctl reload nginx
echo 'Managed Damkemon crawler routes installed and nginx reloaded.'
