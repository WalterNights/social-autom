---
{
  "slug": "elegir-modelo",
  "n": 23,
  "date": "2026-10-14",
  "status": "ready",
  "image": null
}
---

"¿Cuál modelo es el mejor?"

Pregunta equivocada.

La correcta: ¿el mejor para qué restricción?

Elegir modelo es una decisión de arquitectura. Cuatro ejes:

▪️ Capacidad — ¿necesita razonar en varios pasos o es reconocimiento de patrones? La mayoría de tareas reales son lo segundo.
▪️ Latencia — ¿alguien está esperando en pantalla? Un proceso nocturno tolera 30 segundos. Un autocompletado, 300 milisegundos.
▪️ Costo — multiplícalo por tu volumen mensual real, no por una llamada.
▪️ Restricciones — residencia de datos, cumplimiento, on-premise, límites de tasa.

Cómo lo aterrizo:

✅ Modelo pequeño → clasificación, extracción, formateo, enrutamiento. El caballo de batalla. Es el 70% de las llamadas de una app madura.
✅ Modelo mediano → la mayoría de tareas de producto: redacción, resúmenes, código común.
✅ Modelo grande → arquitectura, análisis complejo, código difícil, planificación de agentes.

Tres reglas que me ahorraron problemas:

Empieza por el modelo más capaz para validar que la tarea es posible. Luego baja hasta que la calidad deje de ser aceptable. Ese es tu modelo.

No te acoples a un proveedor. Esto cambia cada pocos meses.

Documenta por qué elegiste lo que elegiste. En seis meses alguien va a preguntar, y probablemente seas tú.

👉 ¿Usas un solo modelo para todo o ya mezclas según la tarea?

#IAconCriterio #DecisionesTécnicas #Arquitectura #AIEngineering
