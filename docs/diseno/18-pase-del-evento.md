# 18 · Pase del evento
> Estado: propuesta · Etapa: Etapas 1–5 del plan (con el primer evento) · Mejora del plan: 2 (Monetización, pieza 2) · Depende de: 02, 17, 03, 04, 27, 28

## En una línea
Una compra chica y única por evento que abre su camino dorado, incluida en Premium, que no vence y que se puede comprar tarde sin perder nada.

## Problema y oportunidad
Entre «gratis» y «suscribirme» no hay ningún escalón. El plan mide que la región prefiere compromisos cortos (29 % de planes semanales, el valor más alto del mundo) y descarta los semanales porque «en bienestar se leen como trampa» (plan). El pase es «la versión honesta de eso»: un pago, un evento, sin renovación.

Importa porque el gasto llega con los eventos (Pokémon Sleep, plan) y porque la primera compra es la más difícil (plan). El pase convierte el evento del doc 02 en el primer lugar donde alguien paga sin suscribirse.

Se lo aprendemos a los pases de temporada de mobile gaming (Royal Match) y a Finch, cuyo evento deja la micromascota en el camino gratis y permite reclamar después lo perdido (plan).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: participantes del evento que compran el pase | 2–4 % (estimación; la primera compra en juegos de la región es 6,51 %, sin verificar, plan) | `pass_purchased` ÷ personas con casillero 1 |
| Pagadores nuevos (sin compra previa) | ≥ 70 % de los compradores (estimación) | RevenueCat |
| Compradores que pasan a Premium en 60 días | Se mide, sin objetivo en el primer evento | RevenueCat |
| Guardrail: participación en el camino común | Igual con y sin pase a la vista | experimento, doc 27 |
| Guardrail: reembolsos | < 5 % (estimación) | RevenueCat |
| Guardrail: pagos a Premium | Sin caída en la tanda con pase | experimento |

**Modelo de ingresos (estimación).** Con 10 mil usuarios activos, si la mitad juega el evento y 3 % compra: 150 pases a USD 1,99 son USD 299 brutos por evento, USD 254 después del 15 % de comisión. Con cuatro eventos al año (plan): cerca de USD 1.000 netos al año, unos USD 85 por mes. Es poco; su valor está en crear pagadores. Referencia: un pagador argentino vale USD 17,9 al año (plan), y la suscripción convierte 1,5 % a día 35 con prueba a pago de 20–23 % (plan). El pase apunta a quien no entra en ese 1,5 %.

## Experiencia
El doc 02 define el evento: 20 casilleros que avanzan con cada día jugado. Este documento agrega solo la fila dorada.

1. **Pantalla del evento.** Dos filas: arriba el camino común, abajo el dorado, con sus premios a la vista y un candado chico. Sin cartel de venta al entrar.
2. **Tocar un casillero dorado.** Paucho, en globo: «Ese es del camino dorado. Se abre con el pase de este evento». Botón «Ver el pase».
3. **Una sola oferta por iniciativa de la app,** al reclamar el casillero 3: tarjeta bajo el camino, «Ya caminaste 3 casilleros. Con el pase te llevás también los 3 dorados». Se cierra con X y no vuelve.
4. **Hoja del pase.**
   - Título: «Pase de {evento}».
   - Lista con íconos de todo lo dorado, sin premios sorpresa.
   - «Un solo pago de {precio}. No se renueva».
   - «Te llevás ahora los {n} dorados de los casilleros que ya caminaste».
   - «El evento termina el {fecha}. Viniendo todos los días llegás al casillero {m}. Lo que falte lo podés buscar después: el pase no vence».
   - Botón verde: «Comprar el pase · {precio}». Secundario: «O tenelo incluido con Gauchito Premium» (abre el paywall del doc 17).
   - Pie: «Ahora no» · «Restaurar compras».
5. **Después de comprar.** Los dorados ya alcanzados se reclaman de un toque, uno atrás del otro, con el festejo corto del doc 15. Paucho: «¡Qué lujo! Mirá todo lo que trajimos».
6. **Con Premium.** El camino dorado está abierto desde el casillero 1, sin hoja de venta. Un sello dice «Incluido en tu Premium».

**Comprar tarde.** El pase entrega al instante todo lo dorado de los casilleros ya caminados. Los que faltan se abren al caminarlos. Si el evento termina antes, quedan disponibles por la vía de «buscar después» del doc 02, sin pagar de nuevo.

**Estados vacíos y de error.** Sin evento activo: el pase no existe en ninguna pantalla. Sin conexión: «No pudimos hablar con la tienda. Probá de nuevo en un rato»; el camino común sigue andando. Compra pendiente (pago demorado): «Tu compra está en camino; cuando la tienda confirme, se abre solo».

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Precio de lista | USD 1,99 (en Argentina ~USD 2,99 con impuestos, 1,5×, plan) | Piso del rango del plan; primera compra chica |
| Tipo de compra | Pago único por edición, no consumible, restaurable | No es suscripción: nada se renueva solo |
| Vigencia | Para siempre, para esa edición | Sin miedo a perder lo pagado |
| Compra tardía | Entrega retroactiva de todo lo caminado | Estándar de los pases; nadie paga por menos |
| Dónde se vende | Solo durante el evento y hasta 7 días después de su cierre | Ver «Preguntas abiertas» |
| Ofertas por iniciativa de la app | 1 por evento, en el casillero 3 | Primero mostrar el evento, después vender |
| Para quien tiene Premium | Incluido; no se le vende | Plan |
| El animalito exclusivo | Siempre en el camino común | Regla de Finch; el animalito no se paga |
| Contenido dorado | Solo cosmético: cosas del cuarto, prendas, un adorno para el animalito | Doc 02 define la lista |
| Herraduras en el camino dorado | Ninguna, o un monto simbólico | No vender moneda por la puerta de atrás; doc 04 |
| Termos en el camino dorado | Ninguno | «No cobrar por salvar la racha con plata» (plan) |
| Avisos del teléfono sobre el pase | Ninguno | Los avisos son de Paucho, no de la tienda |
| Cuenta regresiva | No; la fecha de cierre va en texto | Sin presión fabricada |

**«Cuidarte es gratis, mimar a Paucho se paga», punto por punto.**
| Cosa | Gratis | Con pase o Premium |
|---|---|---|
| Avanzar casilleros (un día jugado, un casillero) | Sí, igual para todos | Igual; el pase no acelera |
| Camino común completo: animalito, 2 prendas, 3 cosas del cuarto (plan) | Sí | Sí |
| Reclamar después lo no alcanzado | Sí (doc 02) | Sí, también lo dorado |
| Hábitos, racha, obras, salidas, calma durante el evento | Sí | Sin cambios |
| Camino dorado | Visible, cerrado | Abierto |
| Saltear casilleros o comprar días | No existe | No existe |

## Contenido necesario
- Por evento: lista dorada del doc 02 (propuesta: 5 a 6 piezas cosméticas, no 20; el resto de los casilleros dorados van vacíos o con variantes de color).
- Textos: 1 hoja de venta, 1 tarjeta del casillero 3, 3 líneas de Paucho al tocar un dorado, 2 líneas al comprar, 3 mensajes de error.
- Arte: fila dorada del camino, sello «Incluido en tu Premium», ícono del pase.
- 1 producto por edición en cada tienda, con su captura de revisión.

## Arte, animación y sonido
El dorado se usa acá porque es premio (guía visual: dorado solo para premios). La fila dorada brilla suave; el candado no tiembla ni llama la atención. Al abrirse, un brillo recorre la fila de izquierda a derecha y suena el efecto de premio del doc 15. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- RevenueCat: un producto no consumible por edición, `pase_{año}_{mes}_{evento}` (ejemplo: `pase_2027_07_dia_del_amigo`), con entitlement `pase_{eventId}`. Offering `evento_actual`, que apunta al producto de la edición en curso.
- Acceso al camino dorado: `hasPremium(s) || s.passes.includes(eventId)`.
- Estado guardado: `passes: string[]` y `goldClaimed: Record<eventId, number[]>`. El avance del evento es el del doc 02; no se duplica.
- El id del producto viaja en el JSON remoto del evento (doc 28), así un evento nuevo no pide actualizar la app. El producto sí hay que crearlo y enviarlo a revisión en cada tienda antes del evento: sumar dos semanas de margen.
- Restaurar: `passes` se rearma desde RevenueCat. Lo ya reclamado depende del guardado en la nube (doc 26).
- La PWA no vende el pase.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `pass_offer_viewed` | Tarjeta del casillero 3 u hoja abierta | `event_id`, `placement`, `step_reached`, `days_left` |
| `pass_offer_closed` | X o «Ahora no» | `event_id`, `placement` |
| `pass_purchased` | La tienda confirma | `event_id`, `step_reached`, `price_usd`, `country`, `first_purchase` |
| `gold_step_claimed` | Reclama un dorado | `event_id`, `step`, `source` (`pass` o `premium`) |
| `pass_to_premium_tapped` | Toca «incluido con Premium» | `event_id` |

## Casos borde y riesgos
- **Compró el pase y después se suscribió.** No hay reembolso automático. La hoja lo avisa antes con el enlace a Premium. El pase sigue valiendo si la suscripción vence.
- **Premium vence en medio del evento.** Lo dorado reclamado queda. Lo que falta se cierra y puede comprar el pase; ve cuántos dorados ya caminó.
- **Compra el último día.** La hoja dice hasta qué casillero llega y que lo demás se busca después. Si eso no se puede garantizar técnicamente en V1, la venta se cierra 3 días antes del final.
- **Canibaliza Premium.** Cuatro pases al año son USD 7,96 contra USD 14,99–17,99 del anual. Si los pagos a Premium caen en la tanda con pase, subir el pase a USD 2,99.
- **Adelantar el reloj** suma casilleros (riesgo del plan). El pase no lo empeora; lo resuelve el doc 02.
- **Tiendas.** Compra dentro de la app, no consumible, con «Restaurar compras» (Apple 3.1.1). Sin cajas de premios al azar: todo se ve antes de pagar. Precio leído de la tienda.
- **Bienestar.** El pase nunca se menciona en la racha, el ánimo ni la calma. Ningún texto dice «no te lo pierdas» ni «última oportunidad».

## Fases
- **V1 (primer evento):** fila dorada, hoja de venta, entrega retroactiva, incluido en Premium, restaurar.
- **V2:** sello «Incluido en tu Premium», enlace cruzado medido, experimento de precio 1,99 contra 2,99.
- **Más adelante:** pase regalado a tu compañero de racha (doc 09); eventos auspiciados (doc 24).
- **Afuera:** pase anual de eventos (eso es Premium), niveles de pase, saltear casilleros pagando.

## Criterios de aceptación
- [ ] El camino común y su animalito se completan sin pagar.
- [ ] Comprar con N casilleros caminados entrega exactamente N dorados al instante.
- [ ] La hoja muestra precio de la tienda, «No se renueva», fecha de cierre y casillero alcanzable.
- [ ] Con Premium activo o en prueba, no aparece ninguna oferta del pase.
- [ ] Tras reinstalar, «Restaurar compras» devuelve el pase.
- [ ] La tarjeta del casillero 3 aparece una vez por evento y no vuelve tras cerrarla.
- [ ] Sin evento activo no hay ningún rastro del pase.
- [ ] Ningún aviso del teléfono menciona el pase.

## Preguntas abiertas
1. **¿Se vende el pase de un evento ya cerrado?** Recomiendo solo hasta 7 días después; más allá complica la tienda y el soporte.
2. **¿USD 1,99 o 2,99?** Recomiendo 1,99 en el primer evento y probar 2,99 en el segundo.
3. **¿El pase vale para la reedición del mismo evento al año siguiente?** Recomiendo no: producto por edición, con piezas doradas nuevas.
4. **¿Cuántas piezas doradas por evento?** Recomiendo 5 a 6, para no duplicar el costo de arte (el plan presupuesta 6 piezas por evento).
