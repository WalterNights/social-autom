# linkedin-ops

Cola de contenido para LinkedIn. Los posts viven como archivos en git, un linter valida el formato antes de publicar, Playwright genera las imágenes y la API oficial publica a la hora agendada.

**Lo que automatiza:** renderizar imágenes, validar formato, agendar y publicar.
**Lo que no:** escribir. Ese sigue siendo trabajo tuyo.

---

## Instalación

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Requiere Node 22 o superior. No hay paso de build: no hay TypeScript ni bundler porque un CLI de seis archivos no los necesita.

## Configurar el acceso a LinkedIn

Solo hace falta la primera vez. Publicar en tu propio perfil **no** requiere aprobación de LinkedIn; el scope necesario es self-serve.

1. Entra a `https://www.linkedin.com/developers/apps` y crea una app.
2. **Te va a pedir vincularla a una página de empresa, aunque solo publiques en tu perfil.** Si no tienes una, crea una de relleno.
3. En la pestaña **Products**, añade *Sign In with LinkedIn using OpenID Connect* y *Share on LinkedIn*. Ambos se activan solos, sin revisión.
4. En **Auth**, agrega la redirect URL: `http://localhost:5599/callback`.
5. Copia el Client ID y el Client Secret a tu `.env`.
6. Corre `npm run auth`, abre la URL que imprime y autoriza.

La sesión queda en `.tokens.json` (permisos 600, y está en `.gitignore` — no lo subas a ningún repo).

**El access token vence a los 60 días.** El publicador lo refresca solo si tu app entrega refresh tokens; si no, vas a tener que repetir `npm run auth`. El comando te avisa cuál es tu caso al terminar.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run new -- mi-slug` | Crea un post nuevo, agendado en el siguiente L/X/V libre |
| `npm run lint` | Valida los 24 posts. Sin argumento, todos; con slug, uno |
| `npm run render` | Genera los PNG 1080×1080 de los posts que llevan imagen |
| `npm run next` | Muestra qué toca publicar hoy, con vista previa. No publica |
| `npm run publish` | Publica el siguiente post pendiente |
| `npm run publish -- --ask` | Te lo manda a Telegram y espera que toques "Publicar" |
| `npm run publish -- --slug X` | Publica uno específico, fuera de turno |
| `npm run estado` | Regenera `ESTADO.md` con la cola completa |
| `npm run token` | Cuántos días le quedan al acceso y qué posts peligran |
| `npm run token -- --avisar` | Igual, pero solo escribe a Telegram si urge. Para el cron |

**Ojo con el `--`.** `npm run publish --slug X` sin los dos guiones no funciona: npm
se traga el flag y lo interpreta como configuración suya, así que al script nunca le
llega. Siempre `npm run publish -- --slug X`.

`ESTADO.md` es un archivo **generado**: la verdad de qué se publicó vive en el
frontmatter de cada post. Si los dos discrepan, gana el post. Se regenera solo
después de cada publicación.

## Anatomía de un post

```
---
{
  "slug": "rag-sin-humo",
  "n": 7,
  "date": "2026-09-07",
  "status": "ready",
  "image": { "template": "proceso", "label": "Arquitectura", ... }
}
---
El texto del post, tal cual se va a publicar.
```

El frontmatter es JSON y no YAML a propósito: cero dependencias y cero ambigüedad al parsear.

- **`status`**: `draft` (no se publica), `ready` (entra a la cola), `published` (lo escribe el publicador).
- **`date`**: el día que le toca. El publicador toma el post `ready` más antiguo cuya fecha ya llegó.
- **`image`**: `null` si el post va sin gráfico.

El cuerpo es texto plano, exactamente lo que va a salir publicado. **LinkedIn no interpreta markdown**: los `**asteriscos**` y los backticks se verían literales, así que se limpian al importar y el linter avisa si vuelven a aparecer.

### Plantillas de imagen

`concepto`, `lista`, `proceso`, `comparacion`, `pares`. Cada una consume campos distintos — mira `templates/card.html` y los ejemplos ya cargados en `/posts`.

Todas comparten el mismo sistema visual: papel cuadriculado, tinta petróleo, resaltador amarillo para lo que aporta el criterio humano y azul para lo que hace la máquina.

## Qué valida el linter

**Errores** (bloquean la publicación):
- Gancho de más de 200 caracteres — es lo único que se ve antes del "ver más".
- Más de 3000 caracteres en total.
- Menos de 3 o más de 5 hashtags.
- Un enlace en el cuerpo. Va en el primer comentario: LinkedIn castiga el alcance.
- Faltan campos en la configuración de la imagen.

**Avisos** (pasan, pero casi siempre vale la pena atenderlos):
- Una línea con más de dos frases. La regla es una idea por línea.
- Más de dos tipos de marcador en un mismo post.
- Backticks o negrita de markdown, que se verían literales.
- Conectores de relleno: "cabe destacar", "en este sentido", "por otro lado".

## El flujo, día a día

**Cuando se te ocurre una idea:**

```bash
npm run new -- reintentos-idempotencia
```

Escribes el post (o lo trabajamos juntos y pegas el resultado), pones `status: "ready"`, corres `npm run lint` y, si lleva imagen, `npm run render`.

**Para que se publique solo**, a las 7:30 a.m. de lunes, miércoles y viernes.

En Windows, con el Programador de tareas. Abre PowerShell **como administrador** en la carpeta del proyecto:

```powershell
schtasks /create /tn "LinkedIn post" /tr "$PWD\publicar.cmd" /sc weekly /d MON,WED,FRI /st 07:30
```

El script `publicar.cmd` se ubica solo en su carpeta, así que la tarea funciona sin importar desde dónde se invoque. Para probarla sin esperar al lunes: `schtasks /run /tn "LinkedIn post"`.

En Linux o macOS, con cron:

```cron
30 7 * * 1,3,5 cd /ruta/al/proyecto && npm run publish -- --ask >> publish.log 2>&1
```

Con `--ask` te llega el post a Telegram con dos botones. Si no respondes en 45 minutos, no publica nada — que es lo correcto: publicar cuando no estás disponible para responder comentarios en la primera hora desperdicia el post.

Para la aprobación por Telegram: crea un bot con `@BotFather`, pide tu chat id a `@userinfobot`, y pon ambos en `.env`. Si no configuras Telegram, `npm run publish` funciona igual, sin preguntar.

---

## Antes de confiar en esto: haz una prueba

El código contra la API de LinkedIn está escrito según su documentación, pero **no se ha ejecutado contra la API real**. Antes de dejarlo en un cron, publica un post de prueba a mano y revisa dos cosas:

**1. El escapado de caracteres.** La API exige escapar ciertos símbolos en el texto (`( ) [ ] { } < > @ | ~ _ *`). Por defecto **no** escapo el `#`, porque hacerlo rompe los hashtags y esos son parte de la estrategia. Si LinkedIn rechaza un post por eso, añádelo en `.env`:

```
LI_ESCAPE_CHARS=\|{}@[]()<>*_~#
```

**2. Que la imagen se vea completa.** El recorte a 1080×1080 lo hace Playwright sobre el elemento, no sobre el viewport, así que debería ser exacto. Verifícalo igual con el primero.

Otras cosas que conviene saber:

- **La API no soporta @menciones.** Si algún día quieres etiquetar a alguien, ese post va a mano.
- **La API no tiene parámetro de programación.** Un post se crea publicado; el horario lo pone el cron.
- **`LI_VERSION`** usa formato `YYYYMM`. Cuando LinkedIn deprecie la versión, actualiza esa línea del `.env`.
- El límite es de ~100 llamadas al día. Con tres posts por semana, irrelevante.

## Estructura

```
posts/           un archivo por post, versionado en git
templates/       card.html — la plantilla de imagen, parametrizable
src/
  lint.js        CLI del linter
  render.js      Playwright → PNG
  auth.js        OAuth, y refresco de token
  publish.js     valida, sube imagen, publica, avisa
  lib/
    posts.js     leer, escribir y agendar posts
    rules.js     las reglas editoriales, compartidas por lint y publish
scripts/
  import-serie.js  convierte el markdown de la serie en 24 posts
  new.js           crea un post nuevo
out/images/      los PNG generados (no se versionan)
```
