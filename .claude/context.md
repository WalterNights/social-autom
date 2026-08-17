# Project context

_Última actualización: 2026-08-17 — sesión de puesta en marcha: instalación, primera publicación real y arranque de la automatización._

## Current focus

Automatizar la publicación para no correr comandos a mano. El plan acordado es
desplegar en un VPS del usuario (solo backend, sin front), con cron a la hora
agendada y avisos de éxito **y de fallo** por un canal de mensajería. El canal
está sin decidir: se pidió WhatsApp, pero tiene una restricción fuerte (ver
Open questions).

## State of the tree

- Branch: `master`
- Último commit: `1b5b79c` Genera ESTADO.md desde los posts y abre la cola hasta el 4 de septiembre
- Cambios sin commitear: ninguno
- **El repo no tiene remoto.** Existe solo en el disco del usuario. Para desplegar
  por `git pull` hay que subirlo a un repositorio privado primero.

## Recent work

- **Instalación desde cero.** El proyecto venía como `linkedin-ops.tar.gz`; se
  desempacó en la raíz. `npm run lint` da 24 posts · 0 errores · 6 avisos y
  `npm run render` genera 9 PNG de 1080×1080.
- **Dos bugs arreglados que impedían usarlo.** El guard de entrypoint de
  `auth.js` nunca daba true en Windows (`file://` + ruta con backslashes contra
  `import.meta.url`), así que `npm run auth` terminaba en silencio. Y la
  plantilla `lista` desbordaba el lienzo en tres tarjetas: en el post 19 se
  perdía una línea entera del pie.
- **Primera publicación real contra la API** (post 01, `urn:li:share:7495083744874188800`).
  Confirmó que el escapado se comporta como documenta la especificación `little`:
  paréntesis y comillas salen como texto normal, los hashtags quedan como enlaces.
  Hasta ese momento el código contra LinkedIn nunca se había ejecutado.
- **`publish.js` revisado contra la documentación oficial.** Endpoint, payload,
  headers, flujo de imagen y escapado coinciden. Se encontró y corrigió un bug:
  mandaba el slug en `content.media.title`; para imágenes el campo documentado
  es `altText`.

## Active decisions

- **`ESTADO.md` es un reflejo, no un registro.** El usuario propuso un `.md` tipo
  checklist como almacén de estado para evitar una base de datos. Se implementó
  como archivo **generado** desde el frontmatter de los posts, que ya guarda
  `status`, `publishedAt` y `urn` y está versionado en git. Dos fuentes de verdad
  se habrían desincronizado. Si `ESTADO.md` discrepa, gana el post.
- **El `#` no se escapa al publicar.** Está verificado contra la doc y contra una
  publicación real: un `#palabra` sin escapar se convierte en hashtag; escaparlo
  lo mataría. Configurable en `LI_ESCAPE_CHARS`.
- **La app de LinkedIn es propia del proyecto**, no la reutilizada de otro proyecto
  del usuario. Motivo: pedir un scope distinto sobre la misma app invalida los
  access tokens previos, y acopla la rotación del client secret entre proyectos.
- **Sin refresh token.** Confirmado por la doc de Meta: los refresh tokens
  programáticos son solo para partners. `freshTokens()` no puede renovar solo.

## Next steps

1. **Decidir el canal de avisos** (WhatsApp vs Telegram) — bloquea el resto.
2. Recoger los datos del VPS: distro, si hay root, y método de despliegue.
3. Montar el despliegue: cron, aviso de fallo, `.env` y `.tokens.json` en el
   servidor con permisos 600.
4. **Aviso proactivo de vencimiento del token**, con el enlace de autorización,
   varios días antes del corte. Hoy el vencimiento solo se descubre cuando la
   publicación ya falló.
4. Pasar a `ready` los posts del 07 en adelante cuando el usuario quiera.
5. Atender los 6 avisos del linter (cinco líneas de 3–4 frases, un post con tres
   tipos de marcador). Son reales, no ruido; no silenciarlos tocando el linter.

## Open questions / blockers

- **WhatsApp exige plantillas pre-aprobadas.** Meta solo permite mensajes libres
  dentro de una ventana de 24 h que se abre cuando el usuario escribe al número.
  Un cron a las 7:30 a.m. cae fuera de esa ventana, así que cada tipo de aviso
  ("publicado X", "falló Y") necesita una plantilla aprobada, un número dedicado
  distinto del personal, y cuenta de Meta Business. Telegram ya está implementado
  en `publish.js` (`--ask`) y solo necesita `TG_BOT_TOKEN` y `TG_CHAT_ID`.
  **Decisión pendiente del usuario.**
- **El VPS casi seguro corre en UTC.** El cron del README (`30 7 * * 1,3,5`)
  serían las 2:30 a.m. hora Colombia. Colombia es UTC−5 fijo: la línea correcta
  es `30 12 * * 1,3,5`.
- **`npm run auth` necesita un navegador.** No funciona en un VPS headless a secas.
  El usuario decidió que el aviso de re-autenticación llegue por mensajería con el
  enlace, y autorizar él a mano. **Problema:** el redirect actual es
  `http://localhost:5599/callback`; si abre ese enlace en el celular, "localhost"
  es el celular y no hay nada escuchando ahí. Para que funcione desde el teléfono
  hace falta un redirect público con HTTPS apuntando al VPS (dominio o subdominio
  + certificado), registrarlo en la app de LinkedIn, y separar el puerto de
  escucha del redirect en `auth.js`. Alternativa sin dominio: hacerlo desde el
  portátil con túnel SSH.
- **Playwright en el VPS** necesita `npx playwright install --with-deps chromium`,
  que pide root y baja ~115 MB.

## Fechas que importan

- **El access token vence el 16/10/2026.** `freshTokens()` corta 5 días antes, así
  que **desde el 11/10 el publicador falla** y los posts 22, 23 y 24 no saldrían.
  Hay que repetir `npm run auth` antes de esa fecha; hacerlo a finales de
  septiembre deja margen de sobra.
- La cola va del 24/08 al 16/10, lunes/miércoles/viernes. Hoy hay 1 publicado,
  5 en `ready` (hasta el 04/09) y 18 en `draft`.

## Pointers

- [CLAUDE.md](CLAUDE.md) — reglas duras del proyecto: nunca publicar por cuenta
  propia, no editar posts publicados, no migrar el frontmatter a YAML.
- [README.md](README.md) — instalación, comandos y anatomía de un post.
- [ESTADO.md](ESTADO.md) — la cola, generada. `npm run estado` la regenera.
- [src/publish.js](src/publish.js) — publicador; revisado contra la doc oficial.
- [src/lib/rules.js](src/lib/rules.js) — las reglas editoriales, compartidas por
  el linter y el publicador. Si cambia una regla, se cambia solo ahí.
- [docs/posts-texto-directo.md](docs/posts-texto-directo.md) — los 24 posts en el
  formato que de verdad se publica.
- [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
  · [Images API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api)
  · [little text format](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format)
