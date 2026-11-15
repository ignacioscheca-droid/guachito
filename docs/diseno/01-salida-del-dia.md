# 01 · La salida del día
> Estado: propuesta · Etapa: Etapa 1 del plan (antes del primer corte numérico), V1 solo texto · Mejora del plan: 1 · Depende de: 04, 15, 16, 28

## En una línea
Cuando la barra se llena y no toca obra, Paucho sale dos horas a un lugar del pago y vuelve con un cuento de tres líneas y un recuerdo para la libreta: 150 recuerdos, cinco meses de novedad diaria.

## Problema y oportunidad
Después de la obra 10 la barra no hace nada. `chargeTarget` (store.ts) devuelve `null` sin `nextJob`, Inicio muestra «¡Todo listo!» y cada hábito paga 5 herraduras sueltas. La simulación da 44 de 46 días sin nada nuevo entre el 14 y el 59 (plan). Una obra pide una escena ilustrada por etapa; una salida pide un texto y, más adelante, un ícono (plan). Se lo aprendemos a la aventura diaria de Finch, que trae un descubrimiento por día (plan).

## Objetivo y métricas
| Métrica | Hoy | Objetivo | Cómo se mide |
|---|---|---|---|
| Primaria: días sin nada nuevo, 14–59 (simulación, jugador constante) | 44 de 46 | ≤ 3 de 46 | `simulation.test.ts`, `PACING.quietDays14to59` nuevo |
| Activos del día que llenan la barra, días 11–30 | sin dato | ≥ 55 % | `barra_llena` / activos (27) |
| Salidas con el cuento leído el mismo día | — | ≥ 70 % | `salida_cuento_visto` / `salida_iniciada` |
| Guardrail: duración de la vuelta | — | ≤ 10 s, ≤ 3 toques | prueba manual (15) |
| Guardrail: bajas de avisos por «volví» | — | ≤ 2 % semanal | 16 |

## Experiencia
1. **Barra llena.** Si toca salida, Paucho dice de cerca una línea: «Hoy me voy hasta la laguna. Vuelvo en un par de horas.» Botón «¡Andá nomás!».
2. **Afuera (2 h).** El área queda con el perro esperando. La barra muestra «Vuelve en 1 h 40» y el ícono del lugar en su punta. Los hábitos siguen pagando herraduras, igual que con una obra en marcha.
3. **Aviso** (si están activos): «Volví de la laguna. Te traje algo.»
4. **La vuelta**, en Inicio: Paucho de cerca cuenta las tres líneas (un toque por línea, se pueden saltear), aparece el recuerdo con su nombre y rareza, y «¡A la libreta!» lo guarda. Tres toques.
5. **La libreta de recuerdos**: en Mapa → «Los viajes», cada lugar es una página con «7 de 25». En V1 es una lista: nombre, rareza, fecha y el cuento para releer.

Estados: página vacía, «Todavía no fui para ahí. Cuando salga te cuento.»; lugar bloqueado, «Se abre con 6 salidas más.»; vuelta sin ver durante días, Paucho espera con el cuento y nada se pierde; sin recuerdos nuevos, «Hoy no encontré nada nuevo, pero qué lindo estaba» y 10 herraduras.

### Doce cuentos de ejemplo
| Lugar · rareza | Recuerdo | Cuento |
|---|---|---|
| Pulpería · común | Galletas de campaña | Fui a la pulpería a buscar yerba. / Don Tito me convidó galletas de campaña, de las que hacen ruido. / Te guardé una. Bueno, media. |
| Pulpería · común | Pilas para la radio | La radio se quedó muda en plena cumbia. / Compré pilas y volví bailando por el camino. / El perro dice que bailo mal. No le creas. |
| Pulpería · especial | Calco para el termo | En el mostrador había una caja de calcos. / Elegí un sol con cara de dormido. / Me hizo acordar a mí un lunes. |
| Laguna · común | Ranita verde | Me senté en la orilla a no hacer nada. / Una ranita se me subió a la bota y se quedó. / No me moví hasta que se fue. Tardó un rato largo. |
| Laguna · especial | Garza blanca | Había una garza parada en una pata. / Probé hacer lo mismo y aguanté cuatro segundos. / Ella sigue ahí. Yo me vine a tomar unos mates. |
| Laguna · rara | Luna en el agua | Me quedé hasta que salió la luna. / Estaba entera en la laguna, quietita. / Tiré una piedra y se desarmó. Después se armó sola. |
| Monte · común | Nido de hornero | Encontré un nido de hornero en un poste. / Lo miré un buen rato: ni un clavo usó. / Yo con martillo y todo, y él me gana. |
| Monte · especial | Mburucuyá maduro | Había un mburucuyá trepado al alambrado. / Tenía un solo fruto maduro, naranja. / Lo partí al medio: dulce y un poquito ácido. |
| Monte · rara | Mulita cruzando | Algo cruzó el sendero despacito. / Era una mulita, con su armadura y todo. / Me miró, la miré, y cada uno siguió con lo suyo. |
| Pueblo · común | Churros de la plaza | En la plaza había un carrito de churros. / Compré dos: uno para el camino y otro para el camino también. / Llegué sin ninguno. Así es la vida. |
| Arroyo · especial | Piedra para hacer sapito | Junté piedras chatas en el arroyo. / La mejor hizo cinco sapitos antes de hundirse. / Te traje la segunda mejor, que esa se salvó. |
| Loma · única | Las Tres Marías | Subí a la loma de noche, con el poncho puesto. / Estaban las Tres Marías, clarito, arriba del rancho. / Me dormí contándolas. Son tres, pero igual. |

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Barras llenas por día | 1 (`lastFullDay`, sin cambios) | Un momento grande por día; ya es la regla de las obras |
| Qué dispara la barra | Obra si «toca obra»; si no, salida | La barra siempre sirve para algo |
| `SALIDAS_ANTES_DE_OBRA` | Área 1: 0 · Área 2: 1 · desde el viaje: 2 | La primera semana no se toca; después los 10 trabajos duran unos 21 días en vez de 10, y la primera salida cae el día 3 |
| En la barra | Dos puntos junto al ícono de la obra: «Faltan 2 salidas para el corral» | La espera se ve y tiene motivo: Paucho junta materiales |
| `SALIDA_MS` | 2 horas | Da una segunda visita el mismo día (argumento del plan, mejora 11) y deja a la obra de 8 h como lo grande |
| Meta de la barra | Sigue `energyGoal(jobsDone)`; las salidas no la suben | Con 7 hábitos como máximo, una barra de 60–70 dejaría afuera a quien hace 4 |
| Herraduras | 30 por llenar la barra, como hoy; la salida no paga aparte | El premio de la salida es el recuerdo; la cuenta está en 04 |
| Recuerdos | 150 = 6 lugares × 25 | Cinco meses de novedad (plan) |
| Por lugar | 14 comunes, 7 especiales, 3 raros, 1 único | La mayoría sale rápido; siempre queda algo difícil por página |
| Sorteo | Común 62 %, especial 28 %, raro 10 %; nunca repite; si se agota una rareza, baja a la siguiente | Sin repetidos no hay decepción ni hace falta moneda de canje |
| Garantías | Un especial o mejor cada 5 salidas; un raro cada 20 | Rachas de mala suerte acotadas |
| Único | No se sortea: llega al juntar los otros 24 del lugar | Completar la página tiene premio propio |
| Lugares, por salidas hechas | Pulpería 0 · Laguna 4 · Monte 10 · Pueblo 20 · Arroyo 35 · Loma 55 | Un lugar nuevo cada 2 a 4 semanas |
| Lugar del día | Lo elige Paucho: 50 % el más nuevo con recuerdos pendientes, el resto al azar | Cero decisiones en lo diario; la elección del jugador es V2 |
| Cuándo se decide el recuerdo | Al salir, con semilla del día | Reabrir la app no cambia el resultado |
| Premios de página | 25 herraduras cada 5 recuerdos; 100 al completarla | 1.200 en 150 salidas: unas 8 por día, no mueve la economía (04) |

## Contenido necesario
- 150 cuentos de tres líneas (unas 6.000 palabras), escritos en tanda por lugar. Cada uno: id, lugar, rareza, tipo (bicho, cosa, sabor, cielo), nombre, tres líneas.
- Mezcla por lugar: Pulpería, cosas y sabores; Laguna y Monte, bichos; Pueblo, sabores y gente; Arroyo, piedras y bichos; Loma, cielos.
- 18 líneas de salida (3 por lugar), 6 de «no encontré nada», 30 textos de aviso «volví» (16).
- Arte en V1: ninguno. Un emoji por tipo hasta que lleguen los íconos.

## Arte, animación y sonido
V1 no pide arte: Paucho de cerca con las poses `mate_b*` que ya existen, y el recuerdo en una `Card` del sistema de diseño. V2: 150 íconos generados en hojas de 25 con una sola luz, y un fondo por lugar para «Los viajes». Sonido: pasos al salir, tranquera al volver. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- Estado nuevo: `salidas: { hechas, desdeObra, album: Record<idRecuerdo, día>, actual: { lugar, recuerdo } | null }` y `work.kind: 'obra' | 'salida'`.
- `game/salidas.ts` (nuevo): `LUGARES`, `RECUERDOS`, `tocaObra(s)`, `elegirSalida(s, día)`.
- `store.ts`: `chargeTarget` deja de devolver `null` sin obra; `startWork` y `completeJob` aceptan salida. `journey.ts`: `SALIDA_MS`, `SALIDAS_ANTES_DE_OBRA`.
- `encargos.ts`: `barToday` vuelve a valer después de la última obra; diario nuevo «Escuchá el cuento de hoy» (toque, 5) y línea semanal «Salí 2 / 4 / 6 veces».
- Pantallas: `Home.tsx`, `FullTalk`, `MapaTab.tsx`. El aviso usa el mismo camino que «obra lista» (16).
- Sin servidor. Los textos van en el binario; los packs nuevos llegan por contenido remoto (28).
- Migración: un guardado con `jobsDone = 10` arranca con salidas en su próxima barra.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `salida_iniciada` | «¡Andá nomás!» | `lugar`, `salidas_hechas`, `hora_local` |
| `salida_cuento_visto` | Se guarda el recuerdo | `recuerdo_id`, `rareza`, `horas_desde_vuelta`, `salteado` |
| `recuerdo_pagina_completa` | Recuerdo 25 de un lugar | `lugar`, `dias_desde_instalacion` |
| `libreta_abierta` | Se abre «Los viajes» | `recuerdos_total` |
| `lugar_desbloqueado` | Se abre un lugar | `lugar`, `salidas_hechas` |

## Casos borde y riesgos
- **Reloj adelantado**: saltea las 2 horas, igual que hoy las 8. El tope de una barra por día limita el daño a un recuerdo diario.
- **Obra y salida a la vez**: nunca; `work` es uno solo.
- **Pool agotado** (unas 150 salidas): cae a «no encontré nada» más 10 herraduras hasta que llegue un pack.
- **Bienestar**: la salida es gratis para siempre. Ningún cuento habla de la ausencia del jugador ni de síntomas. La pulpería vende yerba, galletas y pilas: nada de alcohol.
- **Tiendas**: el sorteo no se paga con plata ni con herraduras; no es una caja de botín.
- **Riesgo de fatiga**: un cuento flojo por día cansa. Los 150 se revisan en voz alta antes de entrar.

## Fases
- **V1 (etapa 1)**: 3 lugares, 75 cuentos, libreta en lista, sin arte, regla de espaciado de obras.
- **V2**: 150 cuentos, íconos, página por lugar, el jugador elige destino, tarjeta para compartir el único (10).
- **Más adelante**: packs de 25 por evento (02), el acompañante aparece en el cuento (03).
- **Afuera**: minijuegos durante la salida, objetos de salida para el cuarto.

## Criterios de aceptación
- [ ] Con las 10 obras hechas, llenar la barra inicia una salida y no muestra «¡Todo listo!».
- [ ] La vuelta se completa en 3 toques y 10 segundos o menos.
- [ ] En 150 salidas simuladas con 25 semillas no hay repetidos y se cumplen las dos garantías.
- [ ] El único de un lugar aparece solo con los otros 24 juntados.
- [ ] Cerrar y reabrir durante la salida no cambia lugar ni recuerdo.
- [ ] La simulación da 3 o menos días sin nada nuevo entre el 14 y el 59.
- [ ] Ningún texto contiene las palabras prohibidas del brief.

## Preguntas abiertas
1. **Espaciar las obras cambia «una barra llena por día arranca la obra siguiente».** Recomiendo aceptarlo desde el Área 2: lo pide el plan («hitos grandes, más espaciados») y lleva el día 3 la primera salida.
2. **¿Dos horas o inmediata?** Recomiendo 2 h: crea la segunda visita. Si en la prueba menos del 50 % vuelve el mismo día, bajar a 1 h.
3. **¿Don Tito y otros vecinos con nombre?** Recomiendo sí, hasta cuatro personajes fijos: dan mundo sin pedir arte.
