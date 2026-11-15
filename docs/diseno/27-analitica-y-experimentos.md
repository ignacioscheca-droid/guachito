# 27 · Analítica y experimentos

> Estado: propuesta · Etapa: Etapa 1 del plan (lo primero que se construye; se prueba en la web) · Mejora del plan: frente 5, filas 3 y 4 de «Camino a las tiendas» · Depende de: 11, 26, 28

## En una línea

Unos 45 eventos con nombre fijo, tres definiciones de retención que no se discuten, cinco tableros y una prueba A/B por vez en PostHog; errores en Sentry; y una lista corta de cosas que no se miden nunca.

## Problema y oportunidad

Hoy no hay analítica: no se puede saber dónde se va la gente y todo el plan es a ciegas hasta que la haya (plan). El código no tiene ninguna llamada de medición. Los errores quedan en el teléfono: `errorLog.ts` guarda los últimos 30 en `gauchito.v2.errors` y `postErrorLogToWorker` no está conectado.

El plan avanza por cortes numéricos. Con 40 testers un D1 medido de 40 % puede ser cualquier cosa entre 25 y 55 %, y los amigos retienen más que los desconocidos (plan). Sin definiciones exactas, cada corte se puede leer como convenga.

La lección es de Duolingo: poner el foco en retener a los usuarios actuales (CURR) tuvo 5 veces más impacto en usuarios diarios que la siguiente métrica (plan, Jorge Mazal en Lenny's).

## Objetivo y métricas

| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| **Primaria:** los cortes del plan se pueden leer sin trabajo manual | tablero «Cortes» al día, por tanda | PostHog |
| Cobertura | 100 % de las pantallas y ceremonias con evento | lista de este doc contra el código |
| Pérdida de eventos | < 2 % entre el contador local y PostHog | `events_sent` en `app_opened` |
| Sesiones sin error | ≥ 99,5 % | Sentry |
| Guardrail: costo | USD 0 con 10 mil usuarios; cientos bajos con 100 mil (plan) | factura |
| Guardrail: presupuesto | ≤ 15 eventos por usuario por día activo (estimación) | PostHog |
| Guardrail: privacidad | 0 propiedades con texto escrito por la persona | prueba automática |

## Experiencia

La persona casi no lo ve. Hay tres puntos de contacto:

1. **Aviso.** En Ajustes → Privacidad: «Gauchito mide cómo se usa la app para mejorarla: qué pantallas se abren y qué botones se tocan. Nunca lo que escribís ni cómo te sentís.» Interruptor «Ayudar a mejorar Gauchito», prendido por defecto fuera de la Unión Europea y el Reino Unido.
2. **Pedido explícito** donde la ley lo exige (si se distribuye en España): una pantalla al terminar la primera sesión, nunca antes de la casita. «¿Me dejás anotar cómo usás la app? Me ayuda a mejorarla.» «Dale» / «No, gracias». Con «No» no se manda nada, tampoco errores con identificador.
3. **Error.** Si algo falla, Paucho en burbuja: «Uy, algo salió mal. Ya lo anoté.» El menú «Algo se ve mal» se queda solo en builds internos.

Para el dueño, la experiencia son los tableros (más abajo) y un resumen semanal de PostHog por correo.

## Reglas y números

### Definiciones

| Término | Definición exacta |
|---|---|
| Instalación | primer `ftue_started` de un `user_id` (la cuenta anónima del doc 26) |
| D0 | día calendario local de la instalación |
| Día activo | día local con al menos un `app_opened` en primer plano |
| **D1 / D7 / D30** | % de la cohorte con un día activo exactamente N días calendario después de D0. No es «hasta el día N» ni «N o más» |
| D-N cuidado | lo mismo, pero con al menos un `habit_completed` o `mate_cebado` ese día. Es la que le importa al producto |
| Cohorte válida | solo desconocidos: `source` distinto de `amigos` e `interno`, sin reinstalaciones; se lee cuando el día N ya pasó para todos |
| Usuario actual | activo hoy y activo al menos un día de los 6 anteriores |
| **CURR** | de los usuarios actuales de ayer, % activos hoy |
| NURR | de los nuevos de ayer, % activos hoy (equivale a D1) |
| RURR | de los que ayer volvieron tras 7 a 29 días sin abrir, % activos hoy |
| Dormido | sin abrir hace 30 días o más |

Los estados y el CURR siguen el modelo de Duolingo (plan); conviene cotejar la definición con el artículo original antes de comparar números con los suyos.

### Los cortes

| Corte | Muestra mínima (plan) | Valor propuesto (estimación) | Margen de error al 95 % |
|---|---|---|---|
| D1 | 300 desconocidos por tanda | ≥ 35 % | ± 5,4 puntos |
| D7 | 300 | ≥ 18 % | ± 4,3 puntos |
| D30 | 500 | ≥ 8 % | ± 2,4 puntos |
| Pago | lanzamiento suave | 1 % de las instalaciones (plan) | — |

Referencia de categoría: D1 27 %, D7 13–18 %, D30 3–9 % (plan). Un corte pasa si el valor medido menos el margen supera el promedio de la categoría, y falla si el valor medido más el margen no llega al objetivo. En el medio, se junta otra tanda.

### Experimentos

| Regla | Valor | Por qué |
|---|---|---|
| Pruebas simultáneas | 1 | con 300 por tanda no hay tráfico para más |
| Brazos | 2, 50/50, asignación fija por `user_id` | idem |
| Efecto mínimo que vale probar | 10 puntos de D1 | detectarlo pide unas 360 personas por brazo (80 % de potencia) |
| Lo demás | se cambia por ajuste remoto y se compara tanda contra tanda | más barato que una prueba que no puede concluir |
| Métrica de decisión | una, escrita antes de empezar | no elegir después |
| Fin | muestra completa o 21 días | no mirar y cortar antes |

Orden de precedencia de un ajuste: valor del binario < `tuning.json` remoto (doc 28) < brazo del experimento en PostHog. Los dos remotos usan las mismas claves.

**Primeras cinco pruebas:** (1) pedido de avisos al final de la sesión 1 contra al arrancar el fogón; (2) segunda obra de 2 h contra 30 min; (3) plan inicial de 4 hábitos contra 7; (4) meta de racha antes contra después de la casita; (5) prueba gratis de Premium de 14 contra 30 días.

## Contenido necesario

- Plan de eventos como archivo: `app/src/game/analytics.events.ts`, con tipos; un evento que no esté ahí no compila.
- 5 tableros (abajo), 6 embudos guardados, 4 alertas.
- 3 textos de privacidad y 2 de error.
- Política de privacidad y formularios de las tiendas con lo que se junta: uso del producto, diagnósticos, identificador no vinculado a la identidad.

**Tableros**

| Tablero | Qué muestra |
|---|---|
| Hoy | activos diarios, nuevos, CURR, mates cebados, barras llenas, errores |
| Primera sesión | embudo F1 paso a paso, mediana de segundos al «wow», segunda sesión en D0 |
| Cortes | D1, D7, D30 y D-N cuidado por tanda y `source`, con margen |
| Economía | herraduras ganadas y gastadas por día de vida, saldo mediano, qué se compra |
| Avisos y plata | permiso, aperturas por tipo de aviso, bajas; vistas del muro de pago, pruebas, pagos |

**Alertas:** sesiones sin error bajo 99 %; CURR cae 5 puntos en una semana; el paso de la casita del embudo F1 baja de 70 %; eventos diarios 30 % por encima del presupuesto.

## Arte, animación y sonido

Nada visible, salvo el interruptor de Ajustes y la pantalla de consentimiento, que usan `PauchoTalk` y `Button` del sistema de diseño. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica

- **PostHog** (analítica, embudos, pruebas, ajustes remotos por usuario): `posthog-js`, sin captura automática ni grabación de sesiones, sin guardar IP, país como único dato geográfico. `distinct_id` = `user_id` anónimo del doc 26.
- **Un solo punto de entrada:** `src/game/analytics.ts` con `track(evento, props)`. Las acciones de `store.ts` lo llaman; las pantallas, solo para vistas. Cola en IndexedDB para cuando no hay red, con tope de 500 eventos.
- **Hora:** cada evento lleva `client_ts` y `day_index` calculados con el reloj confiable (doc 26).
- **Errores: Sentry** con `@sentry/capacitor`: atrapa los errores de JavaScript, que son casi todos en una app envuelta, y los cierres nativos. `errorLog.ts` pasa a alimentarlo como migas de contexto. Se limpia el estado adjunto: va `stateLine` (números), nunca nombres. Crashlytics es gratis sin tope pero lee peor los errores de la capa web; queda como alternativa si el costo sube (USD 0 / 26–80 al mes, plan).
- **Propiedades de usuario:** `install_day`, `source`, `platform`, `app_version`, `content_version`, `country`, `locale`, `is_internal`, `day_index`, `streak`, `streak_goal`, `jobs_done`, `areas_done`, `habit_count`, `friendship_level`, `coins_bucket`, `is_premium`, `notif_enabled`, `is_linked`, `chat_done`, `experiments`.
- **Costo:** con 2.500 activos diarios y 15 eventos, 1,1 millones al mes (estimación). Confirmar el tope gratuito en la página de precios de PostHog.

## Analítica

Propiedades comunes a todos: `day_index`, `session_index`, `screen`, `app_version`, `content_version`.

| Área | Evento | Cuándo | Propiedades |
|---|---|---|---|
| Sesión | `app_opened` | pasa a primer plano | `from` (`icon`, `notif`, `widget`, `link`), `notif_kind`, `events_sent` |
| | `session_ended` | pasa a segundo plano | `seconds`, `habits_done` |
| | `tab_opened` / `tab_locked_tapped` | toca una pestaña | `tab` |
| Primera sesión | `ftue_started`, `ftue_step_completed`, `ftue_habits_picked`, `ftue_completed` | doc 11 | doc 11 |
| | `chat_offered`, `chat_question_answered`, `chat_completed` | charla del día 2 | `question_id`, nunca la respuesta |
| Hábitos | `habit_completed` | tilda un hábito | `habit_kind` (`catalog`, `custom`), `catalog_id`, `moment`, `nth_today`, `gave` (`energy`, `coins`) |
| | `habit_uncompleted`, `habit_skipped` | destilda; «Hoy no puedo» | `habit_kind` |
| | `habit_added` / `habit_removed` / `habit_plan_edited` | cambia el plan | `habit_kind`, `scope` (`today`, `always`), `times` |
| Día | `energy_full` | barra llena | `habits_needed`, `hour_local` |
| | `job_started` | arranca obra, viaje o salida | `job_kind`, `job_id`, `hours` |
| | `obra_revealed` | se ve terminada | `obra_id`, `job_index`, `hours_waited` |
| | `area_completed`, `trip_story_seen`, `dog_named` | ceremonias | `area_id`; sin el nombre |
| | `salida_returned`, `recuerdo_collected` | doc 01 | `salida_id`, `recuerdo_id` |
| Racha | `mate_cebado` | desliza el mate | `streak`, `hour_local` |
| | `streak_goal_set` / `streak_goal_reached` | elige o llega | `goal` |
| | `termo_used`, `streak_rescue_offered`, `streak_recalentada`, `streak_lost`, `welcome_back_seen` | al abrir el día | `streak_before`, `days_missed` |
| Encargos | `encargo_cobrado` | cobra | `kind` (`daily`, `weekly`), `encargo_id`, `coins`, `all` |
| Economía | `coins_earned` | suma herraduras | `source`, `amount`, `balance_bucket` |
| | `coins_spent` | compra | `sink` (`room`, `clothes`, `termo`, `event`), `item_id`, `price` |
| | `item_placed` / `outfit_changed` | cuarto y ropa | `slot`, `item_id` |
| Unlocks | `feature_unlocked` | ve la bienvenida | `feature` |
| Avisos | `notif_permission_asked` / `notif_permission_result` | pedido de Paucho y del sistema | `attempt`, `trigger`, `result` |
| | `notif_scheduled` / `notif_settings_changed` | programa o cambia | `kind`, `hour_local`, `enabled` |
| Bienestar | `mood_checkin_done` | toca cómo viene el día | **sin el valor** |
| | `reflection_saved` | guarda la línea | **sin texto ni largo** |
| | `calma_started` / `calma_completed` | minuto de calma | `exercise_id`, `seconds` |
| Social | `share_opened` / `share_completed` | tarjeta | `card_kind`, `channel` |
| | `invite_sent` / `invite_accepted` | racha de a dos | `channel` |
| Eventos | `event_started`, `event_step_claimed`, `event_completed` | doc 02 | `event_id`, `step`, `track` |
| Plata | `paywall_viewed`, `trial_started`, `purchase_completed`, `purchase_failed`, `subscription_cancelled` | doc 17 | `placement`, `product_id`, `price_usd`, `reason` |
| Cuenta | ver doc 26 | | |
| Contenido | ver doc 28 | | |
| Calidad | `error_shown`, `slow_frame_burst`, `asset_load_failed` | falla visible | `where`, `code` |

**Embudos:** F1 primera sesión (doc 11) · F2 día: `app_opened` → `mate_cebado` → `habit_completed` → `energy_full` → `job_started` · F3 vuelta: `job_started` → `app_opened` desde aviso → `obra_revealed` · F4 avisos: pedido → permiso → apertura desde aviso · F5 pago: `paywall_viewed` → `trial_started` → `purchase_completed` · F6 invitación: `invite_sent` → `invite_accepted` → D7 del invitado.

## Casos borde y riesgos

- **Nunca se mide:** el valor del ánimo, el texto de las reflexiones, nombres de hábitos propios, nombres de la persona, de Paucho y del perro, respuestas del cuestionario, contactos, ubicación más fina que país, identificador de publicidad. Una prueba automática recorre `analytics.events.ts` y falla si una propiedad es texto libre.
- **Minuto de calma:** se cuenta que se usó, no cuándo en relación con el ánimo. No se cruzan esos datos.
- **Amigos en la cohorte:** inflan todo. `source` sale del enlace de instalación (`?s=`) y por defecto es `organico`.
- **Reinstalaciones y dos teléfonos:** se unen por `user_id` al vincular (doc 26); antes cuentan como dos, y por eso se excluyen si el dispositivo ya instaló.
- **Reloj adelantado:** `day_index` usa el reloj confiable; los eventos con desvío mayor a 24 h se marcan `clock_suspect` y salen de los cortes.
- **Sin red:** la cola guarda 500; pasado eso se pierden los más viejos, salvo los de F1.
- **Tiendas:** sin identificador de publicidad no hace falta el permiso de seguimiento de Apple. Declarar todo en la etiqueta de privacidad y en «Seguridad de los datos». Revisar el texto de consentimiento con un abogado antes de distribuir en Europa.
- **Leer de más:** con 300 personas, una diferencia de 4 puntos entre tandas es ruido.

## Fases

- **V1 (antes de cualquier tester desconocido):** `track`, los eventos de Sesión, Primera sesión, Hábitos, Día, Racha y Calidad; tableros Hoy, Primera sesión y Cortes; Sentry.
- **V2:** el resto de los eventos, ajustes remotos, primera prueba A/B, alertas, tablero de Economía.
- **Más adelante:** exportar a una base propia para CURR por cohorte y valor por usuario. Afuera: grabación de sesiones, atribución de anuncios, mapas de calor.

## Criterios de aceptación

- [ ] Cada evento de la tabla llega a PostHog con sus propiedades desde un Android y un iPhone.
- [ ] Un evento con nombre fuera de `analytics.events.ts` no compila.
- [ ] La prueba de texto libre pasa; a mano: un hábito propio «prueba secreta» no aparece en ninguna petición.
- [ ] Con el interruptor apagado no sale ninguna petición a PostHog.
- [ ] En modo avión se hacen 20 acciones; al volver la red llegan las 20 con su hora original.
- [ ] El tablero «Cortes» muestra D1 de una tanda de prueba, con margen, y excluye `interno` y `amigos`.
- [ ] Un error forzado aparece en Sentry con versión y `stateLine`, sin nombres.
- [ ] Un usuario queda siempre en el mismo brazo, también tras reinstalar con cuenta vinculada.

## Preguntas abiertas

1. **Valores de los cortes.** 35 / 18 / 8 % son míos; el plan solo fija las muestras y que estén sobre el promedio. Recomiendo confirmarlos contra el diagrama de etapas antes de la primera tanda.
2. **¿Medición prendida por defecto en Argentina?** Recomiendo que sí, con aviso e interruptor, y pedido explícito donde la ley lo exige.
3. **¿D-N «abrió» o «se cuidó» como corte?** Recomiendo cortar con «abrió», que es comparable con la categoría, y mirar «se cuidó» como la verdad del producto.
4. **¿Sentry o Crashlytics?** Recomiendo Sentry por la capa web.
5. **¿PostHog en su nube de Estados Unidos o de Europa?** Recomiendo Europa, pensando en España.
