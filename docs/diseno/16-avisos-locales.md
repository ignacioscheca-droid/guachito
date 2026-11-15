# 16 · Avisos locales
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: 16 · Depende de: 08, 01, 06, 27, 28

## En una línea
Los avisos pasan a programarse en el teléfono, en la hora de cada persona y con la voz de Paucho: uno a la mañana, «obra lista», el de racha solo si falta, y una escalera corta que se calla sola para quien se fue.

## Problema y oportunidad
Hoy los avisos sirven a un solo teléfono, en hora de Madrid, con dos textos por franja.

- Un cron de GitHub manda Web Push a una única suscripción (`reminder.yml`, `push.ts`). Las 9:00 de Madrid son las 4 o 5 de la mañana en Buenos Aires (plan, problema 2).
- «Obra lista», el aviso más valioso, no está desplegado: `PUSH_WORKER_URL` está vacío en `push.ts`.
- `GREETINGS` en `sw.js` tiene dos textos por franja; el de la noche dice «¡Día completo!» aunque no hayas hecho nada. Son tres avisos por día para siempre (plan, problema 10).
- Duolingo elige el texto de cada aviso con un algoritmo que descansa los ya gastados (KDD 2020, plan), y su foco en retener usuarios actuales rindió 5 veces más que la siguiente métrica (plan).
- Lo que ya está bien y se conserva: el pre-permiso de Paucho (`NotifAsk`, `shouldAskPush`), el texto escrito en el teléfono y la foto del estado (`reminderSnapshot.ts`).

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: permiso concedido sobre instalaciones | 60 % Android, 50 % iPhone | `notif_permission_result` |
| Apertura por tipo (toque en 2 h) | «obra lista» 25 %, mañana 8 %, racha 12 % | `notif_opened` / `notif_scheduled` entregados |
| Reactivación | 8 % de quienes entran a la escalera vuelven en 30 días | `session_start` con `from_ladder` |
| Retención D7 | +3 puntos contra el esquema actual | prueba A/B, doc 27 |
| Guardrail: avisos apagados | < 2 % por semana | `notif_type_disabled`, permiso revocado al abrir |
| Guardrail: avisos por persona activa | ≤ 2 por día en promedio | cuenta de `notif_scheduled` |

## Experiencia
**Pre-permiso.** Paucho pregunta cuando hay algo concreto que avisar: al arrancar la primera obra con espera (2 horas, doc 11).
- De cerca: «Voy a tardar un rato con esto. ¿Te aviso cuando termine?» → «¡Sí, avisame!» / «Ahora no».
- Solo «¡Sí, avisame!» abre el cartel del sistema. En iPhone ese cartel sale una sola vez; por eso nunca se muestra en frío.
- «Ahora no»: vuelve a preguntar hasta 3 veces, con 2 días entre una y otra (regla actual de `shouldAskPush`).
- Permiso negado en el sistema: no se insiste. En Ajustes queda «Avisos apagados» con «Abrir ajustes del teléfono».

**Ajustes → Avisos.** Cuatro filas con interruptor y, donde aplica, hora:
| Fila | Por defecto | Hora |
|---|---|---|
| Buen día de Paucho | encendido | la del primer mate, entre 7:00 y 11:00 |
| Obra lista | encendido | cuando termina |
| Se enfría el mate | encendido | 21:00 |
| Recordatorio de la tarde | apagado | 16:00 |

**Los tipos**
1. **Mañana.** Saludo de Paucho; nunca habla de los hábitos (decisión del dueño). Tocarlo abre el mate del día.
2. **Obra lista.** Llega al terminar la obra o la salida. Si termina en horario de silencio, se junta con el de la mañana.
3. **Racha, solo si falta.** A las 21:00, si hoy no se cebó y la racha es ≥ 2.
4. **Escalera de reactivación.** Si no abrís la app, el saludo diario se corta y quedan cinco avisos: días 2, 4, 7, 14 y 30 desde la última visita. Después, silencio. Hablan del día de Paucho, nunca de tu ausencia. Al volver se cancelan todos y recibe `WelcomeBack`.

**Textos de ejemplo** (`{vos}` nombre, `{perro}` si ya tiene nombre, `{obra}` con artículo, `{n}` racha)

*Mañana*
1. «¡Buen día, {vos}! Ya puse la pava. ¿Cebamos?»
2. «Me levanté con un ojo solo. El otro lo abre el primer mate.»
3. «El agua está justa, ni hervida ni tibia. Te espero.»
4. «{perro} me despertó a lengüetazos. Ya que estoy, cebo.»
5. «Amaneció lindo en el rancho. Falta el mate nomás.»
6. «Dormí como un tronco. La yerba ya está lista.»
7. «Prendí la radio y sonó una cumbia. Así cualquiera arranca.»
8. «¡Arriba, {vos}! Bueno, sin apuro. La pava recién silba.»
9. «Las gallinas ya andan de acá para allá. Yo, con el mate en la mano.»
10. «Hay rocío en el pasto y olor a yerba. Buen día.»

*Obra lista*
1. «¡Terminé {obra}! Vení a ver cómo quedó.»
2. «Listo, {vos}. Guardé el martillo. ¿Vamos a ver?»
3. «Ya está {obra}. No miro hasta que llegues.»
4. «¡Toc, toc! Último clavo puesto. Te espero para el estreno.»
5. «Me quedó mejor de lo que pensaba. Entrá y decime qué te parece.»
6. «{obra}: lista. Yo: lleno de aserrín. Vení a ver.»
7. «{perro} ya olfateó todo y dio el visto bueno. Faltás vos.»
8. «Terminé y me cebé un mate para festejar. El próximo es tuyo.»
9. «Ya está, {vos}. Tapé todo con una lona para darte la sorpresa.»
10. «Obra terminada. Estoy cansado pero contento.»

*Racha, si falta*
1. «Me quedó el mate de hoy sin cebar. ¿Lo hacemos antes de dormir?»
2. «Vamos {n} mates seguidos. El de hoy te está esperando.»
3. «La pava sigue tibia, {vos}. Un mate y a la cama.»
4. «Todavía hay tiempo para el mate de hoy. Es un toque.»
5. «Antes de apagar la radio: ¿cebamos el de hoy?»
6. «Te guardé el agua calentita. Cuando quieras.»
7. «Estoy por guardar la yerba. ¿Cebamos el último?»
8. «Un mate cortito y seguimos con los {n}. ¿Dale?»
9. (con termo) «Si hoy no podés, no pasa nada: el termo nos cubre.»
10. (con termo) «Día largo, ¿no? Dejo el termo lleno por si acaso.»

*Escalera*
1. (día 2) «Hoy casi pesco una mojarrita en la laguna. Casi.»
2. (día 2) «Encontré un nido de hornero en el poste. Después te muestro.»
3. (día 4) «{perro} aprendió a traer el palito. A veces.»
4. (día 4) «Llovió toda la tarde. Hice tortas fritas y sobró una.»
5. (día 7) «Hay novedades en el rancho. Cuando andes por acá, te cuento.»
6. (día 7) «Le cambié la yerba al mate. Quedó espumoso.»
7. (día 14) «Acá sigue todo en su lugar. La pava también.»
8. (día 14) «Cuando tengas ganas, con un hábito ya arrancamos. Sin apuro.»
9. (día 30) «No te escribo más por ahora. La tranquera queda abierta.»
10. (día 30) «Último aviso mío. Si un día volvés, hay mate.»

**Rotación (el bandit de Duolingo, versión simple).** Por cada tipo:
1. Se descartan los textos que no aplican (sin perro, sin termo, peldaño equivocado).
2. Descansan los últimos 10 enviados de ese tipo.
3. De los que quedan, 20 % de las veces se elige al azar; el resto, sorteo con peso `(toques + 1) / (envíos + 2)`.
4. Un texto ignorado 3 veces seguidas descansa 30 días.
5. Los contadores viven en el teléfono. V2: pesos iniciales globales desde contenido remoto (doc 28).

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Avisos por día | 2 normales, tope duro 3 | hoy son 3 fijos para siempre |
| Separación mínima | 3 horas | no apilar |
| Silencio | 22:00 a 7:30 | nada de madrugada |
| Hora de la mañana | la del primer mate, entre 7:00 y 11:00; en V2, mediana de los últimos 7 mates menos 15 min | llega antes del hábito de abrir |
| Aviso de racha | 21:00, racha ≥ 2, mate sin cebar | solo si hay algo que cuidar |
| Escalera | días 2, 4, 7, 14, 30 y corta | 5 avisos como máximo en un mes |
| Saludo diario sin visitas | se corta al día siguiente de la última visita | no acumular avisos sin leer |
| Pre-permiso | hasta 3 veces, cada 2 días | regla actual |
| Textos por tipo | 30 o más (escalera: 6 por peldaño) | meta del plan |
| Descanso | 10 envíos; 30 días tras 3 ignorados | versión simple del bandit |
| Largo | título ≤ 30 caracteres, cuerpo ≤ 90 | se lee sin expandir |

## Contenido necesario
- 30 textos de mañana, 30 de obra lista (10 de ellos para salidas, doc 01), 30 de racha (8 con termo), 30 de escalera. Total 120, escritos en tanda con las líneas de doc 06.
- Títulos: «{Paucho} ☀️», «¡{Paucho} terminó!», «{Paucho} 🧉».
- Arte: ícono monocromo de aviso para Android (silueta del mate) e ícono grande de Paucho.
- Sonido: el del mate, corto, como sonido propio del aviso (V2).

## Arte, animación y sonido
El aviso es texto e ícono; no lleva imagen adjunta en V1. El pre-permiso usa `PauchoTalk` con la pose curiosa. Reglas del ícono en `docs/visual/guia-visual.md`.

## Datos y técnica
- **Plugin:** `@capacitor/local-notifications`, sin servidor (plan). Se retiran `reminder.yml`, `send-reminder.mjs` y `push-worker/`.
- **Módulo nuevo** `app/src/game/notifications.ts` con `reschedule(state)`: cancela lo pendiente y programa de nuevo. Se llama al abrir la app, al cebar, al arrancar una obra y al cambiar Ajustes.
- **Qué programa:** obra lista en `startedAt + WORK_MS`; al cebar, el saludo de mañana y el aviso de racha del día siguiente (este se cancela cuando se ceba); los cinco peldaños desde hoy. Nunca más de 10 pendientes (iOS admite 64).
- **Texto:** se elige al programar, con `compose` de `sw.js` movido a `src/game/notifText.ts` y probado con Vitest. `reminderSnapshot.ts` deja de hacer falta en la app nativa.
- **Estado nuevo** en `store.ts`: `notif: { morningAt, nightAt, types, stats: Record<textId, { sent, opened, ignoredRun, lastSent }> }`.
- **Android:** permiso `POST_NOTIFICATIONS` (13+), alarmas inexactas (sin `SCHEDULE_EXACT_ALARM`), canal por tipo para que cada uno se apague desde el sistema.
- **Versión web:** conserva Web Push solo para «obra lista» hasta que salga la app nativa.
- **Migración:** quien ya tenía avisos conserva el permiso; las horas se fijan con su primer mate.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `notif_preask_shown` / `notif_preask_answered` | pre-permiso de Paucho | `attempt`, `answer` |
| `notif_permission_result` | cartel del sistema | `granted`, `platform` |
| `notif_scheduled` | se programa | `type`, `text_id`, `fire_at_local` |
| `notif_opened` | toque en el aviso | `type`, `text_id`, `minutes_after` |
| `session_start` | apertura | `from_notif`, `from_ladder`, `ladder_step` |
| `notif_type_disabled` | interruptor apagado | `type` |
| `notif_time_changed` | cambia la hora | `type`, `hour` |

## Casos borde y riesgos
- **Texto viejo.** El aviso se escribe al programarse: si la persona ceba desde el widget o cambia el nombre, se reprograma. El de racha se cancela al cebar.
- **Cambio de huso o de hora.** Las horas son locales; al abrir se reprograma.
- **Android mata alarmas** en algunas marcas: se acepta; el widget (doc 25) cubre.
- **Culpa.** Ningún texto nombra días de ausencia ni «te extraño» en avisos; eso queda para `WelcomeBack`, ya dentro de la app.
- **Bienestar.** El aviso de racha se apaga por separado (plan, riesgos). Sin palabras prohibidas.
- **Tiendas.** Avisos solo con permiso y sin promoción; los de oferta, si existen (doc 17), van en otro canal apagable.
- **Abuso del bandit.** Optimizar por toques puede premiar textos alarmistas: todos pasan por revisión de voz antes de entrar al fondo.

## Fases
- **V1:** cuatro tipos, 20 textos por tipo, rotación con descanso, Ajustes por tipo, pre-permiso.
- **V2:** 30+ por tipo, hora que aprende, pesos globales remotos, sonido propio.
- **Más adelante:** avisos de evento (doc 02) y de racha de a dos (doc 09), con el mismo tope diario.
- **Afuera:** avisos de marketing, más de 3 por día, imágenes adjuntas.

## Criterios de aceptación
- [ ] Con el teléfono en Buenos Aires, el saludo llega a la hora local elegida.
- [ ] «Obra lista» llega al terminar la obra con la app cerrada y sin conexión.
- [ ] El aviso de las 21:00 no llega si el mate se cebó, ni con racha menor a 2.
- [ ] Sin abrir la app llegan exactamente 5 avisos en 30 días y después ninguno.
- [ ] Ningún texto se repite dentro de 10 envíos del mismo tipo.
- [ ] El cartel del sistema solo aparece tras «¡Sí, avisame!».
- [ ] Nunca llegan más de 3 en un día ni entre las 22:00 y las 7:30.
- [ ] Cada tipo se apaga solo desde Ajustes.

## Preguntas abiertas
1. **Recordatorio de las 16:00.** Hoy está encendido; el plan lo saca del defecto. Recomiendo dejarlo apagado y opcional.
2. **Saludo de la noche.** Recomiendo eliminarlo: lo reemplaza el de racha solo si falta.
3. **Aviso de racha con termo.** Recomiendo mandarlo con el texto del termo (igual que doc 08).
4. **Día 30 de la escalera.** ¿Decir que es el último? Recomiendo que sí: es honesto y deja la puerta abierta.
