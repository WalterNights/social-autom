---
{
  "slug": "cuando-no-usar-agente",
  "n": 15,
  "date": "2026-09-18",
  "status": "ready",
  "image": null
}
---

La decisión técnica más rentable que tomé este año fue borrar un agente.

Lo reemplacé por 60 líneas de código.

Un agente cuesta entre 5 y 20 veces más que una llamada directa. Múltiples iteraciones, contexto que crece, herramientas que se invocan de más.

Cuándo NO vale la pena:

❌ El proceso siempre sigue los mismos pasos. Si puedes dibujar el diagrama de flujo, escribe el diagrama de flujo.
❌ Necesitas el mismo resultado siempre. Cálculos, facturación, reportes regulatorios.
❌ La latencia importa. Nadie espera 40 segundos en un formulario.
❌ No puedes detectar el error automáticamente. Sin verificación, un agente genera errores silenciosos a escala.
❌ Datos sensibles con flujo abierto. Más autonomía es más superficie de ataque.

La pregunta que hago en cada diseño:

¿Qué decisión de este proceso no puedo escribir yo en código?

Si la respuesta es "ninguna", no necesitas un agente.

Necesitas un buen backend.

Saber cuándo NO usar la herramienta de moda es literalmente lo que separa a un senior de un junior entusiasta.

👉 ¿Has visto un agente en producción que claramente debía ser un cron job?

#IAconCriterio #Agentes #DecisionesTécnicas #Arquitectura
