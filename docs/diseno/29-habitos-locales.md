# 29 · Hábitos pensados para acá
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: — (sección «Cultura» del plan) · Depende de: 06, 07, 11, 12

## En una línea
Un catálogo de 61 hábitos escritos para la vida en Argentina, ordenados por las ocho áreas del cuestionario, cada uno con emoji, momento del día y texto final; salen los que chocan con un país que cena tarde.

## Problema y oportunidad
El catálogo de hoy es una traducción de Finch con un mate agregado. Hay tres listas que no se hablan entre sí en `content.ts`: `HABITS` (12, con ícono del artista, la grilla del onboarding), `STARTER_GOALS` (14, con emoji, el plan de arranque) y `HABIT_SUGGESTIONS` (25, cinco temas, «Agregar un hábito»). Los temas de las sugerencias no coinciden con las áreas de `aboutYou.ts`.

Dos hábitos chocan con el público: «Acostarme antes de las 23:30» y «Apagar pantallas a las 23» no encajan en un país que cena tarde (plan). Y `buildPlan` manda justamente «Acostarme antes de las 23:30» a quien dijo que duerme menos de 7 horas.

Lo local es la puerta de entrada (plan). Un hábito como «Preparar el táper» le dice a la persona, en la primera pantalla, que esto se hizo acá.

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: hábitos del plan cumplidos por día activo, semana 1 | +10 % contra el catálogo actual | `habito_hecho` por día |
| Secundaria: hábitos sacados del plan en los primeros 7 días | −20 % | `habito_quitado` |
| Secundaria: hábitos sumados desde las sugerencias, sobre los escritos a mano | ≥ 60 % | `habito_agregado.origen` |
| Guardrail: «Hoy no puedo» por hábito | ningún hábito nuevo por encima de 25 % | `habito_salteado` por id |

## Experiencia
**Onboarding.** La grilla sigue mostrando 12 hábitos para elegir hasta 3 (`HABITS_TO_PICK`). Cambia cuáles (columna «Grilla» de las tablas).

**El plan.** `buildPlan` no cambia de forma: regalo, elegidos, calma, hasta 2 por respuestas, básicos. Cambia a qué hábito apunta cada respuesta.

**Agregar un hábito.** Los cinco temas pasan a ser las ocho áreas, con el mismo emoji y nombre corto que la persona ya vio en el cuestionario. Primero van las áreas que eligió. Arriba de todo queda «Victorias fáciles» con los básicos.

**Momento.** Cada hábito trae un momento sugerido que precarga su plan (`HabitPlan.moment`): Al arrancar, Cuando sea, A la noche. Se cambia desde el ✏️ como hoy.

**Estado vacío.** Si ya tiene todos los hábitos de un área: «De esta ya tenés todos. Mirá otra o escribí el tuyo.»

### Qué sale y qué entra
| Sale | Por qué | Lo reemplaza |
|---|---|---|
| Acostarme antes de las 23:30 | Cena tarde (plan) | Acostarme a la hora que me propuse · Cenar antes de las 22 |
| Apagar pantallas a las 23 | Ídem | Media hora sin pantallas antes de dormir |
| Tomar 8 vasos de agua | Meta de app extranjera; con mate nadie cuenta vasos | Un vaso de agua entre termo y termo |
| Meditar 5 minutos | La app no lo acompañaba | Un minuto de calma con Paucho (doc 07) |
| Una hora de trabajo sin distracciones | Una hora asusta el día 1 | Media hora de corrido, con el celular boca abajo |

Entran los once del plan: un vaso de agua entre termo y termo, merienda sin pantalla, cenar antes de las 22, bajarme una parada antes, preparar el táper, llamar a la abuela, sacar al perro, un mate con alguien, silenciar un grupo de WhatsApp, anotar los gastos del día, sobremesa sin celular.

### Catálogo final
Momento: **A** = Al arrancar, **C** = Cuando sea, **N** = A la noche. **G** = está en la grilla del onboarding. *Nuevo* en cursiva.

**Básicos (plan de arranque, sin área)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🌻 | Levantarme de la cama | A | `levantarme` |
| 🪥 | Lavarme los dientes | A | `dientes` |
| 🧼 | Lavarme la cara | A | `cara` |
| 💧 | Tomar un vaso de agua | C | `vaso-agua` |
| 🦒 | Estirarme un rato | C | `estirarme` |
| 😊 | Hacer algo que me haga feliz | C | `feliz` |
| 🍃 | Respirar hondo 3 veces | C | `respirar` |
| 👕 | *Cambiarme de ropa, aunque no salga* | A | `cambiarme` |

**🏡 Los míos (`familia`)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🏡 | Un rato sin pantallas con los míos | N | `los-mios` |
| 📞 | *Llamar a la abuela* — G | C | `abuela` |
| 🍽️ | *Sobremesa sin celular* | N | `sobremesa` |
| 🤗 | Dar un abrazo | C | `abrazo` |
| 🧸 | *Jugar un rato con los chicos* | C | `jugar-chicos` |
| 📸 | *Mandar una foto al grupo de la familia* | C | `foto-familia` |

**🤝 La gente (`vinculos`)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🧉 | *Un mate con alguien* — G | C | `mate-con` |
| 💌 | Escribirle a alguien que quiero | C | `escribirle` |
| 💬 | Responder un mensaje pendiente | C | `mensaje` |
| 🎙️ | *Mandar un audio en vez de un «jaja»* | C | `audio` |
| 📅 | *Proponer una juntada* | C | `juntada` |
| 👋 | *Saludar a un vecino* | C | `vecino` |

**🎯 Foco (`foco`)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🎯 | *Media hora de corrido, con el celular boca abajo* — G | A | `media-hora` |
| 🔕 | *Silenciar un grupo de WhatsApp* | A | `silenciar` |
| ✅ | Hacer una cosa que vengo postergando | C | `pendiente` |
| 🧾 | *Anotar los gastos del día* | N | `gastos` |
| 📝 | *Anotar las tres cosas de mañana* | N | `tres-cosas` |
| 📖 | Leer 10 páginas — G | N | `leer` |
| 🗓️ | *Sacar ese turno* | C | `turno` |

**🌱 Rutina (`rutina`)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🛏️ | Tender la cama | A | `tender-cama` |
| 🍱 | *Preparar el táper* — G | N | `taper` |
| 🍳 | Cocinar algo casero — G | C | `cocinar` |
| 🍎 | Comer una fruta | C | `fruta` |
| ☕ | *Merienda sin pantalla* | C | `merienda` |
| 🪴 | Regar las plantas | C | `plantas` |
| 🧦 | *Dejar lista la ropa de mañana* | N | `ropa-lista` |
| 🫧 | *Lavar los platos antes de dormir* | N | `platos` |

**😴 Dormir (`dormir`)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🍝 | *Cenar antes de las 22* — G | N | `cenar-22` |
| 📵 | *Media hora sin pantallas antes de dormir* | N | `sin-pantallas` |
| 🔌 | *Dejar el celular cargando lejos de la cama* | N | `celu-lejos` |
| 🌙 | *Acostarme a la hora que me propuse* | N | `mi-hora` |
| 🧉 | *El último mate, antes de las 18* | C | `ultimo-mate` |
| 💡 | *Bajar las luces después de cenar* | N | `luces` |

**💪 Cuerpo (`cuerpo`)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🚶 | Salir a caminar 10 minutos | C | `caminar` |
| 🚌 | *Bajarme una parada antes* | C | `parada` |
| 🐶 | *Sacar al perro* — G | C | `perro` |
| 💧 | *Un vaso de agua entre termo y termo* — G | C | `agua-termo` |
| 🏋️ | Hacer 20 minutos de ejercicio — G | C | `ejercicio` |
| ☀️ | Salir al sol 10 minutos | A | `sol` |
| 🪜 | Subir por la escalera | C | `escalera` |
| 💃 | Bailar una canción | C | `bailar` |

**🍃 Calma (`calma`)**
| | Texto | Mom. | id |
|---|---|---|---|
| 🍃 | *Un minuto de calma con Paucho* — G | C | `minuto-calma` |
| 🧉 | Un mate tranqui, sin pantallas | C | `mate` |
| 🎶 | Escuchar una canción tranqui | C | `cancion` |
| 🚿 | Una ducha sin apuro | N | `ducha` |
| 🌅 | Mirar el atardecer | C | `atardecer` |
| 🪟 | *Cinco minutos en el balcón o la vereda* | C | `vereda` |

**🌻 Confianza (`confianza`)**
| | Texto | Mom. | id |
|---|---|---|---|
| ✍️ | Anotar algo que hice bien — G | N | `algo-bien` |
| 🙏 | Agradecerle a alguien | C | `agradecer` |
| 🙅 | *Decir que no a algo, sin dar explicaciones* | C | `decir-no` |
| 📸 | Sacarle una foto a algo lindo | C | `foto-linda` |
| 🧢 | *Ponerme algo que me guste* | A | `ropa-linda` |
| 🎸 | *Un rato de algo solo por gusto* | C | `por-gusto` |

## Reglas y números
| Regla | Valor | Por qué |
|---|---|---|
| Tamaño | 61 hábitos: 8 básicos y 53 en áreas (6 a 8 por área) | Alcanza para elegir sin perderse |
| Grilla del onboarding | 12, al menos uno por área | `HABITS_TO_PICK` sigue en 3 |
| Largo del texto | hasta 48 caracteres | Un renglón y medio en la tarjeta a 390 pt |
| Forma | primera persona, infinitivo, sin signos | Igual que hoy |
| Tamaño del gesto | se puede hacer en 10 minutos o menos, o es una sola decisión | El día 1 tiene que salir |
| Horas fijas | solo en `cenar-22` y `ultimo-mate`; el resto no pone reloj | La hora la decide la persona |
| Nunca | alcohol, peso, calorías, dietas, medicación, plata más allá de anotar gastos | Bienestar y tiendas; el plan pide evitar el alcohol como hábito |
| `mi-hora` | pide la hora al sumarlo; por defecto 00:30 | Reemplaza las 23:30 sin imponer otra |

**Cambios en `buildPlan`:** área `dormir` → `cenar-22`; `sueno` menos de 7 horas → `celu-lejos`; `postergar: turnos` → `turno`; `calma` → `minuto-calma` + `mate`. **En `COVERS`:** `ejercicio` cubre `caminar` y `estirarme`; `minuto-calma` cubre `respirar`; `agua-termo` cubre `vaso-agua`; `mate` y `sin-pantallas` cubren `los-mios`.

## Contenido necesario
- 61 textos (32 nuevos). 61 emojis.
- Tabla hábito → área, que usa la voz de Paucho para `{meta}` (doc 06).
- 8 nombres cortos de área para «Agregar un hábito».
- Para la grilla: 9 íconos nuevos (siguen `habit_ejercicio`, `habit_leer` y `habit_cocinar`). Mientras no estén, la grilla muestra emoji en los nuevos.

## Arte, animación y sonido
Los 12 íconos `habit_*` del artista son una de las cuatro familias de íconos que conviven hoy (plan). Los nuevos no se piden sueltos: entran en la hoja única del doc 12, con la misma luz. Hasta entonces, emoji sobre el fondo de tarjeta del sistema de diseño. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- `content.ts`: un solo `CATALOG: HabitDef[]` con `area?` y `moment`, que reemplaza a `HABITS`, `STARTER_GOALS` y `HABIT_SUGGESTIONS`. La grilla y las sugerencias son filtros de esa lista.
- Los ids de hoy se conservan cuando el hábito sigue. Los cinco que salen pasan a `RETIRED`: no se ofrecen, pero un guardado que los tiene los sigue mostrando con su texto.
- `aboutYou.ts`: los cambios de `buildPlan` y `COVERS` de arriba. `rules.test.ts` suma un caso por respuesta.
- `AddHabit.tsx`: temas por área, ordenados por `aboutYou.areas`.
- Con contenido remoto (doc 28) el catálogo cambia sin publicar versión.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `habito_elegido_onboarding` | al cerrar la grilla | `habito_id` (uno por elegido) |
| `habito_agregado` | al sumar uno | `habito_id` o `propio`, `origen` (sugerencia, escrito), `area` |
| `habito_quitado` | al sacarlo del plan | `habito_id`, `dias_en_plan` |
| `habito_salteado` | «Hoy no puedo» | `habito_id` |

El texto de un hábito escrito por la persona nunca se envía: va `propio`.

## Casos borde y riesgos
- **No todos tienen abuela, perro o chicos.** Esos hábitos nunca entran solos al plan: solo si la persona los elige.
- **Localismo que no viaja.** «Táper», «termo» y «juntada» no sirven igual en México. El catálogo queda por país (doc 32); los ids son neutros.
- **Hábitos de plata.** «Anotar los gastos del día» es registro, no consejo. No se suman metas de ahorro ni de deuda.
- **Sueño.** Ningún texto promete dormir mejor; son gestos de la noche.
- **Guardados viejos.** Nadie pierde un hábito ni su historial por el cambio.
- **Trampa.** Sin efecto nuevo: el premio por hábito no cambia.

## Fases
- **V1:** textos y emojis nuevos, salen los cinco, cambios en `buildPlan`, momento sugerido.
- **V2:** `CATALOG` único, sugerencias por área, `mi-hora` con hora elegida.
- **Más adelante:** íconos en la hoja única, hábitos de temporada (doc 02), catálogo por país.
- **Afuera:** hábitos con medición automática (pasos, sueño), programas de varios días.

## Criterios de aceptación
- [ ] Ningún hábito ofrecido menciona las 23 ni las 23:30.
- [ ] Cada área del cuestionario tiene entre 6 y 8 hábitos y uno en la grilla.
- [ ] Un guardado con un hábito retirado lo muestra y lo deja completar.
- [ ] `buildPlan` nunca arma un plan con dos hábitos que se cubren entre sí.
- [ ] Todos los textos entran en la tarjeta a 390×844 sin cortarse.
- [ ] La lista pasa el control de palabras prohibidas.

## Preguntas abiertas
1. **¿Sacar «Tomar 8 vasos de agua» o dejar los dos?** Recomiendo sacarlo de lo ofrecido; quien lo tiene lo conserva.
2. **¿«Llamar a la abuela» en la grilla?** Recomiendo que sí: es la tarjeta más compartible. Alternativa: «Llamar a alguien que quiero».
3. **¿«El último mate, antes de las 18»?** Es el único que le pone límite al mate. Recomiendo dejarlo solo en el área Dormir.
4. **¿Tus tres hábitos (Oli, Pau, Entrenar)?** Siguen como propios. No entran al catálogo.
