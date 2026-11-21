# Guía visual de Gauchito

> Estado: guía viva · Aplica a toda funcionalidad nueva desde el lanzamiento suave · Se apoya en: 12 (un solo estilo, aprobado), 13 (cámara más cerca, aprobado), 14 (Paucho se mueve), 15 (ceremonias, festejo y sonido)

Esta guía dice cómo tiene que verse, moverse y sonar Gauchito, qué está mal hoy y qué se revisa antes de lanzar algo nuevo. Cada regla tiene un ID (`PJ-03`) para citarla en una revisión. Las capturas son de la rama `areas` a 390×844; los recuadros rojos marcan lo que hay que corregir y los verdes, lo que hay que copiar.

Cómo usarla: al diseñar, leé el capítulo que toca. Al lanzar, recorré la checklist del final con los ID. Si una regla choca con una decisión del dueño, gana la decisión y la regla se corrige acá.

---

## 1. Principios

**P1 · Un solo Paucho, idéntico en todas partes.** El Paucho de fieltro (`mate_*`, sombrero de ala ancha) es el único modelo. Por qué: al lado de Finch en la tienda lo que delata a una app chica no es la calidad de cada pieza sino la mezcla (plan). Se lo aprendemos a Duolingo: Duo es el mismo búho en la app, los avisos, el ícono, las tarjetas y las redes. Con dos Pauchos en la misma ceremonia, el jugador no sabe cuál es «su» compañero.

**P2 · Paucho primero, la interfaz después.** Lo que se mira en Inicio es Paucho, no la barra ni las tarjetas. Por qué: el vínculo con un compañero se arma leyéndole la cara, y una cara de 40 px no se lee (doc 13). Se lo aprendemos a Finch, donde el pajarito ocupa el tercio central de Inicio y todo lo demás se ordena alrededor.

**P3 · Lo diario es corto; lo raro se siente raro.** Un festejo que se repite todos los días dura ≤ 3 s y no pide toques; la ceremonia grande queda para lo que pasa una vez. Por qué: si todo festeja igual, nada festeja. Se lo aprendemos a Royal Match: el fin de nivel normal es un golpe de 2 s y el cofre de hito tiene su propia puesta en escena. Duolingo hace lo mismo con la extensión de racha diaria (corta) frente a los hitos de 7, 30 y 365 días (largos).

**P4 · El color dice qué hacer y qué ganaste.** Verde = la acción principal; dorado = premio (herraduras, cofres, hitos). Nada más es dorado. Por qué: el color es la señal más rápida de la pantalla; si el dorado está en todos los botones, el premio pierde valor (plan). Se lo aprendemos a Duolingo (botón verde único, oro solo para logros) y a Royal Match (botón verde de jugar, monedas y cofres en oro).

**P5 · Un mundo de fieltro con una sola luz.** Todo objeto (íconos, prendas, animalitos, escenas) es del mismo material, con la luz arriba a la izquierda a 45°, sombra propia suave y sin brillo metálico. Por qué: un ícono metálico al lado de uno de fieltro se lee como un parche. Se lo aprendemos a Homescapes y a Animal Crossing: hasta el ícono más chico parece un objeto del mismo mundo.

**P6 · Todo se mueve con intención y con peso.** Cada movimiento tiene anticipación, acción y asentamiento, con curvas distintas para entrar, salir y festejar. Por qué: hoy todo rebota con la misma curva (22 usos) y Paucho se teletransporta; así nada tiene peso (plan). Se lo aprendemos al rey de Royal Match, que actúa con todo el cuerpo, y al pajarito de Finch, que camina, se duerme y se estira.

**P7 · Amable siempre, también cuando no hiciste nada.** Lo visual nunca reta: ni rojo de alarma, ni Paucho llorando por tu ausencia, ni fuego que se apaga. Los estados bajos de Paucho hablan de *su* día (tiene sueño, hace frío), nunca de lo que no hiciste. Por qué: es una app de bienestar con público 18+ y tiendas que miran esto; la culpa sube bajas de avisos. Se lo aprendemos a Finch, que trata el día salteado sin castigo.

---

## 2. Auditoría de hoy

Lo que sigue sale del capítulo «Arte y animación» del plan, verificado sobre las capturas a 390×844, el arte de `app/public/a/` y `index.css` de la rama `areas`. Severidad: **A** = se ve en la primera sesión o delata la app en la tienda; **B** = se ve todos los días; **C** = pulido.

![Inicio de hoy con lo que hay que corregir](img/hoy-inicio.jpg)

*Inicio, día 0. 1: Paucho ocupa ~19 % del ancho y su cara no se lee. 2: hueco blanco en las sierras. 3: franja de tierra lisa. 4: la energía (+10 ⚡) y la barra en dorado-naranja, el mismo color que los premios. 5: pestañas bloqueadas en gris con candado, de cuatro dialectos.*

| # | Problema | Evidencia | Sev. | Arreglo | Doc |
|---|---|---|---|---|---|
| 1 | **Dos Pauchos.** El del artista (`g_*`, sombrero chico, sombreado plano) y el de fieltro (`mate_*`, ala ancha) conviven en la misma ceremonia y en la barra de pestañas | `img/no-dos-pauchos.jpg`; Reveal.tsx:186 (`g_jump` y 1,7 s después `mate_b4`); `g_avatar` en pestaña Paucho (`img/hoy-pestana-paucho.jpg`) | A | Rehacer las 6 `g_*` visibles en fieltro; avatar recortado de `mate_b2` | 12 |
| 2 | **Paucho chico.** ~75 px de ancho (19 %) y cara de ~40 px en Inicio; la mitad inferior del arte es tierra lisa | `img/hoy-inicio.jpg`; AreaScene.tsx (`width = size.w`) | A | Cámara 1,40× centrada en Paucho (doc 13); objetivo ≥ 28 % en V1 y ~35 % con pose de reposo nueva (PJ-05) | 13 |
| 3 | **Cicatrices en la primera escena.** Placas verdes planas sobre los dos troncos y hueco blanco en las sierras de `area1_scene_0` (las etapas 1–3 lo heredan) | `img/hoy-escena-cicatrices.jpg` | A | Retocar el plano limpio y reimportar `area1_scene_0..3` | 12 |
| 4 | **Cuatro dialectos de íconos** y dos herraduras distintas (dorada metálica `ui_herradura`, bronce en la tienda) | `img/no-iconos-mezclados.jpg` | A | Una hoja de 32 íconos de fieltro, misma luz (IC-01) | 12 |
| 5 | **Fuera de modelo:** `nav_rancho` es un granero rojo norteamericano; el candado del Mapa es metal fotográfico | `img/no-iconos-mezclados.jpg`, `img/hoy-mapa.jpg` | A | Estancia con tranquera; candado de fieltro y madera | 12 |
| 6 | **Dorado para todo.** 40 usos de `--gold*` contra 22 de verde; botones principales dorados («¡A ver!», «¡Cobrar todo!», «Seguir», «¡Dale!»), barras de progreso doradas | `img/hoy-dorado-en-todo.jpg`; `index.css` | A | Botón principal verde; dorado solo premios (CO-02) | 15 |
| 7 | **Una sola curva para todo:** `cubic-bezier(0.3, 1.6, 0.5, 1)` 22 veces, y 6 variantes del mismo rebote (45 usos en total) | `index.css` | B | 5 curvas con nombre en tokens (AN-01) | 14 |
| 8 | **Títere de diapositivas.** Martilla con 3 poses (2 cuadros/s reales), respira escalando el bitmap, habla alternando 2 imágenes cada 130 ms sin relación con el texto, nunca camina | AreaScene.tsx, PauchoTalk.tsx | B | Sprites a 12 fps; prueba de 2 días con el martillo | 14 |
| 9 | **Siempre contento.** 5 emociones de cuerpo entero; faltan sueño, preocupación, orgullo, cansancio, frío y «te extrañé» | `mate_*`, `libreta_*`; `img/si-emociones.jpg` | B | 6 expresiones nuevas en la hoja de modelo (PJ-07) | 12 |
| 10 | **La barra llena cobra peaje:** cinco tiempos con texto y dos toques, todos los días | EnergyFull / DayLoop.tsx | B | Ceremonia completa el primer día; después ≤ 3 s sin toques (CE-02) | 15 |
| 11 | **Sonido sintetizado.** Todos los efectos son osciladores de Web Audio; es lo que más barato suena | sound.ts:1-7 | B | Sonidos grabados y voz en sílabas (SO-01) | 15 |
| 12 | **Emojis del sistema como íconos:** 🎵🔔📳 en Ajustes, 🔥 y corazones en la pestaña Paucho, 🧉 en globos, 🏡🐶 en Recuerdos. Se ven distinto en iPhone y en Android | `img/hoy-ajustes.jpg`, `img/hoy-pestana-paucho.jpg` | B | Íconos de la hoja; emoji solo dentro de texto de Paucho y nunca como ícono (IC-06) | 12 |
| 13 | **La racha se dibuja con fuego** (🔥) en la pestaña Paucho, aunque la racha es «el mate de la mañana» | `img/hoy-pestana-paucho.jpg` | B | Mate humeante como símbolo único de racha (IC-07) | 08 |
| 14 | **La ropa no se ve.** «Su ropa» es una lista de chips de texto marrón; 4 de 6 prendas no tienen capa puesta (plan) | `img/hoy-pestana-paucho.jpg`; shop.ts:43-46 | B | Miniatura de cada prenda y Paucho vestido en la pestaña (VE-04) | 12, 14 |
| 15 | **Miniaturas de la tienda con pared y piso** (`thumb_*`): un cuarto adentro de una tarjeta | `img/hoy-casita.jpg` | B | Objeto solo sobre `--cream` (IC-04) | 12 |
| 16 | **Casita vacía.** Paucho mide ~55 px de ancho; 40 % de la escena es piso naranja liso | `img/hoy-casita.jpg` | C | Encuadre del cuarto más cerca y objetos de piso (ES-05) | 13 |
| 17 | **Contraste bajo en la racha.** «días de racha» y letras de los días en naranja `#f59a2c` sobre crema: ~2,2:1 | `img/si-racha-mate.jpg` | B | Texto de racha en `--earth`; naranja solo en el número grande (AC-01) | 08 |
| 18 | **Tipografía sin escala:** 26 tamaños distintos (12 a 42 px, con 12,5, 13,5 y 14,5) y peso 900 en 116 reglas | `index.css` | C | 7 tamaños con nombre (TI-01) | — |
| 19 | **Memoria a medir.** 313 imágenes en 12,5 MB, pero cada escena de 1024×1536 ocupa ~6,3 MB decodificada; 124 `@keyframes` | `index.css`, `a/` | B | Presupuesto de memoria y prueba en Android de 3–4 GB (RE-01) | 13, 14 |
| 20 | **Reseñas inventadas** de 5 estrellas que elogian «aventuras» e «historias» en «Armando tus metas» | PlanScreens.tsx:12-19 | A | Sacarlas antes de publicar (MT-05) | 11 |
| 21 | **Reducir movimiento cubierto a medias:** 2 bloques `prefers-reduced-motion` en 7.853 líneas de CSS | `index.css:1540, 3189`; DayOne.tsx:143 | B | Variante quieta para cada animación de más de 400 ms (AC-04) | 14 |

**Lo que está bien y hay que cuidar.** La escena de la racha (`img/si-racha-mate.jpg`) es la mejor pantalla de la app: Paucho de fieltro grande, una sola idea, cielo que amanece. El plano medio de «¡Volviste!» (`done1`) también: Paucho ocupa el 90 % del ancho y habla de cerca. La vida de ambiente (nubes, árboles, fogón, gallinas, veleta) está por encima del promedio indie (plan). Las reglas de esta guía salen en buena parte de generalizar esas pantallas.
