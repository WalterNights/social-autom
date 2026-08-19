#!/usr/bin/env bash
# Publica y devuelve el resultado a git. Esto es lo que llama el cron.
#
# El commit no es cosmético: el frontmatter es el registro de qué salió. Si el
# VPS publica y no lo empuja, el repo dice `ready` para algo que ya se publicó,
# y el siguiente `git pull` choca con los cambios locales.
set -uo pipefail

cd "$(dirname "$0")/.."
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

avisar() {
  [ -f .env ] && set -a && . ./.env && set +a
  [ -n "${TG_BOT_TOKEN:-}" ] && [ -n "${TG_CHAT_ID:-}" ] || return 0
  curl -fsS -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -H 'Content-Type: application/json' \
    -d "$(node -e 'console.log(JSON.stringify({chat_id:process.env.TG_CHAT_ID,text:process.argv[1]}))' "$1")" \
    >/dev/null || true
}

echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') ==="

npm run publish
codigo=$?

if [ $codigo -ne 0 ]; then
  # publish.js ya avisó por Telegram con el detalle. Aquí solo se propaga.
  echo "La publicación falló con código $codigo"
  exit $codigo
fi

# Sin cambios que guardar (por ejemplo, hoy no tocaba publicar).
if git diff --quiet -- posts ESTADO.md; then
  echo "Nada que commitear."
  exit 0
fi

git add posts ESTADO.md
git commit -q -m "Publica $(git diff --cached --name-only -- posts | head -1 | xargs -r basename | sed 's/\.md$//')"

if git push -q origin master 2>/dev/null; then
  echo "Estado empujado a origin."
else
  # No es fatal: el post ya salió en LinkedIn y el commit está en el VPS. Pero
  # hay que saberlo, porque el repo queda desactualizado y el próximo deploy
  # se va a encontrar con ramas divergentes.
  echo "AVISO: el post se publicó pero no se pudo empujar el estado a GitHub."
  avisar "⚠️ Se publicó bien, pero el VPS no pudo empujar el estado a GitHub.

El commit está en el servidor sin subir. Revísalo antes del próximo deploy o las ramas van a divergir."
  exit 1
fi
