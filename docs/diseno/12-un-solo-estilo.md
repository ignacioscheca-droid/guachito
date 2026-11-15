# 12 · Un solo Paucho, un solo estilo
> Estado: propuesta · Etapa: Etapas 1–5 del plan (antes del lanzamiento suave) · Mejora del plan: 12 · Depende de: 13, 14, 15, guía visual

## En una línea
Fijar el Paucho de fieltro (`mate_*`, ala ancha) como único modelo, rehacer solo las 14 piezas del estilo viejo que todavía se ven, limpiar la primera escena y regenerar los íconos en una sola hoja con la misma luz.

## Problema y oportunidad
Lo que delata a la app al lado de Finch es la mezcla, no la calidad de cada pieza (plan). El inventario de `app/public/a/` en la rama `areas` da 313 archivos y 12,5 MB, con estos choques:

- **Dos Pauchos en la misma ceremonia.** `AreaDone` (Reveal.tsx:186) muestra `g_jump` (sombrero chico, sombreado plano) y 1,7 s después `PauchoTalk` muestra `mate_b4_contento` (ala ancha, fieltro). En el campo, `Paucho.tsx` usa `g_idle`, `g_celebrate`, `g_wave` y `g_thumbs`; al lado, `PauchoTrabaja` y `PauchoMate` ya son de fieltro.
- **La cara de la barra de pestañas es la vieja.** `g_avatar` está en la pestaña Paucho, el perfil, la revelación, el viaje y los encargos.
- **Cicatrices en la primera pantalla.** `area1_scene_0.webp` (1024×1536) tiene dos placas verdes planas sobre los troncos (izquierda x≈0–180, derecha x≈860–1024, y≈330–420) y un hueco blanco en las sierras (x≈690–830, y≈215–260). Las etapas 1 a 3 salen del mismo plano y las heredan.
- **Cuatro dialectos de íconos.** Dorado metálico (`ui_herradura`, `ui_energia`, `ui_candado`, `ui_moneda`), mate suave (`habit_*`), pintado (`nav_*`, `ui_tab_*`) y recortes del cuarto con pared y piso (`thumb_*`).
- **Fuera de modelo.** `nav_rancho.webp` es un granero rojo norteamericano con techo a dos aguas quebrado; se muestra al abrir «Áreas» (Welcomes.tsx:37). La pestaña Encargos usa `room_top_libreta` como reemplazo.

Se lo aprendemos a Duolingo: Duo es idéntico en cada superficie (plan).

## Objetivo y métricas
- **Primaria:** cero piezas del estilo viejo visibles en los flujos de los días 0 a 10. Se mide con una lista de capturas a 390×844 revisada por el juez (regla A de los estándares de calidad).
- **Secundarias:** un solo dialecto de íconos (0 de 4 sobrantes); peso de `a/` ≤ 12,5 MB después de sumar lo nuevo (se compensa borrando 2,0 MB sin uso).
- **Guardrail:** ninguna pieza nueva cambia la caja ni la línea de pies de la que reemplaza (906×990, botas en y = 982,5), para no tocar posiciones en `journey.ts`.

## Experiencia
El jugador no ve una función nueva: deja de ver saltos. Recorrido de control, en este orden:

1. Onboarding: escena del mate sobre la etapa 0 del Área 1, sin placas ni hueco.
2. Inicio día 0: Paucho sentado (fieltro) → hábito hecho → festejo en el campo (hoy `g_celebrate`, pasa a fieltro).
3. Barra llena → `PauchoTalk` → martillo. Un solo Paucho en los tres tiempos.
4. Revelación y área completada: el salto grande es de fieltro.
5. Barra de pestañas: cinco íconos de la misma hoja; la cara de Paucho es de ala ancha.
6. Casita: miniaturas de la tienda sobre fondo crema, sin pared ni piso.

Estado de error: si una pieza nueva falta, `art()` sigue sirviendo la vieja; el cambio es archivo por archivo, sin bandera.

## Reglas y números
Inventario real y destino de cada familia:

| Familia | Archivos | KB | Estilo | Destino |
|---|---|---|---|---|
| `mate_*` (7 planos generales, 21 planos medios, 3 partes del mate) | 31 | 2.291 | fieltro | **Quedan.** Son el modelo |
| `trabaja_*`, `libreta_*`, `paucho_room_*`, `paucho_maiz` | 28 | 1.370 | fieltro | Quedan |
| `g_*` visibles: idle, celebrate, wave, thumbs, jump, avatar | 6 | 373 | viejo | **Se rehacen** |
| `g_*` sin pantalla: sad, sleep, surprised, pet, think, mate, map | 7 | 456 | viejo | Se borran (think, mate y map salen de `POSE_ART`) |
| `wear_*` (2 pañuelos × idle, celebrate, avatar) | 6 | 35 | viejo | Se rehacen sobre las poses nuevas |
| `dog_sit`, `dog_sleep` (campo, todos los días desde el Área 2) | 2 | 35 | viejo | Se rehacen con el perro de `perro_room_*` |
| `dog_*` resto y `ride_*` (solo en el viaje al sur) | 18 | 770 | viejo | Quedan; fuera de alcance |
| `perro_*`, `cucha_*`, `michi_*` | 18 | 714 | fieltro | Quedan |
| `area1_*` | 20 | 1.261 | fieltro | **Se retoca** el plano limpio; se reimportan `scene_0..3` y `etapa0` |
| `area2_*` | 25 | 1.485 | fieltro | Quedan |
| `area3_0`, `bg_patio` | 2 | 196 | provisorio | `area3_0` espera su arte; `bg_patio` se borra |
| `room_*` | 52 | 747 | fieltro | Quedan |
| `thumb_*` | 44 | 288 | recorte con pared | **Se retocan por script** (fondo crema) |
| `habit_*`, `ui_*`, `nav_*` | 30 | 524 | 3 dialectos | **Se rehacen** en una hoja |
| `item_*`, `story_*` | 21 | 1.281 | viejo | Se borran: ningún código los nombra |
| `ill_*` | 3 | 363 | viejo | Queda `ill_adventure_ready` (viaje); las otras dos se borran |

Total a producir: 8 poses, 6 capas de ropa, 1 plano limpio, 1 hoja de 32 íconos. Total a borrar: 31 archivos, cerca de 2,0 MB.

| Regla | Valor | Por qué |
|---|---|---|
| Modelo único | `mate_a1_base` (cuerpo) y `mate_b2_habla_cerrada` (cara) | Son las más vistas y aprobadas |
| Caja de pose de campo | 906×990, botas en y = 982,5 | No mover `hero` ni las capas de ropa |
| Hoja de íconos | 4096×2048, grilla 8×4, celda 512, margen 48 | Una sola generación = una sola luz |
| Salida de ícono | 256×256 webp, ≤ 20 KB | Igual a hoy |
| Luz | arriba a la izquierda, 45°; sombra propia suave, sin sombra arrojada | La de `mate_*` |
| Intentos por pieza | máximo 6; al sexto se guarda la mejor y se anota | Acota el costo |

## Contenido necesario
- **Hoja de modelo de Paucho** (1 imagen, 2048×1536): frente, tres cuartos, perfil y espalda; 6 expresiones (contento, habla, escucha, curioso, dormido, sorprendido); manos (abierta, puño, sosteniendo); paleta con 8 muestras; medidas: 2,6 cabezas de alto, ala del sombrero = 1,45 × ancho de cabeza, guarda de 9 rombos. Se arma recortando `mate_*` existentes; lo que falte (perfil, espalda) se genera.
- **8 poses de campo:** idle parado, festejo, saludo, pulgar arriba, salto, avatar (256×256), perro sentado, perro dormido.
- **6 capas de pañuelo** (celeste y amarillo × idle, festejo, avatar): salen por recoloreo con máscara, como hace `build_placeholders.py`.
- **Plano limpio del Área 1:** una imagen 1024×1536.
- **Hoja de íconos (32):** 12 hábitos, 5 pestañas (mapa, libreta de encargos, mate de inicio, casita criolla de adobe y tejas, estancia con tranquera para «Áreas» en lugar del granero), herradura, energía, candado, check, amistad, bolsa, premium, viaje, puesto, 5 solapas del cuarto y termo (hoy es un emoji 🧉).

## Arte, animación y sonido
Las reglas de estilo (paleta, contorno, textura, luz) están en `docs/visual/guia-visual.md`; acá va solo la producción.

**Prompts base** (se pegan con la hoja de modelo y dos `mate_*` como referencia):

- Pose: «Mismo personaje de la hoja de modelo, sin cambiar proporciones, cara, bigote ni sombrero de ala ancha. Estilo muñeco de fieltro, luz suave desde arriba a la izquierda. Cuerpo entero, de frente, pose: {pose}. Fondo magenta plano #FF00FF, sin sombra en el piso, sin texto. Lienzo 906×990, botas apoyadas a 8 px del borde inferior.»
- Plano limpio: «Editá solo las zonas marcadas: completá las copas de los dos árboles y la sierra del fondo siguiendo lo que las rodea. No cambies nada más. Mismo tamaño, 1024×1536.»
- Íconos: «Hoja de 32 íconos en grilla 8×4, fondo magenta plano, cada objeto centrado y del mismo tamaño aparente. Mismo material de fieltro, misma luz arriba a la izquierda, sin brillo metálico, sin sombra arrojada. Objetos: {lista}.»

Sonido: no aplica.

## Datos y técnica
- Sin cambios al guardado.
- Código: `Paucho.tsx` (`POSE_ART` apunta a `paucho_*` nuevos; se quitan think, mate, map), `Reveal.tsx:186`, `ui.tsx` (TABS), `Welcomes.tsx:37`, `shop.ts` (`WEAR`). Se borra `Gauchito.tsx` si el doc 14 confirma que Rive no vuelve.
- Herramientas: `design/tools/import_area1.py` (reimportar etapas desde el plano retocado), `import_room.py` (miniaturas sobre `--cream` en vez de recorte con pared), y un importador nuevo `import_icons.py` (corta la hoja por grilla, quita magenta, recorta a 256).
- El arte original no está en git: la generación y los importadores corren en la Mac del dueño.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `art_missing` | `art()` pide un archivo que no carga | `name`, `screen` |

No hay evento de producto: el efecto se lee en D1 y D7 del corte siguiente (doc 27).

## Casos borde y riesgos
- **La generación cambia la cara.** Se mitiga con la hoja de modelo y el tope de 6 intentos; el juez compara contra `mate_b2_habla_cerrada`.
- **La hoja de íconos sale despareja entre celdas.** Si más de 4 de 32 fallan, se parte en dos hojas de 16 con la primera como referencia.
- **Retocar el plano mueve píxeles.** `import_area1.py` recorta obras por diferencia entre etapas; se verifica que las cajas de `journey.ts` no cambien.
- **Tiendas:** el granero no es un riesgo de revisión, sí de marca. Sin impacto de bienestar.

## Fases
- **V1 (5 días de trabajo, estimación):** día 1 hoja de modelo; día 2 plano limpio del Área 1 y reimportación; días 3–4 las 8 poses y los pañuelos; día 5 hoja de íconos, miniaturas y borrado.
- **V2:** `ride_*` y `dog_run_*` del viaje; íconos de recuerdos y animalitos (docs 01 y 03) en la misma hoja.
- **Afuera (plan):** rehacer todo el arte; solo se tocan las poses viejas que todavía se ven.

## Criterios de aceptación
- [ ] Ninguna captura de los días 0–10 a 390×844 muestra una pieza `g_*`, `dog_sit` o `dog_sleep` viejos.
- [ ] `area1_scene_0..3` sin placas ni hueco, comparadas al 200 %.
- [ ] Las 5 pestañas y los 12 hábitos vienen de la misma hoja; el juez no distingue dialectos.
- [ ] `nav_rancho.webp` no existe en `a/`.
- [ ] Las poses nuevas pisan el mismo punto del suelo que las viejas (diferencia ≤ 2 px a 390 de ancho).
- [ ] `npm run verify` pasa y `a/` pesa ≤ 12,5 MB.
- [ ] El sistema de diseño se republica con los íconos nuevos.

## Preguntas abiertas
1. **¿El avatar de la pestaña sale de un recorte de `mate_b2` o se genera aparte?** Recomiendo recorte: cero riesgo de cara distinta.
2. **¿Se borra el archivo Rive y `Gauchito.tsx`?** Recomiendo decidirlo con el resultado de la prueba del doc 14.
3. **¿El ícono de Inicio sigue siendo el mate?** Recomiendo que sí: es la marca de la racha.
4. **¿`ride_*` entra en V1?** Recomiendo que no: se ve una vez cada 10 trabajos.
