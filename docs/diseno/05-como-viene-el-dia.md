# 05 · ¿Cómo viene el día?
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: 5 · Depende de: 06, 07, 26, 27

## En una línea
Un toque por día sobre cinco mates, de «helado» a «espumoso», y a la noche una línea opcional, «lo mejor de hoy»; Paucho contesta según lo elegido y todo queda solo en el teléfono.

## Problema y oportunidad
Hoy la persona le cuenta a Paucho dos nombres y nada más. El estado guardado (`GameState` en `store.ts`) no tiene ningún campo para cómo está el jugador, y `aboutYou` se escribe en `finishOnboarding` y no se vuelve a leer. Paucho festeja con 6 frases fijas (`PRAISE` en `App.tsx:30`) sin saber si el día viene bien o mal.

Importa porque es lo que convierte un contador de hábitos en una relación, y porque genera el material que usa la memoria (doc 06) (plan). Se lo aprendemos al registro de ánimo y las reflexiones de Finch (plan). La versión propia es el mate: nadie en Argentina necesita que le expliquen la diferencia entre un mate lavado y uno espumoso.

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: días activos con mate elegido | ≥ 45 % en la semana 1, ≥ 30 % en la semana 4 | `dia_registrado` / días con sesión |
| Secundaria: días activos con «lo mejor de hoy» | ≥ 12 % | `nota_guardada` / días con sesión |
| Secundaria: D7 de quien registró el día 1 contra quien no | diferencia positiva (correlación, no causa) | cohortes en doc 27 |
| Guardrail: tiempo hasta el primer hábito de la sesión | no sube más de 3 s | `habito_hecho` − inicio de sesión |
| Guardrail: gente que apaga la tarjeta en Ajustes | < 10 % | `registro_apagado` |

La analítica sabe **que** se registró, nunca **qué**.

## Experiencia
**1. A la mañana, en Inicio.** Después del mate de la racha (`StreakDay` → «¡Dale!»), la primera tarjeta sobre los hábitos dice «¿Cómo viene el día?» con cinco mates en fila y su nombre abajo: Helado · Lavado · Tibio · Calentito · Espumoso. No bloquea nada: los hábitos se pueden hacer sin tocarla.

**2. Un toque.** El mate elegido salta, los otros se apagan, y Paucho contesta en su globo del campo (`say` de `AreaScene`). La tarjeta se pliega en un chip junto a «✓ N»: «🧉 Tibio». Tocar el chip reabre los cinco mates; se puede cambiar hasta la medianoche.

**3. Paucho contesta según el nivel** (12 líneas por nivel en el banco del doc 06):

| Mate | Qué dibuja | Ejemplos |
|---|---|---|
| Helado | mate con escarcha, sin vapor | «Día helado. Hoy hacemos lo que se pueda y listo.» · «Gracias por decírmelo. Yo ando por acá, eh.» · «Helado. Entonces vamos despacito, que nadie nos corre.» |
| Lavado | yerba pálida, palitos flotando | «Lavado, como mate de oficina. Hoy, de a una cosa.» · «Hay días lavados. Mañana cambiamos la yerba.» · «Elegí una sola de la lista. Con esa alcanza.» |
| Tibio | un hilo de vapor | «Tibio. Ni fu ni fa. Se toma igual.» · «Tibio es un montón para un martes.» · «A ver si lo levantamos con algo cortito.» |
| Calentito | vapor parejo | «Calentito, como tiene que ser.» · «Así da gusto. ¿Arrancamos?» · «Hoy la pava se portó.» |
| Espumoso | espuma arriba y brillo | «¡Espumoso! De esos salen dos por mes, aprovechalo.» · «Epa, mirá esa espuma. ¿Qué desayunaste?» · «Yo que vos saco ese turno pendiente ya mismo.» |

Con Helado o Lavado, debajo del globo aparece un botón liviano: «Un minuto de calma» (doc 07). No aparece ningún otro consejo. Paucho no intenta arreglar el día.

**4. A la noche, «Lo mejor de hoy».** Desde las 20:00 aparece una tarjeta en el grupo «A la noche»: un campo de una línea, 140 caracteres, con ejemplos que rotan («El mate con mi hermana», «Que no llovió», «Llegué a horario, milagro»). «Guardar» muestra a Paucho anotando en la libreta (las poses de `Libreta.tsx` ya existen) y dice: «Anotado. Esto lo guardo yo.» Si no se escribe nada, la tarjeta se va sola a la medianoche, sin comentario.

**5. La libreta, en la pestaña Paucho.** Lista de los últimos 30 días: el mate de cada día y su línea. Cada entrada se borra deslizando; abajo, «Borrar todo lo anotado». Antes de que abra la pestaña Paucho (tercer día con hábitos), la libreta se alcanza desde Ajustes.

**Estados vacíos y de error.** Libreta vacía: «Todavía no anoté nada. Cuando quieras, me contás.» Sin lugar para guardar: «No me entró en la libreta. Probá de nuevo en un rato.» y el texto queda en el campo.

**Primera vez.** Bajo la tarjeta, una sola vez: «Esto queda en tu teléfono. No lo ve nadie más, ni nosotros.»

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Niveles | 5 | Lo que usa Finch; menos de 5 no distingue un día flojo de uno malo |
| Registros por día | 1, editable hasta las 23:59 | Un toque, no un diario |
| Cuándo aparece | desde el día 2 | El día 0 ya tiene demasiadas pantallas (doc 11) |
| Tarjeta de la noche | 20:00 a 23:59, hora del teléfono | Un país que cena tarde |
| Largo de la nota | 140 caracteres | Entra en el globo de Paucho cuando la devuelve |
| Energía y herraduras por registrar | 0 | Pagar por nivel invita a mentir; pagar por tocar lo vuelve trámite |
| Encargo «Contale a Paucho cómo viene el día» | nivel toque, 5 herraduras, como mucho 2 veces por semana | Empuja el hábito con el sistema que ya existe (`encargos.ts`) |
| Oferta de calma | solo con Helado y Lavado | No interrumpir los días buenos |
| Tres días seguidos en Helado o Lavado | una línea extra, como mucho cada 14 días: «Si viene pesado hace rato, hablarlo con alguien ayuda. En Ajustes te dejé a dónde.» | Acompañar sin diagnosticar |
| Cuánto se guarda | 365 días; lo más viejo se borra solo | Unos 70 KB, entra cómodo en `localStorage` |
| Apagar | Ajustes → «Preguntarme cómo viene el día» | El registro nunca es obligatorio |

## Contenido necesario
- 60 respuestas de Paucho (12 por nivel) y 6 de «anotado»; se escriben con la tanda del doc 06.
- 20 ejemplos para el campo de la noche.
- 5 íconos de mate (uno por nivel), en apagado y elegido.
- Texto de privacidad (1) y pantalla «A dónde llamar» en Ajustes, con líneas públicas de escucha de Argentina. Los números se verifican antes de publicar.
- 2 sonidos: mate apoyado (elegir) y lápiz sobre papel (guardar).

## Arte, animación y sonido
Los cinco mates salen de una sola hoja, con la misma luz y en fieltro (doc 12), sobre el `habit_mate` que ya se parte en piezas (`make_mate_parts.py`). El elegido crece a 1,15 y vuelve; el vapor del nivel se anima con los puntos `steam` existentes. El festejo es chico a propósito: sin confeti ni dorado, que quedan para premios (doc 15). Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- Clave nueva y separada: `gauchito.v2.diario` → `{ [dia]: { mate: 1–5, nota?: string } }`. Va aparte de `gauchito.v2` para que la nube (doc 26) no pueda subirla ni por error.
- Archivos: `src/game/diario.ts` (leer, guardar, borrar, podar), tarjeta en `Home.tsx`, libreta en `PauchoTab.tsx`, interruptor en `Settings.tsx`.
- No entra en `reminderSnapshot.ts`: ningún aviso cita una nota ni un nivel, porque el aviso se ve con el teléfono bloqueado.
- La copia de seguridad de Ajustes la incluye solo si se marca «Incluir lo que anoté».
- Funciona sin conexión. No hay migración: quien no tiene la clave arranca vacío.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `dia_registrado` | al elegir un mate | `dia_de_juego`, `es_cambio` (bool). **Sin nivel** |
| `nota_guardada` | al guardar la línea | `dia_de_juego`. **Sin texto ni largo** |
| `libreta_abierta` | al abrir la libreta | `entradas` (en tramos: 0, 1–7, 8–30, 31+) |
| `diario_borrado` | al borrar | `alcance` (una, todo) |
| `registro_apagado` | al apagarlo en Ajustes | — |

## Casos borde y riesgos
- **Dato sensible.** Es el riesgo principal (plan). Queda en el teléfono, fuera de analítica y nube, y la ficha de privacidad de las tiendas lo declara como «no recolectado».
- **Sonar a diagnóstico.** Los niveles hablan del mate, no de la persona. Prohibido en todo el texto: «ansiedad», «tratar», «curar», síntomas.
- **Culpa.** Paucho nunca dice «ayer no me contaste». Un día sin registro no existe para él.
- **Trampa.** No paga por nivel, así que no hay nada que fabricar. El encargo paga igual con cualquier mate.
- **Teléfono compartido.** La libreta no lleva clave. Mitigación: borrar entrada por entrada y todo junto.
- **Cambio de teléfono.** Sin nube, lo anotado se pierde salvo copia manual. Se avisa en la pantalla de cuenta (doc 26).
- **Reloj del teléfono.** Adelantarlo solo le da a la persona más tarjetas vacías. No hay premio que cuidar.

## Fases
- **V1:** los cinco mates, respuestas por nivel, clave separada, interruptor en Ajustes.
- **V2:** «lo mejor de hoy», la libreta, la oferta de calma, el encargo.
- **Más adelante:** resumen de diciembre («tu año en mates», doc 02), calculado en el teléfono.
- **Afuera:** gráficos de ánimo, etiquetas de causa, diario largo, exportar a terceros.

## Criterios de aceptación
- [ ] Registrar pide un solo toque y no bloquea ningún hábito.
- [ ] Cada nivel tiene al menos 12 respuestas y ninguna se repite en 7 días.
- [ ] Ningún evento de analítica lleva nivel, texto ni largo de la nota.
- [ ] `gauchito.v2.diario` no aparece en ningún pedido de red ni en el snapshot de avisos.
- [ ] Borrar una entrada y borrar todo funcionan sin conexión.
- [ ] Con el interruptor apagado no aparece ni la tarjeta ni el encargo.
- [ ] El texto pasa la lista de palabras prohibidas y el voseo.
- [ ] Se lee bien a 390×844; cada mate mide al menos 44 pt.

## Preguntas abiertas
1. **¿El registro da energía, como en Finch?** Recomiendo que no: se paga con el encargo ocasional, y el nivel nunca cambia el premio.
2. **¿«Lavado» como segundo nivel?** Recomiendo que sí: es el más argentino de los cinco. Alternativa neutra: «Frío».
3. **¿La línea de «hablarlo con alguien» y la pantalla de teléfonos?** Recomiendo incluirlas, con revisión legal del texto antes de publicar.
4. **¿Lo anotado sube alguna vez a la nube?** Recomiendo que no, ni cifrado, hasta que alguien lo pida y exista un diseño propio.
