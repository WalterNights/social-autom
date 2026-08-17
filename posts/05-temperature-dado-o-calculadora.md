---
{
  "slug": "temperature-dado-o-calculadora",
  "n": 5,
  "date": "2026-09-02",
  "status": "ready",
  "image": null
}
---

Mismo prompt. Dos respuestas distintas.

No es un bug.

Es un parámetro que no configuraste.

Los modelos tienen perillas. La mayoría de devs nunca las toca.

Y luego se sorprende de que el sistema no sea reproducible.

Temperature — cuánto se arriesga al elegir la siguiente palabra.

Baja (0 – 0.3): predecible.
Alta (0.8 – 1.2): creativo y disperso.

Cómo lo decido:

▪️ Extraer datos de un documento → baja. Quiero una calculadora.
▪️ Clasificar tickets, generar JSON → lo más baja posible
▪️ Redactar variantes de un copy → alta. Quiero un dado.
▪️ Generar código → baja. El código creativo se llama bug.

Y el punto que importa:

Ni con temperature en 0 tienes determinismo garantizado.

Sigue siendo probabilístico.

Por eso lo relevante no es que no varíe.

Es que valides la salida antes de usarla.

👉 ¿En qué temperature está tu proyecto? ¿Fue una decisión o el default?

#IAconCriterio #LLM #Backend #AIEngineering
