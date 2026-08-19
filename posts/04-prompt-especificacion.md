---
{
  "slug": "prompt-especificacion",
  "n": 4,
  "date": "2026-08-24",
  "status": "ready",
  "image": {
    "template": "lista",
    "label": "Práctica",
    "title": "Un prompt que sí funciona",
    "highlight": "sí funciona",
    "items": [
      {
        "text": "Rol — desde qué expertise responde"
      },
      {
        "text": "Objetivo — qué debe lograr"
      },
      {
        "text": "Contexto — stack, convenciones, código"
      },
      {
        "text": "Restricciones — qué no puede hacer"
      },
      {
        "text": "Formato — JSON, diff, tabla"
      },
      {
        "text": "Criterios de aceptación",
        "key": true
      }
    ],
    "foot": "Es una historia de usuario.\nEscríbela como tal."
  }
}
---

Le pediste a la IA "un endpoint para usuarios" y te dio algo genérico.

No falló el modelo.

Falló el requerimiento.

Si a un dev junior le llega el ticket "hacer login", el resultado es una lotería.

Con un modelo pasa igual, pero más rápido.

Un buen prompt tiene la estructura de una buena historia de usuario:

✅ Rol — desde qué expertise responde
✅ Objetivo — qué debe lograr, en una frase
✅ Contexto — el stack, las convenciones, el código que ya existe
✅ Restricciones — qué NO puede hacer
✅ Formato — JSON, diff, tabla, tres opciones
✅ Criterios de aceptación — cómo sabemos que quedó bien

El último es el que todos saltan.

Y es el que más rinde.

Dos cosas que mueven la aguja de verdad:

👉 Un ejemplo de la salida que quieres vale más que diez líneas describiéndola
👉 Pídele que te pregunte lo que le falta antes de escribir código

Escribir prompts es escribir requerimientos.

Es una habilidad que ya deberías tener.

👉 ¿Cuál de los seis se te olvida siempre?

#IAconCriterio #PromptEngineering #DesarrolloDeSoftware #BuenasPrácticas
