# 06 · Memoria y voz de Paucho
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: 6 · Depende de: 05, 12, 14, 28, 30

## En una línea
Paucho pasa de 6 frases de festejo a un banco de 480 líneas por situación, con memoria de tus hábitos, tu meta y lo que anotaste, y con días en que anda con sueño, con frío o cansado de la obra.

## Problema y oportunidad
Paucho siempre está contento y casi no tiene qué decir. La evidencia:
- Festejo de hábito: 6 frases (`PRAISE` en `App.tsx:30`), todas del tipo «¡Qué crack!».
- Tocarlo da un salto y un sonido, sin frase (`onTapPaucho`, `App.tsx:265`).
- `aboutYou` se guarda en `finishOnboarding` y ningún otro archivo lo lee.
- El resto de las líneas vive suelto en `pick([...])` de tres variantes dentro de `FullTalk`, `Casita`, `Encargos`, `Reveal`, `DayOne` y `Home`.
- `TalkPose` tiene 6 poses de cerca, todas alegres o neutras.

Si siempre está contento, su alegría no vale (plan). Duo cambia de ánimo según lo que hacés y el pajarito de Finch se duerme (plan). Es la mejora más barata del plan: texto, y cinco poses.

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: D7 y D30 | +2 puntos de D7 contra el banco actual | prueba A/B (doc 27) |
| Secundaria: toques a Paucho por usuario activo y día | ≥ 1,5 | `paucho_tocado` |
| Secundaria: líneas repetidas dentro de 7 días | 0 | test del selector |
| Guardrail: avisos apagados y desinstalaciones tras un estado bajo | sin diferencia con el control | cohortes |

## Experiencia
**Dónde habla.** Dos superficies, las de hoy: el globo del campo (`say`) y de cerca (`PauchoTalk`). No se suman cajas de sistema.

**Qué cambia para la persona.**
1. Tilda «Tender la cama» y Paucho dice «"Tender la cama", listo. Vas mejor que yo.» en vez de «¡Bravo!».
2. Lo toca y contesta: «¿Qué pasó? Estaba pensando en nada.»
3. Un jueves, al abrir: «Hace una semana anotaste: "la merienda con mi vieja". Me quedó dando vueltas.»
4. Un día de julio, temprano: «Qué helada cayó. Me arrimo al fogón y te escucho desde acá.»

**Situaciones, cantidad y ejemplos.**

| # | Situación | Líneas | Tres ejemplos |
|---|---|---|---|
| 1 | Hábito hecho, sin nombre | 40 | «Uno menos. Así, sin hacer ruido.» · «Eso. Anotado.» · «Bien ahí. Yo ni me había levantado.» |
| 2 | Hábito hecho, con `{habito}` | 40 | «"{habito}", listo. Vas mejor que yo.» · «¿"{habito}" ya? Bueno, bueno.» · «"{habito}": hecho. Qué prolijidad.» |
| 3 | Lo tocan | 40 | «¿Qué pasó? Estaba pensando en nada.» · «Ey. Acá ando, cuidando el fuego.» · «Si me tocás de nuevo te cebo uno.» |
| 4 | Saludo al abrir (mañana, tarde, noche) | 36 | «Buen día, {nombre}. La pava ya está.» · «¿Todo bien? Acá recién termina la siesta.» · «A esta hora quedamos los grillos y yo.» |
| 5 | Respuesta al mate del día (doc 05) | 60 | «Tibio es un montón para un martes.» · «Hay días lavados. Mañana cambiamos la yerba.» · «Hoy la pava se portó.» |
| 6 | Devuelve lo anotado, `{nota}` | 24 | «Hace una semana anotaste: "{nota}". Me quedó dando vueltas.» · «Tengo anotado "{nota}". Linda esa.» · «El {dia} lo mejor fue "{nota}". ¿Se repite?» |
| 7 | Recuerda la meta, `{meta}` | 32 | «Viniste para {meta}. Esto que hiciste cuenta.» · «Para {meta} no hay atajo. Hoy sumaste uno.» · «¿Te acordás que querías {meta}? Mirá dónde vas.» |
| 8 | Barra llena, sale a trabajar | 24 | «Con esto me alcanza. Me voy a martillar un rato.» · «Listo, hoy hay obra. Vos seguí con lo tuyo.» · «Me diste cuerda. A las {hora} te muestro.» |
| 9 | Obra lista | 24 | «Quedó derechita. Bueno, casi.» · «Vení a ver. No toques, que está fresco.» · «La hice yo. Con tu energía, pero la hice yo.» |
| 10 | Con sueño | 15 | «Me dormí con la radio prendida. Un mate y arranco.» · «Los gallos hoy se pasaron de puntuales.» · «Bostezo y sigo. No me hagas caso.» |
| 11 | Con frío | 15 | «Qué helada cayó. Tengo las manos como bombilla al sereno.» · «Hoy el poncho no se negocia.» · «Me arrimo al fogón y te escucho desde acá.» |
| 12 | Cansado de la obra | 15 | «Hoy el martillo pesaba el doble. Quedó lindo igual.» · «Me duelen brazos que no sabía que tenía.» · «Estoy fundido. Fundido contento, pero fundido.» |
| 13 | «Hoy no puedo» y días cortos | 18 | «Ese queda para otro día. No se va a ningún lado.» · «Tranqui. Hoy, lo que se pueda.» · «Anotado: hoy no. Mañana vemos.» |
| 14 | Vuelta después de días | 15 | «¡Ey, {nombre}! Justo estaba por cebar.» · «Mirá quién llegó. Pasá, hay yerba nueva.» · «Qué bueno verte. {perro} aprendió a abrir la tranquera.» |
| 15 | Mate de la mañana y racha, `{dias}` | 30 | «{dias} mates seguidos. Ya somos costumbre.» · «Otro mate, otro día. Sin apuro.» · «Una semana. En el pueblo a esto le dicen noviazgo.» |
| 16 | Casita, prendas, perro | 24 | «Ahora sí parece casa de alguien.» · «¿Me queda bien o me estás cargando?» · «{perro} ya eligió su rincón. Era el mío.» |
| 17 | Día de la semana y fechas | 28 | «Lunes. Yo también lo vi venir.» · «Viernes. La radio está en cumbia desde temprano.» · «Domingo. Hoy se permite no hacer nada, con ganas.» |
| | **Total** | **480** | |

**Estados bajos.** Hablan del día de Paucho, nunca de la ausencia del jugador. Duran una sesión y se van solos; tras el primer hábito dice una línea de salida («Ya está, ya me desperté.»). No piden nada y no cambian ningún premio.

| Estado | Cuándo puede aparecer | Pose |
|---|---|---|
| Con sueño | abrir antes de las 7:30 o después de las 23:00 | `b10_sueno` |
| Con frío | junio a agosto, antes de las 10:00 | `b11_frio` |
| Cansado de la obra | hasta 2 horas después de terminar una obra, desde la tercera | `b12_cansado` |

**Estados vacíos.** Sin `playerName`, sin perro o sin notas, el selector descarta las líneas que usan esa variable. Nunca se ve una llave ni un hueco.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Prioridad al elegir situación | ceremonia (8, 9, 15) > mate del día > estado bajo > memoria o meta > con nombre > genérica | Lo raro primero |
| Descanso de una línea | no vuelve hasta usar el 70 % de su bolsa y pasar 7 días | La idea de Duolingo de descansar lo gastado (plan) |
| Elección dentro de la bolsa | al azar entre las descansadas, con más peso a la más vieja | Que no se note el orden |
| `{nombre}` | en 1 de cada 4 líneas como mucho | El nombre repetido suena a vendedor |
| Hábito con nombre contra genérico | 1 de cada 3 festejos | Que sorprenda |
| Memoria de notas | 1 por día, 3 por semana; nota de 3 días o más y hasta 60 caracteres; cada nota vuelve una sola vez | Que sea regalo y no eco |
| Qué recuerda | solo «lo mejor de hoy». Nunca el nivel del mate de un día pasado | No devolver un día malo |
| Meta | 1 por día, 2 por semana, atada a un hábito del área (tabla en doc 29) | Que tenga sentido |
| Estado bajo | 1 por día, 2 días por semana; nunca en los días 1 a 3, ni en un día de vuelta, ni con mate Helado o Lavado | Cuando vos estás bajo, él está firme |
| Largo | campo: 60 caracteres; de cerca: 110 | Entra en dos renglones a 390 pt |
| Signos | un «¡» por línea como mucho | Humor seco (doc 30) |

`{meta}` sale de una tabla fija por área de `aboutYou.areas`: `familia` → «estar más con los tuyos», `vinculos` → «ver más a tu gente», `foco` → «ganar foco», `rutina` → «armar una rutina», `dormir` → «dormir mejor», `cuerpo` → «moverte más», `calma` → «andar más tranqui», `confianza` → «confiar más en vos». `{habito}` va siempre entre comillas y sin conjugar, porque los nombres son frases en infinitivo y los hay escritos por el jugador.

## Contenido necesario
- **480 líneas**, en dos tandas: 300 para la V1 (situaciones 1 a 5, 8, 9, 13, 15) y 180 después.
- **5 poses de cerca nuevas**, cada una con `_cerrada` y `_abierta`, 1254×1254, alineadas al píxel con las `mate_b*`: `b10_sueno` (bostezo, sombrero caído), `b11_frio` (poncho hasta la nariz), `b12_cansado` (se seca la frente), `b13_orgulloso` (pecho inflado, para obra lista y racha), `b14_emocionado` (ojos brillosos, para la vuelta y la memoria).
- `mate_b3_escucha` ya existe y no está en `TalkPose`: se suma para cuando lee una nota.
- 3 sonidos: bostezo, tiritar, resoplido.

## Arte, animación y sonido
Las cinco poses se piden en fieltro, el estilo fijado en el doc 12, con el mismo encuadre que `b2_habla`. En el campo, la V1 no cambia la pose: el estado bajo se ve en el globo y de cerca. Cuando existan los ciclos del doc 14 se suma un bostezo de cuerpo entero. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- `src/game/lines.ts`: el banco. Cada línea: `id`, `situacion`, `texto`, `superficie`, `pose?`, `vars`, `condicion?`.
- `src/game/voice.ts`: `say(situacion, contexto)` aplica filtros, presupuestos y descanso. Un solo punto de entrada reemplaza a `PRAISE` y a los `pick([...])` sueltos.
- Estado nuevo en `gauchito.v2`: `voice: { usadas: Record<id, dia>, presupuesto: {...}, notasUsadas: string[] }`, unos 10 KB.
- Las notas se leen de `gauchito.v2.diario` (doc 05) y nunca se copian a `voice`.
- `voice.test.ts` revisa cada línea: voseo, palabras prohibidas, largo, variables válidas, un solo «¡».
- El banco viaja en el binario; con contenido remoto (doc 28) se actualiza sin versión nueva.
- Migración: ninguna. Sin `voice`, todas las líneas están descansadas.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `linea_mostrada` | cada línea del banco | `situacion`, `linea_id`, `superficie`. Nunca el texto armado |
| `paucho_tocado` | toque en el campo | `pestana` |
| `estado_bajo_mostrado` | entra en un estado | `estado` |
| `memoria_mostrada` | devuelve una nota o la meta | `tipo` (nota, meta). Sin contenido |

## Casos borde y riesgos
- **Culpa.** Ninguna línea menciona días sin entrar, hábitos sin hacer ni «te extrañé». La situación 14 habla de alegría y de novedades del campo. Un test busca «volviste», «por fin», «hace cuánto».
- **Nota que ya no es linda.** Lo mejor de hace una semana puede doler hoy. Por eso cada nota vuelve una sola vez, y borrar una entrada en la libreta la saca de la memoria.
- **Privacidad.** `linea_mostrada` lleva el id, no el texto, porque el texto armado puede contener una nota o un hábito propio.
- **Hábitos con nombres raros.** `{habito}` entre comillas aguanta cualquier texto; pasados los 28 caracteres se usa una línea genérica.
- **Bienestar y tiendas.** Los estados bajos son sueño, frío y cansancio, nunca tristeza ni preocupación. Paucho no aconseja sobre salud.
- **Calidad en tanda.** Trescientas líneas generadas de un saque tienden al «¡Sos un genio!». Cada tanda pasa por el dueño con la guía de voz del doc 30.

## Fases
- **V1:** selector con descanso, 300 líneas, `{nombre}` y `{habito}`, frase al tocarlo.
- **V2:** `{meta}`, memoria de notas (pide el doc 05), estados bajos con sus 3 poses.
- **Más adelante:** las otras 2 poses, líneas de evento (doc 02) y de animalitos (doc 03), banco remoto.
- **Afuera:** texto generado por IA en el teléfono o en un servidor; chat libre con Paucho.

## Criterios de aceptación
- [ ] `PRAISE` y los `pick([...])` de texto ya no existen; todo pasa por `voice.ts`.
- [ ] En una simulación de 60 días ninguna línea se repite dentro de 7 días.
- [ ] Tocar a Paucho siempre da una frase.
- [ ] Ningún estado bajo aparece en los días 1 a 3, en un día de vuelta ni con mate Helado o Lavado.
- [ ] Sin nombre, perro o notas no queda ninguna variable a la vista.
- [ ] Todas las líneas pasan `voice.test.ts`.
- [ ] Las cinco poses nuevas no saltan al alternar boca abierta y cerrada.

## Preguntas abiertas
1. **¿480 líneas o 300?** Recomiendo lanzar con 300 y medir repetición antes de escribir más.
2. **¿Paucho dice «te extrañé»?** El plan lo lista como emoción que falta. Recomiendo que no lo diga: `b14_emocionado` muestra la alegría sin nombrar la ausencia.
3. **¿Recordar también los días espumosos?** Recomiendo no usar ningún nivel pasado en la V2 y revisarlo con datos.
4. **¿Quién escribe?** Recomiendo tandas de IA con esta tabla como guía y una pasada tuya de una hora por cada cien líneas.
