# 08 · Racha por capas
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: 8 · Depende de: 04, 16, 25, 01, 27

## En una línea
La racha sigue siendo cebar el mate de la mañana, tan fácil como hoy; arriba se le suman capas que premian más sin exigir más: premios con objeto en 14, 30, 50 y 100 días, una «semana redonda» aparte para quien hizo hábitos los siete días, un aviso nocturno solo si falta y el widget.

## Problema y oportunidad
La racha ya es lo mejor de la app, pero después del día 7 no da nada que desear ni se ve fuera de la app.

- Hoy un día cuenta si se cebó el mate, se hizo un hábito o lo salvó un termo (`keptDays` en `store.ts`). La auditoría criticó que «mide abrir la app, no cuidarse» (plan, problema 9).
- No lo endurecemos. Duolingo ganó +3,3 % de retención al día 14 justamente por separar la racha de la meta diaria (plan). La racha fácil es el piso; el esfuerzo se premia en otra capa.
- Las metas pagan herraduras y un termo (`GOAL_COINS`: 50/100/150/200/300/500). Los extras de 14/30/50/100 están pensados pero sin arte (`CLAUDE.md` de `areas`: recuerdo, mate de plata, poncho de la racha, cuadro).
- No hay widget ni aviso de «se te enfría» (plan). El aviso de la noche actual dice «¡Día completo!» aunque no hayas hecho nada (`sw.js`).
- Ya funciona y se cuida: compromiso de meta en el onboarding (`StreakGoal`; la apuesta de racha de Duolingo dio +14 % de retención D7, plan), termo automático, «Hoy no puedo», recalentar con 3 hábitos y `WelcomeBack` sin hablar de racha.

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: usuarios D7 que llegan a racha ≥ 14 | 45 % (estimación) | `streak_goal_reached` goal=14 sobre cohorte con D7 |
| Retención D30 | +2 puntos contra la racha sin capas (estimación) | prueba A/B, doc 27 |
| Semanas redondas por usuario activo semanal | 25 % logra al menos una al mes (estimación) | `round_week_completed` |
| Días con hábito sobre días con mate | no baja | `habit_completed` contra `mate_cebado` |
| Guardrail: avisos apagados tras el aviso de racha | < 3 % por mes (estimación) | `notif_type_disabled` type=racha |
| Guardrail: racha perdida que no vuelve en 7 días | no sube | `streak_lost` sin sesión posterior |

## Experiencia
**Capa 0 · El mate (sin cambios).** Cada día nuevo abre con `StreakDay`: deslizás, el número rueda, «¡Dale!». Termo, recalentar y «Hoy no puedo» quedan como están.

**Capa 1 · Metas con objeto.** `GoalDone` suma un tercer premio al lado de herraduras y termo. Paucho lo entrega de cerca:

| Meta | Premio nuevo | Dónde vive | Texto de Paucho |
|---|---|---|---|
| 7 | (ninguno; herraduras y termo) | — | sin cambios |
| 14 | Recuerdo «La bombilla de la suerte» | álbum de la salida (doc 01) | «Dos semanas de mates. Esta bombilla es para vos: la guardé en el álbum.» |
| 30 | Mate de plata | reemplaza al mate en `StreakDay`, en Inicio y en el widget (elegible) | «Un mes entero. Este mate era de mi abuelo. Ahora cebamos con él.» |
| 50 | Poncho de la racha | prenda en la pestaña Paucho | «Cincuenta. Te lo tejí en las siestas que no dormí. Bueno, dormí algunas.» |
| 100 | Cuadro «Cien mates» | pared del cuarto (lugar nuevo en `ROOM_SLOTS`) | «Cien días, {vos}. Lo colgué donde lo veo al despertarme.» |

Al proponer la meta siguiente, Paucho nombra el objeto: «¿Vamos por un mes? Si llegamos, cebamos con el mate de plata.» La barra hacia la meta en `StreakDay` muestra el objeto en silueta al final.

**Capa 2 · Semana redonda.** Es un logro aparte de la racha: los siete días de la semana (lunes a domingo, la misma semana de los encargos) con al menos un hábito hecho.
- En la pestaña Paucho, bajo la racha, una fila de siete yerbas: se pinta la del día al hacer el primer hábito. Texto: «Semana redonda: 4 de 7».
- Al completar la séptima, Paucho en el campo: «¡Semana redonda! Los siete días hiciste algo por vos.» Premio: 40 herraduras y un calco para su termo.
- Si se corta, la fila se vacía el lunes sin mensaje. No hay aviso ni pantalla de pérdida.
- El termo, el mate y «Hoy no puedo» no pintan la yerba del día: esta capa mide hábitos. Tampoco restan nada.

**Capa 3 · Aviso nocturno solo si falta.** A las 21:00 locales, solo si hoy no se cebó y la racha es ≥ 2: «La pava sigue tibia, {vos}. Un mate y a la cama.» Si hay termo, el texto lo dice: «Si hoy no podés, no pasa nada: el termo nos cubre.» Reglas y textos en doc 16.

**Capa 4 · Widget.** Mate humeante si cebaste, frío si falta (doc 25).

**Estados vacíos y de error.** Premio sin arte cargado: se entrega igual y se muestra con su ícono genérico; nunca se bloquea `GoalDone`. Cuarto sin lugar libre para el cuadro: queda en el inventario con «Colgalo cuando quieras».

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Qué cuenta un día de racha | mate cebado, o un hábito, o día salvado | no se toca (Duolingo: +3,3 % D14 por separar racha y meta, plan) |
| Escalera de metas | 7 → 14 → 30 → 50 → 100 → 365 (`STREAK_GOALS`) | ya aprobada por el dueño |
| Herraduras por meta | 50/100/150/200/300/500 (`GOAL_COINS`) | se revisan en doc 04 |
| Termos | máximo 2, uno por meta, 60 herraduras (`TERMOS_MAX`, `TERMO_PRICE`) | sin cambios; el precio lo revisa doc 04 |
| Recalentar | 3 hábitos hoy, hueco máximo 3 días (`RESCUE_HABITS`, `RESCUE_MAX_GAP`) | sin cambios |
| Premio de objeto | uno por meta 14/30/50/100, una sola vez por cuenta | la segunda vez que se llega a 14 da solo herraduras y termo |
| Semana redonda: día válido | ≥ 1 hábito completado ese día | mide cuidarse, no abrir |
| Semana redonda: semana | lunes a domingo; la semana 1 son los días 1–7 | igual que los encargos semanales |
| Semana redonda: premio | 40 herraduras + 1 calco (12 calcos; después solo herraduras) | menos que una meta de racha; (estimación) hasta doc 04 |
| Aviso nocturno | 21:00 local, racha ≥ 2, mate sin cebar, máximo 1 por día | solo cuando hay algo que cuidar |
| Récord | `bestStreak` siempre visible en la pestaña Paucho | perder la racha no borra lo logrado |

## Contenido necesario
- Arte: 4 objetos (bombilla, mate de plata, poncho, cuadro) con ícono de 256 px; mate de plata en las 3 partes del mate (`mate_empty`, `mate_yerba`, `mate_bombilla`); poncho como capa por pose (`WEAR` en `shop.ts`); cuadro como recorte del cuarto; 12 calcos de termo; yerba vacía y pintada para la fila semanal.
- Texto: 4 líneas de entrega × 3 variantes; 4 propuestas de meta con objeto; 6 líneas de semana redonda; 10+ textos de aviso nocturno (doc 16).
- Sonido: uno nuevo, «premio de racha» (doc 15).

## Arte, animación y sonido
El premio cae desde arriba con rebote y un brillo lo recorre, la misma gramática de la revelación de obra (doc 15). El dorado queda reservado a estos premios. El número de racha conserva su animación al extenderse: Duolingo midió +1,7 % de retención D7 en usuarios nuevos por animarla (plan). La yerba de la semana redonda se pinta con un tic corto, sin ceremonia de pantalla completa. Estilo y tamaños: `docs/visual/guia-visual.md`.

## Datos y técnica
- `store.ts`: `streakRewards: number[]` (metas cuyo objeto ya se entregó), `mateSkin: 'calabaza' | 'plata'`, `roundWeeks: string[]` (lunes de cada semana lograda), `calcos: number`.
- `roundWeek(s, day)` se calcula desde `completions`, como los encargos: nunca se guarda avance.
- `actions.reachGoal` entrega el objeto si la meta no está en `streakRewards`.
- `Racha.tsx` (`GoalDone`, tercer premio y propuesta con objeto), `DayOne.tsx` (silueta en la barra, piel del mate), `PauchoTab.tsx` (fila semanal, récord, calcos), `room.ts` y `shop.ts` (cuadro y poncho).
- Todo funciona sin conexión. Migración: los saves que ya pasaron 14/30/50/100 reciben sus objetos en el próximo `GoalDone` o al abrir la pestaña Paucho, con una línea: «Te debía esto».
- Pruebas: casos nuevos en `rules.test.ts` y una columna de semanas redondas en `simulation.test.ts`.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `mate_cebado` | «¡Dale!» en `StreakDay` | `streak`, `hour_local`, `source` (app, aviso, widget) |
| `streak_goal_reached` | se muestra `GoalDone` | `goal`, `days_since_install` |
| `streak_reward_claimed` | se entrega el objeto | `goal`, `reward_id` |
| `streak_goal_chosen` | se elige la meta siguiente | `goal`, `offered` |
| `termo_used` | `openDay` cubre un día | `streak`, `termos_left` |
| `rescue_offered` / `rescue_answered` / `rescue_completed` | flujo de recalentar | `missed_days`, `answer` |
| `streak_lost` | la racha vuelve a cero | `streak_before`, `gap_days` |
| `round_week_completed` | séptimo día con hábito | `week_index`, `total_round_weeks` |

## Casos borde y riesgos
- **Reloj adelantado.** Fabrica racha y objetos (plan, Técnica). Hoy los premios son cosméticos; se acepta hasta que haya cuenta (doc 26).
- **Culpa.** La semana redonda no tiene pantalla de pérdida ni aviso. El aviso nocturno se apaga solo desde Ajustes sin apagar los demás.
- **Poncho caro.** Pide una capa por pose; si no llega, el premio de 50 pasa a ser una cosa del cuarto y el poncho espera.
- **«Hoy no puedo» en todos los hábitos.** La racha sigue (el mate alcanza); la yerba del día no se pinta. Es coherente con la regla y no se explica como castigo.
- **Tiendas y bienestar.** Nada de esto se paga ni se acelera con plata; el termo se gana o se compra con herraduras.
- **Cambio de teléfono.** Hasta doc 26, los objetos viajan en la copia de Ajustes.

## Fases
- **V1:** objetos de 14 y 30, semana redonda con herraduras, aviso nocturno, récord visible.
- **V2:** poncho (50), cuadro (100), calcos del termo, mate de plata en el widget.
- **Más adelante:** premio de 365; «revivir la racha» como evento (a Duolingo le devolvió 15,4 millones de personas, plan).
- **Afuera:** ligas, racha que exige hábitos, pagar con plata para salvarla.

## Criterios de aceptación
- [ ] Un día con solo el mate cebado sigue contando para la racha.
- [ ] `GoalDone` de 14 y 30 entrega herraduras, termo y objeto; repetir la meta no duplica el objeto.
- [ ] El mate de plata se ve en `StreakDay` e Inicio y se puede volver al de calabaza.
- [ ] Siete días seguidos de lunes a domingo con un hábito disparan la semana redonda una sola vez.
- [ ] Un día cubierto por termo no pinta la yerba semanal ni corta la racha.
- [ ] El aviso de las 21:00 no llega si el mate ya se cebó, y se apaga por separado.
- [ ] Ningún texto nombra la ausencia del jugador.
- [ ] `npm run verify` pasa con los tests nuevos.

## Preguntas abiertas
1. **Semana de calendario o siete días corridos.** Recomiendo lunes a domingo: coincide con los encargos y da un «arranque limpio» cada lunes.
2. **Premio de la semana redonda.** Recomiendo 40 herraduras y calco; el número lo fija doc 04.
3. **Aviso nocturno con termo en mano.** Recomiendo mandarlo con el texto del termo; la alternativa es callar y gastar el termo en silencio.
4. **Poncho de la racha.** Si la capa por pose demora, ¿se cambia por una cosa del cuarto? Recomiendo que sí.
