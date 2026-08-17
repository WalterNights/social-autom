---
{
  "slug": "alucinaciones",
  "n": 6,
  "date": "2026-09-04",
  "status": "draft",
  "image": null
}
---

La IA no alucina porque esté rota.

Alucina porque hace exactamente lo que fue construida para hacer.

Si genera la continuación más probable, entonces cuando no tiene el dato genera la continuación más probable de todos modos.

Una función que suena razonable.
Una fecha que encaja.
Una cita perfecta de un paper que no existe.

No hay un modo "no sé" por defecto.

Hay que construirlo.

Cuatro defensas, de menos a más robusta:

✅ Ancla la respuesta en fuentes. Pásale el documento y ordénale responder solo con eso.
✅ Dale permiso de no saber. "Si el contexto no lo tiene, responde NO_ENCONTRADO."
✅ Exige JSON y valídalo contra un esquema. Si no valida, no pasa.
✅ Verifica lo verificable. ¿Nombró un endpoint? Chequéalo. ¿Escribió código? Córrelo.

La regla que cierra todo:

Nunca dejes que un modelo tenga la última palabra sobre algo que un if podía confirmar.

👉 ¿Cuál ha sido la alucinación más cara que has visto llegar a producción?

#IAconCriterio #Alucinaciones #CalidadDeSoftware #FullStack
