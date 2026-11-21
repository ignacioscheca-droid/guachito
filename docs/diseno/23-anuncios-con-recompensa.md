# 23 · Anuncios con recompensa
> Estado: propuesta · Etapa: Con escala · Mejora del plan: — (Monetización, pieza 7) · Depende de: 04, 08, 17, 26, 27

## En una línea
Quien no paga puede, si quiere, prender la radio de Paucho hasta tres veces por día: escucha una tanda y Paucho le pasa herraduras o, de vez en cuando, un termo.

## Problema y oportunidad
Hoy el 98,5 % de quien instala no va a pagar nunca (1,5 % paga, plan) y no aporta nada. Los anuncios no son base de ingreso: con 10 mil activos al mes dejan USD 27 a 365 por mes (plan). Por eso el plan los deja para cuando haya escala, con la vara en 100 mil activos: antes dan pocos dólares por día y cuestan un SDK y un flujo de consentimiento (plan).

Lo que importa es el cómo. En una app de bienestar, un anuncio que interrumpe rompe la confianza y paga centavos (plan). Se lo aprendemos a Preguntados, que vivió de anuncios (plan), a los juegos de Royal Match y Homescapes, donde el anuncio premiado es siempre elegido, y a Duolingo, que separa a quien paga de quien no (6,7 % de su ingreso es publicidad, plan).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: ingreso por activo diario sin Premium | USD 0,002–0,006 por día (estimación) | AdMob ÷ activos diarios sin Premium |
| Activos que prenden la radio al menos una vez por semana | 15–25 % (estimación) | `radio_recompensa` |
| Vistas por espectador por día | 1,5 de 3 (estimación) | ídem |
| Guardrail: D7 y D30 de quien tiene la radio | sin caída contra la tanda sin radio | experimento, doc 27 |
| Guardrail: conversión a Premium | sin caída | RevenueCat |
| Guardrail: reseñas que mencionan anuncios | 0 negativas por mes | lectura manual |
| Guardrail: herraduras de la radio | ≤ 25 % del ingreso semanal del jugador medio | contadores por fuente (04) |

**Cuánto deja.** eCPM de anuncio con recompensa en la región: USD 1,8 en Android y 3,4 en iOS (plan, estimación de terceros). Con 85 % de Android, unos USD 2,0 por mil vistas (estimación). A 100 mil activos al mes, lineal sobre la tabla del plan: USD 270 a 3.650 por mes (estimación). Es la plata de quien no paga; Premium sigue siendo la base.

## Experiencia
**Dónde está la radio.**
1. En el cuarto de la Casita, sobre la mesa: una radio portátil con antena. Tocarla abre la tarjeta.
2. En la tienda, cuando falta plata para algo: una línea debajo del precio, «¿Te faltan herraduras? Paucho prende la radio». Nunca un botón grande.
3. En «Se nos enfrió el mate», como tercera opción, solo si no tiene termos (ver termo abajo).

**La tarjeta.** Paucho de cerca, con la radio en la mano: «Están pasando la tanda. Si la escuchamos juntos, después me tiro unas herraduras». Debajo: «Es un anuncio de unos 30 segundos. Te quedan {n} de 3 hoy». Botones: «Prender la radio» (verde) y «Ahora no».

**Después.** Paucho baila con la radio un segundo (pose existente) y dice: «¡Qué temazo! Tomá, 15 herraduras». Se suman con la animación de moneda estándar, sin festejo grande.

**El termo.** Si tiene 0 termos y una racha de 3 días o más, la tarjeta ofrece «Escuchar la radio por un termo» en lugar de herraduras. Una vez cada 7 días. Así el termo «se gana, se compra con herraduras o se consigue mirando un anuncio» (plan), y nadie paga plata por la racha.

**Para quien paga.** La radio sigue en el cuarto y pasa cumbia: tocarla hace bailar a Paucho. Nunca muestra la tarjeta ni anuncios. Premium dice en su lista «Sin anuncios», aunque nunca se impongan (17).

**Estados.**
| Estado | Qué ve la persona |
|---|---|
| Tope del día | «Por hoy ya escuchamos bastante radio. Mañana hay más». Radio apagada hasta las 00:00 locales. |
| Sin anuncio disponible | «No está agarrando la señal. Probá en un rato». Sin premio, sin castigo. |
| Cerró el anuncio antes | «Se cortó la tanda. Si querés, la prendemos de nuevo». No cuenta para el tope. |
| Sin conexión | La radio dice «Sin señal en el campo». |
| Primera vez | Antes del primer anuncio, el consentimiento (ver Datos). |

**Nunca, en ningún lugar.** Sin intersticiales, banners, anuncios nativos en listas, videos al abrir, anuncios al terminar un hábito, en la barra llena, el mate de la mañana, una revelación, el minuto de calma, «¿Cómo viene el día?» ni en avisos. Ningún premio de hábito, racha u obra se «duplica mirando un anuncio». La radio nunca aparece en la primera semana.

**Por qué nunca intersticiales ni banners.** El intersticial corta el momento en que la persona se cuidó; leído como castigo, es justo lo contrario de la promesa de bienestar. El banner paga una fracción del anuncio con recompensa (plan: «pagan centavos»), ensucia la escena que es lo mejor de la app, y en un teléfono de 390 pt le quita al mundo de Paucho un 8 % de pantalla. Los dos son publicidad que nadie eligió.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Anuncios por día | 3 | Plan |
| Premio por anuncio | 15 herraduras | 45 por día como techo: ≤ 41 % del medio (415/semana, 04) solo si lo hace todos los días; el promedio real queda cerca de 10 % (estimación) |
| Termo por anuncio | 1 cada 7 días, con 0 termos y racha ≥ 3 | Rescate, no fábrica de termos; el termo vale 150 (04) |
| Día de inicio | día 8 de la cuenta | La primera semana es del juego, no de la tanda |
| Formato | solo «recompensado», hasta 30 s | Elegido y con final conocido |
| Quién lo ve | sin Premium, 18+ declarado | Plan; Google no puede leerla como app infantil |
| Categorías bloqueadas | apuestas, citas, alcohol (plan); además préstamos rápidos y cripto, adelgazamiento y suplementos, política, religión, cirugía estética | Bienestar y el tono de Paucho (30) |
| Mediación | AdMob como mediador; sumar AppLovin, Unity Ads y Meta Audience Network a partir de 100 mil vistas por mes (estimación) | Más ofertas suben el eCPM; antes no vale el trabajo |
| Umbral de encendido | 100 mil activos al mes | Vara del revisor (plan) |
| Tope de frecuencia por anunciante | 1 por día por persona | Que no se repita el mismo |

## Contenido necesario
- 1 tarjeta, 5 estados, 2 líneas en la tienda y el mate frío.
- 30 líneas de Paucho con la radio (antes y después), en voseo: «Pará que esta me encanta», «La radio del pueblo no falla», «Ahí va, cumbia de la buena».
- Arte: radio portátil en fieltro, en el cuarto (1 objeto, 2 estados: apagada y prendida con notas). Pose de baile: reusar el salto.
- Sonido: clic de la perilla y 4 s de cumbia libre de derechos para Premium (confirmar licencia).

## Arte, animación y sonido
La radio es un objeto del cuarto, no un ícono de interfaz: madera clara, antena, una calcomanía. Prendida, salen notitas. Verde para «Prender la radio»; el dorado sigue reservado a premios. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- SDK: AdMob con `@capacitor-community/admob` (plan; compatibilidad con la versión de Capacitor sin verificar). Una unidad «recompensada» por plataforma. La recompensa se acredita con verificación del lado del servidor de AdMob cuando haya cuenta (26); antes, al callback local.
- **Consentimiento UMP.** El SDK de mensajes de Google (UMP) muestra el formulario donde la ley lo pide (España y la Unión Europea, por la diáspora; 32) antes del primer anuncio, y un enlace fijo en Ajustes → Privacidad → «Opciones de anuncios» ([Google UMP](https://developers.google.com/admob/android/privacy)).
- **ATT en iOS.** No se pide. Sin IDFA, los anuncios son no personalizados; se pierde algo de eCPM pero no aparece el cartel de «rastrear» en una app de bienestar. Ver «Preguntas abiertas».
- **Android.** Permiso `AD_ID` declarado; anuncios no personalizados para quien lo rechace en UMP.
- Ningún dato de ánimo, reflexión ni hábitos propios llega al SDK. Sin segmentación por hábitos.
- Estado nuevo: `radio { dia: string, vistos: number, ultimoTermo?: string }`. Contador `ganado.radio` (04).
- Archivos: nuevo `game/radio.ts`, `Casita.tsx`, tienda, la pantalla del mate frío, Ajustes.
- El tope se cuenta por fecha local y, con cuenta, también en el servidor: cambiar el reloj no da más.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `radio_tarjeta_vista` | Se abre la tarjeta | `lugar`, `vistos_hoy`, `premio` |
| `radio_prendida` | Toca «Prender la radio» | `lugar`, `premio` |
| `radio_recompensa` | AdMob confirma | `premio`, `red`, `ecpm_usd` |
| `radio_fallida` | Sin anuncio o cortado | `motivo` |
| `anuncios_consentimiento` | Responde UMP | `resultado`, `pais` |

Ningún evento lleva ánimo ni reflexiones.

## Casos borde y riesgos
- **Anuncio inapropiado que se cuela.** Revisión semanal del «Centro de revisión de anuncios» de AdMob y bloqueo por anunciante; vía de reporte en Ajustes: «Vi un anuncio que no va».
- **Granja de herraduras.** El tope de 3, la fecha local y el contador por fuente lo acotan. Si `ganado.radio` pasa el 25 %, bajar a 10.
- **Racha comprada con atención.** El termo por anuncio es 1 cada 7 días, y solo con 0 termos.
- **Bienestar.** La tarjeta nunca dice que Paucho «necesita» el anuncio ni que se pone triste sin él.
- **Tiendas.** Google: política de anuncios y de apps de salud; Apple 5.1.2 y etiqueta de privacidad con «datos usados para publicidad». Detalle en `docs/tecnico/tiendas-android-ios.md`.
- **Mal eCPM.** En Argentina la cobertura puede ser baja; se mide antes de sumar redes.

## Fases
- **V1 (100 mil activos):** radio en el cuarto, 3 por día, herraduras, UMP, AdMob solo.
- **V2:** termo por anuncio, línea en la tienda y en el mate frío, mediación con 2–3 redes.
- **Más adelante:** verificación del lado del servidor; experimento de premio 10 contra 15.
- **Afuera:** intersticiales, banners, nativos, «duplicá tu premio», anuncios para quien paga.

## Criterios de aceptación
- [ ] Con Premium activo, ningún código pide un anuncio (prueba con el SDK espiado).
- [ ] El tope de 3 se respeta con cambio de hora y reinstalación con cuenta.
- [ ] Ningún anuncio en los momentos vedados (prueba automática por pantalla).
- [ ] UMP aparece antes del primer anuncio con IP de España; el enlace de Ajustes lo reabre.
- [ ] Las seis categorías bloqueadas figuran en AdMob antes de encender.
- [ ] «Ahora no» y cerrar la tarjeta no cambian nada ni muestran otra oferta.
- [ ] A 390×844, la tarjeta deja ver la duración y el contador sin desplazar.

## Preguntas abiertas
1. **¿Anuncios alguna vez?** Es decisión del dueño (plan). Recomiendo sí, con escala, porque es el único aporte de quien no paga y es elegido.
2. **¿Pedir ATT?** Recomiendo no en V1; probarlo recién si iOS supera el 30 % del ingreso por anuncios.
3. **¿100 mil o antes?** Recomiendo una prueba técnica en 50 mil, en Android, solo para medir eCPM real.
4. **¿15 herraduras o un premio que no sea moneda (un mimo para un animalito)?** Recomiendo herraduras y medir: es lo que se entiende al primer toque.
