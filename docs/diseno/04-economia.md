# 04 · Economía con algo que desear
> Estado: propuesta · Etapa: Etapa 1 del plan (precios y simulación, antes del lanzamiento suave); gastos nuevos con 01, 02 y 03 · Mejora del plan: 4 · Depende de: 01, 02, 03, 17, 27

## En una línea
No se toca lo que el jugador cobra: se duplica lo que puede desear, se suman tres gastos que se repiten y la simulación pasa a medir el saldo con encargos incluidos.

## Problema y oportunidad
La simulación no cuenta los encargos, que son la mitad del ingreso. Corrí una copia descartable de `simulation.test.ts` con `openEncargos` y `cobrarTodo` en cada sesión, 60 días, sin compras (medido, no estimado):

| Jugador | Día 7 | Día 14 | Día 30 | Día 60 | Semana en régimen | De encargos |
|---|---|---|---|---|---|---|
| Constante (7 hábitos, 7 de 7 días) | 1.020 | 1.830 | 3.415 | 6.175 | 615–630 | 52 % |
| Mínimo (solo la barra, 7 de 7) | 705 | 1.360 | 2.470 | 4.370 | 415 | 54 % |
| Medio (4 hábitos, 5 de 7) | 550 | 1.215 | 2.010 | 3.540 | 315 | 52 % |

El plan estimaba 800 por semana; lo medido es 625. La conclusión no cambia.

**De dónde salen (constante, semana en régimen):** hábitos después del viaje, 7 × 5 × 7 = 245 (`EXTRA_HABIT_COINS`); encargos diarios, 28 por día = 195 (`LEVEL_COINS`); semanales, 185 (`LINES`). Mientras hay obras, el día base es 50 (30 por la barra más 4 × 5). Premios de una vez en 60 días: 3 áreas × 50, viaje 50, metas de racha 50 + 100 + 150 + 200 = 700.

**En qué se gastan hoy:**

| Gasto | Piezas | Precio | Total |
|---|---|---|---|
| Cuarto, opción 1 | 16 | 20–80 | 590 |
| Cuarto, opción 2 | 16 | 40–140 | 1.430 |
| Cuarto, opción 3 por herraduras | 4 | 90–200 | 630 |
| Ropa (`CLOTHES`) | 6 | 40–120 | 440 |
| **Todo lo no Premium** | 42 | | **3.090** |
| Cuarto Premium | 6 | 220–300 | 1.510 |
| Termo | hasta 2 en mano | 60 | se repite |

El jugador constante compra todo lo no Premium el día 28 y llega al día 60 con 3.085 herraduras sin destino. El medio recién lo agota el día 52: el problema es de los mejores jugadores, justo los que más retienen. El termo cuesta 60: menos de un día de ingreso para proteger lo más valioso del juego. Y hay un solo gasto que se repite. Una moneda que sobra deja de premiar, y sin escasez medida no se puede vender nada después (plan). Referencia: las tres opciones por tarea de Homescapes (plan).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: saldo en mano del activo mediano | Entre 1 y 4 días de su ingreso (tabla de metas) | `economia_dia` |
| Activos con saldo mayor a 800 | ≤ 20 % | 800 supera lo más caro no Premium: ya no desean nada |
| Días con saldo menor a 30 | ≤ 40 % de los días | Menos de 30 no alcanza ni para una opción 1 |
| Activos que compran algo en la semana, días 14–60 | ≥ 50 % | `herraduras_gastadas` |
| Cobertura del catálogo al día 60 (constante) | 50–70 % | simulación |
| Guardrail: ingreso de la primera semana | Sin cambios (935 medido) | `PACING.firstWeekEarned` |

## Experiencia
El jugador no ve una «economía»; ve cuatro cosas.
1. **Precios por escalón.** La opción 1 de cada lugar sigue barata; la 2 y la 3 se ven como algo para juntar. La tienda marca lo que ya alcanza y, en lo que no, «Te faltan 120».
2. **Estilos de obra.** En la revelación de cada obra, Paucho muestra tres versiones: «La hice así. También me la imagino de adobe o con techo de chapa.» El estilo 1 es el construido y es gratis. Los otros se compran desde el Mapa, tocando la obra, y cambiar entre los que ya se tienen no cuesta nada.
3. **Mimos** (03): 10 herraduras, uno por animalito por día.
4. **Cosas de evento** (02): el puesto y el reclamo.

Estados: sin nada que alcance, Paucho en la tienda: «Con un par de días más llegamos a la mecedora»; con todo comprado, «No me entra un alfiler. Guardemos para lo que venga».

## Reglas y números
### Qué se toca y qué no
| Regla | Hoy | Propuesta | Por qué |
|---|---|---|---|
| Ingreso por hábito, barra y encargos | 5 / 30 / 5–25 | Igual | Son decisiones del dueño y lo que se siente cada día; subir precios no se nota como pérdida, bajar premios sí |
| Opción 1 del cuarto | 20–80 | Igual | La primera semana tiene que dar una compra por día; el encargo «Comprá algo» depende de eso |
| Opción 2 | 40–140 | × 2: 80–280 | 2 a 3 días del constante, 2 a 6 del medio |
| Opción 3 por herraduras | 160–200; bowls 90 | Acordeón 550, cómoda 600, cortinas 500, bowls 280 | Una semana de juntar: el «sueño» del cuarto |
| Ropa | 40–120 | Pañuelos 100, boina 150, gorro 200, ponchos 250 y 300 | Es lo que más se ve, sobre Paucho en todas las pantallas |
| Premium del cuarto | 220–300 | × 3: 650–900 | Quien paga recibe más para desear, no más monedas |
| Termo | 60 | 150 | A 60, faltar un día de cada tres cuesta 20 por día y la racha no significa nada; a 150 pide el ingreso entero del jugador medio |
| Escalón tope semanal | 110 % de la semana pasada | Con techo en lo posible según el plan de hábitos | Medido: al constante le piden 54 hábitos con 49 posibles y cobra 185 de unos 300 |

Catálogo permanente nuevo: cuarto 5.380 (590 + 2.860 + 1.930) y ropa 1.100, **6.480** contra 3.090.

### Gastos que se repiten
| Gasto | Precio | Tope | Cuánto absorbe |
|---|---|---|---|
| Estilos de obra (2 por obra) | 400 en casa, galpón y molino; 250 en el resto | 18 estilos, 5.400 | Crece con cada área nueva: 1.650 por área |
| Mimos (03) | 10 | 1 por animalito por día | 10 a 70 por semana por animalito; 600 para llevar uno al nivel 5 |
| Puesto del evento (02) | 350 y 550 | 4 eventos al año | 900 por evento |
| Reclamo de lo perdido (02) | 100 por casillero | 20 por evento | Solo para quien quiere apurarlo |
| Termo | 150 | 2 en mano | Unos 150 al mes para quien falta seguido |

### Ingreso con los sistemas nuevos (estimación sobre la corrida)
La salida devuelve la barra después de la última obra: 30 más 3 × 5 en lugar de 7 × 5, unos 85 más por semana, y los premios de página de la libreta suman unos 55. El constante queda en unas 765 por semana (110 por día); el medio, en unas 415 (60 por día). Cada evento regala 210 en el camino gratis.

### Metas de saldo
| Día | Ganado, constante | Ganado, medio | Saldo en mano objetivo | Catálogo comprado, constante / medio |
|---|---|---|---|---|
| 7 | 1.020 | 550 | 60–150 | 12 % / 7 % |
| 14 | 1.900 | 1.250 | 100–250 | 20 % / 13 % |
| 30 | 3.650 | 2.150 | 150–400 | 30 % / 18 % |
| 60 | 6.900 | 3.950 | 150–450 | 50 % / 29 % |

Los porcentajes son sobre lo que existe al día 60 con todo en producción: 6.480 permanentes, 5.400 de estilos, 900 de un evento y unos 1.000 de mimos, 13.780 en total. Con estilos solo para el Área 1 en V1 (1.650), la cobertura del constante sube a 68 %. El saldo objetivo crece porque crece lo que se junta: una opción 1 la primera semana, una opción 3 o un estilo al mes. Nadie completa el catálogo antes del día 120, y cada evento y cada área lo vuelven a abrir.

### Lugar para Premium, sin moneda dura
| Regla | Por qué |
|---|---|
| Premium no multiplica herraduras ni vende hábitos, rachas, obras o salidas | «Cuidarte es gratis»; si pagar diera más monedas, cuidarse valdría menos para quien no paga |
| Premium agrega catálogo (cuarto, camino dorado, lugares para animalitos) | Más deseo, mismo ingreso |
| No hay segunda moneda | Un solo número que entender; una moneda dura en una app de bienestar se lee como casino |
| Herraduras en un paquete pago (20): como máximo 7 días de ingreso del constante, unas 750 | Un paquete no puede comprar un mes de juego |
| Se registra cada ganancia y gasto por fuente desde el día 1 | Sin esa serie no se puede poner precio a nada después |

## Contenido necesario
18 variantes de obra (dos por obra, recortadas sobre el plano limpio de cada área; V1, las 6 del Área 1). 6 líneas de Paucho para los estilos, 8 para la tienda («te falta poco», «todo comprado»). Etiqueta «Te faltan N».

## Arte, animación y sonido
Cada estilo es una `Piece` alternativa en journey.ts, con la misma caja que la original para que no se mueva nada alrededor. Cambiar de estilo usa la transición de construcción en corto: polvo y aparición, un segundo. El dorado queda para premios, no para precios (15). Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- `room.ts` y `shop.ts`: precios nuevos. `store.ts`: `TERMO_PRICE = 150`; estado `estilos: Record<obraId, { tengo: number[], puesto: number }>`; contadores `ganado` y `gastado` por fuente.
- `encargos.ts`: techo del escalón en `stepsFor`. `ENCARGO_SCALE` queda en 1 como perilla remota de emergencia (28).
- Migración: lo comprado se conserva y no se cobra diferencia.
- **Encargos en la simulación** (`simulation.test.ts`):
  1. En `openApp`, llamar `actions.openEncargos()` después del mate y sumar al `ledger` lo que devuelva `renew` (lo guardado en `kept`).
  2. Al final de cada sesión, `cobrarTodo()` con probabilidad por perfil (constante 1; errático 0,6, para ejercitar «Te guardé…»), con el `ledger` calculado antes desde `dailyView` y `lineView`.
  3. Invariantes: un encargo no paga dos veces; un día de diarios paga 100 como máximo; lo no cobrado aparece en `kept` al renovar.
  4. Tres compradores: ahorrista (nunca compra), antojado (compra lo más barato que alcanza), soñador (junta para lo más caro).
  5. `PACING` nuevo: `weekRegime [550, 800]`, `walletD30 [150, 400]`, `walletD60 [150, 450]`, `coverageD60 [0.5, 0.7]`, `daysNothingAffordable ≤ 2` seguidos, y `firstWeekEarned` sube a `[850, 1.050]`.
  6. `reached` suma `cobrar`, `kept`, `estilo`, `mimo`.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `herraduras_ganadas` | Cada ganancia | `fuente`, `monto`, `saldo_despues` |
| `herraduras_gastadas` | Cada compra | `gasto`, `item_id`, `precio`, `saldo_despues`, `dias_desde_instalacion` |
| `tienda_vista` | Se abre la tienda | `saldo`, `alcanzables`, `mas_barato_sin_tener` |
| `compra_no_alcanza` | Toque en algo que no alcanza | `item_id`, `faltan` |
| `economia_dia` | Primer uso del día siguiente | `ganado_por_fuente`, `gastado_por_gasto`, `saldo_cierre` |
| `estilo_cambiado` | Se pone un estilo | `obra_id`, `estilo`, `comprado_ahora` |

## Casos borde y riesgos
- **El dueño ya jugó con los precios viejos**: su guardado conserva todo; solo cambia lo que falta comprar.
- **Jugador medio ahogado**: con 45 por día de calendario, una opción 3 son 12 días. Si la compra semanal cae bajo 50 %, bajar las opciones 2 a × 1,5 antes de tocar otra cosa.
- **Reloj adelantado**: fabrica barras y encargos. No vale plata hasta que haya compras reales; anotado para 26.
- **Bienestar**: ningún gasto toca hábitos, racha, obras, salidas ni calma; el termo también se gana con cada meta de racha.
- **Tiendas**: sin azar pago y con precios a la vista.
- **Arte**: los estilos son el gasto más grande y el único que pide arte. Sin ellos la cobertura al día 60 pasa de 70 %.

## Fases
- **V1 (antes del lanzamiento suave)**: precios nuevos, termo a 150, techo del escalón, encargos y compradores en la simulación, contadores por fuente.
- **V2**: estilos del Área 1, mimos (03), puesto del evento (02).
- **Más adelante**: estilos de las demás áreas, precios por ajuste remoto y pruebas A/B (27, 28).
- **Afuera**: moneda dura, venta de herraduras sueltas, multiplicadores pagos.

## Criterios de aceptación
- [ ] La simulación cobra encargos y su libro contable cierra en 25 semillas por perfil.
- [ ] El constante gana entre 850 y 1.050 la primera semana y entre 550 y 800 en régimen.
- [ ] Al día 60, el antojado tiene entre 150 y 450 en mano y el ahorrista no puede comprar todo.
- [ ] Ningún perfil pasa más de 2 días seguidos sin poder comprar nada desde el día 2.
- [ ] Un guardado anterior conserva lo comprado.
- [ ] Ningún gasto nuevo bloquea un hábito, la racha, una obra, una salida o un ejercicio de calma.

## Preguntas abiertas
1. **¿Subir precios o bajar premios?** Recomiendo solo precios: los premios son tu decisión y son lo que se siente.
2. **Termo a 150.** Es el cambio más visible. Recomiendo hacerlo antes del lanzamiento, cuando nadie tiene el precio viejo en la cabeza.
3. **¿El estilo 1 gratis y los otros pagos, o elegir uno gratis entre tres?** Recomiendo lo primero: lo segundo pide las tres piezas el primer día y no gasta nada.
4. **«Perchero con boleadoras»** (room.ts) choca con la regla del personaje. Recomiendo renombrarlo «Perchero con lazo».
