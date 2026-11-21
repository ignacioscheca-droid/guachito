# 04 · Economía con algo que desear
> Estado: propuesta · Etapa: Etapa 1 del plan (precios y simulación, antes del lanzamiento suave); gastos nuevos con 01, 02 y 03 · Mejora del plan: 4 · Depende de: 01, 02, 03, 17, 23, 27

## En una línea
No se toca lo que el jugador cobra: se duplica lo que puede desear, se suman gastos que se repiten y la simulación pasa a contar los encargos.

## Problema y oportunidad
La simulación no cuenta los encargos, que son la mitad del ingreso. Una copia descartable de `simulation.test.ts` con `openEncargos` y `cobrarTodo` en cada sesión, 60 días, sin compras (medido):

| Jugador | Día 7 | Día 14 | Día 30 | Día 60 | Semana en régimen | De encargos |
|---|---|---|---|---|---|---|
| Constante (7 hábitos, 7 de 7 días) | 1.020 | 1.830 | 3.415 | 6.175 | 615–630 | 52 % |
| Mínimo (solo la barra, 7 de 7) | 705 | 1.360 | 2.470 | 4.370 | 415 | 54 % |
| Medio (4 hábitos, 5 de 7) | 550 | 1.215 | 2.010 | 3.540 | 315 | 52 % |

El plan estimaba 800 por semana; lo medido es 625. La conclusión no cambia.

**Fuentes del constante, semana en régimen:** hábitos después de las obras, 7 × 5 × 7 = 245 (`EXTRA_HABIT_COINS`); encargos diarios, 28 por día = 195 (`LEVEL_COINS`); semanales, 185. Mientras hay obras, el día base es 50 (30 por la barra más 4 × 5). Premios únicos en 60 días: 3 áreas × 50, viaje 50, metas de racha 50 + 100 + 150 + 200 = 700.

**Sumideros de hoy:**

| Gasto | Piezas | Precio | Total |
|---|---|---|---|
| Cuarto, opción 1 | 16 | 20–80 | 590 |
| Cuarto, opción 2 | 16 | 40–140 | 1.430 |
| Cuarto, opción 3 por herraduras | 4 | 90–200 | 630 |
| Ropa (`shop.ts`) | 6 | 40–120 | 440 |
| **Todo lo no Premium** | 42 | | **3.090** |
| Cuarto Premium | 6 | 220–300 | 1.510 |
| Termo (`TERMO_PRICE`) | 2 en mano | 60 | se repite |

El constante compra todo lo no Premium el día 28 y llega al día 60 con 3.085 sin destino; el medio lo agota el día 52. El problema es de los mejores jugadores, los que más retienen. El termo cuesta menos de un día de ingreso y es el único gasto que se repite. Una moneda que sobra deja de premiar, y sin escasez medida no se puede vender nada después (plan). Referencia: las tres opciones por tarea de Homescapes (plan).

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: saldo en mano del activo mediano | Dentro de la banda de «Metas de saldo» | `economia_dia` |
| Activos con saldo > 800 | ≤ 20 % | 800 supera lo más caro no Premium: ya no desean nada |
| Activos que compran algo en la semana, días 14–60 | ≥ 50 % | `herraduras_gastadas` |
| Cobertura del catálogo al día 60, constante | 50–70 % | simulación |
| Guardrail: ingreso de la primera semana | Sin bajar (935 medido) | `PACING.firstWeekEarned` |

## Experiencia
El jugador no ve una economía; ve cuatro cosas.
1. **Precios por escalón.** La opción 1 sigue barata; la 2 y la 3 son para juntar. La tienda marca lo que alcanza y, en lo que no, «Te faltan 120».
2. **Estilos de obra.** En la revelación, Paucho muestra tres versiones: «La hice así. También me la imagino de adobe o con techo de chapa.» El estilo 1 es el construido y es gratis; los otros se compran tocando la obra en el Mapa. Cambiar entre los que ya tenés no cuesta nada.
3. **Mimos** (03): 10 herraduras, uno por animalito por día.
4. **Cosas de evento** (02): el puesto y el reclamo de lo perdido.

Estados: nada alcanza → «Con un par de días más llegamos a la mecedora»; todo comprado → «No me entra un alfiler. Guardemos para lo que venga».

## Reglas y números
### Precios
| Regla | Hoy | Propuesta | Por qué |
|---|---|---|---|
| Ingreso por hábito, barra y encargos | 5 / 30 / 5–25 | Igual | Son decisiones del dueño y lo que se siente cada día; subir precios no se vive como pérdida, bajar premios sí |
| Opción 1 del cuarto | 20–80 | Igual | La primera semana da una compra por día; el encargo «Comprá algo» depende de eso |
| Opción 2 | 40–140 | × 2: 80–280 | 2 a 3 días del constante, 2 a 6 del medio |
| Opción 3 por herraduras | 90–200 | Acordeón 550, cómoda 600, cortinas 500, bowls 280 | Una semana de juntar: el sueño del cuarto |
| Ropa | 40–120 | Pañuelos 100, boina 150, gorro 200, ponchos 250 y 300 | Es lo que más se ve, sobre Paucho en todas las pantallas |
| Premium del cuarto | 220–300 | × 3: 650–900 | Quien paga recibe más para desear, no más monedas |
| Termo | 60 | 150 | A 60, faltar uno de cada tres días cuesta 20 por día y la racha no pesa; 150 es medio ingreso semanal del medio |
| Escalón tope semanal | 110 % de la semana pasada | Con techo en lo posible según el plan de hábitos | Medido: al constante le pide 54 hábitos con 49 posibles |

Catálogo permanente nuevo: cuarto 5.380 y ropa 1.100, **6.480** contra 3.090.

### Sumideros que se repiten
| Gasto | Precio | Tope | Cuánto absorbe |
|---|---|---|---|
| Estilos de obra (2 extra por obra) | 400 en casa, galpón y molino; 250 el resto | 18 estilos, 5.400 | 1.650 por área; crece con cada área |
| Mimos (03) | 10 | 1 por animalito por día | 600 para llevar uno al nivel 5 |
| Puesto del evento (02) | 350 y 550 | 4 eventos al año | 900 por evento |
| Reclamo de lo perdido (02) | 100 por casillero | El que no espera los días | Opcional |
| Termo | 150 | 2 en mano | ~150 al mes para quien falta seguido |

### Ingreso con los sistemas nuevos (estimación sobre la corrida)
La salida (01) devuelve la barra después de la última obra: unas 85 más por semana; las páginas de la libreta, unas 55. Constante: ~765 por semana (110 por día). Medio: ~415 (60 por día). Cada evento regala 210 en el camino gratis.

### Metas de saldo
| Día | Ganado, constante | Ganado, medio | Saldo en mano objetivo | Catálogo comprado, constante / medio |
|---|---|---|---|---|
| 7 | 1.020 | 550 | 60–150 | 12 % / 7 % |
| 14 | 1.900 | 1.250 | 100–250 | 20 % / 13 % |
| 30 | 3.650 | 2.150 | 150–400 | 30 % / 18 % |
| 60 | 6.900 | 3.950 | 150–450 | 50 % / 29 % |

Porcentajes sobre lo que existe al día 60 con todo en producción: 6.480 permanentes, 5.400 de estilos, 900 de un evento y ~1.000 de mimos, 13.780. El saldo objetivo crece con lo que se junta: una opción 1 la primera semana, una opción 3 o un estilo al mes. La curva de deseo va siempre por delante de la de ingreso: nadie completa el catálogo antes del día 120, y cada evento y cada área lo reabren.

### Lugar para Premium y anuncios, sin moneda dura
| Regla | Por qué |
|---|---|
| Premium (17) no multiplica herraduras ni vende hábitos, racha, obras o salidas | Si pagar diera monedas, cuidarse valdría menos para quien no paga |
| Premium suma catálogo: cuarto, camino dorado, lugares para animalitos | Más deseo, mismo ingreso |
| Una sola moneda | Una moneda dura en bienestar se lee como casino |
| Paquete pago (20): 300 herraduras; tope de cualquier paquete, 7 días del constante (~750) | Un paquete no compra un mes de juego |
| Anuncio elegido (23): 10 herraduras, 3 por día; termo por anuncio, 1 por semana (estimación) | 30 por día es la mitad del día del medio: aporte, no atajo |
| Cada ganancia y gasto se registra por fuente desde el día 1 | Sin esa serie no se puede poner precio a nada |

## Contenido necesario
18 variantes de obra (V1: las 6 del Área 1), recortadas sobre el plano limpio de cada área. 6 líneas de Paucho para estilos y 8 para la tienda. Etiqueta «Te faltan N».

## Arte, animación y sonido
Cada estilo es una `Piece` alternativa en `journey.ts`, con la misma caja que la original. Cambiar de estilo usa la transición de construcción en corto: polvo y aparición, un segundo. El dorado es para premios, no para precios (15). Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- `room.ts` y `shop.ts`: precios nuevos. `store.ts`: `TERMO_PRICE = 150`; `estilos: Record<obraId, { tengo: number[], puesto: number }>`; contadores `ganado` y `gastado` por fuente.
- `encargos.ts`: techo del escalón en `stepsFor`. `ENCARGO_SCALE` queda en 1 como perilla remota (28).
- Migración: lo comprado se conserva y no se cobra diferencia.
- **Encargos en la simulación** (`simulation.test.ts`):
  1. En `openApp`, `actions.openEncargos()` después del mate; el `ledger` suma lo que devuelve `renew` (lo guardado en `kept`).
  2. Al final de cada sesión, `cobrarTodo()` con probabilidad por perfil (constante 1; errático 0,6, para ejercitar «Te guardé…»); el `ledger` lo calcula antes desde `dailyView` y `lineView`.
  3. Invariantes: un encargo no paga dos veces; un día de diarios paga 100 como máximo; lo no cobrado aparece en `kept`.
  4. Tres compradores: ahorrista (nunca compra), antojado (lo más barato que alcanza), soñador (junta para lo más caro).
  5. `PACING` nuevo: `weekRegime [550, 800]`, `walletD30 [150, 400]`, `walletD60 [150, 450]`, `coverageD60 [0.5, 0.7]`, `daysNothingAffordable ≤ 2` seguidos; `firstWeekEarned` pasa de `[450, 650]` a `[850, 1050]`.
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
- **El dueño ya jugó con precios viejos**: conserva todo; solo cambia lo que falta comprar.
- **Medio ahogado**: una opción 3 son 10 a 12 días. Si la compra semanal cae bajo 50 %, bajar la opción 2 a × 1,5 antes de tocar otra cosa.
- **Reloj adelantado**: fabrica barras y encargos. No vale plata hasta que haya compras reales; anotado para 26.
- **Bienestar**: ningún gasto toca hábitos, racha, obras, salidas ni calma; el termo también se gana con cada meta de racha.
- **Tiendas**: sin azar pago, precios a la vista.
- **Arte**: los estilos son el sumidero más grande y el único que pide arte. Sin ellos la cobertura al día 60 pasa de 70 %.

## Fases
- **V1 (antes del lanzamiento suave)**: precios nuevos, termo a 150, techo del escalón, encargos y compradores en la simulación, contadores por fuente.
- **V2**: estilos del Área 1, mimos (03), puesto del evento (02).
- **Más adelante**: estilos de las otras áreas, precios por ajuste remoto, pruebas A/B (27, 28), recompensa de anuncios (23).
- **Afuera**: moneda dura, herraduras sueltas a la venta, multiplicadores pagos.

## Criterios de aceptación
- [ ] La simulación cobra encargos y su libro contable cierra en 25 semillas por perfil.
- [ ] El constante gana entre 850 y 1.050 la primera semana y entre 550 y 800 en régimen.
- [ ] Al día 60, el antojado tiene entre 150 y 450 en mano y el ahorrista no puede comprar todo.
- [ ] Ningún perfil pasa más de 2 días seguidos sin poder comprar nada desde el día 2.
- [ ] Un guardado anterior conserva lo comprado.
- [ ] Ningún gasto bloquea un hábito, la racha, una obra, una salida o un ejercicio de calma.

## Preguntas abiertas
1. **¿Subir precios o bajar premios?** Recomiendo solo precios: los premios son tu decisión y lo que se siente.
2. **Termo a 150.** Es el cambio más visible. Recomiendo hacerlo antes del lanzamiento, cuando nadie tiene el precio viejo en la cabeza.
3. **¿Estilo 1 gratis y los otros pagos, o uno gratis a elección?** Recomiendo lo primero: lo segundo pide las tres piezas el primer día y no gasta nada.
4. **«Perchero con boleadoras»** (`room.ts`) choca con la regla del personaje (30). Recomiendo «Perchero con lazo».
