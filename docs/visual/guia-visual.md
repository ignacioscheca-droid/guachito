# Guía visual de Gauchito

> Estado: guía viva · Aplica a toda funcionalidad nueva desde el lanzamiento suave · Se apoya en: 12 (un solo estilo, aprobado), 13 (cámara más cerca, aprobado), 14 (Paucho se mueve), 15 (ceremonias, festejo y sonido)

Esta guía dice cómo tiene que verse, moverse y sonar Gauchito, qué está mal hoy y qué se revisa antes de lanzar algo nuevo. Cada regla tiene un ID (`PJ-03`) para citarla en una revisión. Las capturas son de la rama `areas` a 390×844; los recuadros rojos marcan lo que hay que corregir y los verdes, lo que hay que copiar.

Si una regla choca con una decisión del dueño, gana la decisión y la regla se corrige acá.

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

*Inicio, día 0. 1: Paucho ocupa ~19 % del ancho y su cara no se lee. 2: cicatrices de recorte (restos blancos sobre las sierras, ramas cortadas en seco donde se pegan las capas de árbol). 3: franja de tierra lisa. 4: la energía (+10 ⚡) y la barra en dorado-naranja, el mismo tono que los premios. 5: pestañas bloqueadas en gris con candado; cuatro dialectos de ícono en una sola barra.*

| # | Problema | Evidencia | Sev. | Arreglo | Doc |
|---|---|---|---|---|---|
| 1 | **Dos Pauchos.** El del artista (`g_*`, sombrero chico, sombreado plano) y el de fieltro (`mate_*`, ala ancha) conviven en la misma ceremonia y en la barra de pestañas | `img/no-dos-pauchos.jpg`; Reveal.tsx:186 (`g_jump` y 1,7 s después `mate_b4`); `g_avatar` en pestaña Paucho (`img/hoy-pestana-paucho.jpg`) | A | Rehacer las 6 `g_*` visibles en fieltro; avatar recortado de `mate_b2` | 12 |
| 2 | **Paucho chico.** ~75 px de ancho (19 %) y cara de ~40 px en Inicio; la mitad inferior del arte es tierra lisa | `img/hoy-inicio.jpg`; AreaScene.tsx (`width = size.w`) | A | Cámara 1,40× centrada en Paucho (doc 13); objetivo ≥ 28 % en V1 y ~35 % con pose de reposo nueva (PJ-05) | 13 |
| 3 | **Cicatrices en la primera escena.** Placas verdes planas sobre los dos troncos y hueco blanco en las sierras de `area1_scene_0` (las etapas 1–3 lo heredan) | `img/hoy-escena-cicatrices.jpg` | A | Retocar el plano limpio y reimportar `area1_scene_0..3` | 12 |
| 4 | **Cuatro dialectos de íconos** y dos herraduras distintas (dorada metálica `ui_herradura`, bronce en la tienda) | `img/no-iconos-mezclados.jpg` | A | Una hoja de 32 íconos de fieltro, misma luz (IC-01) | 12 |
| 5 | **Fuera de modelo:** `nav_rancho` es un granero rojo norteamericano; el candado del Mapa es metal fotográfico | `img/no-iconos-mezclados.jpg`, `img/hoy-mapa-ajustes.jpg` | A | Estancia con tranquera; candado de fieltro y madera | 12 |
| 6 | **Dorado para todo.** 40 usos de `--gold*` contra 22 de verde; botones principales dorados («¡A ver!», «¡Cobrar todo!», «Seguir», «¡Dale!»), barras de progreso doradas | `img/hoy-dorado-en-todo.jpg`; `index.css` | A | Botón principal verde; dorado solo premios (CO-02) | 15 |
| 7 | **Una sola curva para todo:** `cubic-bezier(0.3, 1.6, 0.5, 1)` 22 veces, y 6 variantes del mismo rebote (45 usos en total) | `index.css` | B | 5 curvas con nombre en tokens (AN-01) | 14 |
| 8 | **Títere de diapositivas.** Martilla con 3 poses (2 cuadros/s reales), respira escalando el bitmap, habla alternando 2 imágenes cada 130 ms sin relación con el texto, nunca camina | AreaScene.tsx, PauchoTalk.tsx | B | Sprites a 12 fps; prueba de 2 días con el martillo | 14 |
| 9 | **Siempre contento.** 5 emociones de cuerpo entero; faltan sueño, preocupación, orgullo, cansancio, frío y «te extrañé» | `mate_*`, `libreta_*`; `img/si-emociones.jpg` | B | 6 expresiones nuevas en la hoja de modelo (PJ-07) | 12 |
| 10 | **La barra llena cobra peaje:** cinco tiempos con texto y dos toques, todos los días | EnergyFull / DayLoop.tsx | B | Ceremonia completa el primer día; después ≤ 3 s sin toques (CE-02) | 15 |
| 11 | **Sonido sintetizado.** Todos los efectos son osciladores de Web Audio; es lo que más barato suena | sound.ts:1-7 | B | Sonidos grabados y voz en sílabas (SO-01) | 15 |
| 12 | **Emojis del sistema como íconos:** 🎵🔔📳 en Ajustes, 🔥 y corazones en la pestaña Paucho, 🧉 en globos, 🏡🐶 en Recuerdos. Se ven distinto en iPhone y en Android | `img/hoy-mapa-ajustes.jpg`, `img/hoy-pestana-paucho.jpg` | B | Íconos de la hoja; emoji solo dentro de texto de Paucho y nunca como ícono (IC-06) | 12 |
| 13 | **La racha se dibuja con fuego** (🔥) en la pestaña Paucho, aunque la racha es «el mate de la mañana» | `img/hoy-pestana-paucho.jpg` | B | Mate humeante como símbolo único de racha (IC-07) | 08 |
| 14 | **La ropa no se ve.** «Su ropa» es una lista de chips de texto marrón; 4 de 6 prendas no tienen capa puesta (plan) | `img/hoy-pestana-paucho.jpg`; shop.ts:43-46 | B | Miniatura de cada prenda y Paucho vestido en la pestaña (VE-04) | 12, 14 |
| 15 | **Miniaturas de la tienda con pared y piso** (`thumb_*`): un cuarto adentro de una tarjeta | `img/hoy-casita.jpg` | B | Objeto solo sobre `--cream` (IC-04) | 12 |
| 16 | **Casita vacía.** Paucho mide ~55 px de ancho; 40 % de la escena es piso naranja liso | `img/hoy-casita.jpg` | C | Encuadre del cuarto más cerca y objetos de piso (ES-05) | 13 |
| 17 | **Contraste bajo en la racha.** «días de racha» y letras de los días en naranja `#f59a2c` sobre crema: ~2,2:1 | `img/si-racha-mate.jpg` | B | Texto de racha en `--earth`; naranja solo en el número grande (AC-01) | 08 |
| 18 | **Tipografía sin escala:** 26 tamaños distintos (12 a 42 px, con 12,5, 13,5 y 14,5) y peso 900 en 116 reglas | `index.css` | C | 7 tamaños con nombre (TI-01) | — |
| 19 | **Memoria a medir.** 313 imágenes en 12,5 MB, pero cada escena de 1024×1536 ocupa ~6,3 MB decodificada; 124 `@keyframes` | `index.css`, `a/` | B | Presupuesto de memoria y prueba en Android de 3–4 GB (RE-01) | 13, 14 |
| 20 | **Reseñas inventadas** de 5 estrellas que elogian «aventuras» e «historias» en «Armando tus metas» | PlanScreens.tsx:12-19 | A | Sacarlas antes de publicar (MT-05) | 11 |
| 21 | **Reducir movimiento cubierto a medias:** 2 bloques `prefers-reduced-motion` en 7.853 líneas de CSS | `index.css:1540, 3189`; DayOne.tsx:143 | B | Variante quieta para cada animación de más de 400 ms (AC-04) | 14 |

**Lo que está bien y hay que cuidar.** La escena de la racha (`img/si-racha-mate.jpg`) es la mejor pantalla de la app: Paucho de fieltro grande, una sola idea, cielo que amanece. El plano medio de «¡Volviste!» (`done1`) también: Paucho ocupa el 90 % del ancho y habla de cerca. La vida de ambiente (nubes, árboles, fogón, gallinas, veleta) está por encima del promedio indie (plan).

---

## 3. Capítulos

Cada capítulo trae reglas con ID, specs, un bloque **SÍ / NO**, quién lo hace mejor y «Hoy en Gauchito». Las medidas en px son CSS a 390×844 salvo que diga «del arte».

### 3.1 Personaje (PJ)

Paucho es un pibe de campo dormilón y tierno, de fieltro, chibi de 2,6 cabezas. Todo lo que lo muestre sale de la hoja de modelo (doc 12).

![El modelo único](img/si-paucho-fieltro.jpg)

| ID | Regla | Spec |
|---|---|---|
| PJ-01 | **Modelo único.** Todo Paucho nuevo se genera con la hoja de modelo y dos `mate_*` de referencia, y se compara contra `mate_b2_habla_cerrada` (cara) y `mate_a1_base` (cuerpo) | Juez separado; rechazo si cambia la forma del bigote, el ojo o el sombrero |
| PJ-02 | **Proporciones fijas** | 2,6 cabezas de alto; ala del sombrero = 1,45 × ancho de cabeza; guarda de 9 rombos crema sobre marrón; bigote en «manubrio» que tapa la boca de costado; ojos negros con 1 brillo arriba a la izquierda |
| PJ-03 | **Silueta legible en negro.** Cada pose se tiene que entender rellena de negro a 64 px de alto | Prueba de silueta en el control de calidad (§5) |
| PJ-04 | **Paleta del personaje** cerrada en 8 muestras | sombrero `#6b3f22`, guarda `#e9d3a8`, pañuelo `#d6453d`, camisa `#f6efe3`, poncho `#5b3a24` con guarda, bombacha `#4a2e1c`, botas `#7b4a2a`, piel `#f4c79a` (muestreadas de `mate_a1_base`, estimación ±5 %) |
| PJ-05 | **Tamaño en pantalla.** En Inicio Paucho ocupa ≥ 28 % del ancho y ≥ 170 px de alto en reposo (doc 13, V1). Meta V2: ~35 % del ancho con la pose de reposo de frente y brazos abiertos. En primeros planos (`PauchoTalk`, racha), ≥ 60 % del ancho | Hoy: 19 % y 123 px |
| PJ-06 | **Cara mínima** | ≥ 50 px de alto de cara en cualquier pantalla donde Paucho hable o reaccione; si no entra, se usa plano medio |
| PJ-07 | **Rango emocional.** Además de las 5 existentes (contento, escucha, curioso, sorprendido, «ahh»), se producen 6: con sueño, preocupado *por algo suyo*, orgulloso, cansado, con frío, «te extrañé» (abrazo, sin lágrimas) | Plano medio 1254×1254 con `_cerrada`/`_abierta`, como `mate_b*` |
| PJ-08 | **Estados bajos sin culpa.** Las caras bajas se usan para el día de Paucho (llovió, la obra cansa, siesta) y nunca junto a un texto sobre lo que el jugador no hizo | Revisión de texto + imagen juntas |
| PJ-09 | **Poses con intención.** Toda pose nueva dice una acción con todo el cuerpo (peso en una pierna, cabeza inclinada), no solo la cara | Rechazo si la pose es «parado de frente» con otra boca |
| PJ-10 | **Mira al jugador** al hablarle, y a la obra o al objeto cuando habla de eso | La mirada se decide en el guion de cada escena |
| PJ-11 | **Elenco sin próceres.** Mate, termo con calcomanías, perro, siesta, radio con cumbia, auriculares colgados del sombrero. Nada de facón, boleadoras, bandera ni discursos | Lista negra en el prompt base |
| PJ-12 | **Pies en el piso.** Cajas de pose de campo 906×990 con botas en y = 982,5 del arte | Diferencia ≤ 2 px a 390 de ancho (doc 12) |

**SÍ / NO**

- **SÍ:** el primer plano de «¡Volviste, Nacho!» (`done1`): Paucho llena el 90 % del ancho, saluda con la mano, mate en la otra, mira a cámara.
- **NO:** `g_jump` seguido de `mate_b4` en la misma revelación: dos sombreros, dos bigotes, dos sombreados en 1,7 s (`img/no-dos-pauchos.jpg`).
- **SÍ:** «Tengo un sueño… anoche la radio no paraba» con la cara de sueño.
- **NO:** cara triste con «Ayer no viniste».
- **NO:** una pose nueva que solo cambia la boca sobre el mismo cuerpo de frente.

![Emociones que hay y las que faltan](img/si-emociones.jpg)

**Quién lo hace mejor.** Duolingo: Duo es idéntico en app, avisos, ícono y redes, y cambia de ánimo según lo que hacés. Finch: el pajarito tiene estados de sueño, cansancio y alegría que acompañan tu día sin reprochar. Royal Match: el rey actúa con todo el cuerpo y se lo reconoce en silueta.

**Hoy en Gauchito.** Corregir: dos Pauchos (`g_idle`, `g_celebrate`, `g_wave`, `g_thumbs`, `g_jump`, `g_avatar` → fieltro); 19 % del ancho en Inicio; 6 emociones faltantes; `g_sad`, `g_sleep`, `g_surprised` existen pero en el estilo viejo y sin pantalla (se borran, doc 12). Cuidar: los planos medios `mate_b*` y la escena de la racha.

### 3.2 Mascotas y animalitos (MA)

Los animalitos son del mismo fieltro que Paucho y miden en cabezas de Paucho, no en píxeles sueltos. Hoy hay perro (Chicho, `perro_*` de fieltro y `dog_*` viejo), gato (`michi_*`) y gallinas de área.

| ID | Regla | Spec |
|---|---|---|
| MA-01 | **Mismo material y luz** que Paucho (P5) | Fieltro, luz arriba a la izquierda, sin contorno negro |
| MA-02 | **Escala relativa** | Perro sentado = 0,55 del alto de Paucho; carpincho echado = 0,45; hornero = 0,18; ñandú parado = 1,1; gallina = 0,30 |
| MA-03 | **Ojos simples**: dos puntos negros con brillo, como Paucho; sin iris de color | Rechazo de ojos realistas |
| MA-04 | **Set mínimo por animal**: parado, sentado/echado, dormido, feliz, + 1 gesto propio (el carpincho bosteza, el hornero lleva barro, el carancho roba algo) | 5 poses, ≤ 420×530 de caja |
| MA-05 | **Parpadeo** con capa `_ojos` como `perro_room_a_ojos` | cada 3–6 s, 120 ms cerrado |
| MA-06 | **Uno acompaña a Paucho en Inicio**; nunca más de 2 animales en primer plano | Sin tapar la cara de Paucho ni las tarjetas |
| MA-07 | **Sin ropa humana** en animales (nada de sombreritos); como mucho un collar o pañuelo atado | Lo distingue de lo infantil |
| MA-08 | **Nombre visible solo en la ficha**, no flotando sobre la escena | — |
| MA-09 | **Animales autóctonos tiernos, no peligrosos**: carpincho, hornero, ñandú, mulita, vizcacha, lechucita, yacaré con tereré (plan). El yacaré sin dientes a la vista | — |

**SÍ / NO**

- **SÍ:** `cucha_asoma_mira`: el perro asoma de la cucha y mira; una pose chica que cuenta algo.
- **NO:** `dog_sit` viejo (plano, otro perro) al lado de Paucho de fieltro todos los días desde el Área 2 (doc 12 lo rehace).
- **SÍ:** el carpincho dormido en la laguna, medio sumergido, con un pájaro encima.
- **NO:** un carpincho con gorra y anteojos de sol; un hornero del tamaño de Paucho.

**Quién lo hace mejor.** Finch: las micromascotas son objetos de colección chicos, del mismo estilo que el pajarito, y acompañan sin competir. Animal Crossing: cada animal tiene un gesto propio que lo vuelve reconocible.

**Hoy en Gauchito.** Corregir: `dog_sit` y `dog_sleep` del estilo viejo en el campo; en la Casita el perro mira para otro lado y queda en el piso vacío (`img/hoy-casita.jpg`). Cuidar: `perro_b*` y `michi_*`, que ya son del modelo.

### 3.3 Vestimenta y capas por pose (VE)

Una prenda que no se ve puesta no existe. Hoy 4 de 6 prendas no tienen capa (plan) y la pestaña Paucho las muestra como chips de texto.

| ID | Regla | Spec |
|---|---|---|
| VE-01 | **Tres lugares**: cabeza (sombrero, gorra, auriculares), cuello (pañuelo), cuerpo (poncho, chaleco) | Sin lugar de pies hasta tener esqueleto |
| VE-02 | **Una capa por pose visible** para cada prenda que se venda. Si no hay capa para una pose, esa pose usa la ropa base | Lista de poses × prendas en `shop.ts` (`WEAR`) |
| VE-03 | **Teñido con máscara** para variantes de color (doc 14, alternativa A) | 1 máscara por prenda y pose/ciclo, ≈ 20 KB (estimación) |
| VE-04 | **Se ve antes de comprarse**: la tienda muestra a Paucho con la prenda puesta, no la prenda sola | Vista previa en plano medio |
| VE-05 | **Silueta del sombrero intocable**: los sombreros nuevos conservan ala ancha ≥ 1,3 × cabeza; gorras y auriculares van sobre o colgados del sombrero | Paucho se reconoce por el sombrero |
| VE-06 | **Alineación al píxel** con la pose: misma caja y mismo origen que la pose base | Diferencia 0 px; se verifica superponiendo al 50 % |
| VE-07 | **Sin disfraz**: nada de trajes patrios, de próceres ni de marcas de otros | — |
| VE-08 | **Premium se ve premium sin dorado**: textura más rica (bordado, guarda doble), no brillo metálico | P4, P5 |

**SÍ / NO**

- **SÍ:** pañuelo celeste en `idle`, `celebrate` y `avatar` (`wear_panuelo_celeste_*`): la prenda acompaña al personaje en las tres poses.
- **NO:** «Su sombrero / Su pañuelo rojo / Su poncho» como botones de texto marrón (`img/hoy-pestana-paucho.jpg`, 4).
- **NO:** vender un poncho que en Inicio no aparece porque la pose de martillo no tiene capa.
- **SÍ:** si la pose no tiene capa, la tienda dice «Se luce en la casita y en tu perfil».

**Quién lo hace mejor.** Finch: la ropa se ve en el pajarito en todas las pantallas principales y en las fotos. Duolingo: los trajes de Duo en eventos son pocos y siempre se ven puestos.

**Hoy en Gauchito.** Corregir: la pestaña Paucho sin imagen de la ropa; capas solo para 2 pañuelos × 3 poses viejas (se rehacen sobre fieltro, doc 12); las poses de trabajo sin capa. Decidir con la prueba del doc 14 si se paga un esqueleto antes de pasar de 10 prendas.

### 3.4 Escenas, fondos y cámara (ES)

La escena es un escenario para Paucho, no un paisaje. Lo que importa va al centro, a la altura de la cara.

![Cámara hoy y a 1,4×](img/si-no-camara.jpg)

| ID | Regla | Spec |
|---|---|---|
| ES-01 | **Cámara de reposo 1,40×** centrada en los pies de Paucho, que caen 50 px sobre la fila de chips | Doc 13 (aprobado); transiciones de 500–900 ms con `--ease-cam` |
| ES-02 | **Sin cicatrices**: ninguna placa, halo, recorte ni hueco visible al 200 % | Revisión al 200 % sobre cada etapa |
| ES-03 | **Tres planos de profundidad**: cielo y sierras (fondo), campo (medio), patio con Paucho (frente). El fondo baja saturación un 20–30 % y sube valor para separar | Medido con cuentagotas |
| ES-04 | **Nada liso más de 60 px** a la altura del personaje: pasto, piedras, una gallina | V2 del doc 13 con 3–4 sprites de primer plano |
| ES-05 | **Interiores (Casita)** con el mismo criterio: Paucho ≥ 25 % del ancho, el piso con alfombra u objetos | Hoy ~14 % |
| ES-06 | **Formato del arte**: escenas 1024×1536 webp; sin bordes visibles en ningún encuadre; arriba degradado de cielo, abajo color `ground` | Doc 13 |
| ES-07 | **Hora del día** solo en escenas de ceremonia (la racha amanece); Inicio queda de día | Evita relojes que mientan |
| ES-08 | **Encuadre por momento**: reposo, obra, revelación, salida (doc 13). Nunca dos movimientos de cámara encadenados | — |
| ES-09 | **Velo detrás de hojas** (Ajustes, globos grandes): desenfoque de 8–12 px y oscurecido 20 %, como hoy | Mantener |

**SÍ / NO**

- **SÍ:** la racha: cielo, campo y Paucho grande sobre el banquito, una sola idea por pantalla (`img/si-racha-mate.jpg`).
- **NO:** Inicio de hoy: Paucho de 75 px rodeado de pilas de material y tierra lisa (`img/hoy-inicio.jpg`).
- **NO:** ramas cortadas en seco donde se pega la capa del árbol y restos blancos sobre las sierras (`img/hoy-escena-cicatrices.jpg`).

**Quién lo hace mejor.** Finch: el pajarito ocupa el tercio central y el fondo acompaña. Homescapes: la cámara se acerca a la habitación que se renueva y vuelve al personaje después.

**Hoy en Gauchito.** Corregir: cámara a 1×; cicatrices de `area1_scene_0..3`; piso vacío de la Casita; Área 3 son carteles de madera provisorios (plan). Cuidar: la vida de ambiente.

### 3.5 Íconos (IC)

Un ícono es un objeto chico del mundo de Paucho, hecho de lo mismo y con la misma luz.

![Cuatro dialectos de íconos](img/no-iconos-mezclados.jpg)

| ID | Regla | Spec |
|---|---|---|
| IC-01 | **Una sola hoja** por tanda: 4096×2048, grilla 8×4, celda 512, margen 48, fondo magenta `#FF00FF` | Doc 12 |
| IC-02 | **Salida** 256×256 webp ≤ 20 KB; se muestra a 24, 32, 44 o 64 px | 4 tamaños, ninguno más |
| IC-03 | **Mismo tamaño aparente**: el objeto ocupa 80 % de la celda en su lado mayor; objetos redondos 75 % | Se mide en la hoja |
| IC-04 | **Sin escenario**: el objeto solo, sin pared, piso ni marco. Las miniaturas de tienda van sobre `--cream` | Hoy `thumb_*` traen pared y piso |
| IC-05 | **Vista de tres cuartos** desde arriba a 15–20°, luz arriba a la izquierda, sombra propia suave, sin sombra arrojada, sin brillo metálico | P5 |
| IC-06 | **Emoji nunca como ícono.** Se ven distinto en iOS y Android y rompen el estilo. Solo pueden aparecer dentro de una frase de Paucho, como máximo uno | Hoy: 🎵🔔📳🔥🏡🐶🧉 |
| IC-07 | **Un significado, un ícono.** Racha = mate humeante; moneda = herradura (una sola); energía = rayo de fieltro amarillo; bloqueado = candado de madera y cuero | Hoy hay 2 herraduras y la racha usa 🔥 |
| IC-08 | **Pestañas**: 5 íconos de la misma hoja, 32 px, etiqueta siempre visible en 11–12 px; activa con fondo `--nav-on-*` y etiqueta en `--ink` | Hoy la etiqueta solo aparece en la activa |
| IC-09 | **Bloqueado** = el ícono en su color al 45 % de opacidad + candado chico (16 px) en la esquina inferior derecha; nunca gris total | Gris total se lee como roto |
| IC-10 | **Aviso** (insignia roja con número): 18 px, `--red`, borde 2 px `--card`, arriba a la derecha sin tapar más del 25 % del ícono | — |
| IC-11 | **Fuera de modelo prohibido**: nada que no exista en el campo argentino (granero rojo con techo quebrado, silo de chapa) | Revisión cultural |

**SÍ / NO**

- **SÍ:** `habit_mate` y `habit_agua`: suaves, del mismo material, sin marco.
- **NO:** `nav_rancho` (granero norteamericano), `ui_candado` y `ui_herradura` metálicos, `thumb_cama_1` con pared y piso, y una segunda herradura de bronce.
- **NO:** «🔥 5 días de racha».
- **SÍ:** mate humeante de 32 px al lado de «5 días de racha».

**Quién lo hace mejor.** Duolingo: un solo set de íconos con la misma forma redondeada en toda la app. Royal Match: monedas, estrellas y cofres son siempre el mismo objeto, del mismo material, en cualquier tamaño.

**Hoy en Gauchito.** Corregir: cuatro dialectos, dos herraduras, granero, candado de metal, emojis en Ajustes, Recuerdos y pestaña Paucho, `thumb_*` con escenario, pestañas sin etiqueta. Todo entra en la hoja de 32 del doc 12.

### 3.6 Color (CO)

Pocos colores, cada uno con un trabajo. La paleta sale de `app/src/index.css`.

![Paleta](img/paleta.jpg)

| Rol | Token | Hex | Uso |
|---|---|---|---|
| Fondo | `--paper` / `--backdrop` | `#fbf3e4` / `#e9dcc5` | Pantallas y detrás de hojas |
| Tarjeta | `--card` / `--surface` | `#fffdf8` / `#ffffff` | Tarjetas, globos |
| Miniaturas | `--cream` | `#fff7e9` | Fondo de íconos y tienda |
| Texto | `--ink` | `#3a2417` | Todo texto de lectura |
| Título | `--earth` | `#5b3a24` | Títulos, botones secundarios |
| Texto 2° | `--muted` | `#8a7563` | Ayudas (solo ≥ 14 px) |
| Madera | `--wood` / `--wood-deep` | `#8a5a36` / `#6e452a` | Carteles de título |
| **Acción** | `--tick` / `--tick-deep` | `#5aa04a` / `#3f7a33` | **Botón principal**, check |
| Hecho | `--check` | `#43a047` | Estado «hecho» |
| **Premio** | `--gold` / `--gold-deep` | `#f2b33d` / `#c47f15` | **Solo** herraduras, cofres, hitos |
| Energía | `--energy` | `#f59a2c` | Barra de energía |
| Cielo / frío | `--sky` / `--frost` | `#8cc6f2` / `#a9d8f0` | Escenas, termo |
| Rojo | `--red` | `#d6453d` | Pañuelo, insignias; nunca alarma |

| ID | Regla | Spec |
|---|---|---|
| CO-01 | **Verde = acción principal.** Un solo botón verde por pantalla | `--tick` arriba, `--tick-deep` como base de 6 px; texto blanco 18 px peso 900 |
| CO-02 | **Dorado = premio.** Herraduras, cofres, hitos de racha, el brillo de la revelación. Nunca botones de navegar ni barras de progreso de tareas | Hoy 40 usos de `--gold*` |
| CO-03 | **Energía naranja, separada del dorado**: la barra usa `--energy`; el «+10 ⚡» de la tarjeta, `--earth` con el rayo de color | Que «+energía» no se confunda con «+herraduras» |
| CO-04 | **Secundario** = contorno `--wood` 2 px o texto `--earth` sin fondo | — |
| CO-05 | **Rojo nunca para estados del jugador** (racha en riesgo, hábito no hecho) | P7 |
| CO-06 | **Contraste**: texto ≥ 4,5:1, texto ≥ 24 px o 19 px negrita ≥ 3:1 | Ver AC-01 |
| CO-07 | **Tokens, no hex sueltos.** Todo color nuevo entra a `:root` con nombre y al sistema de diseño | Revisión de código |
| CO-08 | **Modo oscuro**: fuera de alcance; la app fuerza claro. Se revisa con escala | — |

![Botones SÍ y NO](img/si-no-boton.jpg)

**SÍ / NO**

- **SÍ:** «¡Cobrar todo!» en verde con una pastilla dorada «+15» a la derecha: el verde dice qué tocar, el dorado dice qué ganás.
- **NO:** «¡A ver!», «Seguir», «¡Dale!» y «¡Cobrar todo!» en el mismo dorado que las herraduras (`img/hoy-dorado-en-todo.jpg`).
- **NO:** borde dorado alrededor de la tarjeta del área en curso: «en curso» no es un premio; va con borde `--tick`.

**Quién lo hace mejor.** Duolingo: verde para continuar, dorado y violeta para logros y premium. Royal Match: verde para jugar, oro para monedas y cofres.

**Hoy en Gauchito.** Corregir: todos los botones principales y las barras de progreso de encargos y racha en dorado; el «+10 ⚡» en dorado-naranja; borde dorado en el Mapa.

### 3.7 Tipografía y carteles (TI)

Una familia (Nunito), siete tamaños, y los títulos importantes en cartel de madera.

| ID | Regla | Spec |
|---|---|---|
| TI-01 | **Escala con nombre** (tokens `--fs-*`) | `xs` 12 · `sm` 14 · `md` 16 · `lg` 18 · `xl` 22 · `2xl` 28 · `hero` 40–72 (números grandes) |
| TI-02 | **Pesos**: 700 texto, 800 etiquetas, 900 títulos y botones | Hoy 900 en 116 reglas; se reserva |
| TI-03 | **Interlineado** 1,3 en texto, 1,1 en títulos | — |
| TI-04 | **Títulos de pantalla en cartel de madera** (decisión tomada): tabla `--wood` con veta, clavos en las puntas, texto `--cream` 22 px peso 900 con sombra interior 1 px `--wood-deep` | Alto 48 px; ancho al texto + 32 px |
| TI-05 | **Cartel solo para títulos** de pantalla y de ceremonia; nunca para botones ni tarjetas | Si todo es cartel, nada es título |
| TI-06 | **Números grandes** (racha, herraduras ganadas) en `hero`, con contorno o sombra de 2 px para leerse sobre arte | Ej.: el «5» de la racha |
| TI-07 | **Mínimo 12 px** en cualquier texto; 14 px para texto que hay que leer (no solo reconocer) | Hoy hay 12,5 / 13,5 / 14,5 |
| TI-08 | **Globos de Paucho**: 16 px, peso 800, `--ink` sobre `--bubble`, máximo 3 líneas y ~90 caracteres | Si no entra, son dos globos |
| TI-09 | **Truncado**: nunca se corta un nombre de hábito; baja a 2 líneas y después a 14 px | Hoy «Cajón man…» en la tienda |

**SÍ / NO**

- **SÍ:** «5» de la racha en 72 px con «días de racha» en `--earth` 22 px debajo.
- **NO:** «días de racha» en el mismo naranja del número sobre crema (2,2:1).
- **SÍ:** «El galpón» en cartel de madera al abrir la revelación.
- **NO:** cartel de madera en el botón «¡Cobrar todo!».

**Quién lo hace mejor.** Duolingo: una sola familia redondeada con pocos tamaños muy marcados. Homescapes y Royal Match: títulos de evento en carteles con material del mundo.

**Hoy en Gauchito.** Corregir: 26 tamaños; tres tamaños con medio píxel; títulos sin cartel; truncados en la tienda.

### 3.8 Componentes de UI (UI)

Pocos componentes, siempre iguales. Cada uno vive en `ui.tsx` y en el sistema de diseño.

| ID | Componente | Spec |
|---|---|---|
| UI-01 | **Botón principal** | 56 px de alto, radio 28, `--tick` con base `--tick-deep` de 6 px; al tocar baja 4 px en 80 ms; ancho completo menos 24 px por lado |
| UI-02 | **Botón secundario** | 48 px, contorno `--wood` 2 px, texto `--earth`; nunca dos principales juntos |
| UI-03 | **Pastilla de premio** | 32 px, `--gold` con base `--gold-deep`, herradura de 20 px + número 16 px peso 900 |
| UI-04 | **Tarjeta de hábito** | 72 px de alto, radio `--radius` 22, ícono 44 px en pozo `--icon-well`, check de 48×48 a la derecha |
| UI-05 | **Globo de Paucho** | `--bubble`, radio 18, cola de 12 px hacia la boca, sombra `--shadow` |
| UI-06 | **Barra de progreso** | 12 px, fondo `--tick-off`; relleno `--tick` para tareas, `--energy` solo para energía, `--gold` solo para un cofre |
| UI-07 | **Hoja inferior** | radio 28 arriba, asa de 36×5 px, velo ES-09 |
| UI-08 | **Interruptor** | 52×32, encendido `--tick` (hoy `--green` apagado de tono: se unifica) |
| UI-09 | **Estados**: normal, apretado, deshabilitado (45 % de opacidad, sin sombra), cargando (puntos que laten), hecho (check verde) | Los cinco dibujados antes de construir |
| UI-10 | **Estado vacío** con Paucho y una frase, nunca una caja vacía | Ej.: «Todavía no hay recuerdos. Mañana salgo a buscar uno.» |

**SÍ / NO**

- **SÍ:** el check de hábito: blanco con check verde; al tocarlo se llena de verde y suelta confeti.
- **NO:** «Cobrar» como contorno dorado al lado de una barra dorada y de «¡Cobrar todo!» dorado: tres dorados que piden tres cosas distintas (`img/hoy-dorado-en-todo.jpg`).
- **NO:** «Guardar nombres» deshabilitado casi invisible sobre crema (Ajustes): debe verse que existe.

**Quién lo hace mejor.** Duolingo: el botón grueso con base de color que se hunde al tocar es su firma. Finch: tarjetas con el mismo alto y ritmo en todas las listas.

**Hoy en Gauchito.** Corregir: botones dorados, barras doradas, tres variantes de «cobrar»; interruptores en `--green` y check en `--tick` (dos verdes distintos).

### 3.9 Layout y áreas seguras (LA)

| ID | Regla | Spec |
|---|---|---|
| LA-01 | **Blanco táctil** ≥ 44×44 pt en iOS y ≥ 48×48 dp en Android; se diseña a 48 | Hoy hay botones de 30 y 32 px (`index.css:661, 800, 865`) |
| LA-02 | **Separación entre blancos** ≥ 8 px | — |
| LA-03 | **Márgenes**: 16 px a los lados en listas, 24 px en botones de ancho completo | — |
| LA-04 | **Áreas seguras**: barra superior debajo de `--safe-top`, pestañas encima de `--safe-bottom`; nada interactivo en los 20 px del gesto de inicio | Probar con muesca y con isla |
| LA-05 | **Grilla de 8 px** para espacios (4 px solo dentro de componentes) | — |
| LA-06 | **3½ tarjetas** visibles en Inicio (decisión tomada; doc 13 deja abierta 2½ en pantallas < 700 px) | — |
| LA-07 | **Pantallas de prueba**: 390×844 (iPhone), 360×800 y 360×640 (Android chico) | Las tres capturadas en cada revisión |
| LA-08 | **Una idea por pantalla** en ceremonias: personaje, número, botón | La racha lo cumple |
| LA-09 | **Pulgar**: la acción principal en el tercio inferior | — |

**SÍ / NO**

- **SÍ:** la racha: Paucho arriba, número al medio, «¡Dale!» abajo al alcance del pulgar.
- **NO:** la primera pantalla de racha con 340 px vacíos debajo del texto (`streak1`): el gesto de deslizar podría ocupar ese espacio con el mate más grande.

**Quién lo hace mejor.** Finch y Duolingo ponen la acción principal abajo, de ancho completo, siempre en el mismo lugar.

### 3.10 Animación y movimiento (AN)

Todo movimiento tiene anticipación, acción y asentamiento, y su curva depende de qué hace.

| ID | Regla | Spec |
|---|---|---|
| AN-01 | **Cinco curvas con nombre** en tokens | `--ease-out` `cubic-bezier(0.2, 0.8, 0.3, 1)` entradas · `--ease-in` `cubic-bezier(0.5, 0, 0.75, 0)` salidas · `--ease-cam` `cubic-bezier(0.45, 0, 0.2, 1)` cámara (doc 13) · `--ease-pop` `cubic-bezier(0.3, 1.4, 0.5, 1)` aparecer con rebote chico · `--ease-party` `cubic-bezier(0.3, 1.8, 0.5, 1)` solo festejos |
| AN-02 | **Duraciones por tipo** | toque 80–120 ms · cambio de estado 200–300 ms · entrada de hoja 300–400 ms · salida = 70 % de la entrada · cámara 500–900 ms · festejo diario ≤ 3.000 ms · ceremonia ≤ 12 s |
| AN-03 | **Rebote solo para lo que se gana o aparece** (premios, checks, obra). Textos, hojas y listas entran sin rebote | Hoy rebota todo |
| AN-04 | **Anticipación** de 80–150 ms antes de toda acción grande: Paucho se agacha antes de saltar, la obra tiembla antes de caer | — |
| AN-05 | **Personaje a 12 fps** (83 ms por cuadro) en sprites; la interfaz a 60 fps | Doc 14 |
| AN-06 | **Idle vivo**: respiración por sprite o por capas, nunca escalando el bitmap entero; un gesto chico cada 8–14 s (sorbo, mirar al perro) | Hoy `paucho-breathe` escala 1,012 × 1,028 |
| AN-07 | **Parpadeo**: cada 2,5–6 s al azar, 120–150 ms cerrado, 1 de cada 6 veces doble | Capas `_parpadeo` y `_ojos` |
| AN-08 | **Caminar**: ciclo de 8 cuadros (667 ms), avanza 0,9 × su alto por ciclo, pies sin patinar (≤ 2 px), la cámara lo sigue con 120 ms de atraso | Doc 14 |
| AN-09 | **Hablar**: la boca abre en sílabas del texto (una vocal = abierta), no cada 130 ms fijo; para al terminar la frase | Hoy alterna 2 imágenes |
| AN-10 | **Escalonado** en listas: 40 ms entre elementos, máximo 6 | — |
| AN-11 | **Solo `transform` y `opacity`** se animan | Rendimiento |
| AN-12 | **Nunca teletransportar** al personaje entre dos lugares de la escena | Caminata o corte con fundido de 150 ms |

**SÍ / NO**

- **SÍ:** la obra se agacha (anticipación 120 ms), cae con `--ease-party` en 450 ms y levanta polvo en el impacto.
- **NO:** la hoja de Ajustes entrando con el mismo rebote que un premio.
- **SÍ:** Paucho camina del banquito al caballete cuando se llena la barra.
- **NO:** Paucho sentado en un cuadro y martillando en el siguiente.

**Quién lo hace mejor.** Duolingo: personajes en Rive con bocas sincronizadas en más de 40 idiomas (plan). Royal Match: el rey anticipa cada reacción con todo el cuerpo. Finch: el pajarito camina a su aventura.

**Hoy en Gauchito.** Corregir: `cubic-bezier(0.3, 1.6, 0.5, 1)` en 22 reglas y 45 rebotes en total; respiración por escala; boca a 130 ms; martillo a 2 cuadros por segundo; sin caminar.

### 3.11 Ceremonias y festejo (CE)

Tres niveles. Cuanto más raro el logro, más larga y más rica la ceremonia.

| Nivel | Qué | Duración | Toques | Elementos |
|---|---|---|---|---|
| **1 · Diario** | hábito hecho, mate cebado, encargo cobrado | ≤ 3 s | 0 | check, confeti chico (≤ 24 piezas), salto de Paucho, sonido corto, háptico «success» |
| **2 · Semanal** | barra llena, obra terminada, meta de racha de 7 | 4–8 s | 1 | cámara a la obra, caída con polvo, brillo que la recorre, pastilla de premio que vuela al contador |
| **3 · Hito** | primer día, área terminada, racha 30/50/100, animalito nuevo | 8–12 s | 1–2 | primer plano de Paucho, cartel de madera, música de 4–6 s, tarjeta para compartir (doc 10) |

| ID | Regla | Spec |
|---|---|---|
| CE-01 | **Lo diario ≤ 3 s y sin toques** | Se puede seguir usando la app mientras termina |
| CE-02 | **Barra llena**: ceremonia completa solo el primer día (decisión tomada); desde el segundo, ≤ 3 s y sin texto obligatorio | Hoy cinco tiempos y dos toques todos los días |
| CE-03 | **Siempre se puede saltear** tocando fuera, salvo el nivel 3 la primera vez | — |
| CE-04 | **El premio viaja** al contador (herraduras) en 600–900 ms con `--ease-in` y el contador late al llegar | — |
| CE-05 | **Confeti con la paleta**, no arcoíris: `--tick`, `--gold`, `--sky`, `--red`, `--cream` | — |
| CE-06 | **Un solo nivel 3 por sesión**; si se juntan dos, el segundo espera al próximo ingreso | — |
| CE-07 | **Reducir movimiento**: sin confeti ni cámara; fundido de 150 ms y el sonido igual | AC-04 |

**SÍ / NO**

- **SÍ:** hábito hecho: la tarjeta se va con confeti, Paucho salta, «¡Primera vez que lo completás!» como aviso de 2 s.
- **NO:** «¡Al máximo!» → «¡Yujuuu!» → 30 herraduras volando → «El rancho está creciendo» → «¡Salir de aventura!» todos los días.

**Quién lo hace mejor.** Royal Match: fin de nivel de 2 s y cofres con puesta en escena aparte. Homescapes: la renovación se revela con cámara y brillo. Duolingo: la extensión de racha es corta; los hitos tienen pantalla propia.

### 3.12 Sonido y hápticos (SO)

El sonido es la señal de calidad más barata (plan). Hoy todo es oscilador.

| ID | Regla | Spec |
|---|---|---|
| SO-01 | **Sonidos grabados o de biblioteca con licencia**, no sintetizados: moneda/herradura, mate (sorbo y bombilla), ladrido, rasgueo de guitarra, martillo, pasos en tierra | ≤ 40 KB cada uno, ogg/m4a |
| SO-02 | **Voz de Paucho en sílabas** inventadas, 3 tonos (contento, curioso, con sueño), como Animal Crossing | Sincronizada con AN-09 |
| SO-03 | **Mezcla**: efectos −12 dB, voz −14 dB, música −20 dB y baja 6 dB cuando habla Paucho | — |
| SO-04 | **Música**: loop de guitarra criolla suave; licencia comercial confirmada antes de publicar (hoy «At Peace With the Plains» sin confirmar, plan) | — |
| SO-05 | **Hápticos**: `tap` en botones, `success` en hábito hecho, `celebrate` en nivel 3, nunca `warning` por algo que el jugador no hizo | `sound.ts` ya tiene los seis tipos |
| SO-06 | **Todo funciona en silencio**: ningún dato vive solo en el sonido | — |
| SO-07 | **Interruptores separados** de música, efectos y vibración (ya existen) | Mantener |

**SÍ / NO:** **SÍ** el sorbo grabado del mate en el cuadro exacto en que Paucho chupa. **NO** un «bip» de oscilador para la herradura. **NO** vibración de alerta cuando la racha está por enfriarse.

### 3.13 Texto en pantalla (TX)

| ID | Regla | Spec |
|---|---|---|
| TX-01 | **Voseo** en todo texto de app | «Cebá», «Mirá», «¿La vemos?» |
| TX-02 | **Paucho habla en primera persona** y de cerca; el sistema casi no habla | «Terminé el galpón» y no «Obra completada» |
| TX-03 | **Botones con verbo** de 1–3 palabras | «¡A ver!», «Cobrar», «Seguir» |
| TX-04 | **Sin culpa ni salud clínica**: nunca «ansiedad», «tratar», «curar», síntomas ni diagnósticos; nada de «no viniste» | P7 |
| TX-05 | **Números con unidad dibujada**: «15» + herradura, no «15 herraduras» en botones | — |
| TX-06 | **Moneda, racha y tienda** con sus nombres: herraduras, el mate de la mañana, prendas y cosas del cuarto | — |
| TX-07 | **Nada falso**: ni reseñas inventadas ni cifras de usuarios que no existen | PlanScreens.tsx:12-19 |

**SÍ:** «¡5 mates seguidos! Faltan 2 para tu meta.» **NO:** «¡Día completo!» a la noche sin hábitos hechos (plan). **NO:** «Racha perdida».

### 3.14 Accesibilidad (AC)

| ID | Regla | Spec |
|---|---|---|
| AC-01 | **Contraste** WCAG AA: 4,5:1 texto, 3:1 texto grande e íconos que informan | `--muted` sobre `--paper` ≈ 4,1:1 (estimación): solo ≥ 14 px negrita; naranja `--energy` nunca para texto |
| AC-02 | **Texto dinámico**: la app aguanta 130 % de tamaño sin cortar botones | Prueba con zoom del sistema |
| AC-03 | **Etiqueta accesible** en cada ícono, botón y en Paucho («Paucho, cebando mate») | — |
| AC-04 | **Reducir movimiento**: cada animación > 400 ms tiene variante quieta; se respeta el ajuste del sistema y hay un interruptor propio | Hoy 2 bloques en 7.853 líneas |
| AC-05 | **Color nunca solo**: «hecho» tiene check además de verde; bloqueado tiene candado además de opacidad | — |
| AC-06 | **Sin destellos** de más de 3 por segundo | Confeti y brillos incluidos |

**SÍ:** «días de racha» en `--earth`. **NO:** «días de racha» y «J V S D» en `#f59a2c` sobre `#fbf3e4`.

### 3.15 Rendimiento visual (RE)

La memoria decodificada manda, no el peso del archivo. Una escena de 1024×1536 pesa ~150 KB en webp y ocupa 6,3 MB en memoria (ancho × alto × 4).

| ID | Regla | Spec |
|---|---|---|
| RE-01 | **Presupuesto de imágenes cargadas** ≤ 60 MB decodificados por pantalla (estimación para un Android de 3–4 GB) | Etapa 6,3 + hojas de sprites ≤ 20 + UI |
| RE-02 | **Solo el área activa** en memoria (plan) | Las demás se liberan al salir |
| RE-03 | **Tamaño de origen ≤ 2× el tamaño mostrado** a densidad 3 | Íconos de 256 para 64 px |
| RE-04 | **Hojas de sprites** ≤ 2.048 px de lado, ≤ 8 MB decodificados, ≤ 250 KB | Doc 14 |
| RE-05 | **Animaciones simultáneas** ≤ 12 en pantalla; nada de `filter: blur` animado | Hoy 124 `@keyframes` |
| RE-06 | **60 fps** en un Android barato (3–4 GB, densidad 2) medido con el perfil del navegador antes de cada lanzamiento | — |
| RE-07 | **Peso total** de `a/` ≤ 12,5 MB (doc 12); cada pieza nueva compensa borrando una sin uso | — |
| RE-08 | **Precarga** de la próxima pantalla de ceremonia durante la anterior, sin bloquear | — |

### 3.16 Materiales de tienda (MT)

| ID | Regla | Spec |
|---|---|---|
| MT-01 | **Ícono de app**: Paucho de fieltro de cara (recorte de `mate_b2`), sombrero cortando el borde superior, fondo `--sky` liso | 1024×1024 sin transparencia; legible a 48 px |
| MT-02 | **Capturas**: 5–8, en orden: Paucho grande + frase; el mate de la racha; la obra que se revela; la Casita; la racha de a dos | 1290×2796 (iOS 6,9") y 1080×1920 (Android) |
| MT-03 | **Una frase por captura** en cartel de madera, voseo, ≤ 6 palabras | «Cuidate un poquito cada día» |
| MT-04 | **Arte real de la app**, sin pantallas inventadas | — |
| MT-05 | **Nada falso**: ni reseñas, ni «millones de usuarios», ni premios que no existen | — |
| MT-06 | **Video de 15–30 s** que empieza con Paucho cebando y termina con la obra revelada | — |
| MT-07 | **Público 18+** declarado; las capturas no apuntan a chicos | — |
| MT-08 | **Sin lenguaje clínico** en título, subtítulo ni capturas | TX-04 |

**SÍ:** captura 1 con Paucho de primer plano y «Tu compañero para cuidarte». **NO:** una captura de Ajustes o del cuestionario.

---

## 4. Checklist de lanzamiento de una funcionalidad nueva

Se copia en el pedido de cambio y se marca cada línea. Una línea sin marcar frena el lanzamiento salvo que el dueño la firme.

| Capítulo | Revisar |
|---|---|
| Personaje | PJ-01 modelo único · PJ-05 tamaño · PJ-06 cara ≥ 50 px · PJ-08 estados bajos sin culpa · PJ-12 pies en el piso |
| Mascotas | MA-01 material · MA-02 escala · MA-06 ≤ 2 en primer plano |
| Vestimenta | VE-02 capa por pose o ropa base · VE-04 vista previa puesta · VE-06 alineación |
| Escenas | ES-01 encuadre · ES-02 sin cicatrices al 200 % · ES-04 nada liso > 60 px |
| Íconos | IC-01 de la hoja · IC-04 sin escenario · IC-06 sin emoji · IC-07 un significado · IC-09 bloqueado |
| Color | CO-01 un verde · CO-02 dorado solo premio · CO-07 tokens |
| Tipografía | TI-01 escala · TI-07 ≥ 12 px · TI-09 sin truncar |
| Componentes | UI-09 los cinco estados · UI-10 estado vacío |
| Layout | LA-01 ≥ 44 pt / 48 dp · LA-04 áreas seguras · LA-07 tres tamaños |
| Animación | AN-01 curva con nombre · AN-02 duración por tipo · AN-03 rebote solo premios · AN-12 sin teletransporte |
| Ceremonias | CE-01 diario ≤ 3 s · CE-03 se saltea · CE-06 un nivel 3 por sesión |
| Sonido | SO-01 grabado · SO-05 háptico correcto · SO-06 funciona en silencio |
| Texto | TX-01 voseo · TX-04 sin culpa ni clínica · TX-07 nada falso |
| Accesibilidad | AC-01 contraste · AC-03 etiquetas · AC-04 reducir movimiento |
| Rendimiento | RE-01 memoria · RE-05 ≤ 12 animaciones · RE-06 60 fps en Android barato |
| Tienda | MT-04 arte real · MT-05 nada falso (si la función entra a capturas) |

**Procedimiento de revisión**

1. **Capturas** de cada pantalla y estado nuevo a 390×844, 360×800 y 360×640, con la menor y la mayor cantidad de contenido (0 hábitos y 7; nombre corto y largo).
2. **Video de 10 s** de cada animación a 390×844, y la misma con «reducir movimiento» activado.
3. **Android chico real** (3–4 GB): abrir, recorrer y medir fps y memoria con el perfil del navegador.
4. **Comparación lado a lado** con la pantalla vecina más parecida que ya pasó: mismo Paucho, mismos íconos, mismos botones.
5. **Juez visual separado**: alguien (persona o agente) que no hizo la pieza recibe las capturas, esta checklist y `img/si-paucho-fieltro.jpg`, y devuelve aprobado o una lista con ID.
6. **El dueño la mira en su iPhone** instalado desde la pantalla de inicio antes de publicar.

---

## 5. Pipeline de producción de arte

**Hoy.** El arte nuevo se genera con ChatGPT desde kits de referencia (`kit_escena_mate/`, `kit_rancho_etapas/`), se baja a la Mac del dueño y se procesa con los importadores de `design/tools/` (`import_assets.py`, `import_mate_scene.py`, `import_area1.py`, `import_room.py`, `import_trabajando.py`, `make_mate_parts.py`), que quitan fondo y halos, alinean y exportan webp a `app/public/a/`. Rive se armó en la app de escritorio y quedó sin uso. El problema: cada tanda arranca de referencias distintas, y así nacieron cuatro dialectos de íconos y dos Pauchos.

**Cómo debe ser.**

1. **Hoja de modelo** (2048×1536, doc 12): frente, tres cuartos, perfil, espalda; 11 expresiones (PJ-07); manos; paleta de 8 muestras; medidas. Vive en `design/model/` y se adjunta a *toda* generación.
2. **Prompts base** versionados en `design/prompts/` (pose, plano limpio, íconos, animalito, prenda), con lienzo, fondo magenta `#FF00FF`, luz y lista negra (PJ-11). Se cambian por pedido de cambio, no a mano en cada chat.
3. **Una tanda = una hoja**: íconos de a 32, poses de a 4, prendas de a una por todas sus poses. Nunca piezas sueltas de un mismo sistema en días distintos.
4. **Importador por familia** en `design/tools/`, que imprime las cajas y anclas para el código (como `WORK_BOX`) y falla si la caja o la línea de pies cambian.
5. **Control de calidad** antes del juez: hoja de contactos (`contact.py`) a 100 % y 200 %; prueba de silueta (PJ-03); comparación de cara contra `mate_b2_habla_cerrada`; halos sobre tierra clara y madera oscura; peso y memoria (RE).
6. **Tope de 6 intentos** por pieza (doc 12) y 20 generaciones por ciclo de sprite (doc 14); al tope se guarda la mejor y se anota.
7. **Registro**: cada pieza en `a/` tiene en un CSV su prompt, referencia, fecha e intento ganador, para poder rehacerla igual.

---

## 6. Backlog visual priorizado

Tamaño: **S** ≤ 1 día · **M** 2–4 días · **L** ≥ 1 semana (estimación).

| Prioridad | Tarea | Tamaño | IDs | Doc |
|---|---|---|---|---|
| 1 | Sacar las reseñas inventadas | S | TX-07, MT-05 | 11 |
| 2 | Botón principal verde, dorado solo premios, barras de tarea en verde | S | CO-01, CO-02, UI-06 | 15 |
| 3 | Cinco curvas con nombre y reemplazo de los 45 rebotes | S | AN-01, AN-03 | 14 |
| 4 | Cámara 1,40× en Inicio | M | ES-01, PJ-05 | 13 |
| 5 | Hoja de modelo + 6 poses `g_*` en fieltro + avatar | M | PJ-01, PJ-12 | 12 |
| 6 | Plano limpio del Área 1 sin cicatrices | S | ES-02 | 12 |
| 7 | Hoja de 32 íconos; fuera emojis, granero, candado de metal y la segunda herradura | M | IC-01…IC-11 | 12 |
| 8 | Barra llena corta desde el día 2 | S | CE-02 | 15 |
| 9 | Contraste de la racha y escala tipográfica | S | AC-01, TI-01 | — |
| 10 | Sonidos grabados y voz en sílabas | M | SO-01, SO-02 | 15 |
| 11 | Prueba de sprites con el martillo (2 días) | M | AN-05 | 14 |
| 12 | 6 expresiones nuevas | M | PJ-07 | 06 |
| 13 | Ropa visible en pestaña Paucho y tienda | M | VE-02, VE-04 | 14 |
| 14 | Reducir movimiento completo | M | AC-04, CE-07 | 14 |
| 15 | Medición en Android de 3–4 GB | S | RE-01, RE-06 | — |
| 16 | Títulos en cartel de madera | S | TI-04 | 15 |
| 17 | Cuatro ciclos de sprites y caminar | L | AN-06…AN-08 | 14 |
| 18 | Materiales de tienda | M | MT-01…MT-08 | — |

**Pregunta abierta para el dueño.** El doc 13 fija ≥ 28 % del ancho para Paucho en Inicio (1,40× con el arte actual); esta guía pide ~35 % como meta. Llegar ahí exige una pose de reposo más ancha o 2½ tarjetas en pantallas chicas. Recomiendo cerrar V1 en 28 % y decidir el 35 % con la captura real en el iPhone.
