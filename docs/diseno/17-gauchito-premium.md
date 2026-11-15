# 17 · Gauchito Premium
> Estado: propuesta · Etapa: Lanzamiento suave · Mejora del plan: — (Monetización, pieza 1) · Depende de: 04, 02, 03, 26, 27

## En una línea
Una suscripción barata, mensual o anual, con 14 días de prueba, que abre lo que embellece el mundo de Paucho y nunca lo que te hace bien.

## Problema y oportunidad
Premium ya existe en el código, pero no se puede comprar. `store.ts:89-90` guarda `premium: boolean`, que solo prende el menú de pruebas (`TestMenu.tsx:46`). `room.ts` marca seis cosas del cuarto como `premium` y `Casita.tsx:38` ya dice: «Esa es de Gauchito Premium: cuando te suscribas, la comprás con tus herraduras».

Importa por dos razones. La suscripción es la mayor parte del ingreso en las apps comparables (87 % en Duolingo, plan). Y el plan pide cobrar en el lanzamiento suave «para saber temprano si alguien paga», con corte en 1 % de las instalaciones (plan).

Se lo aprendemos a Finch (todo el cuidado es gratis; Plus es cosmético) y a Duolingo y Blinkist (la línea de tiempo de la prueba, con aviso antes del cobro).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: instalaciones que pagan a día 35 | ≥ 1 % (corte del plan); referencia LATAM 1,5 % (plan) | RevenueCat, por tanda de 300 instalaciones de desconocidos |
| Instalaciones que empiezan la prueba | ≥ 5 % para el corte; 6,5–7,5 % para llegar a 1,5 % (cuenta: 1,5 % ÷ 20–23 %) | `trial_started` ÷ instalaciones |
| Prueba a pago | 20–23 % (plan) | RevenueCat |
| Mezcla anual | ≥ 60 % de los pagos (estimación) | RevenueCat |
| Guardrail: D7 y D30 | sin caída contra la tanda sin paywall | experimento, doc 27 |
| Guardrail: reembolsos | < 5 % de los cobros (estimación) | RevenueCat |
| Guardrail: reseñas que mencionan cobro o engaño | 0 | lectura manual semanal |

**Modelo de ingresos, por 1.000 instalaciones.** Con 1,5 % pagan 15 personas. A USD 17,9 por pagador y por año en Argentina (plan) son USD 268 brutos al año; menos 15 % de comisión, USD 228 (estimación; el plan no aclara si los 17,9 son antes de comisión). En el corte de 1 %: USD 179 brutos. Con 10 mil usuarios activos, la suscripción sola da USD 255 a 1.300 por mes (plan).

## Experiencia
**Dónde aparece (puntos de entrada).**
1. Tocar una cosa premium en la Casita. Paucho dice la línea actual y aparece el botón «Ver Gauchito Premium».
2. Tarjeta fija al final de la tienda de la Casita.
3. Ajustes → «Gauchito Premium» (también muestra el estado y «Restaurar compras»).
4. Una sola vez por iniciativa de la app: la primera vez que entrás a la Casita desde el día 3, con dos cosas ya compradas. Paucho, de cerca: «Che, {nombre}, hay cosas de estancia que me encantan. ¿Te las muestro?» → «Mostrame» / «Ahora no».
5. V2: casillero dorado de un evento (doc 18) y lugar extra de animalito (doc 03).

**Cuándo NO aparece, nunca.** En la primera sesión ni antes del día 3. En el mate de la mañana, la barra llena, una revelación o una meta de racha. En «Se nos enfrió el mate», «Hoy no puedo» ni la vuelta después de días. Durante el minuto de calma o después de elegir un mate bajo en «¿Cómo viene el día?». Al completar un hábito. En avisos del teléfono. Tras «Ahora no», la app no vuelve a ofrecerlo sola.

**El paywall (una pantalla, con X visible desde el primer cuadro).**
- Título: «Mimá a Paucho con Gauchito Premium».
- Bajada: «Tus hábitos, tu racha y las obras son gratis y van a seguir siéndolo. Premium es para darle gustos a Paucho».
- Lo que trae hoy: «6 cosas de estancia para el cuarto: la mecedora, el gramófono, la mesa de truco, el reloj de péndulo, la cama de estancia y Michi, el gatito. Las comprás con tus herraduras». Solo se lista lo que ya existe en el build.
- Línea de tiempo: «Hoy · Empieza tu prueba. No se te cobra nada» → «Día 12 · Te avisamos que está por terminar» → «Día 14 · Se cobra {precio}. Si cancelás antes, no pagás».
- Planes: «Anual · {precio} por año (equivale a {precio/12} por mes)» y «Mensual · {precio} por mes». El total que se cobra va en el cuerpo más grande.
- Botón: «Probar 14 días gratis». Debajo: «Después, {precio} por año. Cancelás cuando quieras desde la tienda».
- Pie: «Ahora no» · «Restaurar compras» · «Términos» · «Privacidad».
- Sin prueba disponible (ya la usó): botón «Suscribirme por {precio} por año».

**Sin patrones oscuros.** No hay cuenta regresiva, descuento tachado inventado, «No, no quiero cuidar a Paucho», cierre escondido ni segundo paywall al cerrar. Paucho no se pone triste si decís que no.

**Estados.**
| Estado | Qué ve la persona |
|---|---|
| Prueba | Ajustes: «Tu prueba termina el {fecha}. Ese día se cobra {precio}». Dos días antes: aviso local (si los aceptó) y tarjeta en Inicio: «Tu prueba de Premium termina el {fecha}». |
| Activo | «Gauchito Premium · se renueva el {fecha}» y «Administrar en la tienda». |
| En gracia (falló el cobro) | Sigue con todo. Tarjeta en Ajustes y Casita: «No pudimos cobrar tu Premium. Revisá el medio de pago en la tienda; mientras tanto seguís con todo». |
| Vencido | «Tu Premium terminó el {fecha}. Lo que ya compraste se queda con vos». Botón «Volver a Premium». |
| Restaurar | «Restaurar compras» → «¡Listo! Encontramos tu Premium» / «No encontramos compras con esta cuenta de la tienda». |
| Error o sin conexión | «No pudimos hablar con la tienda. Probá de nuevo en un rato». No se cobra ni se bloquea nada. |

**Al vencer.** Lo comprado con herraduras durante Premium queda puesto y es tuyo; Michi no se va nunca. Las cosas premium sin comprar vuelven a estar cerradas. Los premios dorados ya reclamados quedan; los casilleros dorados sin reclamar se cierran pero el avance se conserva. Los animalitos de los lugares extra «duermen en el galpón»: ninguno se pierde y vos elegís cuáles quedan a la vista.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Mensual, precio de lista | USD 2,99 (Argentina: 2,49) | Rango del plan; en Argentina se paga cerca de 1,5 veces la lista (plan) |
| Anual, precio de lista | USD 17,99 (Argentina: 14,99) | Mitad del mensual por doce; «anual primero» (plan) |
| Lo que paga un argentino | ~USD 3,74 y ~22,49 | IVA 21 % + percepción 30 % (plan); confirmar con contador |
| Otros países | Uruguay, Chile, Colombia, México: 2,99 / 17,99 en el escalón local; España y resto: 2,99 / 19,99 | Estimación; revisar por trimestre |
| Prueba gratis | 14 días, en los dos planes, una vez por cuenta de tienda | Ver «Preguntas abiertas» |
| Plan preseleccionado | Anual | Mejor valor por pagador; el total se ve entero |
| Presentación por iniciativa de la app | 1 en la vida de la cuenta, desde el día 3 | Confianza |
| Aviso antes del cobro | 2 días antes | Línea de tiempo honesta |
| Gracia | La más larga que ofrezca cada tienda | Las tarjetas fallan; nadie pierde por eso |
| Margen sin conexión | 3 días con el último estado conocido | No bloquear por mala señal |
| Planes semanales | No | «En bienestar se leen como trampa» (plan) |

**«Cuidarte es gratis, mimar a Paucho se paga», punto por punto.**
| Cosa | Gratis | Premium |
|---|---|---|
| Hábitos, planes, «Hoy no puedo» | Sí, sin tope | — |
| Mate de la mañana, termos, recalentar | Sí | Premium no da termos |
| Obras, áreas, viajes, salida del día | Sí | — |
| Minuto de calma, «¿Cómo viene el día?» | Sí | — |
| Camino común de cada evento, con su animalito | Sí | — |
| Cuarto: 42 de 48 opciones | Sí | 6 de estancia |
| Camino dorado del evento | — | Sí (V2) |
| Lugares para animalitos a la vista | Base (doc 03) | Más lugares (V2) |
| Anuncios elegidos (doc 23) | Opcionales | No se ofrecen |

## Contenido necesario
- 1 paywall con 2 variantes (con prueba, sin prueba); 6 estados; 3 líneas de Paucho para la entrada 4; 2 textos de aviso local.
- Arte: 1 imagen del cuarto con las seis cosas puestas; sello `ui_premium` (ya existe).
- Páginas web de Términos y de Privacidad.

## Arte, animación y sonido
El paywall muestra el cuarto con las seis cosas en vivo (`RoomScene`): péndulo, gramófono, Michi. El dorado queda reservado a premios; el botón principal es verde. Reglas en `docs/visual/guia-visual.md`. Sin sonido propio salvo el toque estándar.

## Datos y técnica
- RevenueCat con `@revenuecat/purchases-capacitor` (plan). Entitlement: `premium`. Offering `default` con paquetes `$rc_annual` y `$rc_monthly`.
- Productos. iOS: grupo «Gauchito Premium» con `gauchito_premium_anual` y `gauchito_premium_mensual`, oferta introductoria gratis. Android: suscripción `gauchito_premium`, planes base `anual` y `mensual`, oferta `prueba-14d`.
- Estado: `premium: boolean` pasa a `entitlement { status: 'none'|'trial'|'active'|'grace'|'expired', plan, expiresAt, checkedAt }`, copia local de lo que dice RevenueCat. `roomLock` (`store.ts:291`) lee `hasPremium(s)`. Migración: `premium: true` de pruebas se descarta.
- Archivos: `store.ts`, nuevo `game/premium.ts`, nuevo `screens/Paywall.tsx`, `Casita.tsx`, Ajustes, `TestMenu.tsx`.
- El vencimiento lo dice la tienda, no el reloj del teléfono.
- La PWA no vende: muestra «Premium está en la app de la tienda».

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `paywall_viewed` | Se abre el paywall | `placement`, `day_n`, `trial_eligible` |
| `paywall_closed` | X o «Ahora no» | `placement`, `seconds_open` |
| `trial_started` | La tienda confirma | `plan`, `placement` |
| `subscription_started` | Primer cobro | `plan`, `price_usd`, `country` |
| `subscription_state_changed` | Cambia el estado | `from`, `to` |
| `restore_tapped` | Restaurar | `result` |
| `premium_item_bought` | Compra una cosa premium | `item_id`, `status` |

Ningún evento lleva ánimo ni reflexiones.

## Casos borde y riesgos
- **Pagó y no le alcanzan las herraduras.** Las seis cosas suman 1.510 herraduras, unas dos semanas de ingreso (estimación sobre las 800 por semana del plan). Ver «Preguntas abiertas».
- **Oferta flaca.** Seis cosas es poco; el corte de 1 % mide disposición a pagar, no el techo.
- **Cancela en la prueba.** Conserva Premium hasta el día 14 y no se le cobra.
- **Cambio de teléfono sin cuenta (doc 26).** «Restaurar compras» devuelve Premium; el progreso depende del guardado.
- **Tiendas.** Apple 3.1.1 y 3.1.2: compra dentro de la app, botón de restaurar, precio y duración claros, enlaces a términos y privacidad. Google, política de suscripciones: condiciones de la prueba, frecuencia de cobro y cómo cancelar, a la vista. Precios siempre leídos de la tienda, nunca escritos a mano. Detalle en `docs/tecnico/tiendas-android-ios.md`.
- **Bienestar.** Ningún texto del paywall promete resultados de salud ni usa las palabras vedadas.

## Fases
- **V1 (lanzamiento suave):** mensual y anual, prueba de 14 días, seis cosas del cuarto, entradas 1 a 4, seis estados, restaurar.
- **V2 (primer evento):** camino dorado y lugares para animalitos; paywall con esos beneficios.
- **Más adelante:** prueba de 30 días en experimento; plan de a dos (19), pago único (21), mate pendiente (22); «sin anuncios» cuando haya anuncios (23).
- **Afuera:** planes semanales, descuentos por abandono, venta en la web.

## Criterios de aceptación
- [ ] Ningún hábito, racha, obra, salida ni ejercicio de calma consulta `hasPremium`.
- [ ] El paywall no aparece en ninguno de los momentos vedados (prueba automática por pantalla).
- [ ] Precio total, duración de la prueba y fecha de cobro visibles sin desplazar a 390×844.
- [ ] X y «Ahora no» visibles desde el primer cuadro, 44 pt.
- [ ] «Restaurar compras» en el paywall y en Ajustes, probado con reinstalación.
- [ ] Al vencer, lo comprado sigue puesto y Michi sigue en el alféizar.
- [ ] Sin conexión, la app abre y no cambia el estado durante 3 días.
- [ ] Aviso de fin de prueba dos días antes, con la fecha correcta en hora local.

## Preguntas abiertas
1. **¿Prueba de 14 o de 30 días?** Las de 17 a 32 días convierten más (42,5 %, plan). Recomiendo 14 en el lanzamiento suave: el cobro cae antes del día 21 y el corte se lee a día 35. Probar 30 después.
2. **¿Las cosas premium siguen costando herraduras?** Es decisión tomada. Recomiendo mantenerla y sumar un regalo: al empezar la prueba elegís una de las seis sin pagar herraduras.
3. **¿Prueba también en el mensual?** Recomiendo sí en V1, para medir con más casos.
4. **¿Precio argentino más bajo que el resto?** Recomiendo sí (2,49 / 14,99), por el 1,5× de impuestos.
