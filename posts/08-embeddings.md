---
{
  "slug": "embeddings",
  "n": 8,
  "date": "2026-09-09",
  "status": "ready",
  "image": null
}
---

Buscas "cómo cancelo mi plan".

El documento dice "baja de suscripción".

Cero palabras en común. Y aun así lo encuentra.

Eso lo hace un embedding, y es más simple de lo que suena.

Un embedding es un texto convertido en una lista de números que representa su significado.

Textos con sentido parecido quedan cerca. Textos distintos quedan lejos.

Buscar deja de ser comparar letras.

Pasa a ser medir distancia.

Lo que necesitas saber para usarlo bien:

▪️ Vectorizas una vez, buscas siempre. Es un proceso batch.
▪️ Vive en una base de datos normal. pgvector sobre Postgres resuelve la mayoría de casos.
▪️ Mismo modelo para indexar y para consultar. Si lo cambias, reindexas todo.
▪️ No entiende negación. "Con seguro" y "sin seguro" quedan peligrosamente cerca.

La búsqueda semántica no es magia.

Es geometría.

👉 ¿Ya usas pgvector o sigues en LIKE '%texto%'?

#IAconCriterio #Embeddings #Postgres #Backend
