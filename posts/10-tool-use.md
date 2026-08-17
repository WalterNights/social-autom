---
{
  "slug": "tool-use",
  "n": 10,
  "date": "2026-09-14",
  "status": "draft",
  "image": {
    "template": "proceso",
    "label": "Herramientas",
    "title": "El modelo pide.\nTu backend decide.",
    "highlight": "Tu backend decide.",
    "steps": [
      {
        "title": "El usuario pregunta",
        "sub": "en lenguaje natural"
      },
      {
        "title": "El modelo propone",
        "sub": "buscarPedidos(4471)"
      },
      {
        "title": "Tu código ejecuta",
        "sub": "auth · permisos · validación",
        "key": true
      },
      {
        "title": "El modelo redacta",
        "sub": "la respuesta final"
      }
    ],
    "foot": "Entre la petición y la ejecución\ncabe toda tu ingeniería."
  }
}
---

Un modelo solo genera texto.

No puede consultar tu base de datos.

Pero sí puede decirte, con precisión, qué función quieres que ejecutes.

Eso es tool use. Y es el salto de chatbot a sistema que trabaja.

Cómo funciona:

1️⃣ Le describes tus funciones: nombre, para qué sirven, qué parámetros reciben
2️⃣ El usuario pregunta "¿cuántos pedidos abiertos tiene el cliente 4471?"
3️⃣ El modelo no responde texto. Responde buscarPedidos({clienteId: 4471})
4️⃣ Tu código ejecuta. El modelo nunca toca tu base de datos.
5️⃣ Le devuelves el resultado y él lo redacta

El paso 4 es todo.

El modelo pide. Tu backend decide.

Entre la petición y la ejecución cabe todo lo que ya sabes hacer: autenticación, permisos, rate limiting, validación, logging.

Tres cosas que aprendí a las malas:

▪️ La descripción de la herramienta es un prompt. Si es vaga, la usa mal.
▪️ Menos herramientas, mejores resultados. Con 40 se confunde. Con 8, acierta.
▪️ Los parámetros se validan igual que los de un usuario. Porque vienen de un usuario.

Esto no es IA.

Es diseño de API.

👉 ¿Ya conectaste herramientas a un modelo o todavía solo generas texto?

#IAconCriterio #FunctionCalling #API #Backend
