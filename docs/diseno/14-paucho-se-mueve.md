# 14 · Paucho se mueve de verdad
> Estado: propuesta · Etapa: Etapas 1–5 del plan (solo la prueba de 2 días); el resto, después de las 24 semanas · Mejora del plan: 14 · Depende de: 12, 13, 15

## En una línea
Cuatro ciclos de animación por sprites (sorbo, martillo, salto, caminar) sacados de video generado entre dos poses que ya existen, precedidos por una prueba de 2 días con un solo ciclo que decide si el camino sirve.

## Problema y oportunidad
Paucho es un títere de diapositivas (plan). En el código:

- **Martilla con 3 poses.** `PauchoTrabaja` (AreaScene.tsx) alterna `arriba` 170 ms → `golpe` 130 ms → `base` 200 ms. Son 2 cuadros por segundo de movimiento real.
- **Respira escalando el bitmap.** `paucho-breathe`: escala 1,012 × 1,028 cada 3,2 s.
- **Toma mate con 5 imágenes** en un ciclo de 10 s (`pmate__f0..4`).
- **Habla alternando 2 imágenes cada 130 ms**, sin relación con el texto (`PauchoTalk.tsx`).
- **Festeja con un salto de CSS** sobre una pose fija (`paucho--hop`, 0,5 s × 2).
- **Nunca camina.** Pasa de sentado a martillando por corte.
- **Rive quedó sin uso.** `guachito.riv` (253 KB) es un cambio de poses con párpados; `Gauchito.tsx` no está importado por ninguna pantalla de la rama `areas`. Las exportaciones del plan gratis pierden el view model (`design/rive/README.md`).

Rive y Spine piden partes en capas, y las partes modulares del artista no reconstruyen al personaje. El video entre dos poses da peso y tela en movimiento sin armar un esqueleto (plan). Referencias: el rey de Royal Match actúa con todo el cuerpo; el pajarito de Finch camina (plan).

## Objetivo y métricas
- **Primaria (prueba):** un ciclo aprobado por el juez con los 7 criterios de abajo, en 2 días y 20 generaciones como máximo.
- **Secundarias (si se aprueba):** 4 ciclos en producción; toques sobre Paucho por sesión (`paucho_tap`, doc 13).
- **Guardrails:** ≤ 8 MB decodificados por hoja y ≤ 20 MB de hojas cargadas a la vez; ≤ 250 KB por archivo; 60 cuadros por segundo de interfaz en un Android de 3–4 GB; la cara no cambia.

## Experiencia
Lo que ve el jugador, ciclo por ciclo:

1. **Sorbo (reposo, Área 1).** Sentado en el banquito, cada 8 a 14 s levanta el mate, chupa, baja y suelta un «ahh» con vapor. Entre sorbos respira y parpadea.
2. **Martillo (obra en marcha).** Levanta, pega, rebota. El polvo y el sonido salen en el cuadro del impacto. Tocado, te mira (pose fija actual).
3. **Salto (festejo).** Con cada hábito: se agacha, salta con los brazos arriba, cae y se asienta. Reemplaza a `paucho--hop`.
4. **Caminar.** Con la barra llena va del banquito al caballete; al volver una obra, de ahí a su lugar. La cámara lo sigue (doc 13).

Estados: mientras una hoja carga se muestra la pose fija de hoy; si falla, queda la pose fija para siempre (sin error visible). Con «reducir movimiento» se muestra el cuadro clave y solo se conserva el parpadeo.

## Reglas y números
Los cuatro ciclos, a 12 cuadros por segundo (83 ms por cuadro):

| Ciclo | Primer → último cuadro | Cuadros | Duración | Tipo | Grilla y hoja | RAM decodificada |
|---|---|---|---|---|---|---|
| Martillo | `trabaja_arriba` → `trabaja_golpe` → `trabaja_arriba` | 8 (impacto en el 4) | 667 ms | bucle, 2 a 4 golpes y pausa | 4×2 · 1024×640 | 2,6 MB |
| Sorbo | `mate_a1_base` → `mate_a3_sorbo` → `mate_a4_ahh` → `mate_a1_base` | 24 | 2.000 ms | una vez, dentro del reposo | 6×4 · 1536×1280 | 7,9 MB |
| Salto | idle de fieltro → festejo de fieltro → idle (doc 12) | 12 (despegue en el 3, caída en el 9) | 1.000 ms | una vez | 4×3 · 1024×960 | 3,9 MB |
| Caminar | contacto izquierdo → contacto derecho (2 poses nuevas, de tres cuartos) | 8 | 667 ms | bucle; avanza 0,9 × su alto por ciclo | 4×2 · 1024×640 | 2,6 MB |

Total: 52 cuadros y 17 MB decodificados si se cargaran todos; nunca se cargan más de dos a la vez.

| Regla | Valor | Por qué |
|---|---|---|
| Celda | 256×320 px | Paucho mide 172 px CSS a 1,40× (doc 13); cubre densidad 2 con margen para el salto |
| Lado máximo de hoja | 2.048 px | límite de textura de teléfonos viejos |
| Archivo | webp con alfa, calidad 82, ≤ 250 KB | similar a 3 poses actuales |
| Presupuesto por hoja | ≤ 8 MB decodificados (ancho × alto × 4) | el sorbo es el techo |
| Presupuesto simultáneo | ≤ 20 MB | una etapa de área ya ocupa 6,3 MB |
| Carga | solo los ciclos del estado actual; el resto al quedar libre el hilo | plan: cargar solo el área activa |
| Ancla | centro de los pies en x 50 %, y 94 % de la celda | misma línea de suelo que las poses |
| Deriva de pies permitida | ≤ 2 px por celda | que no patine |
| Generaciones por ciclo | ≤ 20 | acota el costo |

**Prueba de 2 días: el martillo.** Se elige porque se ve 8 horas por día, es el más corto, sus dos poses ya están alineadas al píxel y el caballete quieto delata cualquier deriva.

- Día 1: 10 generaciones, elegir las 2 mejores, cortar, limpiar, empaquetar.
- Día 2: integrarlo detrás de una opción del menú de pruebas, grabar 10 s a 390×844 en iPhone y en un Android barato, y pasarlo al juez junto al martillo actual.

| Criterio | Aprobado | Rechazado |
|---|---|---|
| Cara | el juez no marca ningún cuadro como «otra cara» frente a `trabaja_base` | 1 o más cuadros |
| Bordes | sin halo ni resto de fondo a 300 %, sobre tierra clara y sobre madera oscura | halo visible en cualquier cuadro |
| Pies y caballete | deriva ≤ 2 px; caballete ≤ 1 px | patina o el caballete tiembla |
| Costura del bucle | no se nota en 10 repeticiones | salto visible |
| Peso | ≤ 150 KB y ≤ 2,6 MB decodificados | más |
| Rendimiento | sin caída de cuadros en el Android barato | tirones |
| Costo | ≤ 2 días y ≤ 20 generaciones | más |

Con 7 de 7 se producen los otros tres ciclos. Con 5 o 6 se repite un día más, una sola vez. Con menos se sigue con poses (plan) y se pasa a la alternativa del esqueleto.

## Contenido necesario
- 4 hojas de sprites y 2 poses nuevas de caminata.
- 1 hoja de máscara de pañuelo por ciclo (4), para la ropa.
- Sin textos nuevos. Sonidos por cuadro: golpe de martillo, sorbo y «ahh», caída del salto, pasos (lista en doc 15).

## Arte, animación y sonido
Reglas de movimiento (anticipación, peso, curvas): `docs/visual/guia-visual.md`. La producción, paso a paso:

1. **Preparar las dos poses** sobre fondo magenta plano #FF00FF a 1024×1280. Verde no: el termo de Paucho es verde.
2. **Generar** con una herramienta de imagen a video que acepte primer y último cuadro, 5 s a 24 cuadros por segundo. Indicación: «Cámara fija, fondo plano sin cambios, el personaje no cambia de cara, ropa ni proporciones; movimiento: {acción}; sin desenfoque de movimiento». Qué herramienta rinde mejor a fines de 2026 no está verificado (plan): es lo que mide la prueba.
3. **Cortar** con ffmpeg el tramo útil y quedarse con un cuadro de cada dos (12 por segundo). Para bucles, cerrar con el primer cuadro.
4. **Limpiar fondo:** clave de color sobre magenta, quitar el tinte del borde, alfa con 1 px de suavizado. Mismo criterio de halos que `import_mate_scene.py`.
5. **Alinear** cada cuadro por la base de los pies y recortar a la celda.
6. **Empaquetar** la grilla en webp y **escribir los datos** (cuadros, grilla, ancla, cuadros de evento), como `import_trabajando.py` imprime `WORK_BOX`.
7. **Revisar** con una hoja de contactos (`design/tools/contact.py`) antes de mandarla al juez.

Riesgos de arte conocidos: cara que cambia entre cuadros, bordes sucios (plan), y manos o guarda del sombrero que se deforman a mitad del movimiento.

## Datos y técnica
- Sin cambios al guardado.
- Herramienta nueva: `design/tools/import_sprites.py` (pasos 3 a 6). Corre en la Mac del dueño; el video original queda en `sprites_src/`, fuera de git.
- Archivos: `app/public/a/spr_{ciclo}.webp` y `app/src/game/sprites.ts` (generado).
- Componente nuevo `components/Sprite.tsx`: una caja con `overflow: hidden` y la hoja adentro; un solo `requestAnimationFrame` compartido avanza el cuadro cada 83 ms moviendo la hoja con `transform: translate` (no repinta). Props: `name`, `loop`, `onFrame(n)`, `onEnd`. Se pausa con la app oculta.
- `PauchoTrabaja` conserva su lógica de 2 a 4 golpes y pausas; cambia el trío de poses por el ciclo y dispara polvo y sonido en `onFrame(4)`. `PauchoMate` reemplaza `pm0..pm4`. `Paucho.tsx` usa el salto en lugar de `paucho--hop`.
- Caminar: `AreaScene` mueve la caja entre dos puntos del arte a velocidad constante y espeja la hoja según el sentido.
- Rive: si la prueba se aprueba, se borran `RiveGauchito.tsx`, `Gauchito.tsx`, `guachito.riv` y la dependencia `@rive-app/react-canvas`.

**La ropa de la tienda sobre sprites.** Hoy la ropa es una capa por pose (`WEAR` en shop.ts): 2 pañuelos con arte para idle, festejo y avatar; las poses de trabajo ya no tienen capa, y 4 de 6 prendas no se ven puestas (plan). Con 52 cuadros, una capa por cuadro no escala. Alternativas:

| Alternativa | Cómo | Costo | Límite |
|---|---|---|---|
| A. Teñir con máscara | una hoja de máscara del pañuelo por ciclo; el color se aplica en el cliente | 4 hojas de ≈ 20 KB (estimación) | solo sirve para cambios de color de una prenda que ya está |
| B. Hornear variantes | una hoja completa por prenda y ciclo | 4 hojas por prenda; con 3 lugares de 3 opciones son 27 combinaciones × 4 | inviable más allá de 2 o 3 prendas de cuerpo entero |
| C. Ropa solo en planos fijos | en el campo, Paucho usa su ropa base más el pañuelo teñido; la prenda completa se ve en Casita, pestaña Paucho, de cerca y en las tarjetas (doc 10) | cero | la prenda no se luce en Inicio |
| D. Esqueleto pago una vez | un animador arma a Paucho en capas en Rive o Spine; la ropa pasa a ser un cambio de piel | un encargo único y, en Rive, el plan pago para exportar el view model; precio a cotizar | depende de un tercero y de rehacer el arte en capas |

Recomendación: A + C para la prueba y los cuatro ciclos. D se evalúa si la prueba falla, o cuando la tienda pase de 10 prendas visibles: ahí vender ropa que no se ve en Inicio empieza a costar ingresos (doc 17).

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `sprite_load_failed` | una hoja no carga o no decodifica | `name`, `net` |
| `sprite_fps_low` | una vez por sesión si el promedio baja de 50 cuadros por segundo con un ciclo activo | `name`, `fps`, `device_mem` |

## Casos borde y riesgos
- **La cara cambia** (riesgo principal, plan): lo corta la prueba; no se producen 4 ciclos a ciegas.
- **Memoria en Android de 3–4 GB:** el sorbo (7,9 MB) se descarga al empezar la obra; si `deviceMemory` ≤ 2 GB, se queda con las 5 imágenes actuales.
- **La ropa comprada no aparece en el campo:** Paucho lo dice en la Casita al comprar («Esta me la pongo para las fotos»), para que no parezca un error.
- **Licencia del video generado:** confirmar que los términos de la herramienta permiten uso comercial antes de publicar.
- **Bienestar y tiendas:** sin impacto; ningún ciclo expresa reproche ni tristeza por la ausencia del jugador.

## Fases
- **V1 (dentro de las 24 semanas):** solo la prueba de 2 días con el martillo y su decisión.
- **V2 (después, si se aprueba):** sorbo, salto y caminar, en ese orden; máscaras de pañuelo; borrar Rive.
- **Más adelante:** ciclos de estados bajos (bostezo, frío; doc 06), el perro y los animalitos (doc 03) con el mismo importador.
- **Afuera:** boca sincronizada por fonema; esqueleto, salvo que la prueba falle.

## Criterios de aceptación
- [ ] La prueba tiene su tabla de 7 criterios completada y firmada por el juez, con las dos grabaciones.
- [ ] `import_sprites.py` regenera la hoja desde el video con un solo comando y escribe `sprites.ts`.
- [ ] El martillo corre a 12 cuadros por segundo; polvo y sonido salen en el cuadro 4 (± 1 cuadro).
- [ ] Ninguna hoja supera 2.048 px de lado, 250 KB ni 8 MB decodificados.
- [ ] Con la hoja ausente, se ve la pose fija y no hay error en pantalla.
- [ ] Con «reducir movimiento», no corre ningún ciclo.
- [ ] El pañuelo celeste y el amarillo se ven en el martillo con la máscara.
- [ ] `npm run verify` pasa.

## Preguntas abiertas
1. **¿La prueba es con el martillo o con el sorbo?** Recomiendo el martillo: más visto, más corto y más fácil de juzgar.
2. **¿Ropa completa solo en planos fijos (C)?** Recomiendo que sí hasta tener 10 prendas; decide cuánto vale la tienda de ropa.
3. **Si la prueba falla, ¿se cotiza el esqueleto o se queda en poses?** Recomiendo pedir una cotización de todos modos durante la prueba: no cuesta y da el número.
4. **¿Se borra Rive al aprobar?** Recomiendo que sí: hoy pesa 253 KB más su librería y no se ve en ninguna pantalla.
