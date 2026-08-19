---
{
  "slug": "evals",
  "n": 21,
  "date": "2026-10-02",
  "status": "ready",
  "image": null
}
---

Cambiaste una línea del prompt para arreglar un caso.

¿Cómo sabes que no dañaste los otros cuarenta?

No lo sabes.

Los tests tradicionales no sirven aquí. La salida no es exacta y dos respuestas distintas pueden ser igual de correctas.

assertEquals no te ayuda.

Por eso existen los evals: tests para sistemas probabilísticos.

Cómo se arma uno:

1️⃣ Junta 20 casos reales. Entradas de producción con la salida esperada. Veinte bastan para el 80% del valor. La mayoría nunca llega ni a eso.

2️⃣ Elige cómo puntuar cada uno:
▪️ Determinista siempre que puedas: ¿el JSON valida? ¿el ID existe? ¿el código corre?
▪️ Por similitud contra una respuesta de referencia
▪️ Con un modelo como juez, para lo subjetivo. Pero valida al juez antes de confiar en él.

3️⃣ Córrelo en cada cambio. Prompt, modelo, versión, temperatura, contexto.

4️⃣ Mide también costo y latencia. Una mejora de calidad que triplica el gasto es una decisión de negocio, no técnica.

Sin evals, "mejoré el prompt" es una opinión.

Con evals, es un hecho con número.

Esa diferencia es la que separa un demo de un producto.

👉 ¿Tienes evals corriendo o todavía pruebas a mano cada cambio?

#IAconCriterio #Testing #Evals #CalidadDeSoftware
