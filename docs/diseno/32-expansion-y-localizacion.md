# 32 · Expansión y localización
> Estado: propuesta · Etapa: Después de las 24 semanas · Mejora del plan: — (Expansión) · Depende de: 02, 17, 27, 28, 29, 30, 31

## En una línea
Un solo Paucho que viaja y hace amigos locales: los textos se escriben una vez en voseo y se adaptan por país, y cada país se abre solo si el anterior pasó su corte.

## Problema y oportunidad
Argentina sola no paga un sueldo: hacen falta 50 a 100 mil activos y probablemente México; Argentina es el laboratorio (plan). Hoy todo el texto está escrito a mano dentro de los componentes, en voseo, sin capa de idiomas. Sumar un país así es copiar la app.

Lo local es la puerta, no el negocio, como en Preguntados; cinco personajes son cinco veces el arte (plan). Se lo aprendemos a Duolingo, que lleva sus personajes a más de 40 idiomas sin cambiarlos (plan).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: activos fuera de Argentina | 30 % del total a 12 meses de abrir Uruguay (estimación) | 27, por país |
| D7 de cada país nuevo | ≥ 80 % del D7 argentino en su primera tanda de 300 | 27 |
| Pago a día 35 por país | ≥ 1 % (corte de 17) | RevenueCat |
| Guardrail: reseñas por textos raros | < 5 % de las del país | lectura manual |

## Experiencia
**Paucho viaja; no cambia.** En cada país llega un «amigo de allá»: un animalito del camino gratis de un evento (02, 03) y un vecino que le manda una carta. Paucho sigue cebando mate a la mañana en todos lados: la racha es su ritual, no un pedido de que la persona tome mate.

**Orden y por qué.**
| # | País | Por qué | Qué cambia |
|---|---|---|---|
| 1 | Uruguay | Voseo y mate, casi sin cambios (plan) | Precios, feriados, 5 hábitos |
| 2 | Paraguay y el NEA | Tereré (plan); el NEA ya es Argentina | Tereré a la tarde como mate de verano; yacaré con tereré (plan) |
| 3 | Chile | Cerca, paga más que Argentina (estimación) | Textos en tú, hábitos, eventos |
| 4 | México | El mercado grande de habla hispana (plan) | Textos en tú, eventos, precios; ver «Preguntas abiertas» |
| 5 | Colombia | Grande y creciente | Textos en tú, eventos |
| 6 | Brasil, por Rio Grande do Sul | El gaúcho y el chimarrão son el mismo mundo | Portugués; empezar por el sur |
| — | España y la diáspora | Pagadores en voseo (idea del revisor, sin probar, plan) | Precio en euros, consentimiento de la Unión Europea |

**España y la diáspora.** Argentinos y uruguayos afuera ya hablan voseo, extrañan el mate y pagan en euros o dólares. España entra antes que México, por la ficha y sin cambiar textos: 2,99 / 19,99 (17) y consentimiento UMP (23). Si paga más que Argentina con la mitad de usuarios, cambia el orden.

**Qué ve la persona al cambiar de país.**
- Idioma: según el teléfono. Un argentino en Madrid con el teléfono en «español (España)» ve voseo, porque el español sin región cae en `es-AR`.
- Ajustes → «Cómo te habla Paucho»: «Con vos» / «Con tú». Por defecto según la región; cambiable siempre.
- Feriados y eventos: según la región de la tienda, no del GPS.

## Reglas y números
**Arquitectura de textos.**
| Regla | Valor | Por qué |
|---|---|---|
| Fuente única | `es-AR`, voseo, escrita primero | El tono nace acá (30) |
| Cadenas de respaldo | `es-UY → es-AR`; `es-PY → es-AR`; `es-CL → es-419-tu → es-AR`; `es-MX → es-419-tu`; `es-CO → es-419-tu`; `es → es-AR` | Uruguay y Paraguay solo pisan lo distinto |
| `es-419-tu` | Tuteo neutro latinoamericano, revisado por una persona de cada país | Una traducción para tres países |
| Claves | Por situación, no por pantalla: `mate.manana.saludo.3` | Las 300–500 líneas de 06 |
| Variables | `{nombre}`, `{habito}`, género neutro cuando se pueda | Sin «bienvenido/a» |
| Regionalismos | Marcados en la fuente (`#local`) para revisar en cada país | «Pibe», «laburo», «che» |
| Largo | Hasta +20 % sobre el voseo | El portugués y el tú se alargan |

**Qué se adapta por país.**
| Cosa | Se adapta | Ejemplo |
|---|---|---|
| Textos de interfaz | Sí (vos / tú / portugués) | «Tocá» → «Toca» |
| Hábitos | Sí, 5 a 10 propios (29) | México: «Desayunar antes de las 10»; Brasil: «Um chimarrão com alguém» |
| Eventos | Sí, calendario propio sobre los cuatro por año (02) | Uruguay: Carnaval largo; México: Día de Muertos (sin calaveras de terror) |
| Amigo local | Uno por país | Chile: pudú; México: ajolote; Brasil: quero-quero |
| Precios | Sí, escalón local de cada tienda (17) | Revisar por trimestre |
| Fechas vedadas | Sí, lista por país, revisada por alguien de allá | Política y duelos nacionales |

**Qué no se adapta.** Paucho, su cara, su ropa y su nombre. El mate de la mañana como racha. La economía y sus precios en herraduras. Lo que es gratis y lo que es Premium. Las reglas de bienestar y las palabras vedadas, traducidas. El público 18+.

**Criterios para abrir un país.**
| Criterio | Valor |
|---|---|
| El país anterior pasó su corte | D7 y pago a día 35 de 17 |
| Señal propia | ≥ 5 % de las instalaciones o ≥ 300 en la lista de espera desde ese país (31), sin haberlo buscado |
| Texto listo | 100 % de las claves en su idioma, revisadas por una persona del país |
| Contenido | 5 hábitos propios, 1 evento adaptado, 1 amigo local |
| Precio | Escalón definido y prueba de compra hecha |

## Contenido necesario
- Extraer todo el texto actual a `es-AR` (estimación: 1.500 a 2.500 cadenas).
- `es-419-tu`: una pasada completa, más revisión por país.
- Por país: 5–10 hábitos, 1 evento, 1 amigo local (1 sprite y 4 cartas), lista de fechas vedadas, ficha de tienda.
- Brasil: `pt-BR` completo, hecho por una persona gaúcha.

## Arte, animación y sonido
Nuevo por país: el amigo local y algún objeto de evento, en fieltro (12). El texto dentro del arte (carteles) pasa a capas de texto. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- i18n: una función `t(clave, vars)` con cadena de respaldo; los componentes dejan de tener texto suelto. Archivos: `src/i18n/es-AR.json`, `es-419-tu.json`, `pt-BR.json`.
- `sw.js` y los avisos locales (16) leen el mismo idioma.
- Estado nuevo: `trato: 'vos' | 'tu'` en Ajustes, y `region` leída de la tienda.
- Fechas, horas y monedas con `Intl`, nunca a mano.
- Contenido remoto (28) con `region` en cada evento.
- Migración: sin cambios en el guardado, salvo `trato` con valor por defecto.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `idioma_resuelto` | Primera apertura | `locale_telefono`, `locale_app`, `region_tienda` |
| `trato_cambiado` | Cambia vos/tú | `de`, `a` |
| `texto_faltante` | Una clave cae al respaldo `es-AR` fuera de Uruguay y Paraguay | `clave`, `locale` |

`pais` y `locale_app` pasan a ser propiedades de todos los eventos (27).

## Casos borde y riesgos
- **El tú borra lo que hace distinto al producto** (plan). Por eso Paucho puede seguir en voseo con interfaz en tú: es un personaje de afuera, como el acento de un amigo. Se decide con datos (abajo).
- **El mate no viaja.** En México o Colombia puede leerse ajeno; lo dicen el D7 y la prueba de ganchos (31).
- **Gaúcho en Brasil.** Identidad regional con carga política: pibe de campo, sin símbolos.
- **Tiendas.** Ficha, capturas y política de privacidad en cada idioma.

## Fases
- **V1:** extraer textos a `es-AR`; Uruguay y España por la ficha.
- **V2:** Paraguay y NEA con tereré; `es-419-tu`; Chile.
- **Más adelante:** México y Colombia; Brasil por el sur.
- **Afuera:** un personaje por país; traducción automática sin revisión; inglés.

## Criterios de aceptación
- [ ] Ningún componente tiene texto suelto; todo pasa por `t()`.
- [ ] Con el teléfono en `es-ES` la app muestra voseo; con `es-MX`, tú.
- [ ] Cambiar «Cómo te habla Paucho» cambia todos los textos sin reiniciar.
- [ ] Los avisos llegan en el mismo idioma que la app.
- [ ] Ninguna pantalla se corta con +20 % de largo a 390×844.

## Preguntas abiertas
1. **¿Paucho habla de vos en México?** Recomiendo probarlo: tanda A con Paucho en voseo e interfaz en tú, tanda B todo en tú; decide el D7.
2. **¿España antes que Chile?** Recomiendo abrir la ficha de España ya, sin trabajo de texto, y medir pagos.
3. **¿Brasil antes que México?** Recomiendo no: el portugués es una traducción entera.
