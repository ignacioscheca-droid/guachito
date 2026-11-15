# 20 · Paquete de bienvenida
> Estado: propuesta · Etapa: Etapas 1–5 del plan (con el primer evento) · Mejora del plan: — (Monetización, pieza 4) · Depende de: 03, 04, 17, 27

## En una línea
Una oferta única y barata (un animalito, un pañuelo y herraduras) que aparece desde el tercer día, dura 14 días de verdad y no vuelve nunca.

## Problema y oportunidad
Hoy no hay ninguna compra por debajo de la suscripción. El plan lo dice así: «la primera compra es la más difícil; hay que hacerla chica». En la región solo 1,5 % de las descargas paga una suscripción a día 35 (plan); el otro 98,5 % no tiene nada que comprar.

Importa menos por su ingreso que por lo que enseña: quién está dispuesto a pagar algo, y si después paga más.

Se lo aprendemos a los paquetes de inicio de mobile gaming (Royal Match, Homescapes). No copiamos sus sellos de «500 % más valor» ni sus relojes: acá no se vende moneda suelta, así que no hay precio de referencia honesto contra el cual inflar.

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: personas que ven la oferta y la compran | 3–5 % (estimación; la primera compra en juegos de la región es 6,51 %, sin verificar, plan) | `welcome_pack_purchased` ÷ `welcome_pack_viewed` |
| Compradores que pagan Premium o un pase en 60 días | Se mide; es la hipótesis central | RevenueCat |
| Guardrail: D7 de quienes vieron la oferta | Igual que el grupo sin oferta | experimento, doc 27 |
| Guardrail: prueba de Premium iniciada | Sin caída | experimento |
| Guardrail: reembolsos | < 5 % (estimación) | RevenueCat |

**Modelo de ingresos (estimación).** De 1.000 instalaciones, unas 200 llegan al día 3 con la Casita abierta. Con 4 % de compra: 8 paquetes a USD 0,99 son USD 7,9 brutos, USD 6,7 después del 15 % de comisión. Para comparar: la suscripción deja USD 268 brutos por 1.000 instalaciones con 1,5 % de conversión, prueba a pago de 20–23 % y USD 17,9 por pagador al año (plan). El paquete no mueve el ingreso; sirve si sus compradores convierten más después.

## Experiencia
1. **Cuándo aparece.** Nunca en la sesión 1. La primera vez que abrís la pestaña Paucho (se abre el tercer día con hábitos), si ya pasó la ceremonia de esa pestaña y no hay otra en cola.
2. **Cómo aparece.** Paucho, de cerca: «{nombre}, armé un paquetito de bienvenida. Mirá lo que tiene». Botones «A ver» y «Ahora no».
3. **La hoja.**
   - Título: «Paquete de bienvenida».
   - Tres tarjetas grandes: «Lanita, la corderita» · «Pañuelo a lunares» · «300 herraduras».
   - «Un solo pago de {precio}. Se compra una sola vez».
   - «Está en la tienda hasta el {día y fecha}».
   - Botón verde: «Comprar · {precio}». Pie: «Ahora no» · «Restaurar compras».
4. **Si decís «Ahora no».** La oferta queda como una tarjeta en la tienda de la Casita, con su fecha. La app no vuelve a mostrarla por su cuenta, salvo una línea dentro de la tienda el último día: «El paquete de bienvenida está hasta hoy».
5. **Al comprar.** Lanita llega con una entrada corta (asoma, te mira, bala), Paucho se pone el pañuelo y las herraduras vuelan al contador. Paucho: «¡Gracias, {nombre}! Lanita ya se siente en casa».
6. **Después de la fecha.** La tarjeta desaparece. No hay «última oportunidad», segunda ronda ni versión más cara.

**Estados vacíos y de error.** Sin conexión: «No pudimos hablar con la tienda. Probá de nuevo en un rato»; los días sin conexión no descuentan de la ventana. Compra pendiente: «Tu compra está en camino; cuando la tienda confirme, llega Lanita». Ya comprado: la tarjeta no existe.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Precio de lista | USD 0,99 (en Argentina ~USD 1,49 con impuestos, 1,5×, plan) | Piso del rango del plan; la primera compra tiene que ser chica |
| Primera aparición | Tercer día con hábitos, al abrirse la pestaña Paucho | No en la sesión 1; ya conoce a Paucho y la tienda de prendas |
| Ventana | 14 días corridos desde que se vio | Da dos fines de semana; es real y no se reinicia |
| Cómo se muestra el plazo | Fecha en texto, sin reloj | Informar sin apurar |
| Apariciones por iniciativa de la app | 1, más una línea en la tienda el último día | Sin insistir |
| Avisos del teléfono | Ninguno | Los avisos son de Paucho, no de la tienda |
| Veces que se puede comprar | 1 por cuenta de tienda | «Una sola vez» tiene que ser verdad |
| Animalito | Lanita, la corderita; solo del paquete | No se saca ninguno de los que se ganan (doc 03) |
| Prenda | Pañuelo a lunares | Los pañuelos son las únicas prendas que hoy se ven puestas en todas las poses (`WEAR` en `shop.ts`) |
| Herraduras | 300 | Unos dos días y medio de ingreso (estimación sobre las 800 por semana del plan); recalibrar con el doc 04 |
| Para quien ya tiene Premium | Se ofrece igual | Es otra cosa: nada del paquete está en Premium |
| Precio tachado o «valor de…» | No | No existe precio de referencia real |

**Valor percibido, sin inflarlo.** El valor está en lo que se ve: un animalito con nombre que camina por el área, una prenda que Paucho lleva puesta en la pantalla principal y herraduras que alcanzan para dos o tres cosas del cuarto (las opciones 2 cuestan entre 50 y 140, `room.ts`). La hoja muestra a Lanita animada y a Paucho con el pañuelo, no un número de descuento.

**«Cuidarte es gratis, mimar a Paucho se paga», punto por punto.**
| Cosa | ¿La toca el paquete? |
|---|---|
| Hábitos, planes, energía de la barra | No. Las herraduras no compran energía |
| Racha y termos | No trae termos. Las 300 herraduras podrían comprar uno a 60 (`TERMO_PRICE`), igual que las ganadas: no se cobra un termo con plata (plan) |
| Obras, áreas, salidas | No acelera ni abre nada |
| Calma y «¿Cómo viene el día?» | No |
| Animalitos que se ganan (eventos, salidas, amistad) | Siguen gratis; Lanita es una más, no reemplaza a ninguna |
| Lo que se paga | Una corderita, un pañuelo y un empujón de herraduras: adornos y compañía |

## Contenido necesario
- Arte de Lanita, según el doc 03: caminando, sentada, durmiendo, entrada (3 cuadros) e ícono.
- Pañuelo a lunares: recoloreado del pañuelo rojo en las poses que ya tienen capa (`idle`, `celebrate`, `avatar`) y en las de trabajo cuando existan.
- Textos: 1 hoja, 3 variantes de la invitación de Paucho, 3 de agradecimiento, 1 línea del último día, 3 mensajes de error.
- 1 producto en cada tienda con su captura de revisión.

## Arte, animación y sonido
La hoja usa tres tarjetas del sistema de diseño, con Lanita en movimiento en la primera. El dorado se usa solo en las herraduras, que son premio. La entrada de Lanita reutiliza la estructura de la llegada del perro (`DogArrival`), más corta: 3 segundos. Sonido: un balido grabado (doc 15). Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- RevenueCat: producto no consumible `paquete_bienvenida`, entitlement `paquete_bienvenida`, offering `bienvenida`.
- Estado guardado: `welcomePack { firstSeenAt, expiresAt, bought, coinsGranted }`.
- Entrega: Lanita y el pañuelo se dan si el entitlement está activo (también al restaurar). Las 300 herraduras se dan una vez, con `coinsGranted`; al restaurar en un teléfono nuevo sin guardado en la nube no se repiten.
- La ventana se cuenta con el reloj del teléfono. Adelantarlo solo le cierra la oferta a quien lo hace; atrasarlo la extiende, y no importa.
- Archivos: `store.ts`, `shop.ts` (pañuelo), contenido de animalitos del doc 03, nuevo `screens/WelcomePack.tsx`, tienda de la Casita.
- La PWA no vende el paquete ni lo muestra.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `welcome_pack_viewed` | Se abre la hoja | `placement` (`paucho`, `tienda`), `day_n`, `days_left` |
| `welcome_pack_closed` | X o «Ahora no» | `placement` |
| `welcome_pack_purchased` | La tienda confirma | `price_usd`, `country`, `day_n`, `days_left` |
| `welcome_pack_expired` | Pasa la fecha sin compra | `times_viewed` |

## Casos borde y riesgos
- **La persona vuelve después de la ventana.** La oferta ya no está y nadie se lo menciona. Si eso genera reclamos, ver «Preguntas abiertas».
- **Choca con el paywall de Premium.** Premium se presenta en la Casita desde el día 3 (doc 17). Regla: nunca dos ofertas el mismo día; el paquete va primero y Premium espera al día siguiente.
- **Las herraduras inundan la economía.** 300 de una sola vez es poco frente al sobrante que mide el plan; igual se recalibra con el doc 04.
- **Reinstalar para comprar dos veces.** No se puede: la tienda no vende dos veces un no consumible.
- **Compras de menores.** Público declarado 18+; la compra pasa por la confirmación de la tienda.
- **Tiendas.** Compra dentro de la app, no consumible, con «Restaurar compras» (Apple 3.1.1). Contenido visible antes de pagar, sin azar. Precio leído de la tienda. La fecha límite tiene que ser cierta: una oferta «única» que reaparece es publicidad engañosa.
- **Bienestar.** La oferta no aparece en la racha, el mate de la mañana, la calma ni la vuelta después de días. Paucho no insiste ni se entristece.

## Fases
- **V1 (con el primer evento):** paquete único a USD 0,99, ventana de 14 días, una aparición.
- **V2:** experimento de precio (0,99 contra 1,99) y de ventana (14 días contra sin fecha).
- **Más adelante:** regalarle el paquete a tu compañero de racha (doc 09).
- **Afuera:** paquetes de herraduras sueltas, ofertas que se repiten, paquetes por nivel de gasto, relojes.

## Criterios de aceptación
- [ ] No aparece en la sesión 1 ni antes del tercer día con hábitos.
- [ ] No aparece el mismo día que el paywall de Premium.
- [ ] La hoja muestra las tres cosas, el precio de la tienda, «una sola vez» y la fecha.
- [ ] No hay reloj, precio tachado ni porcentaje de descuento.
- [ ] Pasada la fecha, la tarjeta no está en ninguna pantalla y no vuelve.
- [ ] Tras comprar: Lanita en el área, pañuelo puesto en Inicio, +300 en el contador, una sola vez.
- [ ] «Restaurar compras» devuelve a Lanita y el pañuelo, sin repetir herraduras.
- [ ] Ningún aviso del teléfono menciona el paquete.

## Preguntas abiertas
1. **¿Ventana de 14 días o sin fecha?** Recomiendo 14 días, dichos con fecha y sin reloj; probar contra «sin fecha» en V2 y quedarse con la que no baje D7.
2. **¿USD 0,99 o 1,99?** Recomiendo 0,99: el objetivo es la primera compra, no el ingreso.
3. **¿Un animalito solo del paquete?** Recomiendo sí (Lanita), para no vender nada que otro gana jugando. Lo decide el doc 03.
4. **¿Sale antes del primer evento?** El plan lo pone con el primer evento. Recomiendo respetarlo: depende de que existan los animalitos.
