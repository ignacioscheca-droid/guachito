# 11 · Primera sesión

> Estado: propuesta · Etapa: Etapa 1 del plan (se prueba en la web antes de envolver) · Mejora del plan: 11 · Depende de: 01, 15, 16, 27, 30

## En una línea

Mate, nombre, tres hábitos y la casita levantada a la vista antes del segundo minuto; el cuestionario pasa al día 2 como charla, y las obras tardan 0, 2, 4 y después 8 horas.

## Problema y oportunidad

Hoy lo mejor de la app, la revelación de una obra, no entra en la primera sesión. El onboarding son 15 pantallas (`Step` en `Onboarding.tsx`: escena, 4 de charla, mate, 4 preguntas, hábitos, cargador, plan, regalo, meta) y la primera obra tarda `WORK_MS` = 8 horas (`journey.ts:303`). Además, llenar la primera barra pide 30 de energía: tres hábitos reales que nadie hace sentado en el sillón.

Dos piezas sobran. `Generating` espera 4,5 s fijos (`GENERATING_MS`) sin calcular nada. Y muestra seis reseñas de 5 estrellas inventadas que elogian «aventuras» e «historias» que este build no tiene (`PlanScreens.tsx:12-19`): riesgo de revisión y de confianza (plan).

La referencia es Royal Match y Homescapes: primera renovación dentro de los dos primeros minutos (plan). La retención del día 1 se decide por lo que se vio en la sesión 1 (plan).

## Objetivo y métricas

| Métrica | Hoy | Objetivo | Cómo se mide |
|---|---|---|---|
| **Primaria:** tiempo hasta el primer «wow» (mediana, `ftue_started` → `obra_revealed` de la casa) | más de 8 h | < 120 s; p75 < 180 s | embudo F1 del doc 27 |
| Llegan al «wow» en la sesión 1 | 0 % | ≥ 80 % de quienes abren | idem |
| Segunda sesión el mismo día (D0) | sin dato | ≥ 35 % (estimación) | `app_opened` con `session_index` ≥ 2 y `days_since_install` = 0 |
| D1 | sin dato | corte de la etapa (doc 27) | cohorte de 300 desconocidos |
| Guardrail: charla del día 2 completa | — | ≥ 60 % de quienes vuelven en D1 | `chat_question_answered` |
| Guardrail: permiso de avisos aceptado | — | ≥ 50 % de quienes ven el pedido | `notif_permission_result` |

## Experiencia

### Hoy contra propuesta

Segundos estimados leyendo el código (tiempos de `SCENE`, tipeo de `useTalk`, un toque ≈ 2 s). Hay que medirlos con analítica.

| # | HOY (15 pantallas) | s | PROPUESTA (11) | s | acum. |
|---|---|---|---|---|---|
| 1 | Escena del mate, sin texto | 8 | Igual; un toque la saltea desde el segundo 2 | 8 | 8 |
| 2 | «¡Hola! Soy el Gauchito ___» | 10 | Igual, con «Paucho» ya escrito: un toque | 6 | 14 |
| 3 | Para qué está (2 oraciones) | 8 | Una sola: «Soy tu compañero para cuidarte un poquito cada día.» | 5 | 19 |
| 4 | «¿Cómo te llamás?» | 10 | Igual | 9 | 28 |
| 5 | El mate (racha, día 1) | 15 | Igual | 14 | 42 |
| 6 | «Contame un poco de vos» | 5 | — pasa al día 2 | | |
| 7–10 | Cuestionario, 4 preguntas | 32 | — pasa al día 2 | | |
| 11 | Elegí hasta 3 hábitos | 25 | Igual; botón «¡Listo!» | 22 | 64 |
| 12 | «Armando tus metas…» + reseñas | 5 | — se elimina | | |
| 13 | «El plan de {nombre}», 7 metas | 10 | — se elimina (ver «Reglas») | | |
| 14 | Regalo: «¡Ya te levantaste!» (se marca solo) | 6 | Inicio: Paucho señala la tarjeta «Levantarme de la cama»; la tocás vos | 6 | 70 |
| 15 | Meta de racha | 8 | — se mueve al final | | |
| | **Inicio, barra en 10/30. Faltan 2 hábitos y 8 h** | 142 | Barra llena (pide 10). «¡Yujuuu! ¡Con eso arranco la casita!» | 5 | 75 |
| | | | **La casita se levanta ahí mismo** (pila → polvo → obra → brillo) | 10 | **85** |
| | | | Se abre Casita: Paucho pide el catre (30 herraduras, las de la barra) | 25 | 110 |
| | | | Meta de racha: «¿Cuántos días seguidos nos cebamos un mate?» | 8 | 118 |
| | | | Inicio: «Con dos hábitos más arranco el fogón. Son dos horitas.» | 5 | 123 |

Primer «wow» a los 85 s (estimación), con 35 s de margen. La sesión completa dura unos dos minutos y termina con algo pendiente.

### Segunda visita del día 0

Al hacer dos hábitos más, la barra (pide 20) se llena y Paucho arranca el fogón por 2 horas. Ahí aparece su pedido de avisos (`NotifAsk`, ya existe): «¿Te aviso cuando esté el fogón?». Es el primer momento en que el aviso tiene un motivo concreto.

### Día 2: la charla

Después del mate de la mañana, Paucho de cerca con la libreta (`Libreta.tsx`): «Ayer no te pregunté nada. ¿Me contás un poco de vos mientras se calienta el agua?». Botones: «Dale» / «Después». Son las 4 preguntas de `aboutYou.ts`, una por burbuja, con su reacción. Al final propone hasta 3 hábitos de `buildPlan`: «Por lo que me contaste, ¿te sumo estos?», cada uno con su tilde. «Después» lo deja como nota en Encargos hasta el día 4; luego se va sola.

### Vacíos y errores

- **Cero hábitos elegidos:** el plan queda en «Levantarme de la cama» más dos básicos (`STARTER_GOALS`). El botón dice «Elegí vos por mí».
- **Cierra antes de terminar:** al volver retoma en el mismo paso (hoy se pierde todo; hay que guardar `ftueStep`).
- **Nombre vacío:** «Paucho» y saludo sin nombre, como hoy.

## Reglas y números

| Regla | Hoy | Propuesta | Por qué |
|---|---|---|---|
| Duración por obra (`WORK_MS`) | 8 h siempre | `WORK_RAMP_MS` = [0, 2 h, 4 h, 8 h]; desde la 4.ª, 8 h | rampa de Royal Match; la de 2 h da la segunda visita (plan) |
| Energía de la barra | 30 | 10 la primera, 20 la segunda, 30 desde la tercera | la casa con un hábito; el fogón con dos más |
| Barras por día | 1 (`lastFullDay`) | 2 solo el día de instalación | sin esto no hay fogón en D0 |
| Hábitos del plan inicial | 7 (`PLAN_SIZE`) | 4: el regalo + 3 elegidos; el tope sigue en 7 | 7 metas el primer día abruman; la charla suma hasta 3 |
| Primer hábito | se marca solo | lo toca la persona, guiada | aprende el gesto central |
| Herraduras de la primera barra | 30 | 30 | pagan justo el catre (`FIRST_BED`, 30) |
| Saltear la escena | no | desde el segundo 2 | reinstalaciones |
| Charla del día 2 | — | ofrecida D1 a D3 | después ya no es bienvenida |

Todo sale por ajustes remotos (doc 28) para poder tunearlo sin publicar.

## Contenido necesario

- 14 líneas nuevas de Paucho con 3 variantes las que se repiten: señalar el hábito, arrancar la casita, mostrarla, invitar al fogón, abrir y cerrar la charla, proponer hábitos.
- Ninguna pieza de arte nueva: la casa, la pila, las poses de libreta y el catre ya existen. El plano limpio del Área 1 tiene cicatrices de recorte y es lo primero que se ve: se repinta en el doc 12.
- Un sonido de obra instantánea: es el de la revelación actual.

## Arte, animación y sonido

La casita se levanta con la transición que ya existe en `Reveal.tsx` (la pila tiembla, polvo, la obra aparece, brillo y confeti), sin la espera previa. Es la primera ceremonia que ve la persona: va completa, no en la versión corta del doc 15. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica

- `journey.ts`: `workMs(jobsDone)` reemplaza a `WORK_MS`; `energyGoal(0)` = 10 y `energyGoal(1)` = 20. `workRemainingMs` en `store.ts` y el pedido a `push-worker` leen la nueva función.
- `store.ts`: `finishOnboarding` deja de marcar el regalo y acepta `aboutYou: null`; `completeHabit` permite la segunda barra si es el día de instalación; campos nuevos `installDay`, `ftueStep`, `chatOffered`.
- `Onboarding.tsx`: salen los pasos `about`, `quiz`, `generating`, `plan`, `gift`. `PlanScreens.tsx`: se borran `Generating` y `REVIEWS`; `StreakGoal` queda.
- `Questionnaire.tsx` se reusa dentro de `PauchoTalk` para la charla.
- Migración: ninguna para saves existentes (ya están `onboarded`). `simulation.test.ts` necesita la rampa: los 10 trabajos se terminan cerca del día 8, no del 10.
- Offline: todo el flujo corre sin red.

## Analítica

| Evento | Cuándo | Propiedades |
|---|---|---|
| `ftue_started` | primer cuadro de la escena | `is_reinstall` |
| `ftue_step_completed` | al salir de cada paso | `step` (`scene`, `name_paucho`, `purpose`, `name_player`, `mate`, `habits`, `first_habit`, `casita_reveal`, `bed`, `streak_goal`), `step_index`, `ms_on_step`, `ms_since_start`, `skipped` |
| `ftue_habits_picked` | «¡Listo!» | `count`, `catalog_ids` (nunca nombres propios) |
| `obra_revealed` | se ve una obra | `obra_id`, `job_index`, `ms_since_install`, `session_index` |
| `ftue_completed` | vuelve a Inicio tras la meta | `ms_total`, `streak_goal` |
| `chat_offered` / `chat_question_answered` / `chat_completed` | charla del día 2 | `day_index`, `question_id` (sin la respuesta), `habits_added` |

Embudo F1: `ftue_started` → cada `step` → `obra_revealed` (casa) → `ftue_completed` → segunda sesión D0 → `app_opened` en D1.

## Los primeros 7 días

Para quien llena la barra todos los días. D0 es el día de instalación.

| Día | Obra que se ve | Se desbloquea | Gancho para mañana |
|---|---|---|---|
| D0 | Casa (al instante); fogón (2 h) | Casita y el catre; meta de racha; pedido de avisos | aljibe, 4 h |
| D1 | Aljibe (4 h): cierra el Área 1 | Encargos; la charla; festejo de área, +50 herraduras, Mapa | la cucha |
| D2 | Cucha (8 h, se ve en D3) | Pestaña Paucho (tercer día con hábitos) | «algo se mueve en la cucha» |
| D3 | Cucha | Llega el perro y le ponés nombre | galpón |
| D4 | Galpón | Primera salida del día entre obras (doc 01) | gallinero |
| D5 | Gallinero: cierra el Área 2 | Festejo de área; Aventuras; sale al sur | qué trae del viaje |
| D6 | Viaje al sur | Tres cosas del cuarto; racha de 7 (meta, termo) | corral |
| D7 | Corral | Cierran los encargos semanales; amistad «Amigos» | molino |

## Casos borde y riesgos

- **El contenido se agota antes.** Con la rampa, los 10 trabajos duran unos 8 días. No se lanza sin la salida del día (doc 01).
- **El arte provisorio del Área 3 llega en D7.** Mismo día que el corte de retención: va antes en el doc 12.
- **Trampa:** adelantar el reloj saltea las 2 y 4 horas; lo cubre el reloj confiable (doc 26). En D0 no hay nada de valor que ganar.
- **Bienestar:** el primer hábito es «Levantarme de la cama»: cierto para cualquiera que tenga el teléfono en la mano, sin mentir para avanzar. La charla nunca pregunta síntomas.
- **Tiendas:** sin reseñas inventadas ni cifras de usuarios; el primer arranque no descarga nada.
- **Quien se va sin arrancar el fogón** no vio el pedido de avisos y no hay cómo llamarlo. Prueba A/B en el doc 27.

## Fases

- **V1:** flujo de 11 pantallas, rampa, charla del día 2, eventos. Web primero.
- **V2:** retomar a mitad del flujo; saltear la escena; prueba del pedido de avisos.
- **Más adelante:** elegir entre tres estilos de casita (doc 04). Afuera: cuenta o registro en la primera sesión (doc 26).

## Criterios de aceptación

- [ ] En un Android de gama baja, de abrir la app a ver la casita pasan menos de 120 s sin apurarse.
- [ ] No existen `Generating`, `REVIEWS` ni ninguna reseña en el build.
- [ ] La primera barra se llena con un hábito y la casita se revela sin espera.
- [ ] El catre se puede comprar siempre al abrirse Casita.
- [ ] Con dos hábitos más arranca el fogón por 2 h y recién ahí aparece `NotifAsk`.
- [ ] El día 2, después del mate, Paucho ofrece la charla; «Después» no la repite ese día.
- [ ] El día 2 solo se llena una barra.
- [ ] `npm run verify` pasa con la simulación actualizada.
- [ ] Todos los eventos de la tabla llegan a PostHog con sus propiedades.

## Preguntas abiertas

1. **Plan inicial de 4 hábitos en vez de 7.** Cambia una decisión tomada (`PLAN_SIZE` 7, pantalla «El plan de {nombre}»). Recomiendo 4 y que la charla lleve a 7.
2. **Dos barras en D0.** Rompe «una barra por día» solo ese día. Recomiendo aceptarlo: es lo que da la segunda visita.
3. **El regalo deja de marcarse solo.** Recomiendo que lo toque la persona.
4. **Meta de racha después del «wow»** y no antes. Recomiendo después: Duolingo midió +14 % en D7 por el compromiso (plan), no por dónde va.
5. **¿El catre en la sesión 1 o en la segunda visita?** Recomiendo en la 1: respeta el orden de ceremonias y enseña la tienda con plata recién ganada.
