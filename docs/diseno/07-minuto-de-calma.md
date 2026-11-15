# 07 · Un minuto de calma con el mate
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: 7 · Depende de: 05, 06, 15, 29

## En una línea
Sesenta segundos de respirar al ritmo del vapor del mate, con Paucho al lado, más dos ejercicios cortos; se hacen dentro de la app, cuentan como hábito y son gratis para siempre.

## Problema y oportunidad
Quien elige «Quiero sentirme más tranquilo/a» recibe dos hábitos y nada más. `calmPicks` en `aboutYou.ts` suma «Respirar hondo 3 veces» y «Un mate tranqui», con la nota «Para sentirte con más calma», y ahí termina. La app anota lo que la persona hace afuera, pero no ofrece nada en el momento (plan).

Importa por el público: el 49 % dice vivir con estrés frecuente (plan). Se lo aprendemos a las respiraciones y los «primeros auxilios» de Finch (plan). La ventaja propia es que la app ya tiene la guía visual: el vapor del mate sube y se deshace, y eso es una respiración.

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: quienes eligieron `calma` y hacen un ejercicio en su primera semana | ≥ 40 % | `calma_completada` sobre usuarios con `calma` |
| Secundaria: ejercicios terminados sobre empezados | ≥ 80 % | `calma_completada` / `calma_iniciada` |
| Secundaria: quienes repiten 2 o más veces por semana | ≥ 15 % de quienes lo probaron | por usuario y semana |
| Guardrail: rechazos de tienda por lenguaje de salud | 0 | revisión |
| Guardrail: nada de esto detrás de un pago | siempre | revisión de cada versión |

## Experiencia
**Entradas.** Hay tres, y ninguna interrumpe:
1. La tarjeta de un hábito de calma (`respirar`, `meditar`, `minuto-calma`) lleva un botón «▶ Con Paucho». Hacerlo así tilda el hábito al terminar.
2. Pestaña Paucho → «Un minuto de calma», siempre disponible. Antes de que abra esa pestaña, un chip 🍃 en Inicio para quien eligió `calma`.
3. Tras elegir mate Helado o Lavado (doc 05), el botón liviano «Un minuto de calma».

**Elegir.** Una hoja inferior con tres tarjetas: «Respirar con el vapor», «Mirar lejos», «Aflojar». Recuerda la última usada y la pone primera.

**Durante.** Pantalla completa, sin barra de pestañas ni contadores. Una X arriba a la izquierda, siempre. La música baja al 30 %.

**Guion de «Respirar con el vapor» (60 s).** Ritmo: 4 segundos de aire, 6 de soltar, cinco veces. Sin retener el aire.

| Segundo | Qué se ve | Texto | Sonido y vibración |
|---|---|---|---|
| 0–3 | Paucho sentado con el mate (plano general de la escena del mate). La escena se oscurece un poco | «Un minuto. Seguí el vapor.» | La música baja; grillos suaves |
| 3–5 | El vapor hace una subida corta de muestra | «Cuando sube, tomás aire. Cuando se va, lo soltás.» | — |
| 5–9 | El vapor sube derecho y crece | «Tomá aire…» | Un toque suave por segundo (4) |
| 9–15 | El vapor se abre y se deshace hacia arriba | «Soltalo despacito…» | Soplido bajo, sin vibración |
| 15–19 | Sube | «Aire…» | 4 toques |
| 19–25 | Se deshace | «Soltá…» | Soplido |
| 25–35 | Tercera vuelta. Paucho baja los hombros al soltar | sin texto | Igual |
| 35–45 | Cuarta vuelta. Paucho cierra los ojos | sin texto | Igual |
| 45–49 | Sube | «La última.» | 4 toques |
| 49–55 | Se deshace | sin texto | Soplido |
| 55–58 | Paucho toma un sorbo y hace «ahh» (poses A3 y A4) | sin texto | Sorbo |
| 58–60 | Paucho te mira (A5) | «Listo. Un minuto para vos.» | La música vuelve |

Al final, un solo botón: «Gracias, Paucho». Si vino de un hábito, se tilda ahí y vuela su energía.

La primera vez, antes del segundo 0: «A tu ritmo. Si te incomoda, respirá normal y mirá el vapor nomás.»

**«Mirar lejos» (60 s).** La cámara recorre el horizonte del área, despacio, con las nubes que ya se mueven. Tres consignas de 20 segundos: «Buscá tres cosas que se muevan.» · «Ahora dos sonidos, de acá o de tu casa.» · «Y una cosa que estés tocando.» Cierre: «Ya está. Seguimos cuando quieras.»

**«Aflojar» (60 s).** Tres tandas de 20 segundos, con Paucho haciéndolo: «Apretá los puños como exprimiendo un limón… y soltá.» · «Hombros a las orejas… y abajo.» · «Apretá los dientes un segundo… y aflojá la cara.» Cierre: «Quedaste como poncho recién lavado.»

**Salir antes.** La X cierra sin preguntas. Paucho dice en el campo: «Cuando quieras lo seguimos.» Nunca «te faltaba poco».

**Estados especiales.** Con «Reducir movimiento» activo, el vapor se cambia por un brillo que sube y baja de intensidad. Sin sonido ni vibración el ejercicio se entiende igual: el texto y el vapor alcanzan. Si la app pasa a segundo plano, se pausa y vuelve al inicio de la vuelta en curso.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Duración | 60 s exactos | Es la promesa del nombre |
| Ritmo de respiración | 4 s / 6 s, 5 vueltas, sin retener | Soltar más largo que tomar; retener incomoda a quien recién empieza |
| Cuenta como hecho | al pasar el segundo 40 | Cuatro vueltas alcanzan; no castigar a quien corta al final |
| Premio | el del hábito: 10 de energía, o 5 herraduras con la barra llena | Vale lo mismo que cualquier otro (`ENERGY_PER_HABIT`) |
| Premio sin hábito de calma en el plan | cuenta como un hábito extra «solo hoy», 1 por día | Que también le sirva a quien no eligió `calma` |
| Usos sin premio | sin límite | Calmarse no se raciona |
| Oferta tras el mate | solo Helado y Lavado, 1 por día | No insistir |
| Volumen de la música durante | 30 % | Que el soplido se oiga |
| Precio | gratis, sin anuncios antes ni después | «Cuidarte es gratis» |

## Contenido necesario
- Textos: 12 del guion de respirar, 5 de «Mirar lejos», 5 de «Aflojar», 6 cierres alternativos, 4 líneas de salida, 1 aviso de primera vez.
- Arte: nada nuevo para «Respirar» y «Mirar lejos» (escena del mate, vapor, cielo y nubes del área). «Aflojar» pide 3 poses nuevas de plano general: puños, hombros, cara.
- Sonido: soplido suave en dos largos (4 s y 6 s), sorbo, grillos, un cierre de guitarra de dos notas.
- Hábito nuevo en el catálogo: «Un minuto de calma con Paucho» 🍃 (`minuto-calma`, doc 29), que reemplaza a «Meditar 5 minutos» entre los que se ofrecen.

## Arte, animación y sonido
El vapor es el protagonista. Usa los puntos `steam` de `SCENE` y debe leerse a un metro del teléfono: sube en una columna clara durante 4 segundos y se abre en abanico durante 6. Paucho acompaña con poco: hombros, ojos, un sorbo. Nada rebota y no hay dorado ni confeti; es la única pantalla de la app que busca bajar el ritmo (doc 15). Curvas lentas, de entrada y salida suaves. Los sonidos son grabados, no sintetizados. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- Sin estado nuevo para lo esencial: terminar llama a `actions.completeHabit` con el hábito de origen, o agrega `minuto-calma` a `extras[dia]` y lo completa.
- Campo chico nuevo: `calma: { ultimo: string, vistoAviso: boolean }`.
- Archivos: `src/screens/Calma.tsx` (las tres rutinas como listas de pasos con segundo de inicio), `src/game/calma.ts` (guiones y reglas), botón en `HabitCard`, entrada en `PauchoTab.tsx`, sonidos en `sound.ts`.
- El tiempo sale de `clock.ts`, así los tests corren el guion sin esperar.
- Todo dentro del binario y sin conexión. Mantener la pantalla encendida durante el minuto (Wake Lock en web, plugin en Capacitor).

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `calma_iniciada` | empieza el segundo 0 | `ejercicio`, `origen` (habito, paucho, inicio) |
| `calma_completada` | pasa el segundo 40 | `ejercicio`, `conto_como_habito` (bool) |
| `calma_abandonada` | X antes del segundo 40 | `ejercicio`, `segundo` |

`origen` no distingue la oferta que sigue al mate: se informa como `inicio`, para que el evento no delate un día Helado.

## Casos borde y riesgos
- **Promesa clínica.** El texto dice «calma», «un minuto para vos», «bajar un cambio». Nunca «ansiedad», «tratar», «curar», «ataque», «técnica comprobada» ni cifras de beneficio. La ficha de la tienda tampoco.
- **Declaración de salud de Google.** Suma una función de relajación; se declara como tal (ver `docs/tecnico/tiendas-android-ios.md`).
- **Incomodidad al respirar.** Por eso no hay retención, el aviso inicial invita a respirar normal y la X está siempre.
- **Trampa.** Dejar correr el minuto sin mirar da un hábito por día. Es el mismo valor que tildar cualquier hábito a mano; no hay nada que proteger.
- **Dos premios por lo mismo.** Si `respirar` ya está tildado hoy, el ejercicio corre sin premio y no ofrece el extra.
- **Culpa.** No hay racha de calma ni contador de «días sin respirar».
- **Android barato.** La escena de 1024×1536 más el vapor se miden en un teléfono de 3 GB antes de publicar (plan).

## Fases
- **V1:** «Respirar con el vapor», entradas desde el hábito y desde Paucho, regla del segundo 40.
- **V2:** «Mirar lejos», oferta tras el mate Helado o Lavado, sonidos grabados.
- **Más adelante:** «Aflojar» (pide 3 poses), versión de 3 minutos, acceso desde el widget (doc 25).
- **Afuera:** meditaciones guiadas con voz, programas de varios días, contenido para dormir.

## Criterios de aceptación
- [ ] El ejercicio dura 60 s ± 0,5 s medido con `clock.ts`.
- [ ] El vapor sube 4 s y se deshace 6 s, cinco veces, sin saltos.
- [ ] Se entiende con el teléfono en silencio y con «Reducir movimiento».
- [ ] Pasado el segundo 40 el hábito queda tildado aunque se cierre.
- [ ] No hay más de un premio de calma por día.
- [ ] No hay compra, anuncio ni cartel de Premium en ningún punto del flujo.
- [ ] El texto pasa la lista de palabras prohibidas y el voseo.
- [ ] La pantalla no se apaga durante el minuto.

## Preguntas abiertas
1. **¿Cuenta como hábito para quien no tiene ninguno de calma?** Recomiendo que sí, uno por día, como extra «solo hoy».
2. **¿Reemplazar «Meditar 5 minutos» en la grilla del onboarding?** Recomiendo que sí: es el único hábito que la app puede acompañar de punta a punta.
3. **¿Ritmo 4/6 o 4/4?** Recomiendo 4/6 y probarlo con cinco personas antes de fijarlo.
4. **¿Voz de Paucho en sílabas durante el ejercicio (doc 15)?** Recomiendo que no: acá gana el silencio.
