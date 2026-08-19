---
{
  "slug": "logica-de-negocio",
  "n": 17,
  "date": "2026-09-23",
  "status": "ready",
  "image": null
}
---

"Calcula el descuento según nuestras reglas comerciales."

Ahí acabas de convertir una regla determinista en una probabilidad.

Nunca hagas eso.

Es el error de arquitectura más caro que veo. Y viene disfrazado de productividad.

Lo que jamás debe decidir un modelo:

❌ Cálculos de dinero
❌ Reglas de precios
❌ Permisos y autorización
❌ Validaciones legales o regulatorias
❌ Cualquier cosa que deba dar el mismo resultado siempre

Lo que hace excelente:

✅ Interpretar lenguaje natural
✅ Extraer datos de texto desordenado
✅ Clasificar, resumir, redactar
✅ Traducir intención en parámetros estructurados

La frontera es limpia:

El modelo traduce. Tu código decide.

Y eso define dónde lo pones:

▪️ Nunca en el controlador. Es una llamada de red lenta, cara y no determinista.
▪️ Detrás de una interfaz tuya, no acoplado al SDK del proveedor. En 8 meses vas a querer cambiar de modelo.
▪️ Con timeout, reintentos y fallback. ¿Qué pasa si la API está caída? Necesitas esa respuesta hoy.
▪️ Con la salida validada antes de que toque tu dominio.

El modelo es un servicio externo.

Tu arquitectura ya sabe cómo tratar servicios externos.

👉 ¿Tu llamada al modelo está detrás de una interfaz propia o pegada al SDK?

#IAconCriterio #Arquitectura #CleanArchitecture #Backend
