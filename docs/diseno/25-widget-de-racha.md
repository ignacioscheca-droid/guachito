# 25 · Widget de racha
> Estado: propuesta · Etapa: Etapas 1–5 del plan (con el envoltorio Capacitor) · Mejora del plan: 8 · Depende de: 08, 12, 16, 26

## En una línea
Un widget de pantalla de inicio con Paucho y el mate: humeante si hoy cebaste, frío si falta, con el número de la racha; es el único recordatorio que no se puede silenciar.

## Problema y oportunidad
Fuera de la app, la racha no existe.

- Hoy la racha solo se ve al abrir: el chip «🧉 N» de Inicio y `StreakDay`. No hay widget (plan, mejora 8).
- En Duolingo, la mitad de quienes usan el widget de racha tienen rachas de 6 meses o más (sin causalidad medida, plan). Finch muestra a su mascota de aventura o durmiendo (plan).
- El widget es además la función nativa que baja el riesgo de la regla 4.2 de Apple («funcionalidad mínima») para una app envuelta (plan).
- Los widgets no se pueden hacer en la capa web: es el único código nativo propio del plan.
- En Android, que es 81–87 % de los teléfonos (plan), las alarmas de avisos a veces se pierden; el widget cubre ese hueco.

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: usuarios D7+ con widget instalado | 15 % | `widget_installed`, estado leído al abrir la app |
| Aperturas desde el widget | 10 % de las sesiones de quienes lo tienen | `session_start` con `source=widget` |
| Racha media, con y sin widget | se informa como correlación, igual que Duolingo | cohortes, doc 27 |
| Días con mate cebado antes de las 12:00 | +5 puntos en quienes lo tienen | `mate_cebado.hour_local` |
| Guardrail: widget quitado en 7 días | < 20 % | `widget_removed` |
| Guardrail: dato viejo en pantalla | 0 casos de «humeante» sin haber cebado hoy | prueba de QA con cambio de día |

## Experiencia
**Cómo se descubre.** Al cumplir 3 días de racha, después de `StreakDay`, Paucho de cerca: «¿Sabías que puedo quedarme en tu pantalla? Así ves el mate sin abrir nada.» → «Mostrame cómo» / «Ahora no». Se ofrece una vez; queda en Ajustes → «Widget».
- Android: «Mostrame cómo» abre el diálogo del sistema para fijar el widget (`requestPinAppWidget`).
- iPhone: tres pasos ilustrados (mantener apretado, «+», buscar Gauchito); el sistema no permite agregarlo desde la app.

**Tamaños**
| Tamaño | iOS | Android | Qué muestra |
|---|---|---|---|
| Chico | `systemSmall` | 2×2 celdas | Paucho con el mate, número de racha, una palabra de estado |
| Mediano | `systemMedium` | 4×2 celdas | lo mismo a la izquierda; a la derecha una línea de Paucho y los 7 días de la semana con su tilde |

**Estados.** Se calculan en el widget con tres datos guardados: último día cebado, racha y hora local.
| Estado | Condición | Imagen | Texto (mediano) |
|---|---|---|---|
| Cebado | el último mate es de hoy | Paucho sorbe, vapor, fondo de día | «¡Qué rico estuvo! {n} mates seguidos.» |
| Amanecer | falta, 5:00–11:59 | Paucho despeinado con la pava | «Buen día. La pava ya silba.» |
| Tarde | falta, 12:00–18:59 | mate sin vapor en la mesa, Paucho lo mira | «El mate de hoy te espera.» |
| Noche | falta, 19:00–23:59 | mate frío, farol encendido | «Todavía estamos a tiempo.» |
| Madrugada | 0:00–4:59 | Paucho duerme, sombrero sobre la cara | «Zzz…» |
| Obra lista | hay obra terminada sin ver (gana a los demás, salvo de madrugada) | Paucho señala la lona | «¡Terminé! Vení a ver.» |
| Cebado de noche | cebado, 21:00 en adelante | Paucho duerme con el mate al lado | «Hasta mañana.» |
| Pausa | el último mate es de antes de ayer | Paucho en el alero con la pava | «Acá hay agua calentita.» Sin número. |
| Sin datos | recién instalado, sin primera sesión | Paucho saluda | «Tocá para conocer a Paucho.» |

- El chico muestra solo la palabra: «¡Cebado!», «Te espera», «A tiempo», «Zzz», «¡Listo!».
- En «Pausa» no se muestra número ni mate frío: qué pasa con la racha (termo, recalentar) lo resuelve la app al abrir, y el widget no adelanta malas noticias.
- Con termo en mano, el estado «Noche» agrega un termo chico al lado del mate.

**Al tocar.** Abre la app: si falta el mate, en `StreakDay`; si hay obra lista, en Inicio con «¿La vemos?»; si no, en Inicio. No se ceba desde el widget: el gesto de deslizar es el ritual.

**Errores.** Si no puede leer los datos, muestra «Sin datos» y al tocar abre la app, que reescribe el puente.

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Cortes horarios | 5:00, 12:00, 19:00, 21:00, 0:00 | cinco cambios visibles por día, sin gastar refrescos |
| Refresco inmediato | al cebar, al arrancar o terminar una obra, al cambiar nombre o piel del mate | la app avisa al sistema |
| iOS: línea de tiempo | entradas precalculadas para las próximas 48 h en los cortes y en el fin de obra; política `.atEnd` | el sistema no garantiza refrescos; el presupuesto diario ronda 40–70 ([Apple](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date), a verificar) |
| Android: actualización | `WorkManager` en cada corte (±15 min) y `updatePeriodMillis` de 30 min como respaldo | el mínimo del sistema es 30 min; sin alarmas exactas |
| Cambio de día | el widget compara «último día cebado» con la fecha local | a medianoche pasa a «falta» sin que la app corra |
| Número mostrado | la racha guardada; oculto en «Pausa» | nunca muestra una caída |
| Oferta del widget | día 3 de racha, una sola vez | ya hay algo que cuidar |
| Peso de imágenes | PNG de 360 px como máximo, menos de 150 KB cada una | las extensiones de widget tienen poca memoria |
| Texto | hasta 34 caracteres en mediano, 9 en chico | entra en una línea |

## Contenido necesario
- **Imágenes:** 9 estados × 2 recortes (cuadrado y apaisado) = 18, más la variante con mate de plata para «Cebado» y «Tarde» (doc 08) y el termo chico. Total 23.
- **Textos:** 3 variantes por estado para el mediano (27 líneas) y 9 palabras para el chico. Rotan por día, como `pick` en `sw.js`.
- **Guía de instalación:** 3 ilustraciones para iPhone.
- **Vista previa** para la galería de widgets de cada sistema: 2 por plataforma.

## Arte, animación y sonido
El widget es una imagen fija por estado; ni iOS ni Android permiten animación libre.

- Paucho ocupa cerca del 60 % del alto en el chico. El número va grande, arriba a la derecha, con el ícono del mate.
- El vapor distingue «Cebado» de «Tarde» a simple vista: es la señal principal, antes que el texto.
- Fondo por franja: celeste de mañana, ocre de tarde, azul de noche; se toman de los tokens de `index.css` y de la escena de `StreakDay`.
- Un solo estilo (doc 12): las poses salen del juego `mate_*`; faltan dos nuevas, dormido y despeinado con la pava.
- iOS 18 puede teñir los widgets: se entrega también una versión de un tono para el modo tintado.
- Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
**Puente desde Capacitor.** Un plugin propio y chico, `WidgetBridge`, con un método: `set(data)`.
- iOS: escribe en `UserDefaults(suiteName: "group.<bundle>.widget")` (App Group compartido entre app y extensión) y llama a `WidgetCenter.shared.reloadAllTimelines()`.
- Android: escribe en `SharedPreferences("widget")` y llama a `GlanceAppWidget.updateAll()`.

**Datos que cruzan** (un JSON de menos de 1 KB):
```
{ v: 1, mateDay: "2027-03-14", streak: 12, termos: 1, mateSkin: "calabaza",
  pauchoName: "Paucho", week: ["2027-03-08", …],   // días con mate de la semana
  work: { status: "working", doneAt: 1741960800000 }, textSeed: 3 }
```
Es la misma idea que `reminderSnapshot.ts`: una foto mínima del estado. No cruza nada de hábitos, ánimo ni reflexiones.

- **Cuándo se escribe:** un `subscribe` del `store.ts` con espera de 300 ms, como `startReminderSnapshots`, y al abrir la app.
- **iOS:** extensión WidgetKit en SwiftUI, `StaticConfiguration`, familias `systemSmall` y `systemMedium`. El proveedor arma la línea de tiempo con los cortes horarios y `doneAt`. Enlace al tocar: `widgetURL("gauchito://mate")`.
- **Android:** `GlanceAppWidget` (Jetpack Compose), receptor con dos tamaños declarados; trabajo periódico para los cortes. `PendingIntent` a la actividad principal con la misma ruta.
- **Rutas:** `App.tsx` atiende `gauchito://mate` y `gauchito://obra` con `@capacitor/app` (`appUrlOpen`).
- **Archivos nuevos:** `ios/App/GauchitoWidget/`, `android/app/src/main/java/.../widget/`, `app/src/game/widgetBridge.ts`.
- **Sin conexión:** todo es local. Con cuenta (doc 26), al restaurar en otro teléfono la primera apertura reescribe el puente.
- **Pruebas:** la función de estado (`widgetState(data, now)`) se escribe una vez en TypeScript con sus tests y se porta a Swift y Kotlin con la misma tabla de casos.

## Analítica
Los widgets no mandan eventos; todo se registra desde la app.
| Evento | Cuándo | Propiedades |
|---|---|---|
| `widget_offer_shown` / `widget_offer_answered` | oferta de Paucho | `answer`, `streak` |
| `widget_installed` | la app detecta un widget activo al abrir | `size`, `platform` |
| `widget_removed` | antes había y ya no | `days_installed` |
| `session_start` | apertura | `source=widget`, `widget_state` |
| `mate_cebado` | «¡Dale!» | `source=widget` si la sesión vino de ahí |

Detección: `WidgetCenter.getCurrentConfigurations` en iOS y `AppWidgetManager.getAppWidgetIds` en Android, expuestas por el plugin.

## Casos borde y riesgos
- **Dato viejo.** Si la app no corre en días, el widget sigue correcto porque compara fechas; pasa a «Pausa» solo.
- **Reloj o huso cambiados.** Se usa la hora local del teléfono; al abrir la app se reescribe.
- **Culpa.** El mate frío habla del mate, no de la persona. Ningún texto dice «perdiste» ni cuenta días de ausencia; en «Pausa» no hay número.
- **Android barato.** Algunas marcas frenan los trabajos en segundo plano: el cambio de franja puede demorar; `updatePeriodMillis` es el respaldo.
- **Presupuesto de iOS.** Por eso la línea de tiempo va precalculada y no se piden refrescos periódicos.
- **Memoria.** Imágenes chicas y una sola por estado; probar en el iPhone más viejo admitido.
- **Tiendas.** El widget es gratis siempre. Las pieles pagas del mate, si existen (doc 17), solo cambian la imagen.
- **Privacidad.** El widget se ve con el teléfono en la mesa: solo muestra el mate y un número.

## Fases
- **V1:** chico y mediano en Android primero (el plan va con Android primero), después iOS; 9 estados; oferta al día 3.
- **V2:** pantalla de bloqueo en iOS 16+ (`accessoryCircular`: mate lleno o vacío con el número; `accessoryRectangular`: mate, número y una palabra; `accessoryInline`: «🧉 12 · te espera»), mate de plata, estado de racha de a dos (doc 09). Android no tiene widgets de bloqueo en teléfonos.
- **Más adelante:** Paucho de salida (doc 01), widget grande con el rancho, Actividad en vivo con la cuenta regresiva de la obra.
- **Afuera:** cebar desde el widget, widget configurable.

## Criterios de aceptación
- [ ] Tras cebar, el widget pasa a «Cebado» en menos de 5 segundos al volver a la pantalla de inicio.
- [ ] A medianoche pasa a «falta» sin abrir la app, en ambos sistemas.
- [ ] Los cortes de 5:00, 12:00, 19:00 y 21:00 se reflejan con no más de 30 min de demora en Android y 15 en iOS.
- [ ] Con el último mate de antes de ayer, muestra «Pausa» sin número.
- [ ] Tocar con el mate pendiente abre `StreakDay`; con obra lista, abre Inicio con la invitación.
- [ ] Los dos tamaños se leen en claro, oscuro y tintado.
- [ ] El JSON del puente no contiene hábitos ni textos escritos por la persona.
- [ ] La tabla de casos de `widgetState` pasa igual en TypeScript, Swift y Kotlin.

## Preguntas abiertas
1. **Android o iOS primero.** Recomiendo Android (mercado), salvo que Apple objete la 4.2 en la primera revisión.
2. **«Obra lista» en el widget.** Compite con la racha. Recomiendo que gane: es la mejor razón para abrir.
3. **Número en «Pausa».** Recomiendo ocultarlo; la alternativa es mostrar el récord.
4. **Momento de la oferta.** Día 3 o al llegar a 7. Recomiendo día 3 y probar contra 7 (doc 27).
5. **Poses nuevas.** Dormido y despeinado sirven también para los estados bajos de doc 06; recomiendo pedirlas en la misma tanda.
