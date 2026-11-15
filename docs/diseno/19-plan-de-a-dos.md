# 19 · Plan de a dos
> Estado: propuesta · Etapa: Después de las 24 semanas (si Premium convierte) · Mejora del plan: monetización, pieza 3 · Depende de: 09, 17, 26, 03, 04, 27

## En una línea
Una sola persona paga cerca de 1,5 veces Premium y lo comparte con su compañero de racha: dos cuentas, dos Pauchos, un pago, y dos cosas que solo existen de a dos.

## Problema y oportunidad
Premium individual deja afuera el gesto más fuerte de la app: cuidarse con alguien. La racha de a dos (doc 09) ya junta a dos personas todos los días; hoy no hay forma de que una le regale Premium a la otra, y en Latinoamérica solo 1,5 % de las descargas paga al día 35 (plan). La mayoría de los compañeros nunca va a pagar por su cuenta, pero sí puede recibirlo.

Tres referencias, las tres con una cuenta propia por persona:

| Producto | Cómo funciona | Qué copiamos |
|---|---|---|
| Spotify Premium Duo | Plan con descuento para 2 personas; cada una tiene su cuenta y hay una lista compartida, el Duo Mix ([Spotify](https://www.spotify.com/us-es/duo/)) | Dos cuentas separadas y un beneficio que solo existe de a dos |
| Duolingo Super Family | Hasta 6 cuentas; un blog de terceros lo ubica en USD 119,99 al año contra 83,99 el individual, cerca de 1,43× ([fuente no oficial](https://www.dailyexcelsior.com/?p=2182000)) | El múltiplo de precio y la invitación por enlace |
| Platzi Expert Duo | Plan anual para dos, cada uno con su cuenta, vendido en la región ([Platzi](https://platzi.com/precios/)) | La prueba de que «dúo» ya se entiende acá (plan) |

Por qué importa más allá de la plata: cada plan de a dos es una instalación que llega con Premium puesto y con una racha compartida, la combinación que mejor retiene (22 % más de días completos con amigo en Duolingo, correlación; plan).

## Objetivo y métricas

| Métrica | Objetivo inicial | Cómo se mide |
|---|---|---|
| Primaria: planes de a dos sobre suscripciones nuevas | ≥ 15 % (estimación; no hay referencia pública) | `duo_purchase_completed` / compras de Premium |
| Lugares ocupados a los 7 días de la compra | ≥ 80 % | `duo_invite_accepted` dentro de 7 días |
| Invitados que son instalaciones nuevas | ≥ 30 % (estimación) | `duo_invite_accepted.is_new_install` |
| Renovación al mes 2, de a dos contra individual | mayor en de a dos (hipótesis a probar) | RevenueCat, por producto |
| Guardrail: canibalización | menos de 50 % de los invitados pagaba antes (por debajo de eso el plan suma, ver modelo) | `duo_invite_accepted.guest_was_paying` |
| Guardrail: reembolsos y reclamos | no mayor que en individual | consolas de las tiendas |
| Guardrail: cambios de compañero | menos de 5 % de los planes agota el límite | `duo_partner_changed` |

## Experiencia

**Dónde se ofrece.** En tres lugares, nunca como interrupción:
1. Pantalla de Premium (doc 17): selector «Para mí · De a dos» arriba de los precios.
2. Racha de a dos: al cumplir 7 días juntos, Paucho lo menciona una vez: «Ya van siete mates con {compañero}. Si querés, Premium también puede ser de a dos.»
3. Ajustes → Suscripción → «Pasar a de a dos» para quien ya paga.

**Compra (titular).**
1. Toca «De a dos». Ve los dos precios y la cuenta hecha: «Sale {precio}. Son {precio/2} por cabeza.»
2. Paga con la hoja de la tienda. Su Premium empieza en el momento.
3. «¿Con quién lo compartís?» Lista sus compañeros de racha de a dos (doc 09) con un botón «Invitar» y, abajo, «Invitar a otra persona».
4. Se abre WhatsApp con el texto listo: «Te regalo Gauchito Premium. Es conmigo, de a dos, y vos no pagás nada 🧉 {enlace}».
5. Mientras nadie acepta, su tarjeta en Ajustes dice «Lugar libre · Reenviar invitación».

**Aceptación (invitado).**
1. Abre el enlace. Si no tiene la app, va a la tienda y, al abrirla, la invitación lo espera después del primer mate (no se saltea la primera sesión, doc 11).
2. Paucho de cerca, con dos mates: «{Titular} te invita a Premium de a dos. No pagás nada y no te pido tarjeta.» Botones «¡Acepto!» y «Ahora no».
3. Ceremonia corta (3 segundos, regla del doc 15): aparecen los teros en el patio y el juego de mate en la mesa del cuarto.
4. Al titular le llega un aviso: «{Invitado} aceptó. ¡Ya son dos!»
5. Si todavía no tenían racha de a dos, se les propone arrancarla ahí mismo. El plan no la exige.

**Lo que solo existe de a dos.**

| Beneficio | Qué es | Regla |
|---|---|---|
| El juego de mate de a dos | Objeto del cuarto: dos mates y un termo con las iniciales de los dos | Se entrega al aceptar; queda para siempre en ambos cuartos |
| La yunta de teros | Animalito compartido (los teros andan siempre de a dos). Cada uno tiene un tero en su área | El día que los dos cebaron el mate, los dos teros aparecen juntos y uno deja una herradura de regalo (5) |
| Regalo de la semana | Un mimo para el animalito del otro, una vez por semana | Sin costo; llega como aviso de Paucho |

Nada de esto toca hábitos, racha, obras, salidas ni calma: son cosas de mimar.

**Estados vacíos y de error.**

| Situación | Texto |
|---|---|
| Enlace vencido | «Esta invitación ya se enfrió. Pedile a {titular} que te mande otra.» |
| Enlace ya usado | «Este lugar ya tiene dueño.» |
| Sin conexión al aceptar | «No pude avisarle a {titular}. Probemos de nuevo cuando tengas señal.» |
| El invitado es el propio titular | «Este mate ya es tuyo. Mandáselo a otra persona.» |
| Fin del plan, para el invitado | «El plan de a dos terminó el {fecha}. Los teros y el juego de mate se quedan con vos.» |

**Casos de vida del plan.**

| Caso | Qué pasa |
|---|---|
| El invitado ya paga mensual | Acepta igual. Se le dice: «Ya tenés Premium. Para no pagar dos veces, cancelá tu renovación: tu lugar acá ya está activo.» Botón directo a la gestión de suscripciones de la tienda y un recordatorio 3 días antes de su renovación. No hay reembolso automático: la tienda no deja cancelar por el usuario en iOS |
| El invitado ya paga anual | Mismo aviso, con la fecha de fin. Puede aceptar ya o tocar «Guardame el lugar» y entrar cuando venza (el lugar se reserva hasta 60 días) |
| El invitado tiene «Amigo para siempre» (doc 21) | Recibe los beneficios de a dos; su pago único no cambia |
| El titular ya pagaba individual | «Pasar a de a dos» es una mejora dentro del mismo grupo de suscripción: la tienda prorratea ([Apple](https://developer.apple.com/app-store/subscriptions/), [Google](https://developer.android.com/google/play/billing/subscriptions)) |
| Se separan o se pelean | Cualquiera de los dos toca «Salir del plan» en Ajustes, sin pedir permiso ni dar motivo. El otro recibe un aviso neutro: «El lugar del plan de a dos quedó libre.» El invitado conserva Premium 7 días. Los teros y el juego de mate quedan en los dos teléfonos; los teros dejan de juntarse |
| El titular cancela | Los dos siguen hasta el fin del período pago. Siete días antes, el invitado ve: «El plan termina el {fecha}. ¿Seguís por tu cuenta o lo tomás vos?» «Tomarlo» lo convierte en titular con su propio pago y deja al otro como invitado |
| Falla el cobro del titular | Rige el período de gracia de la tienda; el invitado no ve nada hasta que el plan realmente termina |
| Cambian de compañero | El titular libera el lugar y manda otra invitación. Límite: 2 cambios cada 12 meses |
| El invitado borra su cuenta | El lugar queda libre y no cuenta como cambio |
| Termina la racha de a dos | El plan sigue: va atado a la persona, no a la racha |

## Reglas y números

| Regla | Valor inicial | Por qué |
|---|---|---|
| Precio | 1,5 × el individual, redondeado al escalón de tienda. Con individual a USD 2,99 / 19,99: USD 4,49 al mes y 29,99 al año. Con 2,49 / 14,99: USD 3,99 y 22,99 | Lo fija el plan; 25 % de ahorro por persona se entiende sin cuenta |
| Lugares | 2 (titular + 1) | «De a dos» es el producto; un plan familiar sería otro documento |
| Prueba gratis | La misma que el individual (doc 17), una vez por titular | No abrir un atajo para repetir pruebas |
| Vigencia del enlace | 7 días, un solo uso | Evita que circule en grupos |
| Cambios de compañero | 2 cada 12 meses; el primer lugar ocupado no cuenta | Frena la reventa y la rotación de lugares |
| Gracia del invitado al salir | 7 días de Premium | Nadie pierde todo de golpe por una pelea |
| Reserva para invitado con anual vigente | hasta 60 días | Evita el doble pago |
| Herradura de los teros | 5 por día en que ambos cebaron | Menos del 5 % del ingreso diario (cerca de 115; estimación del plan); revisar con doc 04 |
| Qué ve cada uno del otro | Lo mismo que en la racha de a dos: si cebó hoy | Ánimo, reflexión y hábitos nunca se comparten |
| Edad | Ambos 18+ declarados | Regla general |

## Contenido necesario
- Textos: unos 45 (compra 8, invitación 6, aceptación 6, casos de vida 15, avisos 6, teros 4).
- Arte: juego de mate de a dos (recorte del cuarto + miniatura), tero en 3 poses (parado, picotea, alerta), yunta junta en 1 pose, Paucho de cerca con dos mates (variante de `mate_b*`), tarjeta para compartir «Ya somos dos» (doc 10).
- Sonido: el grito del tero y el golpe de dos mates.

## Arte, animación y sonido
Los teros siguen el patrón de las gallinas del Área 2: sprites chicos con sombra de piso. El juego de mate ocupa la mesa del cuarto como una opción más del lugar `mesa`. Las iniciales se dibujan con texto sobre el arte, no con una pieza por pareja. Reglas de estilo: `docs/visual/guia-visual.md`.

## Datos y técnica

**Las tiendas no venden «para dos».** Lo único nativo es Family Sharing de Apple. La comparación:

| | Family Sharing de Apple | Lugar compartido propio (recomendado) |
|---|---|---|
| Plataformas | Solo iOS. En Google Play la Biblioteca familiar cubre apps, no compras dentro de la app ([respuesta de RevenueCat](https://community.revenuecat.com/general-questions-7/is-my-app-eligible-for-google-family-library-if-i-use-revenuecat-3107)) | iOS y Android; Android es 81–87 % del mercado (plan) |
| Con quién | Hasta cinco familiares del mismo grupo «En familia» de Apple ([Apple](https://developer.apple.com/news/?id=ksfkdwpr)) | Cualquier persona con la app: amiga, pareja, la vieja |
| Precio | No se puede cobrar distinto por compartir: el mismo producto se reparte | Producto aparte a 1,5× |
| Control | Una vez activado en un producto no se apaga; Apple no dice quién es familia de quién; el acceso tarda hasta 1 hora ([RevenueCat](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-family-sharing)) | Invitación, cambios y bajas son nuestros |
| Trabajo | Un interruptor | Cuenta (doc 26), 4 funciones de servidor, 3 tablas |

Recomendación: lugar compartido propio, y dejar Family Sharing apagado en todos los productos. Activarlo en el individual regalaría hasta cinco lugares por el precio de uno y no se puede revertir.

**Cómo funciona.**
1. Productos: `premium_duo_monthly` y `premium_duo_yearly`, en el mismo grupo de suscripción que el individual. En RevenueCat dan los derechos `premium` y `duo_owner`.
2. Supabase guarda la pareja: `duo_plans` (titular, producto, estado, fin de período), `duo_seats` (invitado, entró, salió), `duo_invites` (token, vence, usado por).
3. Funciones: `duo-invite` (crea el enlace si hay lugar y cupo de cambios), `duo-accept`, `duo-leave`, y `rc-webhook`, que escucha compra, renovación, cancelación y vencimiento.
4. Al aceptar, el servidor le otorga al invitado el derecho `premium` como acceso promocional por la API de RevenueCat ([referencia](https://www.revenuecat.com/docs/api-v1/entitlements)) y lo renueva o revoca con cada evento del titular. Así la app pregunta en un solo lugar si alguien es Premium. La referencia marca el campo `duration` como en desuso: hay que confirmar la forma vigente antes de construir. Alternativa: la app lee el lugar desde Supabase y calcula `premium = suscripción propia || lugar activo`.
5. Enlace: `https://{dominio}/d/{token}` como enlace universal; para instalaciones nuevas, el token viaja por el referente de instalación de Play y, en iOS, por un código de 6 letras escrito a mano como respaldo.

**En la app.** `store.ts` suma `duo: { role: 'owner' | 'guest', partnerName, since } | null` como caché; `premium` deja de ser un booleano de pruebas (doc 17). `room.ts` suma la opción de mesa con origen `duo`. Sin conexión vale lo último que guardó el SDK de RevenueCat.

**Revisión de tiendas.** El lugar del invitado sale de una compra hecha en la tienda, igual que en Duolingo Family. La regla 3.1.1 de Apple permite regalar a otros lo que se vende por compra dentro de la app ([Apple](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)). El enlace nunca lleva a pagar fuera de la tienda.

## Analítica

| Evento | Cuándo | Propiedades |
|---|---|---|
| `duo_offer_viewed` | Ve la opción de a dos | `source` (paywall, racha, ajustes) |
| `duo_purchase_completed` | Compra confirmada | `product_id`, `was_individual`, `trial` |
| `duo_invite_sent` | Abre WhatsApp con el enlace | `to_streak_partner` |
| `duo_invite_opened` | El invitado abre el enlace | `is_new_install` |
| `duo_invite_accepted` | Acepta | `guest_was_paying`, `hours_since_sent` |
| `duo_seat_reserved` | Toca «Guardame el lugar» | `days_to_expiry` |
| `duo_left` | Alguien sale | `role`, `days_in_plan` |
| `duo_partner_changed` | Lugar ocupado por otra persona | `changes_in_12m` |
| `duo_takeover` | El invitado toma el plan | `product_id` |
| `duo_teros_together` | Ambos cebaron hoy | `streak_days` |

## Casos borde y riesgos
- **Reventa de lugares.** Un lugar, enlace de un solo uso y 2 cambios al año la vuelven poco rentable.
- **Control en la pareja.** Salir es de un toque, sin permiso y con aviso neutro; el plan no agrega nada que el otro pueda mirar. Nunca un texto del tipo «{nombre} dejó de pagar».
- **Doble cobro.** Es el reclamo más probable. El aviso al aceptar y el recordatorio antes de la renovación son obligatorios para lanzar.
- **Culpa.** Los teros que no se juntan no dicen nada; no hay estado triste por la ausencia del otro.
- **Reembolso del titular.** Si la tienda devuelve la plata, el lugar se revoca; los objetos ya entregados quedan.
- **Titular en iOS, invitado en Android.** Funciona: el derecho vive en RevenueCat, no en la tienda del invitado.
- **Caída de RevenueCat o Supabase.** El invitado conserva el último estado guardado; nunca se revoca por un error de red.

## Fases
- **V1.** Dos productos, invitación por enlace, aceptar, salir, cancelación con aviso, juego de mate de a dos. Sin teros.
- **V2.** Yunta de teros, regalo semanal, «Tomarlo vos», «Guardame el lugar», tarjeta «Ya somos dos».
- **Más adelante.** Regalar un año de a dos (pago único), plan familiar de hasta 4. Afuera: ver hábitos del otro, chat.

## Criterios de aceptación
- [ ] Comprar de a dos da Premium al titular antes de invitar a nadie.
- [ ] El enlace abre la invitación con la app instalada y sin ella, en Android y en iOS.
- [ ] Un enlace usado o vencido no da acceso y muestra su texto.
- [ ] El invitado nunca ve una hoja de pago ni un pedido de tarjeta.
- [ ] Un invitado con suscripción propia ve el aviso de doble pago y el acceso a cancelarla.
- [ ] Al cancelar el titular, ambos conservan Premium hasta el fin del período y el invitado es avisado 7 días antes.
- [ ] «Salir del plan» funciona para los dos roles y deja 7 días de gracia al invitado.
- [ ] El tercer cambio de compañero en 12 meses se rechaza con un texto claro y la fecha en que se habilita.
- [ ] Ningún dato de ánimo, reflexión ni hábitos sale del teléfono por este sistema.
- [ ] Family Sharing figura apagado en todos los productos de App Store Connect.

## Modelo de ingresos (estimación)
Con 10 mil usuarios activos y 3 % que paga (caso medio del plan) hay 300 pagadores. A USD 2,99 son USD 897 brutos al mes.
- Si 15 % elige de a dos: 45 titulares pagan USD 1,50 más cada uno, +USD 67.
- Si 10 de esos 45 invitados ya pagaban y dejan de hacerlo: −USD 30.
- Neto: +USD 37 al mes, cerca de +4 %, antes del 15 % de comisión y de impuestos.

El plan suma mientras menos de la mitad de los invitados fuera pagador. En plata es poco a esta escala. Lo que compra son 45 personas más con Premium y racha compartida, y hasta 45 instalaciones nuevas sin costo.

## Preguntas abiertas
1. **¿Teros como animalito compartido?** No están en el elenco del plan (doc 03). Recomiendo sumarlos: andan de a dos y son el ave símbolo de Uruguay, lo que ayuda al doc 32.
2. **¿Gracia de 7 días al invitado que sale?** Cuesta poco y evita el peor momento. Recomiendo sí.
3. **¿Límite de 2 cambios por año o 1 cada 90 días?** Recomiendo 2 por año: más simple de explicar.
4. **¿Se ofrece al cumplir 7 días de racha de a dos?** Es el mejor momento y el más delicado. Recomiendo una sola mención, que no vuelve si se cierra.
5. **¿Quién tiene «Amigo para siempre» puede sumar a alguien?** Recomiendo dejarlo para después de ver cuántos lo compran.
6. **Dominio de los enlaces.** Hace falta uno propio antes de construir (también lo piden los docs 09 y 10).
