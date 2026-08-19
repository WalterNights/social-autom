# Project context

_Última actualización: 2026-08-19 — el sistema publica solo. Primera publicación automática por cron completada de punta a punta._

## Current focus

**El objetivo está cumplido:** el VPS publica solo, tres veces por semana, y avisa
por Telegram si algo falla. Lo que queda es opcional (el deploy por Actions) o
editorial (los 6 avisos del linter).

## State of the tree

- Branch: `master`. Local, GitHub y VPS sincronizados.
- Remoto: `git@github-social:WalterNights/social-autom.git`, **repositorio público**
  por decisión explícita del usuario (se le advirtió que expone los posts antes de
  publicarse; lo quiere como portafolio).
- **Dos deploy keys, ambas con escritura.** Una desde Windows
  (`~/.ssh/id_ed25519_social`, alias `github-social`) y otra desde el VPS
  (`/root/.ssh/id_github`), que es la que usa el servidor para empujar el estado
  tras publicar. Cada máquina con la suya: revocar una no toca la otra.

## El despliegue, tal como quedó

- **VPS Ubuntu 25.10, acceso root**, proyecto en `/opt/linkedin-ops`.
- **Zona horaria del servidor en `America/Bogota`**, a propósito: así el cron se
  escribe en hora local y desaparece la traducción a UTC, que es donde se cometen
  los errores.
- **Cron** (`scripts/cron-install.sh`, idempotente):
  - `30 7 * * 1,3,5` → `scripts/publicar.sh`
  - `0 8 * * *` → `npm run token -- --avisar`
  - Con una línea `PATH=` explícita: cron arranca con un entorno mínimo y sin ella
    `npm` no se encuentra.
- **`.env` y `.tokens.json` se crearon a mano en el servidor** (con `nano`), con
  permisos 600. Nunca se versionan.
- **Playwright funciona** pese a avisar de que Ubuntu 25.10 no está soportado
  oficialmente: baja la compilación de 24.04 y renderiza las 9 tarjetas sin
  problema. Verificado en el servidor.

## Recent work

- **Sistema completo funcionando y verificado en producción.** El post 02 se
  publicó por cron, el servidor commiteó el estado y lo empujó a GitHub solo.
- **Se adelantó la cola 7 días.** El post 01 salió el 17/08 como prueba, pero la
  cola estaba fechada suponiendo arranque el 24, lo que dejaba 9 días de hueco y
  rompía la cadencia L/X/V. Al restar 7 días exactos ningún post cambia de día de
  la semana, y como efecto secundario la serie termina antes del corte del token.
- **Dos bugs de plataforma Windows→Linux, ambos ya con guardia:**
  - Los `.sh` estaban guardados como `100644` porque en Windows `core.fileMode` es
    `false` y el `chmod +x` nunca llegó al índice. El cron murió con "Permission
    denied". Ahora el CI falla si algún `.sh` no está en `100755`.
  - `parsePost` reventaba tras cada publicación: al traerse el post con `pull`,
    `core.autocrlf` lo dejaba en CRLF y el delimitador de cierre `---\r` no
    coincidía. Se tolera CRLF y se añadió `.gitattributes` con `eol=lf`.
- **CI en GitHub Actions**: lint, render de las 9 imágenes, comprobación de que
  son 1080×1080 y de que los scripts son ejecutables.

## Active decisions

- **Telegram, no WhatsApp.** Meta solo permite mensajes libres dentro de una
  ventana de 24 h que abre el usuario; un cron a las 7:30 cae fuera, así que cada
  aviso necesitaría plantilla aprobada, número dedicado y cuenta de Meta Business.
- **El VPS commitea y empuja lo que publica.** No es cosmético: sin ese commit el
  repo diría `ready` para un post que ya salió, y el siguiente `pull` chocaría.
  Si el push falla, `publicar.sh` avisa por Telegram.
- **El deploy usa `merge --ff-only`, nunca `reset --hard`.** Si el servidor tiene
  una publicación sin empujar, el deploy debe fallar, no pisarla.
- **Los avisos viven en `src/lib/telegram.js`, no en `publish.js`.** `publish.js`
  tiene código de nivel superior: **publica con solo importarlo**. No importar
  nada de ahí.
- **`ESTADO.md` es un reflejo, no un registro.** La verdad vive en el frontmatter
  de cada post. Si discrepan, gana el post.
- **Un aviso que falla debe salir con código 1.** Un `exit 0` cuando el mensaje no
  salió significa "todo bien" en el log del cron, y es justo el caso en que nadie
  se enteró.
- **El `#` no se escapa al publicar.** Verificado contra la doc y contra dos
  publicaciones reales.
- **Sin refresh token.** Son solo para partners; hay que repetir `npm run auth`.

## Next steps

1. Terminar el deploy por Actions **si se quiere**: faltan los cinco secretos
   `VPS_HOST`, `VPS_USER`, `VPS_PATH`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`. El
   secreto `ENV_FILE` ya existe y el workflow lo usa para escribir el `.env`.
   Es comodidad: sin esto, actualizar el servidor es un `git pull`.
2. Atender los 6 avisos del linter (cinco líneas de 3–4 frases, un post con tres
   tipos de marcador). Son reales, no ruido; no silenciarlos tocando el linter.
3. Endurecer el SSH del VPS (desactivar login por contraseña) ahora que las claves
   funcionan. El repo es público y describe qué corre en ese servidor.

## Open questions / blockers

- Ninguno bloquea la publicación. El sistema funciona sin intervención.
- **El enlace de re-autenticación no serviría desde el celular** tal como está: el
  `state` solo existe mientras corre `auth.js`, y el redirect apunta a
  `localhost`. Haría falta un subdominio con HTTPS sobre el VPS. Con las fechas
  actuales **no hace falta renovar durante la serie**, así que dejó de ser urgente.

## Fechas que importan

- **Serie: 17/08 → 09/10**, lunes/miércoles/viernes.
- Publicados: **01** (17/08, a mano) y **02** (19/08, primer cron automático).
  Siguiente: **03 el viernes 21/08**.
- **El token vence el 16/10 y el publicador corta el 11/10.** La serie termina el
  09/10, así que **ningún post queda en riesgo**. El aviso de Telegram saltaría
  igual hacia el 01/10.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run estado` | Regenera `ESTADO.md` |
| `npm run token` | Días que le quedan al acceso y qué posts peligran |
| `npm run token -- --avisar` | Solo escribe a Telegram si urge. Para el cron |
| `npm run next` | Vista previa de lo que toca. No publica |
| `npm run publish -- --slug X` | Publica uno concreto. **Ojo:** sin el `--`, npm se traga el flag |

En el servidor, el log de todo está en `/opt/linkedin-ops/publish.log`.

Variables de `.env`: las de LinkedIn, más `TG_BOT_TOKEN`, `TG_CHAT_ID` y la
opcional `TOKEN_AVISO_DIAS` (por defecto 10). **No poner `TOKEN_AVISO_DIAS` en el
`.env` del servidor**: forzaría el aviso a diario y se acabaría ignorando.

## Pointers

- [CLAUDE.md](CLAUDE.md) — reglas duras: nunca publicar por cuenta propia, no
  editar posts publicados, convención de commits.
- [scripts/publicar.sh](scripts/publicar.sh) — lo que llama el cron.
- [scripts/setup-vps.sh](scripts/setup-vps.sh) — instalación del servidor, idempotente.
- [src/lib/telegram.js](src/lib/telegram.js) — avisos. Reutilizable sin riesgo.
- [src/publish.js](src/publish.js) — publicador. **Publica al importarlo.**
- [src/lib/rules.js](src/lib/rules.js) — reglas editoriales, compartidas por el
  linter y el publicador. Si cambia una regla, se cambia solo ahí.
- [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
  · [little text format](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format)
