# 03 · Animalitos para juntar
> Estado: propuesta · Etapa: Etapa 4 del plan (el primero llega con el primer evento); elenco completo después de las 24 semanas · Mejora del plan: 3 · Depende de: 01, 02, 04, 09, 10, 17

## En una línea
Ocho bichos de la pampa llegan por salidas, eventos y amistad, viven en la estancia, uno acompaña a Paucho, y los mimos son el gasto chico de todos los días.

## Problema y oportunidad
Hoy no se colecciona nada: hay un perro que llega con la cucha y Michi, el gatito, que es una cosa Premium del alféizar (`alfeizar_3` en room.ts). Finch reparte micromascotas en sus eventos; el carpincho es un meme nacional probado (plan). Es la colección con más carga afectiva y la más compartible, y cada animal es un sprite chico, no una escena (plan). Además le da a la economía un gasto que se repite (04).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: activos con 30 días o más que tienen al menos 2 animalitos | ≥ 50 % | `animalito_llego` por usuario |
| Activos con animalito que dan un mimo en el día | ≥ 35 % | `mimo_dado` / activos con animalito |
| Herraduras gastadas en mimos sobre lo ganado | 10–20 % | `economia_dia` (04) |
| Tarjetas compartidas por animalito nuevo | ≥ 8 % | `tarjeta_compartida` con `motivo = animalito` (10) |
| Guardrail: quejas o reseñas que hablen de pena o culpa por un animalito | 0 | soporte y reseñas |

## Experiencia
1. **Llegada.** Mismo molde que `DogArrival`: algo se mueve en la escena, el bicho asoma, Paucho lo presenta de cerca y el jugador le pone nombre con un dado de nombres. Ejemplo, el hornero: «Me vino siguiendo desde el monte. Dice que mi casa está bien, pero que le falta barro.»
2. **En la estancia.** Vive en su rincón del área y hace lo suyo: el hornero junta barro, el carpincho duerme, el carancho se lleva la boina y la devuelve. Un toque lo hace reaccionar, gratis y sin límite.
3. **Acompañante.** En la pestaña Paucho, «Los bichos» muestra el elenco. «Que venga conmigo» elige uno: camina al lado de Paucho en Inicio y aparece en los cuentos de la salida («La mulita encontró el nido antes que yo»).
4. **Mimos.** Botón «Darle un mimo» en la ficha de cada uno: una galleta, un corazón, y sube su cariño. El del acompañante es gratis una vez al día.
5. **Cariño.** Cinco niveles, cada uno con algo que se ve (tabla abajo).

Estados: elenco vacío, se ven las ocho siluetas con una pista («Dicen que anda cerca de la laguna en invierno»); sin lugares libres, «Ya hay dos en el patio. ¿Quién descansa en el monte?» y el cambio es gratis; sin herraduras, el botón del mimo dice «Mañana le doy otro» y no ofrece comprar nada.

## Reglas y números
### El elenco
| Animalito | Rareza | Cómo llega | Qué hace | Por qué ahí |
|---|---|---|---|---|
| Hornero | Común | Salida 5, asegurado | Lleva barro a su nido | El primero tiene que llegar en la segunda semana y sin suerte |
| Mulita | Común | Al juntar el recuerdo raro «Mulita cruzando» (Monte) | Se hace bolita cuando la tocás | Premia la libreta (01) |
| Vizcacha | Especial | Página de la Loma completa | Junta cosas brillantes en la puerta de su cueva | Meta larga de salidas |
| Lechucita | Especial | Amistad «Amigos del alma» (30 días juntos, friendship.ts) | Gira la cabeza y te mira | La amistad por días ya existe y hoy da solo cosas del cuarto |
| Carancho | Especial | Primera semana completa de racha de a dos (09) | Roba la boina y la devuelve | Premio por invitar: gratis y social |
| Carpincho | De evento | Casillero 20 del primer evento (02) | Duerme la siesta al sol | El más deseado, donde más gente lo ve |
| Ñandú | De evento | Evento de noviembre | Corre sin motivo y frena de golpe | El cómico, para el mes de Paucho |
| Yacaré | De evento | Evento de enero | Toma tereré a la sombra | Verano y nordeste; abre la puerta a Paraguay (32) |

El cuarto evento del año presenta uno nuevo fuera de esta lista.

### Reglas
| Regla | Valor inicial | Por qué |
|---|---|---|
| Cómo se consiguen | Solo jugando: salidas, eventos, amistad, racha de a dos | Sin sobres ni azar pago: ni las tiendas ni el tono de bienestar lo aguantan |
| Rareza | Etiqueta de dónde viene (común, especial, de evento), no una probabilidad | Da orden a la colección sin sorteo |
| Lo conseguido | Es para siempre; nadie se va, se enferma ni se pone triste | Nada de culpa |
| Lugares en la estancia | 2 gratis, además del acompañante | Tres bichos a la vista llenan la escena en un teléfono de 390 px |
| Lugares con Premium | +3 (5 en total) | Es lo que el plan pone en Premium; no bloquea conseguir ni mimar |
| Los que no tienen lugar | «Descansan en el monte»: se ven en el elenco y reciben mimos igual | El lugar limita lo que se ve, no lo que se tiene |
| Acompañante | 1; cambiarlo es gratis y sin espera | Decisión diaria sin costo |
| Mimo del acompañante | 1 gratis por día | Quien no gasta también avanza |
| Mimo pago | 10 herraduras, 1 por animalito por día | 10 % del ingreso diario de un jugador constante (04): se da sin pensar, pero suma |
| Galletas | Un mimo gratis cada una; llegan por eventos (02) | Premio de relleno con uso inmediato |
| Tope diario | 1 mimo por animalito | El gasto máximo queda acotado: 20 por día sin Premium, 50 con Premium |
| Cariño | No baja nunca | Sin castigo por faltar |
| Niveles de cariño (mimos acumulados) | 5 · 15 · 30 · 60 | El primero en la primera semana; el último a los dos meses de mimo diario |

### Qué da cada nivel
| Nivel | Mimos | Qué se abre |
|---|---|---|
| 1 | 0 | Llega y vive en la estancia |
| 2 | 5 | Un gesto nuevo al tocarlo |
| 3 | 15 | Aparece en los cuentos de la salida cuando es acompañante |
| 4 | 30 | Un accesorio (pañuelito, moño de lana) |
| 5 | 60 | Siesta al lado de Paucho en el cuarto y su tarjeta para compartir (10) |

Llevar un animalito al nivel 5 cuesta hasta 600 herraduras; los ocho, 4.800. Es un gasto de meses.

### El perro y el gato
| | Hoy | Con el elenco |
|---|---|---|
| Perro | Llega con la cucha, lo nombra el jugador, vive en el área y en el cuarto | Es la ficha 0 de «Los bichos», siempre completa. No ocupa lugar, no es acompañante porque ya va siempre, y sus mimos son gratis |
| Michi | Cosa Premium del alféizar, 300 herraduras | Tiene ficha en el elenco con la marca «vive en el cuarto». No ocupa lugar ni tiene niveles en V1 |

Empezar el elenco con una ficha ya llena hace que la colección nunca se vea vacía.

## Contenido necesario
- Por animalito: 5 sprites (quieto en dos cuadros, gesto, siesta, de cerca para la llegada, accesorio). Total: 40.
- Por animalito: 1 línea de llegada, 6 de Paucho sobre él, 4 variantes para los cuentos, 1 pista para la silueta, 12 nombres para el dado. Total: unas 190 líneas.
- 8 siluetas, 1 ícono de galleta, 1 pantalla «Los bichos».
- 8 sonidos cortos, uno por bicho.

## Arte, animación y sonido
Cada animalito mide entre un tercio y la mitad del alto de Paucho y lleva la misma sombra de suelo que el perro y las gallinas (`GroundShadow`). Se anima como las gallinas del Área 2: dos cuadros y un gesto con temporizador. Los accesorios son una capa sobre el sprite quieto. Estilo de fieltro único y demás reglas en `docs/visual/guia-visual.md` (12).

## Datos y técnica
- Estado: `bichos: Record<id, { nombre, llego: día, mimos: number, ultimoMimo: día }>`, `acompanante: id | null`, `lugares: id[]`, `galletas: number`.
- `game/bichos.ts` (nuevo): `ELENCO`, `NIVELES`, `nivelDe`, `puedeMimar`, `lugaresMax(s)`.
- `store.ts`: `actions.darMimo`, `elegirAcompanante`, `ponerEnLugar`; cada mimo va al `log` del día para los encargos.
- `encargos.ts`: diario «Dale un mimo a {nombre}» (toque) y línea semanal «Dale 3 / 6 / 10 mimos».
- `AreaScene.tsx`: un punto de anclaje por lugar y por área, con el mismo esquema de cajas que `Piece`.
- Sin servidor. Los animalitos de evento llegan con el evento (28) y quedan guardados en el teléfono.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `animalito_llego` | Se guarda el nombre | `bicho_id`, `via`, `dias_desde_instalacion`, `total_bichos` |
| `mimo_dado` | Cada mimo | `bicho_id`, `pago` (gratis, herraduras, galleta), `nivel_despues`, `saldo_despues` |
| `cariño_nivel` | Sube de nivel | `bicho_id`, `nivel` |
| `acompanante_cambiado` | Se elige otro | `bicho_id` |
| `elenco_abierto` | Se abre «Los bichos» | `total_bichos`, `lugares_usados` |
| `lugar_lleno_visto` | Aparece «ya hay dos en el patio» | `premium` |

## Casos borde y riesgos
- **Culpa**: los animalitos no tienen hambre ni medidores que bajen. Si el jugador falta un mes, están igual.
- **Trampa**: el tope de un mimo por animalito por día se guarda por fecha; adelantar el reloj da a lo sumo los mimos de los días salteados, igual que hoy con las obras.
- **Tiendas**: sin azar pago y con todo el elenco visible desde el principio.
- **Lugares pagos**: riesgo de que se lea como «pagá para ver a tus bichos». Por eso el cambio es gratis y los que descansan siguen recibiendo mimos.
- **Escena cargada**: con la cámara más cerca (13), tres bichos, el perro y dos gallinas pueden tapar la obra. Se prueba en 390×844 antes de fijar los anclajes.
- **Ropa**: el carancho roba la boina. Si Paucho no tiene boina, se lleva su sombrero de siempre.

## Fases
- **V1**: carpincho (primer evento) y hornero (salida 5); elenco con siluetas; acompañante; mimo gratis y pago; niveles 1 a 3.
- **V2**: mulita, lechucita y carancho; lugares; niveles 4 y 5 con accesorios; tarjeta.
- **Más adelante**: ñandú, yacaré, vizcacha; lugares Premium; amigos locales por país (32).
- **Afuera**: cría, intercambio entre jugadores, vestir a los animalitos más allá de un accesorio.

## Criterios de aceptación
- [ ] El hornero llega en la salida 5 en todas las semillas de la simulación.
- [ ] Un mimo pago descuenta 10 herraduras, y un segundo mimo al mismo animalito el mismo día se rechaza.
- [ ] El mimo gratis del acompañante vuelve a estar disponible al día siguiente.
- [ ] Faltar 30 días no cambia cariño, nombre ni lugar de ningún animalito.
- [ ] Sin Premium se pueden conseguir y mimar los ocho.
- [ ] El perro aparece como ficha 0 completa desde que tiene nombre.
- [ ] Tres animalitos, el perro y Paucho se ven sin taparse en 390×844 en las tres áreas.

## Preguntas abiertas
1. **¿Michi sigue siendo Premium?** Recomiendo dejarlo así (ya está decidido) y no sumar más animales pagos: los del elenco se ganan.
2. **¿Mimo a 10 herraduras o gratis para todos?** Recomiendo 10: es el único gasto diario del juego, y el acompañante ya tiene el suyo gratis.
3. **¿2 lugares gratis o 3?** Recomiendo 2 hasta ver la escena con la cámara nueva (13).
4. **«Amistad» en el plan puede leerse como amistad con Paucho o con otra persona.** Usé las dos: lechucita por días juntos, carancho por racha de a dos.
