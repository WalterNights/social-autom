# Project context

_Última actualización: 2026-08-17 — sesión de puesta en marcha: instalación, primera publicación real y sistema de avisos por Telegram funcionando._

## Current focus

Automatizar la publicación para no correr comandos a mano. Los avisos ya están
resueltos y probados por Telegram. **Lo que falta es el despliegue en el VPS**
del usuario (solo backend, sin front) con cron a la hora agendada. Está frenado
esperando tres datos: distro, si hay root, y método de despliegue.

## State of the tree

- Branch: `master`
- Último commit: `34d56d5` Avisa por Telegram cuando la publicación falla
- Cambios sin commitear: ninguno
- **El repo no tiene remoto.** Existe solo en el disco del usuario. Para desplegar
  por `git pull` hay que subirlo a un repositorio privado primero.

## Recent work

- **Instalación desde cero** (el proyecto venía como `linkedin-ops.tar.gz`) y dos
  bugs que impedían usarlo: el guard de entrypoint de `auth.js` nunca daba true en
  Windows, así que `npm run auth` moría en silencio; y la plantilla `lista`
  desbordaba el lienzo en tres tarjetas, perdiendo una línea entera del pie en el
  post 19.
- **Primera publicación real** (post 01, `urn:li:share:7495083744874188800`).
  Confirmó que el escapado se comporta como documenta la especificación `little`.
  Hasta ese momento el código contra LinkedIn nunca se había ejecutado.
- **`publish.js` revisado contra la doc oficial.** Todo coincide; se corrigió un
  bug: mandaba el slug en `content.media.title`, y para imágenes el campo
  documentado es `altText`.
- **`ESTADO.md` generado** desde los posts (`npm run estado`), y actualizado solo
  después de cada publicación.
- **Sistema de avisos por Telegram, probado de punta a punta.** `npm run token`
  vigila el vencimiento del acceso y avisa a los 10 días del corte; `publish.js`
  avisa cuando falla, cuando la cola se agota, y cuando publica bien.

## Active decisions

- **Telegram, no WhatsApp.** Se pidió WhatsApp, pero Meta solo permite mensajes
  libres dentro de una ventana de 24 h que abre el usuario. Un cron a las 7:30 cae
  fuera, así que cada tipo de aviso necesitaría una plantilla aprobada, un número
  dedicado distinto del personal y cuenta de Meta Business. Telegram quedó
  funcionando el mismo día.
- **Los avisos viven en `src/lib/telegram.js`, no en `publish.js`.** `publish.js`
  tiene código de nivel superior: **publica con solo importarlo**. Su `notify`
  exportado era una trampa — cualquier comando que quisiera avisar habría
  disparado una publicación real. No volver a importar nada de `publish.js`.
- **`ESTADO.md` es un reflejo, no un registro.** La verdad de qué se publicó vive
  en el frontmatter de cada post (`status`, `publishedAt`, `urn`), versionado en
  git. Dos fuentes de verdad se habrían desincronizado. Si discrepan, gana el post.
- **El `#` no se escapa al publicar.** Verificado contra la doc y contra una
  publicación real: un `#palabra` sin escapar se vuelve hashtag; escaparlo lo mata.
- **La app de LinkedIn es propia del proyecto**, no reutilizada de otro proyecto
  del usuario: pedir un scope distinto sobre la misma app invalida los tokens
  previos y acopla la rotación del client secret.
- **Sin refresh token.** Los refresh tokens programáticos son solo para partners.
  `freshTokens()` no puede renovar solo; hay que repetir `npm run auth` a mano.
- **Un aviso que falla debe salir con código 1.** Un `exit 0` cuando el mensaje no
  salió significa "todo bien" en el log del cron, y es justo el caso en que nadie
  se enteró de nada.

## Next steps

1. **Recoger los datos del VPS**: distro, si hay root, método de despliegue.
   Bloquea todo lo demás.
2. Montar el despliegue: cron a la hora correcta, `.env` y `.tokens.json` en el
   servidor con permisos 600, Playwright con sus librerías del sistema.
3. Decidir si se monta el subdominio HTTPS para la re-autenticación desde el
   celular (ver Open questions).
4. Pasar a `ready` los posts del 07 en adelante cuando el usuario quiera.
5. Atender los 6 avisos del linter (cinco líneas de 3–4 frases, un post con tres
   tipos de marcador). Son reales, no ruido; no silenciarlos tocando el linter.

## Open questions / blockers

- **Datos del VPS pendientes.** Distro, root, y si despliega por git (requiere
  subir el repo a un remoto privado) o subiendo archivos.
- **El enlace de re-autenticación no funciona desde el celular tal como está.**
  Dos motivos: el `state` que valida `auth.js` solo existe mientras ese proceso
  corre, así que un enlace generado por el cron llevaría un `state` que nadie
  espera; y el redirect es `http://localhost:5599/callback`, que en un teléfono
  apunta al propio teléfono. Falla de la peor forma: el usuario autoriza de verdad
  y el código no llega a ninguna parte. Para resolverlo hace falta un subdominio
  con HTTPS apuntando al VPS, registrarlo en la pestaña Auth de la app, y separar
  en `auth.js` el puerto de escucha del que va en el redirect. **Sin dominio**, la
  alternativa es hacerlo desde el portátil con túnel SSH
  (`ssh -L 5599:localhost:5599 usuario@vps`), que son dos minutos seis veces al año.
- **El VPS casi seguro corre en UTC.** El cron del README (`30 7 * * 1,3,5`) serían
  las 2:30 a.m. hora Colombia. Colombia es UTC−5 fijo: lo correcto es
  `30 12 * * 1,3,5`.
- **Playwright en el VPS** necesita `npx playwright install --with-deps chromium`,
  que pide root y baja ~115 MB.

## Fechas que importan

- **El access token vence el 16/10/2026.** `freshTokens()` corta 5 días antes, así
  que **desde el 11/10 el publicador falla** y los posts 22, 23 y 24 no saldrían.
  El aviso de Telegram salta a los 10 días del corte (≈01/10), pero conviene
  renovar a finales de septiembre.
- La cola va del 24/08 al 16/10, lunes/miércoles/viernes. Hoy: 1 publicado,
  5 en `ready` (hasta el 04/09), 18 en `draft`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run estado` | Regenera `ESTADO.md` |
| `npm run token` | Días que le quedan al acceso y qué posts peligran |
| `npm run token -- --avisar` | Solo escribe a Telegram si urge. Para el cron |
| `npm run publish -- --slug X` | Publica uno concreto. **Ojo:** sin el `--`, npm se traga el flag |

Variables nuevas en `.env`: `TG_BOT_TOKEN`, `TG_CHAT_ID`, y opcional
`TOKEN_AVISO_DIAS` (por defecto 10).

## Pointers

- [CLAUDE.md](CLAUDE.md) — reglas duras: nunca publicar por cuenta propia, no
  editar posts publicados, no migrar el frontmatter a YAML.
- [README.md](README.md) — instalación, comandos y anatomía de un post.
- [src/lib/telegram.js](src/lib/telegram.js) — avisos. Reutilizable sin riesgo.
- [src/token.js](src/token.js) — vigilancia del vencimiento del acceso.
- [src/publish.js](src/publish.js) — publicador. **Publica al importarlo.**
- [src/lib/rules.js](src/lib/rules.js) — reglas editoriales, compartidas por el
  linter y el publicador. Si cambia una regla, se cambia solo ahí.
- [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
  · [Images API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/images-api)
  · [little text format](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/little-text-format)
