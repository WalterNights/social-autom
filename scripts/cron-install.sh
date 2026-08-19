#!/usr/bin/env bash
# Instala las dos tareas programadas. Idempotente: reemplaza las suyas y deja
# intactas las demás líneas del crontab.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
MARCA="# linkedin-ops"

# La hora es local. setup-vps.sh deja el servidor en America/Bogota justamente
# para no tener que traducir a UTC aquí, que es donde se cuelan los errores.
NUEVAS="$(cat <<CRON
$MARCA
# cron arranca con un PATH minimo. Sin esta linea npm no se encuentra: la tarea
# falla en silencio a las 7:30 y nadie se entera hasta ver el feed vacio.
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
$MARCA publicar — lunes, miércoles y viernes a las 7:30
30 7 * * 1,3,5 $RAIZ/scripts/publicar.sh >> $RAIZ/publish.log 2>&1
$MARCA vigilar el vencimiento del token — a diario
0 8 * * * cd $RAIZ && npm run token -- --avisar >> $RAIZ/publish.log 2>&1
CRON
)"

actual="$(crontab -l 2>/dev/null | grep -v "$MARCA" | grep -v "$RAIZ/scripts/publicar.sh" | grep -v "npm run token" || true)"
printf '%s\n%s\n' "$actual" "$NUEVAS" | grep -v '^$' | crontab -

echo "Cron instalado. Zona horaria del servidor: $(timedatectl show -p Timezone --value 2>/dev/null || date '+%Z')"
echo
crontab -l | grep -A1 "$MARCA"
