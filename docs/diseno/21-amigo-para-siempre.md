# 21 · Amigo de Paucho para siempre
> Estado: propuesta · Etapa: Después de las 24 semanas (si Premium convierte) · Mejora del plan: — (Monetización, pieza 5) · Depende de: 17, 18, 26, 27

## En una línea
Un pago único que da Premium de por vida, para quien no quiere suscripciones, puesto en un lugar discreto y a un precio que no se come al plan anual.

## Problema y oportunidad
Hay gente que no se suscribe a nada, aunque el producto le guste. La lección del plan es Focus Friend: 1,4 millones de descargas en su primera semana (est.) y usuarios que «rechazaron la suscripción y pidieron un pago único de por vida» (plan). En Argentina se suma que cada cobro en dólares llega con cerca de 1,5 veces el precio de lista (plan): un cargo que se repite pesa más que uno solo.

Importa porque en la región apenas 1,5 % de las descargas paga a día 35 y la prueba convierte 20–23 % (plan). Parte del 77–80 % que prueba y no paga puede estar rechazando el formato y no el producto. Eso hay que medirlo, no suponerlo.

Lo que no se copia de Focus Friend: lanzar con pago único desde el día uno. El plan lo pone después de ver «si Premium convierte», porque el ingreso recurrente es la base (87 % en Duolingo, plan).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: ingreso por instalación a 12 meses | Mayor en la tanda con pago único que sin él | experimento por tanda, doc 27 |
| Pagadores que eligen el pago único | 10–20 % (estimación) | RevenueCat |
| Compradores que nunca habían empezado una prueba | ≥ 50 % (estimación): son pagadores nuevos | RevenueCat |
| Guardrail: suscripciones anuales nuevas | Caída ≤ 10 % en la tanda con pago único | experimento |
| Guardrail: suscriptores activos que se pasan | ≤ 15 % en 90 días (estimación) | `lifetime_purchased` con `prior_status` |
| Guardrail: reembolsos | < 5 % (estimación) | RevenueCat |

**Modelo de ingresos (estimación).** Por 1.000 instalaciones pagan 15 personas (1,5 %, plan). Si 3 de ellas eligen el pago único a USD 29,99 son USD 90 de una vez. Esas mismas 3 como suscriptoras dejarían USD 53,7 por año (USD 17,9 por pagador y año en Argentina, plan). El pago único empata recién a los 20 meses: gana si esas personas no iban a renovar dos veces, y pierde si iban a quedarse años. Si en cambio son 3 pagadores nuevos, que no se habrían suscrito, son USD 90 que no existían. Por eso la métrica primaria es el ingreso por instalación y no las ventas. Todo va con 15 % de comisión de tienda (plan).

## Experiencia
**Qué incluye.**
| | Premium | Para siempre |
|---|---|---|
| Las 6 cosas de estancia del cuarto | Mientras pagás | Siempre |
| Camino dorado de cada evento | Mientras pagás | Todos los eventos futuros |
| Más lugares para animalitos | Mientras pagás | Siempre |
| Sin ofertas de anuncios | Mientras pagás | Siempre |
| «El cuadro de amigos»: un retrato de Paucho con vos para la pared del cuarto | — | Sí, único extra |
| Segundo lugar del plan de a dos (doc 19) | — | No |
| Mate pendiente para otra persona (doc 22) | Compra aparte | Compra aparte |

El extra es uno solo y es cosmético. No hay un nivel «más amigo» por encima.

**Dónde se ofrece.**
1. Ajustes → Gauchito Premium, al final: «¿Preferís pagar una sola vez?».
2. En el paywall (doc 17), una línea de texto bajo los planes: «También hay un pago único», recién desde el día 30 de la persona.
3. Al terminar una prueba sin pagar, una sola vez, en Ajustes y como tarjeta en la Casita: «Si las suscripciones no son lo tuyo, hay un pago único».
4. Suscriptor con 6 meses o más: una línea en Ajustes, sin presentación de Paucho.

**Dónde no.** En los primeros 30 días. En la primera presentación del paywall. En el mate de la mañana, la racha, la calma, el ánimo o la vuelta después de días. En avisos del teléfono.

**La hoja.**
- Título: «Amigo de Paucho para siempre».
- «Un solo pago de {precio}. No se renueva. Nunca más te cobramos por Premium».
- Lista de lo que trae, con el cuadro a la vista.
- «Si hoy tenés una suscripción, cancelala en la tienda: no se corta sola. Te llevamos».
- Botón verde: «Comprar · {precio}». Pie: «Ahora no» · «Restaurar compras».

**Después de comprar.** Paucho, de cerca, con una línea y sin ceremonia larga: «¡Amigos para siempre, {nombre}! Colgué un cuadro nuestro». Si había una suscripción activa, pantalla siguiente: «Te queda un paso: cancelá tu suscripción para que no se renueve» y el botón «Abrir la tienda».

**Estados.** Ajustes muestra «Amigo de Paucho para siempre · desde el {fecha}», sin fecha de vencimiento ni botón de administrar. Errores y compra pendiente: los mismos textos del doc 17.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Precio de lista | USD 34,99 (Argentina: 29,99, que con impuestos ronda USD 45; 1,5×, plan) | Dentro del rango del plan y cerca de 2 veces el anual |
| Relación con el anual | Nunca menos de 2 veces el anual de ese país | Freno principal a la canibalización |
| Descuentos | Ninguno, nunca | Un «de por vida» en oferta enseña a esperar |
| Visibilidad | Texto secundario; nunca tercer botón del paywall | Quien lo busca lo encuentra; el resto ve los planes |
| Antigüedad mínima para verlo en el paywall | 30 días | El corte de Premium se lee antes, sin ruido |
| Presentaciones por iniciativa de la app | 1, al terminar una prueba sin pagar | Ahí está la persona que rechazó el formato |
| Qué cubre «para siempre» | Todo lo que Premium incluya mientras la app exista | Promesa simple y cumplible |
| Qué no cubre | Plan de a dos, mate pendiente, objetos de marcas (doc 24) | Son productos para otra persona o de terceros |
| Pase del evento ya comprado | No se reembolsa; se avisa antes | Igual que en el doc 18 |
| Compartir en familia | Apagado | Un pago, una persona; el de a dos es el doc 19 |

**Cómo se acota la canibalización.** Precio en dos anuales o más, sin descuentos. Fuera de la primera presentación y de los primeros 30 días. Se lanza solo si Premium pasó su corte de 1 % (plan), en la mitad de las tandas nuevas. Se retira si las anuales nuevas caen más de 10 % sin que suba el ingreso por instalación.

**«Cuidarte es gratis, mimar a Paucho se paga», punto por punto.**
| Cosa | Con el pago único |
|---|---|
| Hábitos, planes, energía | Igual que gratis; no suma nada |
| Racha y termos | No da termos ni protege la racha |
| Obras, áreas, salidas | No acelera ni abre ninguna |
| Calma, ánimo, reflexión | Igual que gratis |
| Camino común de eventos y sus animalitos | Igual que gratis |
| Lo que se paga | Los mismos adornos de Premium y un cuadro. «Amigo» es el nombre del producto: Paucho trata igual a quien no paga |

## Contenido necesario
- Arte: «El cuadro de amigos» (una cuarta opción del lugar `cuadro` en `room.ts`, con miniatura) y la imagen de la hoja.
- Textos: 1 hoja, 1 pantalla de «cancelá tu suscripción», 3 variantes de la línea de Paucho, 4 líneas de entrada (Ajustes, paywall, fin de prueba, suscriptor antiguo).
- 1 producto en cada tienda con su captura de revisión.

## Arte, animación y sonido
La hoja es sobria: fondo del cuarto, el cuadro en primer plano y nada que parpadee. Al comprar, el cuadro se cuelga en la pared con el rebote corto de «colocar» y un brillo que lo recorre una vez (doc 15). Sin confeti: el festejo grande se reserva para lo que la persona logra, no para lo que paga. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- RevenueCat: producto no consumible `gauchito_para_siempre`. Otorga el mismo entitlement `premium` del doc 17 y uno propio, `para_siempre`, para el cuadro y el texto de Ajustes. Offering `para_siempre`, separado del `default`.
- Estado: `entitlement.status` suma el valor `'lifetime'`, sin `expiresAt`. `hasPremium(s)` lo cuenta como activo.
- Las tiendas no cancelan la suscripción al comprar un pago único. La app detecta `premium` activo por suscripción más `para_siempre` y muestra el aviso con enlace a la administración de suscripciones hasta que deje de renovarse.
- Sin cuenta (doc 26), el pago queda atado a la cuenta de la tienda: «Restaurar compras» lo devuelve en un teléfono nuevo de la misma tienda. Pasar de Android a iPhone pide la cuenta del doc 26.
- Archivos: `game/premium.ts`, `screens/Paywall.tsx`, Ajustes, `room.ts` (cuadro), nuevo `screens/ParaSiempre.tsx`.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `lifetime_offer_viewed` | Se abre la hoja | `placement`, `day_n`, `prior_status` |
| `lifetime_offer_closed` | X o «Ahora no» | `placement` |
| `lifetime_purchased` | La tienda confirma | `price_usd`, `country`, `prior_status`, `day_n` |
| `lifetime_cancel_reminder_shown` | Compra con suscripción activa | `plan` |
| `lifetime_double_billing_resolved` | La suscripción deja de renovarse | `days_to_resolve` |

## Casos borde y riesgos
- **Doble cobro.** Compra el pago único y la suscripción se renueva igual. Mitigación: aviso antes y después, y una tarjeta fija en Ajustes hasta que se resuelva. Es el riesgo de confianza más grande del documento.
- **Compra durante la prueba.** La prueba hay que cancelarla igual; el mismo aviso.
- **«Para siempre» y la app cierra.** Los términos dicen: mientras la app esté disponible. No se promete contenido nuevo con fecha.
- **Costo que no termina.** Cada comprador recibe todos los eventos futuros sin pagar más. Con cuatro eventos al año reutilizables (plan) el costo por persona es casi cero; con eventos auspiciados (doc 24) no cambia.
- **Cambio de tienda.** Sin cuenta, el pago no cruza de Android a iPhone. Se avisa en la hoja hasta que exista el doc 26.
- **Tiendas.** No consumible con «Restaurar compras» (Apple 3.1.1); precio leído de la tienda; el texto no puede sugerir que es una suscripción ni esconder que la suscripción vigente sigue.
- **Bienestar.** «Amigo» no puede leerse como que quien no paga es menos amigo: ningún texto de Paucho cambia según el pago, salvo la línea de agradecimiento.

## Fases
- **V1:** producto, hoja, entradas 1 y 3, aviso de doble cobro, cuadro, en la mitad de las tandas.
- **V2:** entradas 2 y 4; precio por país; decisión de dejarlo o retirarlo según el ingreso por instalación a 6 meses.
- **Más adelante:** regalar un «para siempre».
- **Afuera:** descuentos, niveles por encima, pago único del plan de a dos.

## Criterios de aceptación
- [ ] No aparece antes del día 30 ni en la primera presentación del paywall.
- [ ] El precio de cada país es al menos 2 veces su anual.
- [ ] La hoja dice «No se renueva» y avisa de la suscripción vigente antes del botón de compra.
- [ ] Con suscripción activa, tras comprar aparece el paso de cancelar, con enlace a la tienda, y persiste en Ajustes.
- [ ] `hasPremium` es verdadero sin fecha de vencimiento; nada premium se cierra nunca.
- [ ] «Restaurar compras» lo devuelve tras reinstalar.
- [ ] Ningún hábito, racha, obra, salida ni ejercicio de calma cambia con la compra.

## Preguntas abiertas
1. **¿USD 29,99 o 39,99?** Recomiendo 34,99 de lista y 29,99 en Argentina; subir si se pasan más de 15 % de los suscriptores.
2. **¿Se muestra a quien nunca probó Premium?** Recomiendo solo en Ajustes hasta el día 30.
3. **¿El nombre?** «Amigo de Paucho para siempre» es el del plan. Si en pruebas se lee como «los que no pagan no son amigos», alternativa: «Premium para siempre».
4. **¿Lanzarlo si Premium no llega al 1 %?** El plan dice no. Hay un argumento contrario (Focus Friend): si el corte falla y las reseñas piden pago único, probarlo antes de descartar el cobro. Recomiendo decidirlo con las respuestas de quienes cierran el paywall.
