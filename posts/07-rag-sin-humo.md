---
{
  "slug": "rag-sin-humo",
  "n": 7,
  "date": "2026-09-07",
  "status": "draft",
  "image": {
    "template": "proceso",
    "label": "Arquitectura",
    "title": "RAG en 3 pasos",
    "highlight": "RAG",
    "steps": [
      {
        "title": "Buscas",
        "sub": "los fragmentos relevantes en tus datos"
      },
      {
        "title": "Los pegas",
        "sub": "en el prompt, como contexto",
        "key": true
      },
      {
        "title": "Le pides",
        "sub": "que responda usando solo eso"
      }
    ],
    "foot": "No reentrenas nada.\nLe das la página correcta, justo a tiempo."
  }
}
---

"¿Y cómo hago que la IA conozca la documentación de mi empresa?"

No la entrenas.

Le pasas la página correcta, justo a tiempo.

Eso es RAG. Suena a paper. Son tres pasos:

1️⃣ Buscas los fragmentos relevantes en tus datos
2️⃣ Los pegas en el prompt como contexto
3️⃣ Le pides que responda usando solo eso

Es un SELECT, una concatenación de strings y una llamada HTTP.

Por qué gana casi siempre frente a entrenar un modelo:

▪️ Actualizas un documento y el sistema ya sabe lo nuevo
▪️ Puedes citar la fuente. Es auditable.
▪️ Filtras permisos antes de recuperar
▪️ Cuesta órdenes de magnitud menos

Dónde se rompe en la práctica, que es lo que nadie cuenta:

▪️ El chunking. Un párrafo partido a la mitad recupera basura.
▪️ La búsqueda semántica sola falla con códigos y nombres propios. Combínala con palabras clave.
▪️ El reranking. Recupera 20, reordena, pasa los 5 mejores.

RAG no es un problema de IA.

Es un problema de búsqueda. Y la búsqueda es ingeniería clásica.

👉 ¿Has montado un RAG? ¿Dónde se te cayó primero?

#IAconCriterio #RAG #Arquitectura #FullStack
