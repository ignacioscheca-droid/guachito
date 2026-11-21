# 24 · Marcas en el mundo
> Estado: propuesta · Etapa: Con escala · Mejora del plan: — (Monetización, pieza 8) · Depende de: 02, 03, 17, 23, 27, 28, 30

## En una línea
Una yerba o una fintech auspicia el evento de la temporada con un objeto propio que Paucho usa en su cuarto; se ve como parte del mundo, dice «Auspicio» y nunca toca un hábito.

## Problema y oportunidad
Los anuncios dejan USD 27 a 365 por mes con 10 mil activos (plan; 23); un solo acuerdo de marca iguala lo que dan con 30 a 180 mil (plan). Va desde 50 mil activos: canje al principio, USD 300–2.000 por mes después (plan, estimación).

Gauchito tiene un mundo con objetos que la gente elige poner, y el mate y el termo son su centro: justo lo que venden las yerbas. Se lo aprendemos a los objetos de marca de los juegos de mundo y a Finch, que no mete marcas en el cuidado.

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: ingreso de marcas por mes | canje en 2027; USD 300–2.000 desde 50 mil activos (plan) | contratos |
| Objeto auspiciado puesto en el cuarto | ≥ 35 % de quienes lo reciben (estimación) | `marca_objeto_puesto` |
| Guardrail: D7 y días jugados en el evento | sin caída contra el evento sin marca | 27 |
| Guardrail: quitan el objeto en 24 h | < 20 % (estimación) | `marca_objeto_sacado` |

## Experiencia
**Formatos (de menor a mayor).**
1. **Objeto del evento.** Una de las tres cosas del cuarto del camino gratis (02) es de la marca: «Termo Pampa edición invierno». Cae en el casillero 12, nunca en el 20, que es del animalito.
2. **Portada del evento.** El cartel del calendario suma «Con el auspicio de {marca}» abajo, en letra chica.
3. **Encargo de marca (V2).** Un encargo del evento: «Ceba un mate con el termo nuevo» (toque en el cuarto, no un hábito). Paga herraduras del juego.

**Lo que ve la persona.** Abre el casillero 12. Paucho de cerca: «¡Mirá lo que llegó! Un termo de Yerba Pampa. Ahora el mate dura más». Debajo, en gris: «Auspicio · Yerba Pampa». Botones: «Ponerlo en la mesa» y «Guardarlo».

**En la Casita.** La ficha dice «Auspicio». Se saca y se cambia como cualquier otro, y no vuelve solo.

**Estados.**
| Estado | Qué ve la persona |
|---|---|
| Tiene Premium | Lo mismo: la marca no es anuncio, es objeto elegido. Premium no la oculta |
| Lo sacó | Queda en el galpón; no hay recordatorio |
| Terminó el contrato | El objeto se queda con quien lo ganó; deja de ofrecerse |

## Reglas y números
**Reglas de marca dentro del mundo.**
| Regla | Valor | Por qué |
|---|---|---|
| Objetos auspiciados por evento | 1 | Que el mundo siga siendo de Paucho |
| Logo | Pintado en el objeto, en fieltro, ≤ 15 % de su superficie | Estilo único (12) |
| Arte | Lo hace Gauchito; la marca aprueba, no entrega | Nadie pega un PNG corporativo |
| Lo que dice Paucho | 1 línea sobre el objeto; nunca precio, oferta, beneficio de salud ni «comprá» | Paucho no vende (30) |
| Etiqueta | «Auspicio · {marca}» en la ficha y en el casillero | Publicidad identificable |
| Dónde nunca | hábitos, racha, mate de la mañana, minuto de calma, «¿Cómo viene el día?», avisos, primera sesión | «Cuidarte es gratis» |
| Enlaces | Ninguno hacia la marca dentro del juego en V1 | Sin salir del mundo |
| Datos | La marca recibe solo totales: cuántos lo recibieron y lo pusieron | Nada personal, nada de ánimo |

**Categorías.**
| Sí | No |
|---|---|
| Yerbas, termos y mates | Apuestas, alcohol, citas (las mismas de 23) |
| Fintech: billetera o ahorro, con objeto neutro (una alcancía de chancho) | Préstamos, créditos rápidos, cripto, inversiones |
| Comida de perro (el perro de Paucho) | Suplementos, adelgazamiento, farmacéuticas, salud mental |
| Alpargatas, ropa de campo, camping | Comida ultraprocesada, bebidas azucaradas |
| Radios, música en streaming | Política, religión, clubes de fútbol |
| Librerías, bicicletas | Tabaco y vapeo |

Límite de la fintech: Paucho no habla de plata (30); objeto decorativo, sin tasas, cuotas ni rendimientos.

**Precio.**
| Escala | Precio | Qué incluye |
|---|---|---|
| Antes de 50 mil activos | Canje: producto para sorteos en redes (31) y difusión cruzada | Formatos 1 y 2 |
| 50–100 mil activos | USD 300–2.000 por evento-mes (plan) | Formatos 1 a 3 |
| Más de 100 mil | A definir con datos propios | Los cuatro |

**Kit de venta (una página).**
Paucho con el mate y «El gauchito que acompaña a {n} personas a cuidarse un poquito cada día» · público en totales (activos, país, 18+, días jugados por semana) · el objeto de muestra en el cuarto, con su etiqueta · resultado del evento anterior (recibido y puesto) · las reglas en 5 líneas · precio y fechas de los próximos 4 eventos (02) · contacto.

**Wellhub como canal.** Postularse como app socia de Wellhub, que tiene planes en Argentina (plan), desde 50 mil activos. No es una marca dentro del mundo: es distribución pagada por empresas a sus empleados. Las condiciones de pago se averiguan al postular (sin dato). Betterfly se fue de Argentina en 2025 (plan): no se arma venta propia a empresas.

## Contenido necesario
- 1 objeto auspiciado por evento: arte en fieltro, 2 estados si aplica; ficha con etiqueta.
- 3 líneas de Paucho por objeto.
- Modelo de contrato: duración, aprobación de arte en 2 rondas, sin datos personales, el objeto se queda con los jugadores.

## Arte, animación y sonido
Misma hoja de estilo y luz que el resto (12); la marca aprueba color y logo, no el estilo. Sin dorado: es para premios (15). Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- El objeto vive en la definición remota del evento (28): `{ id, marca, etiqueta, arte, linea, desde, hasta }`. Llega sin actualizar la app.
- `room.ts`: `RoomSource` suma `{ kind: 'marca'; eventoId }`. La ficha del objeto lee `etiqueta`.
- Si el contrato se corta, el servidor deja de ofrecerlo; lo ya ganado se queda en el guardado.
- Totales para el informe a la marca: salen de PostHog (27) agregados por evento; nunca por persona.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `marca_objeto_recibido` | Se abre su casillero | `evento_id`, `marca_id` |
| `marca_objeto_puesto` | Lo pone en el cuarto | `evento_id`, `marca_id`, `lugar` |
| `marca_objeto_sacado` | Lo saca | `evento_id`, `horas_puesto` |
| `marca_tarjeta_compartida` | Comparte la tarjeta con el objeto | `evento_id`, `marca_id` |

Ningún evento lleva ánimo ni reflexiones.

## Casos borde y riesgos
- **La marca pide más** (logo grande, enlace, eslogan en boca de Paucho): no; las reglas van en el contrato.
- **Escándalo de la marca.** Cláusula de salida: deja de ofrecerse y el arte se cambia por uno genérico, en remoto.
- **Yerba y hábito de mate.** Un hábito «Un mate con alguien» (29) no se vuelve de marca nunca.
- **Etiquetado.** «Auspicio» visible siempre. Revisar con abogado la norma argentina de publicidad y la de cada país antes del primer contrato (sin verificar).
- **Tiendas.** Contenido de terceros identificado, sin enlaces de compra; la etiqueta de privacidad no cambia.
- **Bienestar.** Ninguna marca promete efectos en el ánimo o la salud.

## Fases
- **V1 (canje, antes de 50 mil):** formato 1 y 2 con una yerba, a cambio de producto para sorteos y difusión.
- **V2 (desde 50 mil):** contratos pagos, encargo de marca, kit de venta, postulación a Wellhub.
- **Más adelante:** objeto en la tarjeta de fin de evento (10); marcas por país (32).
- **Afuera:** marcas en hábitos, racha, avisos o calma; enlaces de compra; datos personales para marcas.

## Criterios de aceptación
- [ ] El objeto auspiciado nunca cae en el casillero 20 ni en la primera semana.
- [ ] La etiqueta «Auspicio · {marca}» se lee en el casillero y en la ficha a 390×844.
- [ ] Sacar el objeto funciona igual que con cualquier otro y no dispara mensajes.
- [ ] Con el contrato vencido, el objeto ya ganado sigue en el guardado.
- [ ] El informe a la marca contiene solo totales por evento.

## Preguntas abiertas
1. **¿Fintech sí o no?** Choca con «Paucho no habla de plata» (30). Recomiendo aceptarla solo con objeto neutro y sin texto sobre plata; si no hay fintech que lo acepte, dejarla afuera.
2. **¿Premium oculta las marcas?** Recomiendo no: es un objeto, no un anuncio, y se puede sacar.
3. **¿Primer canje antes de los 50 mil?** Recomiendo sí, en el primer evento con una yerba chica, para tener un caso que mostrar en el kit.
