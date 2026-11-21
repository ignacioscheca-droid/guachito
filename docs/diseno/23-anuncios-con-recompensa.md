# 23 · Anuncios con recompensa
> Estado: propuesta · Etapa: Con escala · Mejora del plan: — (Monetización, pieza 7) · Depende de: 04, 08, 17, 26, 27

## En una línea
Quien no paga puede, si quiere, prender la radio de Paucho hasta tres veces por día: escucha una tanda y Paucho le pasa herraduras o, de vez en cuando, un termo.

## Problema y oportunidad
Paga el 1,5 % de quien instala (plan); el resto no aporta nada. Los anuncios no son base: con 10 mil activos al mes dejan USD 27 a 365 por mes (plan). Por eso entran con escala, con la vara en 100 mil activos: antes dan pocos dólares por día y cuestan un SDK y un flujo de consentimiento (plan).

Importa el cómo. En bienestar, el anuncio que interrumpe rompe la confianza y paga centavos (plan). Se lo aprendemos a Preguntados, que vivió de anuncios (plan), a Royal Match y Homescapes, donde el anuncio premiado siempre se elige, y a Duolingo, que separa a quien paga (6,7 % de su ingreso es publicidad, plan).

## Objetivo y métricas
| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| Primaria: ingreso por activo diario sin Premium | USD 0,002–0,006 por día (estimación) | AdMob ÷ activos diarios sin Premium |
| Activos que prenden la radio cada semana | 15–25 % (estimación) | `radio_recompensa` |
| Guardrail: D7, D30 y conversión a Premium | sin caída contra la tanda sin radio | experimento, 27 |
| Guardrail: herraduras de la radio | ≤ 25 % del ingreso semanal del jugador medio | contadores por fuente (04) |

**Cuánto deja.** eCPM de la región: USD 1,8 en Android y 3,4 en iOS (plan, estimación de terceros); con 85 % de Android, unos USD 2,0 (estimación). A 100 mil activos, lineal sobre el plan: USD 270 a 3.650 por mes (estimación).

## Experiencia
**Dónde está la radio.**
1. En el cuarto, sobre la mesa: una radio portátil con antena. Tocarla abre la tarjeta.
2. En la tienda, si falta plata: una línea chica bajo el precio, «¿Te faltan herraduras? Paucho prende la radio».
3. En «Se nos enfrió el mate», como tercera opción, solo sin termos (abajo).

**La tarjeta.** Paucho de cerca, con la radio: «Están pasando la tanda. Si la escuchamos juntos, después me tiro unas herraduras». Debajo: «Es un anuncio de unos 30 segundos. Te quedan {n} de 3 hoy». Botones: «Prender la radio» (verde) y «Ahora no».

**Después.** Paucho baila un segundo (pose del salto): «¡Qué temazo! Tomá, 15 herraduras». Animación de moneda estándar, sin festejo grande.

**El termo.** Con 0 termos y racha de 3 días o más, la tarjeta ofrece «Escuchar la radio por un termo». Una vez cada 7 días. Así el termo «se gana, se compra con herraduras o se consigue mirando un anuncio» (plan), y nadie paga plata por la racha.

**Para quien paga.** La radio pasa cumbia y hace bailar a Paucho. Nunca hay tarjeta ni anuncio. Premium lista «Sin anuncios» (17).

**Estados.**
| Estado | Qué ve la persona |
|---|---|
| Tope del día | «Por hoy ya escuchamos bastante radio. Mañana hay más». |
| Sin anuncio o sin conexión | «No está agarrando la señal. Probá en un rato». Sin premio ni castigo. |
| Cerró antes | «Se cortó la tanda. Si querés, la prendemos de nuevo». No cuenta para el tope. |

**Nunca.** Sin anuncios al abrir, al terminar un hábito, en la barra llena, el mate de la mañana, una revelación, el minuto de calma, «¿Cómo viene el día?» ni en avisos. Nada de «duplicá tu premio mirando un anuncio». Nada en la primera semana.

**Por qué nunca intersticiales ni banners.** El intersticial corta el momento en que la persona se cuidó y se lee como castigo: lo contrario de la promesa. El banner paga centavos (plan), ensucia la escena, que es lo mejor de la app, y le quita un 8 % de pantalla a 390 pt. Los dos son publicidad que nadie eligió.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Anuncios por día | 3 | Plan |
| Premio | 15 herraduras | Techo de 315 por semana; el uso real queda cerca del 10 % del ingreso del medio, 415/semana (04; estimación) |
| Termo por anuncio | 1 cada 7 días, con 0 termos y racha ≥ 3 | Rescate, no fábrica; el termo vale 150 (04) |
| Desde | día 8 de la cuenta | La primera semana es del juego |
| Formato | solo recompensado, hasta 30 s | Elegido, con final conocido |
| Quién | sin Premium; app declarada 18+ | Plan |
| Categorías bloqueadas | apuestas, citas, alcohol (plan); además préstamos rápidos, cripto, adelgazamiento, suplementos, política, religión, cirugía estética | Bienestar y tono (30) |
| Mediación | AdMob como mediador; sumar AppLovin, Unity Ads y Meta Audience Network desde 100 mil vistas por mes (estimación) | Más ofertas suben el eCPM |
| Encendido | 100 mil activos al mes | Vara del revisor (plan) |

## Contenido necesario
- 1 tarjeta, 3 estados, la línea de la tienda y la del mate frío.
- 30 líneas de Paucho con la radio: «Pará que esta me encanta», «Ahí va, cumbia de la buena».
- Arte: la radio en fieltro, apagada y prendida con notitas. Sonido: clic de perilla y 4 s de cumbia libre de derechos (confirmar licencia).

## Arte, animación y sonido
La radio es un objeto del cuarto, no un ícono: madera clara, antena, una calcomanía. Verde para «Prender la radio»; el dorado sigue siendo de premios. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
- AdMob con `@capacitor-community/admob` (plan; compatibilidad con Capacitor sin verificar). Una unidad recompensada por plataforma; verificación del lado del servidor cuando haya cuenta (26).
- **UMP.** El SDK de mensajes de Google muestra el consentimiento donde la ley lo pide (España y la Unión Europea, por la diáspora; 32) antes del primer anuncio; enlace fijo en Ajustes → Privacidad → «Opciones de anuncios» ([Google UMP](https://developers.google.com/admob/android/privacy)).
- **ATT.** No se pide en iOS: sin IDFA, anuncios no personalizados. Se pierde algo de eCPM, pero no aparece el cartel de «rastrear» en una app de bienestar.
- **Android.** Permiso `AD_ID`; no personalizados para quien lo rechace en UMP.
- Ningún dato de ánimo, reflexión ni hábitos llega al SDK.
- Estado: `radio { dia, vistos, ultimoTermo? }`; contador `ganado.radio` (04). El tope va por fecha local y, con cuenta, en el servidor.
- Archivos: nuevo `game/radio.ts`, `Casita.tsx`, tienda, mate frío, Ajustes.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `radio_tarjeta_vista` | Se abre la tarjeta | `lugar`, `vistos_hoy`, `premio` |
| `radio_recompensa` | AdMob confirma | `premio`, `red`, `ecpm_usd` |
| `radio_fallida` | Sin anuncio o cortado | `motivo` |
| `anuncios_consentimiento` | Responde UMP | `resultado`, `pais` |

Ningún evento lleva ánimo ni reflexiones.

## Casos borde y riesgos
- **Anuncio que se cuela.** Revisión semanal del centro de revisión de AdMob; en Ajustes, «Vi un anuncio que no va».
- **Granja de herraduras.** Tope, fecha local y contador por fuente. Si `ganado.radio` pasa el 25 %, bajar a 10.
- **Bienestar.** La tarjeta nunca dice que Paucho «necesita» el anuncio ni se pone triste sin él.
- **Tiendas.** Política de anuncios y de apps de salud de Google; Apple 5.1.2 y etiqueta de privacidad. Detalle en `docs/tecnico/tiendas-android-ios.md`.

## Fases
- **V1 (100 mil activos):** radio, 3 por día, herraduras, UMP, AdMob solo.
- **V2:** termo por anuncio, entradas de tienda y mate frío, mediación.
- **Afuera:** intersticiales, banners, nativos, «duplicá tu premio», anuncios para quien paga.

## Criterios de aceptación
- [ ] Con Premium, ningún código pide un anuncio (SDK espiado).
- [ ] El tope de 3 resiste cambio de hora y reinstalación con cuenta.
- [ ] Ningún anuncio en los momentos vedados (prueba por pantalla).
- [ ] UMP aparece antes del primer anuncio desde España; Ajustes lo reabre.
- [ ] Las categorías bloqueadas figuran en AdMob antes de encender.
- [ ] A 390×844, duración y contador visibles sin desplazar.

## Preguntas abiertas
1. **¿Anuncios alguna vez?** Es tuya (plan). Recomiendo sí, con escala: es el único aporte de quien no paga y es elegido.
2. **¿Pedir ATT?** Recomiendo no; probarlo si iOS pasa el 30 % del ingreso por anuncios.
3. **¿Prueba antes de 100 mil?** Recomiendo una técnica en 50 mil, en Android, para medir el eCPM real.
