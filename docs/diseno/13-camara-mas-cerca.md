# 13 · La cámara más cerca
> Estado: propuesta · Etapa: Etapas 1–5 del plan (antes del lanzamiento suave) · Mejora del plan: 13 · Depende de: 12, 14, 15

## En una línea
La escena de Inicio se escala hasta 1,4× centrada en Paucho y se mueve sola hacia la obra cuando pasa algo, para que sus expresiones se lean sin una sola pieza de arte nueva.

## Problema y oportunidad
Paucho ocupa cerca del 19 % del ancho en Inicio y la mitad inferior del arte es tierra naranja lisa (plan). El código lo confirma:

- `AreaScene.tsx` pone el arte al ancho de la pantalla (`width = size.w`) y solo decide la altura: la fila `cardsAt` del arte (0,69 en las Áreas 1 y 2) cae donde empiezan las tarjetas.
- A 390×844 el arte mide 390×585 px. `hero.h` es 21 % del alto: Paucho mide 123 px de alto y unos 80 de ancho (20 % de la pantalla). Su cara son unos 40 px.
- En `area1_scene_0.webp` no hay nada dibujado debajo de y ≈ 1.000 de 1.536: el 35 % inferior es tierra lisa. En Inicio las tarjetas tapan una parte; el resto es la franja vacía entre Paucho y las tarjetas.
- La única cámara que se mueve hoy es `adone-open` (área completada): de 1,35× a 1× en 1.400 ms.

Se lo aprendemos al Inicio de Finch, donde el pajarito llena el tercio central, y a Homescapes, que acerca la cámara a lo que se renueva.

## Objetivo y métricas
- **Primaria:** alto de Paucho en Inicio ≥ 170 px a 390×844 (hoy 123) y ancho ≥ 28 % de la pantalla (hoy 20 %).
- **Secundarias:** toques sobre Paucho por sesión (se espera que suban; evento `paucho_tap`); el juez lee la expresión en una captura sin ampliar.
- **Guardrails:** 3½ tarjetas de hábito siguen a la vista; ningún texto de la barra superior queda tapado; 60 cuadros por segundo durante las transiciones en un Android de 3–4 GB; la memoria de imágenes no sube.

## Experiencia
Cuatro encuadres. Cada uno se define por una escala, un punto del arte que se mira y el lugar de la pantalla donde cae.

1. **Reposo (idle).** Paucho cebando mate o tirando maíz, grande, con los pies 50 px arriba de la fila de chips. Detrás se ven la casa o el galpón recortados; el cielo sale por arriba.
2. **Obra.** Mientras martilla, o cuando la próxima obra brilla («¡Ahora vamos con el fogón!»), la cámara abre un poco y se corre para que entren Paucho y la pila.
3. **Revelación.** Al tocar «¡A ver!», la cámara va a la obra, la deja caer encuadrada (doc 15) y recién después vuelve a Paucho.
4. **Salida.** Barra llena: Paucho camina hacia la obra (doc 14) y la cámara lo sigue; en el viaje y en la salida del día (doc 01) camina hacia el borde y la cámara abre a plano general antes del corte.

El globo de campo (`ascene__say`) sigue saliendo sobre su cabeza; si no entra arriba, sale al costado opuesto a la obra. Con «reducir movimiento» activado, los encuadres cambian por corte con un fundido de 150 ms.

Estado vacío (área terminada, sin obra): queda el encuadre de reposo. Error: si el contenedor mide 0, se usa escala 1 (comportamiento actual).

## Reglas y números
Encuadres. El foco se da en % del arte; el ancla, en la pantalla.

| Estado | Escala | Foco (arte) | Ancla (pantalla) | Cuándo |
|---|---|---|---|---|
| Reposo | 1,40 | pies de Paucho (`hero.x`, `hero.y`) | x 50 %, y = `cardsTop` − 50 px | `status` charging, sin fase |
| Obra | 1,20 | punto medio entre Paucho y el centro de la pila | x 50 %, y = `cardsTop` − 50 px | `status` working; fase `next` |
| Revelación | la que deja la caja de la obra al 80 % del ancho, entre 1,0 y 1,6 | centro de la caja de la obra | x 50 %, y 40 % del alto libre | fases `reveal` y `tell` |
| Salida | 1,40 → 1,00 | Paucho mientras camina; después el centro del área | x 50 % | `startWork`, viaje, salida del día |
| Área completada | 1,35 → 1,00 | centro (`focusY`) | centro | `AreaDone`, sin cambios |

Con escala 1,40 a 390×844: arte de 546×819 px, Paucho de 172 px de alto y 112 de ancho (29 % de la pantalla), cara de unos 56 px. `cardsTop` es 481; los pies caen en y = 431 y la cabeza en y ≈ 259, con 139 px libres hasta la barra superior para el globo (borde inferior de la barra ≈ 120 px, estimación).

Transiciones:

| De → a | Duración | Curva | Nota |
|---|---|---|---|
| Reposo → Obra | 600 ms | `cubic-bezier(0.45, 0, 0.2, 1)` | la misma de `adone-open` |
| Obra → Reposo | 500 ms | igual | |
| → Revelación | 700 ms | igual | termina 100 ms antes de que tiemble la pila |
| Revelación → Reposo | 900 ms | `cubic-bezier(0.3, 0, 0.2, 1)` | arranca cuando Paucho termina de hablar |
| Seguimiento al caminar | continuo | lineal, atraso de 120 ms | la cámara nunca se adelanta a Paucho |
| Entrada a Inicio (cambio de pestaña) | 0 ms | — | la cámara ya está en su lugar |
| Primera vez del día | 1.000 ms de 1,15 a 1,40 | salida suave | un solo acercamiento al abrir la app |

Otras reglas:

| Regla | Valor | Por qué |
|---|---|---|
| Escala máxima | 1,40 | más arriba el arte de 1.024 px se ve blando |
| Escala por alto de pantalla | `min(1,40; (cardsTop − 46 − 120 − 8) / alto de Paucho a 1×)`, piso 1,00 | que la cabeza no toque la barra superior |
| Límite horizontal | el arte nunca deja ver su borde: `left` entre `−(ancho escalado − ancho de pantalla)` y 0 | sin franjas |
| Límite vertical | arriba, el degradado de cielo; abajo, el color `ground` (ya existen) | sin costuras |
| Una transición por vez | la nueva reemplaza a la anterior desde donde está | sin saltos |

**La tierra lisa.** Con el encuadre de reposo, la franja vacía entre Paucho y las tarjetas baja de unos 90 px a 50 px, y lo que queda del arte por debajo está tapado por las tarjetas. No se recorta el archivo: el viaje, «Áreas» (`whole`) y el área completada usan el arte entero. En V2 la franja de 50 px se llena con vida chica (pasto, una gallina que cruza, el perro), no con arte de fondo nuevo.

## Contenido necesario
Ninguna pieza de arte nueva en V1. Textos: ninguno. En V2, 3 o 4 sprites de primer plano (mata de pasto, piedra, flor) de la hoja del doc 12.

## Arte, animación y sonido
- **Resolución.** Las etapas miden 1.024 px de ancho. A 1,40× se muestran a 546 px CSS:

| Teléfono | Píxeles reales a 1,40× | Relación con el arte | Lectura |
|---|---|---|---|
| Android 360 de ancho, densidad 2 | 1.008 | 0,98× | nítido |
| Android 360 de ancho, densidad 3 | 1.512 | 1,48× | algo blando |
| iPhone 390, densidad 3 | 1.638 | 1,60× | blando; hoy ya es 1,14× |

  El fieltro tolera bien la ampliación; los bordes duros (cerco, tejas) son los que la delatan. V1 sale con el arte actual y lo decide el juez en un iPhone. Si no pasa, V2 exporta las etapas a 1.536×2.304 solo para densidad 3: de 6,3 MB a 14,2 MB decodificados por etapa (ancho × alto × 4), por eso no va por defecto.
- **Personajes.** Paucho de campo tiene cajas de 640×990 y 420×530: a 172 px CSS × 3 quedan por debajo de su tamaño de origen. No se tocan.
- **Sombras y globos** escalan con el escenario porque ya están en unidades del contenedor (`cqw`).
- **Sonido:** un soplo de aire de 300 ms a −18 dB solo en la ida a la revelación (doc 15). Las demás transiciones son mudas.
- Reglas generales de encuadre y composición: `docs/visual/guia-visual.md`.

## Datos y técnica
- Sin cambios al guardado.
- `AreaScene.tsx`: hoy calcula `width` y `top` y aplica `translate`. Pasa a calcular `{escala, left, top}` desde un encuadre y aplica `transform: translate(…) scale(…)` con origen arriba a la izquierda. El ancho de layout del escenario no cambia, así que las unidades `cqw` y los porcentajes de `journey.ts` siguen valiendo.
- Prop nueva `shot: 'idle' | 'obra' | 'reveal' | 'leave' | 'whole'` (reemplaza a `whole`); `Home.tsx` la deriva de `status` y `phase`.
- `journey.ts`: campo opcional `shots` por área para ajustar a mano el foco de cada encuadre.
- `index.css`: `.ascene__stage { transition: transform var(--cam-ms) var(--ease-cam); will-change: transform }`; tokens nuevos `--ease-cam` y `--cam-ms`, también en el sistema de diseño.
- Rendimiento: solo se anima `transform` (capa compuesta). Medir en un Android barato con las 163 reglas de animación que ya corren (plan).
- Funciona sin conexión; no usa servicios.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `paucho_tap` | toque sobre Paucho en Inicio | `shot`, `area`, `status` |
| `camera_scale_clamped` | una vez por instalación si la escala quedó debajo de 1,40 | `scale`, `screen_w`, `screen_h` |

## Casos borde y riesgos
- **Pantallas bajas (360×640).** `cardsTop` da 277 px; quedan 103 px entre la barra superior y los chips, menos que Paucho a 1× (113 px). La regla de escala lo deja en 1,00: no mejora ni empeora. Para ganar tamaño ahí hay que mostrar 2½ tarjetas (ver preguntas abiertas). En 360×800 la escala 1,40 entra completa.
- **La obra queda fuera de cuadro en reposo.** Es buscado; el encuadre «Obra» la trae cuando importa, y el ícono de la obra sigue al final de la barra.
- **Área 3 (provisoria, arte cuadrado, `cardsAt` 0,95).** Usa escala 1,15 hasta que llegue su arte.
- **Mareo.** Ninguna transición supera 900 ms ni encadena dos movimientos; se respeta «reducir movimiento».
- **El perro y las gallinas quedan cortados por el borde.** Se acepta el corte lateral; nunca un personaje cortado por las tarjetas.
- Sin impacto en bienestar ni en la revisión de tiendas.

## Fases
- **V1 (2 días, estimación):** encuadres de reposo, obra y revelación; transiciones; regla de escala; pruebas en 360×640, 360×800 y 390×844.
- **V2:** seguimiento al caminar (necesita el ciclo del doc 14); vida de primer plano; etapas a 1.536 px si el juez lo pide.
- **Más adelante:** paralaje entre cielo, sierras y escenario al mover la cámara.
- **Afuera:** pellizcar para acercar o arrastrar la escena a mano.

## Criterios de aceptación
- [ ] A 390×844, Paucho mide ≥ 170 px de alto en reposo y sus pies quedan 50 ± 4 px sobre los chips.
- [ ] A 360×640, nada tapa la barra superior ni los chips; la escala es ≥ 1,00.
- [ ] Se ven 3½ tarjetas en los tres tamaños.
- [ ] Nunca aparece un borde del arte ni una franja de color entre arte y fondo.
- [ ] Reposo → Obra dura 600 ± 30 ms; la ida a la revelación termina antes del temblor de la pila.
- [ ] El globo de campo entra completo en pantalla en los cuatro encuadres.
- [ ] «Áreas», el viaje y el área completada se ven igual que antes.
- [ ] Con «reducir movimiento», no hay desplazamiento animado.
- [ ] Capturas a 390×844 y 360×640 de cada encuadre, revisadas por el juez.

## Preguntas abiertas
1. **¿2½ tarjetas en pantallas de menos de 700 px de alto?** Cambia una decisión tomada (3½, como Finch). Recomiendo que sí, solo ahí: gana 78 px y Paucho llega a 1,40×.
2. **¿El reposo deja la obra fuera de cuadro?** Recomiendo que sí; la alternativa (1,25× con la pila adentro) deja a Paucho en 154 px.
3. **¿Acercamiento de 1.000 ms al abrir la app cada día?** Recomiendo probarlo una semana; si cansa, queda solo el primer día.
4. **¿Etapas a 1.536 px para iPhone?** Recomiendo esperar la captura real antes de pagar 8 MB más de memoria por etapa.
