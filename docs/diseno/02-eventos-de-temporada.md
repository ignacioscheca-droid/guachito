# 02 · Eventos de temporada
> Estado: propuesta · Etapa: Etapa 4 del plan (primer evento); mensuales después de las 24 semanas · Mejora del plan: 2 · Depende de: 01, 03, 04, 18, 27, 28

## En una línea
Cuatro veces al año, un calendario de 20 casilleros avanza con cada día jugado y entrega un animalito, dos prendas y tres cosas para el cuarto; lo que no se alcanzó se termina después, sin apuro.

## Problema y oportunidad
Nada en Gauchito tiene fecha: el día 40 es igual al 20 (plan). Finch hace un evento por mes que cuenta días jugados y deja reclamar lo perdido; Gossip Harbor le ganó a Travel Town por cadencia de eventos (plan). Un evento es el contenido más barato por día de retención, seis piezas de arte, y es donde después se apoya el pase (plan; 18). Empezamos con cuatro al año porque un evento mensual es un impuesto de arte para siempre y cada prenda pide una capa por pose (plan).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: activos del mes que llegan al casillero 10 | ≥ 40 % | `evento_casillero` con `n = 10` / activos del evento |
| Llegan al casillero 20 dentro de la ventana | ≥ 20 % | ídem con `n = 20` |
| Días jugados por activo durante el evento contra el mes anterior | +10 % | 27 |
| D30 de quienes instalan durante el evento contra la tanda previa | +2 puntos | cohortes (27) |
| Guardrail: bajas de avisos | sin suba | 16 |
| Guardrail: gente que abre el evento ya terminado y abandona la pantalla | ≤ 30 % | `evento_viejo_abierto` sin acción |

## Experiencia
1. **Anuncio.** El primer día, después del mate, Paucho de cerca: «¡Llegó el invierno! Armé un calendario: cada día que hagas un hábito, abrimos un casillero.» Un botón: «¡A ver!».
2. **El calendario.** Se entra por un cartelito en Inicio, arriba a la derecha, con los días que quedan. Es un camino de 20 casilleros con dos filas: abajo la gratis, arriba la dorada con candado.
3. **Cada día.** El primer hábito del día abre el casillero. El premio se cobra con un toque; si no se cobra, queda esperando.
4. **Día especial.** El 20 de julio cuenta doble: «Hoy es el Día del Amigo. Hoy abrimos dos.»
5. **Cierre.** El último día, Paucho: «Se va el invierno. Lo que quedó sin abrir lo guardo en la libreta.»
6. **Después.** El calendario pasa a Mapa → «Los viajes» → «Temporadas», con lo que falta a la vista.

Estados: sin evento activo, el cartelito no existe; quien instala a mitad del evento ve «Llegaste con el invierno empezado. Lo que no lleguemos a abrir lo terminamos después»; sin conexión, el evento ya descargado funciona completo.

### Evento de ejemplo: «Un invierno con amigos» (1 al 31 de julio)
| # | Camino gratis | Camino dorado |
|---|---|---|
| 1 | 20 herraduras | |
| 2 | Recuerdo: «Escarcha en la tranquera» | |
| 3 | **Cosa:** Pava silbadora y tortas fritas (sobre la mesa) | |
| 4 | 30 herraduras | 60 herraduras y 3 galletas |
| 5 | 3 galletas (mimos, ver 03) | |
| 6 | Recuerdo: «Humito de la chimenea» | |
| 7 | **Prenda:** Bufanda tejida (cuello) | |
| 8 | 30 herraduras | **Cosa:** Brasero de hierro (bajo la ventana) |
| 9 | Recuerdo: «Charco congelado» | |
| 10 | **Cosa:** Manta de lana cruda (pie de la cama) | |
| 11 | 40 herraduras | |
| 12 | Termo | **Prenda:** Bufanda a rayas (otro color de la gratis) |
| 13 | Recuerdo: «Mandarinas al sol» | |
| 14 | **Cosa:** Guirnalda del Día del Amigo (cuadro) | |
| 15 | 40 herraduras | |
| 16 | 3 galletas | **Cosa:** Mate con funda de lana (sobre la mesa) |
| 17 | **Prenda:** Poncho de invierno (cuerpo) | |
| 18 | Recuerdo: «Dos sillas junto al fogón» | |
| 19 | 50 herraduras | |
| 20 | **Animalito:** el carpincho, que llega buscando el calor del fogón | Su gorrito de lana y 100 herraduras |

Totales gratis: 1 animalito, 2 prendas, 3 cosas, 5 recuerdos, 210 herraduras, 6 galletas, 1 termo. Dorado: 2 cosas, 1 prenda, 1 accesorio, 160 herraduras, 3 galletas.

### El resumen del año (diciembre)
Del 10 de diciembre al 6 de enero, Paucho ofrece «El año de {nombre} y Paucho»: seis tarjetas que se pasan con un toque, armadas en el teléfono con lo que ya guarda el juego.
1. «Cebamos 212 mates.» (`mates`)
2. «Estuvimos juntos 240 días.» (`daysTogether`)
3. «Lo que más hiciste: Salir a caminar, 143 veces.» (`completions`)
4. «Levantamos 9 obras y 2 áreas.»
5. «Trajimos 96 recuerdos y 4 bichos.»
6. «Tu mes más lindo fue septiembre.» y, de regalo, un pan dulce para la mesa.

Pide 14 días jugados en el año; con menos, muestra «Nuestro primer mes». El ánimo y las reflexiones no aparecen (regla de privacidad). Cada tarjeta se puede compartir (10). No tiene calendario ni camino dorado, y el brindis es con mate.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Eventos por año | 4: enero, abril, julio, noviembre | Uno por estación; el arte de uno alcanza para tres meses de producción |
| Temas | Enero «Verano en la costa» · Abril «Otoño: rosca y huevo» · Julio «Un invierno con amigos» · Noviembre «El mes de Paucho» | Calendario del plan; julio coincide con el lanzamiento de la racha de a dos (09) |
| Animalito del primer evento | El carpincho, sea cual sea el mes | El más deseado va donde más gente lo ve (03) |
| Casilleros | 20 | Valor del plan |
| Ventana | El mes calendario (30 o 31 días) | 20 de 30 es 67 %: lo completa quien juega 5 días de 7 |
| Día jugado | Al menos un hábito hecho ese día | El evento premia cuidarse; la racha ya premia abrir (08). Un termo no abre casillero |
| Avance | 1 por día; el día especial, 2 | Sin maratones; el día doble perdona una falta |
| Premios gratis | 6 piezas de arte y 14 de relleno | Las 6 del plan; algo con arte cada 3 o 4 días, y la primera el día 3 |
| El animalito | Siempre en el camino gratis, casillero 20 | «Cuidarte es gratis»: lo que tiene carga afectiva no se cobra |
| Camino dorado | 5 casilleros (4, 8, 12, 16, 20); cuatro piezas, de las cuales al menos una es cambio de color | Embellece, no completa; arte barato |
| Abrir el dorado | Pase del evento o Premium (18, 17); entrega hacia atrás lo ya recorrido | Comprar el día 15 no castiga |
| Puesto del evento | 2 cosas por herraduras, 350 y 550, variantes de color | Gasto de evento (04) sin arte nuevo |
| Reclamo de lo perdido | Terminado el evento, su calendario sigue: 1 casillero cada 2 días jugados mientras no haya evento activo, o 100 herraduras por casillero | Entre dos eventos hay unos 60 días: siempre alcanza. Sin miedo a perder |
| Sello «a tiempo» | Marco dorado en la libreta para quien llegó al 20 dentro del mes | Volver este mes vale algo sin quitarle nada a nadie |
| Fechas que no se tocan | 24 de marzo, 2 de abril, 8 de enero, elecciones | Lista del plan; el evento de enero no tiene día especial el 8 |

## Contenido necesario
Por evento: 1 animalito (5 sprites, ver 03), 2 prendas (capas por pose), 3 cosas, 4 piezas doradas, 2 variantes para el puesto, 1 cartelito, 5 recuerdos de texto, 8 líneas de Paucho (anuncio, mitad, día especial, cierre, después, tres de respaldo), 6 textos de aviso. Resumen del año: 6 plantillas de tarjeta y 12 líneas.

## Arte, animación y sonido
El calendario es un camino de tierra con postes; el casillero del día late; el dorado brilla solo al abrirse (el dorado es para premios, regla de 15). Las cosas de evento son una cuarta opción en lugares que ya existen en `ROOM_SLOTS`, así que no piden regiones nuevas en el cuarto. Sonido: un acorde de guitarra al abrir un casillero y uno más largo en el 20. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- Definición remota (28): `{ id, nombre, desde, hasta, diaDoble, casilleros: [{ gratis, dorado? }], puesto }`. El arte baja con el evento y queda en caché.
- Estado: `eventos: Record<id, { abiertos: number, cobrados: number[], dorado: boolean, aTiempo: boolean, ultimoDia: string }>`.
- Código: `game/eventos.ts` (nuevo), `room.ts` (`RoomSource` suma `{ kind: 'evento'; id }`), `shop.ts`, `encargos.ts` (diario «Abrí el casillero de hoy», toque), `Home.tsx`, `MapaTab.tsx`.
- Sin conexión el día 1: el evento aparece cuando baja. Los días jugados se cuentan desde `completions`, así que no se pierden.
- La fecha sale del reloj del teléfono hasta que exista cuenta (26).

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `evento_visto` | Primer anuncio | `evento_id`, `dia_del_evento` |
| `evento_casillero` | Se abre un casillero | `evento_id`, `n`, `camino`, `premio_tipo`, `a_tiempo` |
| `evento_dorado_abierto` | Pase o Premium | `evento_id`, `n_al_comprar`, `via` |
| `evento_reclamo` | Avance después del cierre | `evento_id`, `n`, `via` (días o herraduras) |
| `evento_puesto_compra` | Compra en el puesto | `item_id`, `precio`, `saldo_despues` |
| `resumen_anual_visto` | Última tarjeta | `tarjetas_vistas`, `compartio` |

## Casos borde y riesgos
- **Reloj cambiado**: un casillero por día real guardado; retroceder la fecha no reabre días.
- **Dos calendarios**: solo uno avanza por vez; el activo tiene prioridad sobre el viejo.
- **Culpa**: nunca «te quedan 3 días» en rojo ni avisos de cuenta regresiva. El aviso de cierre sale una sola vez.
- **Tiendas**: el camino dorado muestra todo su contenido antes de pagar; nada es al azar.
- **Costo de arte**: si el primer evento no llega a las metas, el segundo reutiliza el mismo esqueleto con otro tema antes de producir más.

## Fases
- **V1**: un evento, camino gratis, reclamo por días, definición remota.
- **V2**: camino dorado con pase (18), puesto, día doble, sello.
- **Más adelante**: resumen del año, eventos mensuales si las metas se cumplen dos veces seguidas, marcas (24).
- **Afuera**: rankings, eventos por equipos, premios al azar.

## Criterios de aceptación
- [ ] Un día con un hábito abre exactamente un casillero; uno salvado con termo, ninguno.
- [ ] Jugando 20 de 30 días se llega al casillero 20.
- [ ] Comprar el dorado en el casillero 15 entrega los premios del 4, 8 y 12.
- [ ] Terminado el evento, 2 días jugados abren un casillero del calendario viejo.
- [ ] El evento completo funciona en modo avión una vez descargado.
- [ ] El resumen del año no muestra ni comparte ánimo ni reflexiones.

## Preguntas abiertas
1. **¿Un hábito o el mate para abrir casillero?** Recomiendo un hábito; el mate deja el evento en «abrir la app».
2. **Abril con «rosca y huevo».** Recomiendo dejarlo en comida y otoño, sin imágenes religiosas; la alternativa es «Otoño en el monte».
3. **Reclamo gratis por días.** Le quita urgencia al mes. Recomiendo mantenerlo y medir el sello «a tiempo»; si la llegada al casillero 10 queda bajo 30 %, pasar a solo herraduras.
4. **Noviembre.** «El mes de Paucho» sin acto escolar: cumpleaños de Paucho, no Día de la Tradición.
