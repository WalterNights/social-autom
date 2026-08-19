# Instrucciones del proyecto

Cola de contenido para LinkedIn. Los posts viven como archivos en `posts/`, un linter valida el formato, Playwright genera las imágenes y la API oficial publica.

Detalles de instalación, comandos y configuración: @README.md

El objetivo del proyecto es visibilidad ante reclutadores técnicos. Cuando haya que decidir entre dos opciones, gana la que sirva a eso.

## Reglas que no se rompen

- **Nunca ejecutes `npm run publish` por tu cuenta.** Publica en una cuenta real y es irreversible. Prepara todo y para ahí; el disparo lo doy yo.
- **Nunca subas `.env` ni `.tokens.json` a git.** Están en `.gitignore`. Si los ves apareciendo en un `git status`, avísame antes de seguir.
- **No inventes detalles de la API de LinkedIn.** Si algo no está en el código o en el README, búscalo en la documentación oficial de Microsoft y cita de dónde salió.
- **No edites posts con `status: "published"`.** Ya salieron; el archivo es el registro de lo que se publicó.
- **Antes de dar una tarea por terminada, corre `npm run lint`.** Debe quedar en 0 errores.
- **Los commits usan convención:** `feat:`, `fix:`, `ci:`, `docs:`, `chore:`, `refactor:`. El asunto en minúscula y en imperativo; el cuerpo explica el porqué, no el qué.

## Cómo se escribe un post

El cuerpo de un `.md` en `posts/` es **texto plano, exactamente lo que se va a publicar**. LinkedIn no interpreta markdown: los asteriscos y los backticks salen literales en el feed. Nada de `**negrita**`, nada de `` `código` ``, nada de encabezados.

El formato es deliberado:

- Una idea por línea. Si una línea tiene dos frases con dos ideas, son dos líneas.
- Línea en blanco entre ideas. El aire es lo que hace que se lea en el celular.
- Las primeras líneas hasta el primer salto en blanco son el gancho. Es lo único que LinkedIn muestra antes del "ver más": máximo 200 caracteres.
- El remate va solo, al final, sin explicación después. Explicar el remate lo mata.
- Cierra con una pregunta marcada con 👉 y de 3 a 5 hashtags.
- Marcadores: ✅ lo que sí, ❌ lo que no, ▪️ lista neutra, 1️⃣ pasos en orden. Máximo dos tipos por post. El 👉 es del cierre y no cuenta.
- Sin enlaces en el cuerpo. Van en el primer comentario, porque LinkedIn castiga el alcance de los posts con links.

Frases prohibidas por relleno: "cabe destacar", "en este sentido", "por otro lado", "en el mundo actual", "hoy en día". Si una línea se puede borrar sin perder nada, se borra.

## Convenciones técnicas

- **El frontmatter es JSON, no YAML.** Fue a propósito: cero dependencias y cero ambigüedad al parsear. No lo migres a YAML.
- **Node con JavaScript plano, sin TypeScript ni build step.** Es un CLI de seis archivos; un compilador no compra nada aquí. No agregues TypeScript, bundler ni framework sin que lo pidamos explícitamente.
- **Las reglas editoriales viven solo en `src/lib/rules.js`**, compartidas por el linter y el publicador. Si cambia una regla, se cambia ahí, no en cada post ni duplicada en `publish.js`.
- Las dependencias se mantienen al mínimo. Hoy solo Playwright. Antes de agregar un paquete, pregunta si de verdad hace falta.

## Trampas que ya nos costaron

- **El linter cuenta frases por línea, no por bloque.** La primera versión contaba por bloque y trataba cada lista de viñetas como un párrafo de diecisiete frases: 39 avisos, casi todos falsos. Un linter con falsos positivos se ignora a la semana. Si agregas reglas, prioriza no gritar de más.
- **El `#` no se escapa al publicar, a propósito.** La API de Posts exige escapar varios símbolos en `commentary`, pero escapar el `#` rompe los hashtags. Está configurado en `LI_ESCAPE_CHARS`. Si LinkedIn rechaza un post por eso, se ajusta ahí, no en el código.
- **El código contra la API de LinkedIn nunca se ha ejecutado contra la API real.** Está escrito según la documentación. Trátalo como no verificado hasta que hagamos la primera publicación de prueba.
- **El access token vence a los 60 días.** `freshTokens()` lo refresca si la app entrega refresh token; si no, toca repetir `npm run auth`.
- **La API no soporta @menciones ni programación nativa.** El horario lo pone el Programador de tareas de Windows vía `publicar.cmd`.

## Primera sesión

Si el proyecto todavía no está instalado, en este orden:

1. `npm install` y `npx playwright install chromium`
2. Copiar `.env.example` a `.env` (déjalo con los valores vacíos, yo los lleno)
3. `git init` y primer commit, verificando que `.env` y `.tokens.json` quedan ignorados
4. `npm run lint` — debe dar 24 posts, 0 errores, 6 avisos
5. `npm run render` — debe generar 9 PNG en `out/images`

Los 6 avisos del paso 4 son reales, no ruido: son líneas de tres frases que se pueden apretar. No los silencies cambiando el linter; si acaso, arregla las líneas.

No hagas nada del setup de LinkedIn (crear la app, `npm run auth`) sin que te lo pida.
