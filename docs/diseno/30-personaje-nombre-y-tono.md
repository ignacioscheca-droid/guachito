# 30 · Personaje, nombre y tono
> Estado: propuesta · Etapa: Lanzamiento suave · Mejora del plan: — (sección «Cultura» y decisiones 1 y 5 del plan) · Depende de: 06, 12, 03, 31

## En una línea
Paucho es un pibe de campo dormilón y tierno, que habla en voseo con humor seco; la marca para las tiendas debería ser «Paucho: tu gauchito», con Paucho como nombre propio y «gauchito» como descripción.

## Problema y oportunidad
Hoy el personaje no está escrito en ningún lado y el nombre tiene dos cargas. La voz actual es de festejo genérico: «¡Sos un genio!», «¡Qué crack!», «¡Bravo!» (`PRAISE`, `App.tsx:30`), con dos o tres signos de exclamación por línea. Sin una biblia, las 480 líneas del doc 06 van a salir igual.

El gaucho tiene un riesgo propio: sonar a acto escolar del Día de la Tradición (plan). Y «Gauchito» remite al Gauchito Gil, el santo popular más conocido del país, que va a dominar las búsquedas, y a la mascota del Mundial 78; fuera de Argentina la palabra dice poco (plan).

Se lo aprendemos a Duolingo: Duo es idéntico en cada superficie, y sus fans rinden más que la marca (plan). Un personaje con voz propia es el único canal de adquisición que no cuesta plata (doc 31).

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: líneas que pasan la revisión de voz a la primera | ≥ 85 % por tanda | revisión del dueño con esta guía |
| Secundaria: en la búsqueda de la tienda por el nombre, la app sale primera | sí, en Argentina, a 30 días de publicar | búsqueda manual semanal |
| Secundaria: testers que describen a Paucho con palabras de esta biblia («tierno», «dormilón», «gracioso») | 7 de 10 | entrevista del corte cualitativo |
| Guardrail: palabras prohibidas en texto publicado | 0 | `voice.test.ts` (doc 06) |

## Experiencia
### Quién es
Paucho tiene veintipico y vive solo en un rancho que está levantando de a poco, en un pueblo de la pampa que nunca se nombra. No es un nene ni un prócer: es el pibe que en el pueblo todos quieren y que llega tarde porque se quedó dormido.

| | |
|---|---|
| **Qué ama** | El mate (amargo), su perro, la siesta, la radio con cumbia, las tortas fritas, quedarse mirando el fuego |
| **Qué le sale bien** | Cebar, escuchar, arreglar cosas con alambre |
| **Qué le sale mal** | Madrugar, las obras derechas, guardar un secreto del perro |
| **Qué quiere** | Tener el rancho lindo y que vos andes bien. En ese orden no, pero casi |
| **Cómo te trata** | Como a un amigo que pasó a tomar unos mates: sin apuro y sin sermón |
| **Toques de hoy** | Termo con calcomanías, auriculares colgados del sombrero, el celular con la pantalla rajada que casi no usa |
| **Lo que nunca** | Facón, boleadoras, bandera, discursos patrios, alcohol, cigarrillo, política, religión, cuadro de fútbol con nombre |

Tres reglas de conducta:
1. **No arregla, acompaña.** Si el día viene helado, no da consejos: se queda.
2. **Sus días bajos son suyos.** Tiene sueño, frío o está fundido por la obra. Nunca está triste porque no entraste.
3. **Se ríe de sí mismo, nunca de vos.** El chiste es que él es más vago que cualquiera.

### Guía de voz
| Regla | Sí | No |
|---|---|---|
| Voseo natural | «Tranqui. Hoy, lo que se pueda.» | «¡Tú puedes lograrlo!» |
| Humor seco, bajito | «Bien ahí. Yo ni me había levantado.» | «¡¡Sos un genio total!!» |
| Concreto, del campo | «Hoy la pava se portó.» | «Hoy es un gran día para brillar.» |
| Un «¡» por línea como mucho | «Quedó derechita. Bueno, casi.» | «¡Increíble! ¡Bravo! ¡Así se hace!» |
| Corto: 60 caracteres en el campo, 110 de cerca | «Lunes. Yo también lo vi venir.» | Dos oraciones con moraleja |
| Sin autoayuda | «Uno menos. Así, sin hacer ruido.» | «Cada pequeño paso te acerca a tu mejor versión.» |
| Sin acto escolar | «Me arrimo al fogón y te escucho desde acá.» | «¡Ahijuna, aparcero! ¡Viva la tradición!» |
| Sin culpa | «Mirá quién llegó. Pasá, hay yerba nueva.» | «Te extrañé. Hace cinco días que no venís.» |
| Sin lenguaje clínico | «Día helado. Vamos despacito.» | «Parece que estás con ansiedad. Probá esta técnica.» |
| El premio es chico y de verdad | «Tomá, te junté unas herraduras.» | «¡Desbloqueaste una recompensa!» |

**Palabras de Paucho:** dale, tranqui, bárbaro, joya, un toque, re, fundido, cebar, arrimarse, de a poco, nomás, che (poco).
**Palabras que no usa:** racha «en llamas», mood, nivel, desbloquear, recompensa, productividad, mejor versión, guerrero, campeón, crack, genio. Tampoco gauchesco impostado (aparcero, pa', m'hijo) ni insultos, aunque sean cariñosos.

**Vocabulario fijo del producto:** herraduras (la moneda), el mate de la mañana (la racha), el termo (lo que cubre un día), recalentar (recuperarla), la obra, la libreta (encargos y lo anotado), la casita.

**Avisos.** La misma voz, más corta, y nunca cita lo que anotaste (doc 16). «Terminé el fogón. Vení a ver, no toques que está fresco.»

### Elenco secundario
Solo Paucho habla. Los animales actúan, y Paucho cuenta lo que hacen; así el elenco no multiplica el texto.

| Personaje | Estado | Carácter en una línea | Relación con Paucho |
|---|---|---|---|
| El perro (nombre que elige el jugador) | En la app | Cachorro confianzudo; duerme donde no debe | Su sombra. Le roba el rincón y las alpargatas |
| Michi, la gata | En la app (cuarto) | Vive en la ventana y no rinde cuentas | Lo tolera |
| Las gallinas | En la app (galpón) | Dos, ofendidas por todo | Le picotean el maíz de la mano |
| El carpincho | Propuesto (doc 03) | Duerme la siesta en la laguna; nada lo apura | Su maestro de siesta |
| El hornero | Propuesto | Construye su casa mejor y más rápido | Su competencia en la obra |
| El ñandú | Propuesto | Cómico, corre para el lado equivocado | Lo sigue sin que lo inviten |
| El carancho | Propuesto | Se lleva cosas; las devuelve cambiadas | El único con el que se enoja, un poco |
| Mulita, vizcacha, lechucita | Propuestos | Tímida · chusma · no duerme nunca | Vecinos |
| El yacaré con tereré | Propuesto, para el nordeste (doc 32) | Primo del litoral, toma frío | El amigo que hace cuando viaja |

No hay familia, pareja, patrón ni villano. El mundo de Paucho no tiene conflicto: tiene obras, siestas y bichos.

### El nombre de la marca
| Opción | A favor | En contra |
|---|---|---|
| **Gauchito** | Es el nombre de hoy; dice qué es; el diminutivo es tierno | Compite en búsquedas con el Gauchito Gil. Arrastra a la mascota del 78. Es una palabra común: difícil de registrar y de defender. Afuera dice poco (plan) |
| **Paucho** | Único y buscable; nombre propio, como Duo; viaja a cualquier país; sirve para cuentas de redes | No dice qué es. El jugador hoy puede renombrarlo, y la marca dejaría de coincidir |
| **Paucho: tu gauchito** | Marca propia más descripción; «gauchito» en minúscula ayuda a que lo encuentren sin ser la marca; 19 caracteres, entra en el título de las dos tiendas | Más largo; en el ícono solo entra «Paucho» |

**Recomendación: «Paucho: tu gauchito».** La marca que se registra y se defiende es Paucho. El ícono y las redes dicen Paucho. «Gauchito» queda como descripción, en minúscula. Para otros países el segundo término se cambia sin tocar la marca.

Riesgos a cerrar antes de publicar:
- **Gauchito Gil.** Es devoción popular viva. Nada de rojo con cintas, altares, velas ni pañuelo rojo al cuello como ícono; ningún evento el 8 de enero (plan). Revisar que la prenda roja de la tienda no arme esa imagen con el sombrero.
- **Mundial 78.** La mascota fue un nene con camiseta argentina, sombrero y rebenque, y la fecha tiene carga política. Paucho no usa celeste y blanco, no lleva rebenque ni pelota, y no se parece a un nene.
- **INPI.** El plan no verificó el registro. Hay que buscar «Paucho» y «Gauchito» en las clases 9 (apps), 41 (entretenimiento) y 42 (software como servicio) antes de imprimir nada. Un agente de marcas cobra poco por esa búsqueda (sin dato de precio).
- **Tiendas.** Confirmar que no haya otra app llamada Paucho en Google Play y App Store de Argentina, México y España.

## Reglas y números
| Regla | Valor | Por qué |
|---|---|---|
| Quién habla | solo Paucho | Una voz, un banco de líneas |
| Edad aparente | veintipico | Público declarado 18+; que no parezca app para chicos (plan) |
| Signos de exclamación | 1 por línea como mucho; 0 en la mitad de las líneas | El festejo raro tiene que sentirse raro (doc 15) |
| `{nombre}` del jugador | 1 de cada 4 líneas | Doc 06 |
| Modernidad a la vista | 2 objetos: termo con calcos y auriculares | Más que eso es disfraz al revés |
| Colores vedados en Paucho | celeste y blanco juntos; rojo dominante | Mundial 78 y Gauchito Gil |
| Temas vedados | política, religión, fútbol con nombre, alcohol, peso, plata | Tiendas y tono |
| Nombre visible en la app | Paucho, fijo | Ver pregunta 2 |

## Contenido necesario
- Esta biblia, en una página, como contexto fijo de cada tanda de líneas (doc 06).
- 20 pares sí/no más, sacados de la primera tanda, para afinar.
- Ficha de cada animal propuesto: 3 gestos y 5 cosas que Paucho cuenta de él.
- Título y subtítulo de tienda: «Paucho: tu gauchito» · «Hábitos con mate y compañía» (27 caracteres).
- Búsqueda de marca en el INPI y captura de las búsquedas en tiendas.

## Arte, animación y sonido
El personaje se fija en el estilo de fieltro (doc 12): sombrero de ala ancha, pañuelo, bombacha, alpargatas. Se suman dos objetos a su hoja de modelo: el termo con calcomanías (un carpincho, una radio, un sol; ninguna bandera ni escudo) y los auriculares colgados del ala. La radio suena a cumbia instrumental propia, sin temas con derechos. La voz en sílabas del doc 15 es grave y dormida, no de dibujito. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- Sin cambios al guardado si el nombre queda fijo; `name` deja de editarse y vale siempre «Paucho». Un guardado con otro nombre lo conserva (ver pregunta 2).
- Los ids en minúscula con «guachito» no se tocan (CLAUDE.md).
- `sw.js` usa hoy «Gauchito» como nombre de reserva: pasa a «Paucho».
- Manifest, título de la página e ícono: «Paucho».
- La lista de palabras prohibidas vive en `voice.test.ts`.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `nombre_cambiado` | si se permite renombrar | `es_default` (bool). Nunca el nombre |
| `tienda_origen` | primera apertura | `termino_busqueda` si la tienda lo informa |

El resto de la voz se mide con los eventos del doc 06.

## Casos borde y riesgos
- **Disfraz.** El riesgo de acto escolar vuelve con cada evento patrio. En el 25 de Mayo y el Día de la Tradición, Paucho come pastelitos y duerme la siesta; no da discursos.
- **Estereotipo.** Paucho es vago para madrugar, no para trabajar: levanta el rancho con sus manos. El chiste nunca es «el del interior es lento».
- **Expansión.** El voseo y el mate viajan a Uruguay; para México el plan pide no decidir todavía. Esta biblia vale para el Río de la Plata.
- **Marca ajena.** Si «Paucho» está registrado en clase 9 o 41, se vuelve a esta tabla antes de gastar en ícono.
- **Tiendas.** Chibi más público 18+: el texto no usa lenguaje infantil ni premios «para chicos».
- **Abuso.** Nombre libre del compañero permite poner cualquier cosa en capturas compartidas (doc 10); otro motivo para fijarlo.

## Fases
- **V1 (antes del lanzamiento suave):** biblia aprobada, decisión de nombre, búsqueda en INPI y tiendas, cambio de título e ícono.
- **V2:** hoja de modelo con termo y auriculares; fichas de los primeros tres animales.
- **Más adelante:** guía para redes (doc 31), variante por país (doc 32).
- **Afuera:** historia de origen, familia de Paucho, personajes humanos.

## Criterios de aceptación
- [ ] Ninguna línea publicada contiene las palabras de la lista «no usa».
- [ ] Ninguna pieza de arte muestra facón, boleadoras, bandera, rebenque ni cintas rojas.
- [ ] Título de tienda, ícono, manifest y avisos dicen Paucho.
- [ ] Hay constancia de la búsqueda en el INPI para las clases 9, 41 y 42.
- [ ] Diez líneas al azar del banco, leídas en voz alta, suenan a la misma persona.
- [ ] Los animales no tienen globos de diálogo.

## Preguntas abiertas
1. **Nombre para las tiendas.** Recomiendo «Paucho: tu gauchito». Te toca a vos (decisión 1 del plan).
2. **¿El jugador sigue poniéndole nombre?** Hoy el onboarding dice «Soy el Gauchito ___». Si la marca es Paucho, recomiendo fijarlo y que el nombre que se elige sea el del perro, que ya existe. Cambia una decisión tomada.
3. **¿Cuánto modernizarlo?** Recomiendo dos objetos y parar ahí (decisión 5 del plan).
4. **¿Paucho tiene celular?** Lo puse rajado y casi sin uso, como chiste. Si no te cierra, sale sin tocar nada más.
5. **¿El pañuelo rojo actual?** Si el pañuelo de base es rojo, recomiendo pasarlo a otro color por el Gauchito Gil.
