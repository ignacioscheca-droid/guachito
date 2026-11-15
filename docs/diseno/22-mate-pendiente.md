# 22 · El mate pendiente
> Estado: propuesta · Etapa: Después de las 24 semanas (si Premium convierte) · Mejora del plan: monetización, pieza 6 · Depende de: 17, 26, 27, 19

## En una línea
Quien quiere, deja pago un mes de Premium en el pizarrón de la pulpería; alguien que no puede pagarlo lo pide y lo recibe, sin que ninguno sepa quién es el otro.

## Problema y oportunidad
Premium deja afuera a quien no tiene tarjeta o no llega a fin de mes, y eso en una app de bienestar se nota. Google Play en Argentina solo acepta tarjetas y quien paga en pesos paga cerca de 1,5 veces el precio de lista (plan). «Cuidarte es gratis» cubre lo esencial; el mate pendiente cubre el mimo.

La costumbre existe: el café pendiente, donde se deja pago un café para quien venga después. Finch lo hace con los «Guardianes», que pagan y con eso se sortea Plus gratis para quien no puede pagarlo (plan). El plan lo dice sin vueltas: rinde más en imagen que en plata. Es la pieza que hace creíble el resto de la monetización, y da una historia para la prensa (doc 31).

## Objetivo y métricas

| Métrica | Objetivo inicial | Cómo se mide |
|---|---|---|
| Primaria: mates dejados por cada 100 pagadores al mes | ≥ 5 (estimación; sin referencia pública) | `mate_pendiente_purchased` / pagadores activos |
| Mates entregados sobre dejados, a 30 días | ≥ 90 % | `mate_pendiente_granted` / comprados |
| Espera mediana de quien pide | ≤ 14 días | fecha de pedido a entrega |
| Receptores que siguen activos al terminar su mes | ≥ 60 % | actividad 7 días después del fin |
| Guardrail: pedidos rechazados por abuso | < 10 % | `mate_pendiente_request_rejected` |
| Guardrail: reembolsos de mates dejados | < 2 % | consolas de las tiendas |

No es objetivo que el receptor pague después. Si pasa, se mide, pero no se le ofrece nada especial.

## Experiencia

**El pizarrón.** En la pantalla de Premium y en Ajustes hay una pizarra de pulpería: «Mates pendientes: 12». Debajo, dos botones: «Dejar un mate» y «Pedir un mate».

**Dejar un mate.**
1. Toca «Dejar un mate». Paucho de cerca: «Dejás pago un mes de Premium para alguien que hoy no puede. No va a saber quién fuiste.»
2. Elige 1, 3 o 5 mates. Paga con la hoja de la tienda.
3. El número del pizarrón sube con una tiza que raya. Paucho: «Listo. Queda anotado.»
4. Cuando alguien lo recibe, un aviso: «Tu mate pendiente ya lo está tomando alguien. Gracias.» Sin nombre, sin ciudad, sin fecha exacta.
5. Queda un recuerdo en el álbum (doc 01): «Mate pendiente», con la cantidad dejada.

Puede dejar un mate cualquiera, pague Premium o no. Se ofrece activamente solo a quien ya paga, una vez, al renovar.

**Pedir un mate.**
1. Toca «Pedir un mate». Paucho: «Si este mes no podés pagarlo, anotate. No te pregunto nada.»
2. Un solo botón: «Anotarme». No hay formulario, motivo ni comprobante.
3. Si hay mates: «¡Hay uno para vos! Tenés Premium hasta el {fecha}. No se renueva solo y no te pido tarjeta.»
4. Si no hay: «Ahora el pizarrón está vacío. Te anoté: cuando alguien deje uno, te aviso.» El pedido vale 30 días.
5. Al recibirlo puede mandar un gracias eligiendo una de cuatro frases hechas («¡Gracias por el mate!», «Me alegraste la semana», «Ya te lo devuelvo a alguien», «Estaba muy rico»). No hay texto libre.
6. Tres días antes del fin: «Tu mate pendiente termina el {fecha}. Lo que ya pusiste en el cuarto se queda como dice Premium.» (regla de vencimiento del doc 17). Sin oferta de pago en ese mensaje.

**Estados vacíos y de error.**

| Situación | Texto |
|---|---|
| Ya es Premium y toca «Pedir» | «Vos ya tenés Premium. ¿Querés dejar uno?» |
| Pidió hace poco | «Ya tomaste uno hace poco. Podés anotarte de nuevo el {fecha}.» |
| Cuenta muy nueva | «Primero conozcámonos unos días. Volvé a anotarte el {fecha}.» |
| Sin conexión | «Sin señal no llego a la pulpería. Probá en un rato.» |
| El pedido venció sin mate | «Este mes no llegó ninguno. Si querés, te anoto de nuevo.» |

## Reglas y números

| Regla | Valor inicial | Por qué |
|---|---|---|
| Precio | Igual a un mes de Premium (USD 2,49–2,99, plan) | Uno pagado, uno entregado: se explica solo |
| Qué recibe el receptor | 30 días de Premium completo, sin renovación ni tarjeta | El pedido nace de no poder pagar |
| Asignación | Fila por orden de pedido; se reparte al entrar cada mate | Más justo y más fácil de explicar que un sorteo; ver preguntas abiertas |
| Requisitos para pedir | Cuenta de 14 días o más y 7 días con actividad; no tener Premium ni prueba activa | Filtra cuentas creadas para pedir |
| Frecuencia | 1 mate cada 6 meses por persona | Que alcance para más gente |
| Vigencia del pedido | 30 días | La fila no se llena de gente que ya se fue |
| Tope por comprador | 5 mates por mes | Frena el lavado de tarjetas y los reembolsos masivos |
| Vencimiento del mate sin pedir | No vence; queda en el pizarrón | La plata ya se cobró: hay que entregarlo |
| Reembolso de un mate no entregado | Sale del pizarrón | No hay nada que revocar |
| Reembolso de un mate ya entregado | El receptor lo conserva; el costo lo absorbe la app | Nunca se le saca algo a quien pidió |
| Anonimato | Total en los dos sentidos | Nadie queda expuesto ni en deuda |
| Lo que nunca se pregunta | Ingresos, trabajo, salud, motivo | Dignidad y regla de datos sensibles |
| Número del pizarrón | Real, del servidor; se muestra también «entregados este mes» | Transparencia verificable |

## Contenido necesario
- Textos: unos 30 (pizarrón 4, dejar 8, pedir 8, avisos 6, gracias 4).
- Arte: pizarrón de pulpería con números de tiza (los números son texto), ícono del mate pendiente, recuerdo para el álbum, Paucho de cerca alcanzando un mate (ya existe en la escena del mate).
- Sonido: tiza sobre pizarra.

## Arte, animación y sonido
El pizarrón es madera oscura con tiza, del mismo material que los títulos en cartel (doc 15). No lleva dorado: el dorado es para premios y esto no es un premio. La tiza raya el número nuevo en 400 ms. Reglas: `docs/visual/guia-visual.md`.

## Datos y técnica
**Recomendación: consumible + derecho otorgado por servidor.**
1. Producto consumible `mate_pendiente_1` en las dos tiendas (packs de 3 y 5 como cantidad del mismo producto donde la tienda lo permita, o productos aparte).
2. RevenueCat avisa la compra por webhook a una función de Supabase, que suma filas en `pending_mates` (id, comprado_el, comprador, estado, receptor, entregado_el).
3. `mate-request` anota el pedido en `mate_requests` tras chequear requisitos. `mate-assign` corre con cada compra y cada pedido: toma el mate más viejo y el pedido más viejo, y le otorga al receptor el derecho `premium` por 30 días con la API de acceso promocional de RevenueCat ([referencia](https://www.revenuecat.com/docs/api-v1/entitlements); confirmar el parámetro de duración vigente, igual que en el doc 19).
4. La app del receptor ve `premium` activo como cualquier otra; no necesita código nuevo en el cliente más allá de las dos pantallas.

**Por qué no códigos promocionales de las tiendas.** En Google Play los códigos de suscripción dan una prueba gratis de 3 a 90 días y los personalizados solo sirven para quien nunca se suscribió ([Google](https://support.google.com/googleplay/android-developer/answer/6321495)); una prueba de suscripción pide medio de pago y se renueva, justo lo que el receptor no puede. Además vencen por trimestre y habría que repartirlos a mano por plataforma. Quedan como respaldo para prensa y creadores (doc 31).

**Revisión de tiendas.** Es un regalo de algo que se vende por compra dentro de la app, permitido por la regla 3.1.1 de Apple ([Apple](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)). No es una donación: ningún texto dice «donar», «donación» ni «caridad», y no se promete ningún beneficio fiscal.

**En la app.** Sin cambios al estado local salvo `matesDejados: number` para el recuerdo. Requiere cuenta (doc 26). El comprador y el receptor nunca se cruzan en una misma respuesta del servidor.

## Analítica

| Evento | Cuándo | Propiedades |
|---|---|---|
| `mate_pendiente_board_viewed` | Ve el pizarrón | `source`, `is_premium`, `available` |
| `mate_pendiente_purchased` | Compra confirmada | `quantity`, `is_premium` |
| `mate_pendiente_requested` | Se anota | `days_since_install`, `queue_position` |
| `mate_pendiente_request_rejected` | No cumple requisitos | `reason` |
| `mate_pendiente_granted` | Recibe el mes | `wait_days` |
| `mate_pendiente_thanks_sent` | Elige una frase | `phrase_id` |
| `mate_pendiente_ended` | Termina el mes | `active_last_7d` |

Ningún evento une comprador con receptor.

## Casos borde y riesgos
- **Abuso con cuentas nuevas.** Los 14 días y 7 activos lo encarecen; un mismo dispositivo no puede pedir con dos cuentas en 6 meses.
- **Fila larga y pizarrón vacío.** Es el escenario más probable al principio. El texto lo dice de frente y no promete fecha. Ver la pregunta sobre poner mates de la casa.
- **Exposición.** No hay lista de receptores, ni «alguien de Córdoba», ni insignia visible para otros. En la racha de a dos (doc 09) el compañero no ve cómo se obtuvo Premium.
- **Presión para dar.** Se ofrece una vez al renovar y no vuelve. Paucho nunca dice que alguien «está esperando».
- **Culpa al terminar.** El mes termina con un aviso neutro; ningún texto compara con «lo que perdés».
- **Chargebacks.** Tope de 5 por mes por comprador; lo entregado no se revoca.
- **Lectura como sorteo.** Una fila sin azar evita las reglas de sorteos y concursos de las tiendas y del país.

## Fases
- **V1.** Pizarrón, dejar 1 mate, pedir, fila, entrega, aviso anónimo al comprador.
- **V2.** Packs de 3 y 5, frases de gracias, recuerdo en el álbum, «entregados este mes».
- **Más adelante.** Mates de la casa, mates dejados por marcas (doc 24), mate pendiente de a dos. Afuera: mensajes libres, elegir a quién va, ranking de quienes dejan.

## Criterios de aceptación
- [ ] Comprar un mate sube el pizarrón en menos de 5 segundos con conexión.
- [ ] Con mate disponible, pedir da Premium en el momento, sin hoja de pago ni tarjeta.
- [ ] Sin mate disponible, el pedido queda en fila y se entrega solo al entrar uno.
- [ ] Una cuenta de menos de 14 días o con Premium activo no puede pedir y ve su texto.
- [ ] El mes otorgado termina a los 30 días sin renovarse.
- [ ] Ninguna pantalla, aviso ni evento permite deducir quién dejó o quién recibió.
- [ ] Ningún texto usa «donar», «caridad» ni pregunta por la situación de la persona.
- [ ] Un reembolso de un mate ya entregado no le quita Premium al receptor.

## Preguntas abiertas
1. **¿Fila o sorteo?** Finch sortea. Recomiendo fila: es más justa, se explica en una línea y no roza reglas de sorteos.
2. **¿Mates de la casa?** Que la app ponga 1 cada 10 dejados, o 20 al lanzar para que el pizarrón no arranque vacío. Recomiendo los 20 iniciales; cuestan cero en efectivo.
3. **¿Puede dejar un mate quien no paga Premium?** El plan dice «quien paga». Recomiendo abrirlo a todos: hay gente que no quiere suscripción pero sí este gesto.
4. **¿Un mes o más?** Recomiendo un mes fijo en V1; un solo tamaño mantiene la cuenta «uno pagado, uno entregado».
5. **¿Se cuenta en la prensa?** Recomiendo sí, con el número real de entregados y sin historias de receptores.
