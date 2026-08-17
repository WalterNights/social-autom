---
{
  "slug": "code-review",
  "n": 20,
  "date": "2026-10-07",
  "status": "draft",
  "image": null
}
---

El código generado por IA compila, pasa los tests y se ve limpio.

Por eso es más peligroso que el código malo.

El malo se nota.

Lo que reviso, en este orden, siempre:

✅ ¿Las dependencias existen y las necesito? Es común que invente paquetes o importe una librería entera para algo de tres líneas.

✅ ¿Los casos borde están cubiertos? Null, vacío, cero, negativo, concurrente. La IA escribe el camino feliz magníficamente.

✅ ¿Cómo maneja los errores? Un catch vacío es el patrón que más encuentro.

✅ ¿Encaja con nuestras convenciones? Puede ser correcto y aun así ajeno al proyecto. Eso es deuda técnica futura.

✅ ¿Hay problemas de seguridad? Consultas concatenadas, validación ausente, permisos que se asumen.

✅ ¿Cuál es el costo real? Un N+1 elegantemente escrito. Funciona en desarrollo, cae en producción.

✅ ¿Puedo explicar cada línea? Este es el filtro definitivo.

La pregunta que cambia la conversación en un equipo no es "¿esto funciona?".

Es "¿esto es lo que habríamos escrito nosotros?".

Aceptar código que no entiendes es contraer deuda a una tasa que no conoces.

👉 ¿Qué revisas tú que no esté en esta lista?

#IAconCriterio #CodeReview #CalidadDeSoftware #BuenasPrácticas
