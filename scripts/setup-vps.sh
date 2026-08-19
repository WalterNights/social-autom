#!/usr/bin/env bash
# Instala el proyecto en un VPS Ubuntu. Idempotente: se puede volver a correr.
#
#   sudo bash scripts/setup-vps.sh
#
# No toca .env ni .tokens.json: esos los creas tú a mano (ver el README).
set -euo pipefail

REPO="${REPO:-https://github.com/WalterNights/social-autom.git}"
DESTINO="${DESTINO:-/opt/linkedin-ops}"
USUARIO="${USUARIO:-$(logname 2>/dev/null || echo root)}"
ZONA="${ZONA:-America/Bogota}"

log() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Córrelo como root: sudo bash $0"; exit 1; }

log "Zona horaria"
# Con la zona del servidor en Bogotá, el cron se escribe en hora local y se
# acaba la aritmética mental de UTC, que es donde se cometen los errores.
timedatectl set-timezone "$ZONA"
echo "  $(timedatectl show -p Timezone --value) · ahora son las $(date '+%H:%M')"

log "Paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ca-certificates

log "Node 22 o superior"
necesita_node=1
if command -v node >/dev/null 2>&1; then
  mayor="$(node -v | sed 's/^v//; s/\..*//')"
  [ "$mayor" -ge 22 ] && necesita_node=0 && echo "  ya está $(node -v)"
fi
if [ "$necesita_node" -eq 1 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
  echo "  instalado $(node -v)"
fi

log "Código"
if [ -d "$DESTINO/.git" ]; then
  git -C "$DESTINO" fetch --quiet origin
  git -C "$DESTINO" merge --ff-only origin/master
  echo "  actualizado en $DESTINO"
else
  git clone --quiet "$REPO" "$DESTINO"
  echo "  clonado en $DESTINO"
fi
chown -R "$USUARIO":"$USUARIO" "$DESTINO"

log "Dependencias"
sudo -u "$USUARIO" npm --prefix "$DESTINO" ci --silent

log "Chromium para Playwright"
# --with-deps trae las librerías de sistema; sin ellas el navegador no arranca
# y el fallo aparece recién el día que toca renderizar.
sudo -u "$USUARIO" npx --prefix "$DESTINO" playwright install --with-deps chromium

log "Listo"
cat <<FIN

  Falta lo único que no puede hacer este script, porque son tus credenciales:

    1. Crea $DESTINO/.env  (copia .env.example y llena los valores)
    2. Copia tu .tokens.json, o corre la autorización con un túnel SSH
    3. chmod 600 $DESTINO/.env $DESTINO/.tokens.json

  Luego comprueba, sin publicar nada:

    cd $DESTINO && npm run token && npm run next

  Y cuando eso responda bien, instala el cron:

    bash scripts/cron-install.sh

FIN
