# 14 · Paucho se mueve de verdad
> Estado: propuesta · Etapa: Etapas 1–5 del plan (solo la prueba de 2 días); el resto, después de las 24 semanas · Mejora del plan: 14 · Depende de: 12, 13, 15

## En una línea
Cuatro ciclos por sprites (sorbo, martillo, salto, caminar) sacados de video generado entre dos poses que ya existen, después de una prueba de 2 días con un solo ciclo que decide si el camino sirve.

## Problema y oportunidad
Paucho es un títere de diapositivas (plan). En el código de `areas`:

- **Martilla con 3 poses:** `PauchoTrabaja` (`AreaScene.tsx`) encadena `arriba` 170 ms → `golpe` 130 ms → `base` 200 ms.
- **Respira escalando el bitmap** (`paucho-breathe`, 1,012 × 1,028 cada 3,2 s) y toma mate con 5 imágenes que se prenden y apagan en 10 s (`pmate__f0..4`).
- **Habla alternando 2 imágenes cada 130 ms**, sin relación con el texto (`PauchoTalk.tsx`).
- **Festeja con un salto de CSS** sobre una pose fija (`paucho--hop`, 0,5 s × 2) y **nunca camina**: pasa del banquito al caballete por corte.
- **Rive quedó sin uso.** `guachito.riv` (254 KB) es cambio de poses más párpados; `Gauchito.tsx`, el único que lo usa, no lo importa ninguna pantalla. El plan gratis pierde el view model al exportar (`design/rive/README.md`).

Rive y Spine piden partes en capas, y las partes del artista no rearman al personaje. El video entre dos poses da peso y tela en movimiento sin armar esqueleto (plan). Se lo aprendemos al rey de Royal Match, que actúa con todo el cuerpo, y al pajarito de Finch, que camina (plan).

## Objetivo y métricas
- **Primaria (prueba):** un ciclo aprobado por el juez con los 7 criterios de abajo, en 2 días y ≤ 20 generaciones.
- **Secundarias (si se aprueba):** 4 ciclos en producción; toques sobre Paucho por sesión (`paucho_tap`, doc 13).
- **Guardrails:** ≤ 8 MB decodificados por hoja y ≤ 14 MB cargados a la vez; ≤ 300 KB por archivo; 60 cuadros por segundo en un Android de 3–4 GB; la cara no cambia.

## Experiencia
1. **Sorbo (reposo, Área 1).** Cada 8 a 14 s levanta el mate, chupa, baja y suelta un «ahh» con vapor.
2. **Martillo (obra en marcha).** Levanta, pega, rebota; polvo y sonido en el cuadro del impacto. Si lo tocás, te mira.
3. **Salto (festejo de hábito).** Se agacha, salta con los brazos arriba, cae y se asienta. Reemplaza a `paucho--hop`.
4. **Caminar.** Con la barra llena va del banquito al caballete y vuelve cuando la obra se revela. La cámara lo sigue (doc 13).

Mientras una hoja carga, o si falla, se ve la pose fija de hoy, sin error visible. Con «reducir movimiento» queda el cuadro clave y el parpadeo.

## Reglas y números
A 12 cuadros por segundo (83 ms por cuadro). Celda de 288×384 px (salto: 288×480, por el aire).

| Ciclo | Primer → último cuadro | Celdas | Duración | Tipo | Hoja | RAM decodificada |
|---|---|---|---|---|---|---|
| Martillo | `trabaja_arriba` → `trabaja_golpe` → `trabaja_arriba` | 8 (impacto en la 4) | 667 ms | bucle; 2 a 4 golpes y pausa | 4×2 · 1152×768 | 3,5 MB |
| Sorbo | `mate_a1` → `mate_a3_sorbo` → `mate_a4_ahh` → `mate_a1` | 16, en 24 tiempos (sorbo y «ahh» se sostienen) | 2.000 ms | una vez | 4×4 · 1152×1536 | 7,1 MB |
| Salto | idle → festejo → idle, estilo único (doc 12) | 12 (despegue 3, caída 9) | 1.000 ms | una vez | 4×3 · 1152×1440 | 6,6 MB |
| Caminar | contacto izquierdo → contacto derecho (2 poses nuevas) | 8 | 667 ms | bucle; avanza 0,9 × su alto por ciclo | 4×2 · 1152×768 | 3,5 MB |

RAM = ancho × alto × 4. Las cuatro suman 20,7 MB; nunca hay más de dos cargadas (peor caso, sorbo + salto: 13,7 MB).

| Regla | Valor | Por qué |
|---|---|---|
| Alto de Paucho en la celda | ≤ 344 px | a 1,40× mide 172 px CSS (doc 13): nítido en densidad 2; en densidad 3 se amplía 1,5×, como el escenario |
| Lado máximo de hoja | 2.048 px | límite de textura de teléfonos viejos |
| Archivo | webp con alfa, calidad 82; martillo ≤ 150 KB, resto ≤ 300 KB (estimación) | — |
| Por hoja | ≤ 8 MB decodificados | por eso el sorbo sostiene cuadros en vez de sumar celdas |
| Simultáneo | ≤ 14 MB | una etapa de área ya ocupa 6,3 MB (doc 13) |
| Carga | ciclo del estado actual; el siguiente probable con el hilo libre | plan: cargar solo lo activo |
| Ancla | centro de los pies en x 50 %, y 94 % de la celda; deriva ≤ 2 px | misma línea de suelo que las poses; que no patine |

**Prueba de 2 días: el martillo.** Se ve 8 horas por día, es el más corto, sus poses ya están alineadas al píxel y el caballete quieto delata cualquier deriva.

- Día 1: 10 generaciones; elegir las 2 mejores; cortar, limpiar, empaquetar.
- Día 2: integrarlo detrás del menú de pruebas; grabar 10 s a 390×844 en iPhone y en un Android barato; pasarlo al juez al lado del martillo actual.

| Criterio | Aprobado | Rechazado |
|---|---|---|
| Cara | ningún cuadro marcado «otra cara» frente a `trabaja_base` | 1 o más |
| Bordes | sin halo a 300 %, sobre tierra clara y madera oscura | halo en cualquier cuadro |
| Pies y caballete | deriva ≤ 2 px; caballete ≤ 1 px | patina o tiembla |
| Costura del bucle | invisible en 10 repeticiones | salto visible |
| Peso | ≤ 150 KB y ≤ 3,5 MB decodificados | más |
| Rendimiento | sin cuadros perdidos en el Android barato | tirones |
| Costo | ≤ 2 días y ≤ 20 generaciones | más |

7 de 7: se producen los otros tres. 5 o 6: un día más, una sola vez. Menos: se sigue con poses (plan) y se cotiza el esqueleto.

## Contenido necesario
- 4 hojas de sprites, 2 poses nuevas de caminata y 4 máscaras del pañuelo (una por ciclo).
- Sin textos nuevos. Sonidos atados a cuadros (doc 15): martillazo en la celda 4, pasos en los contactos, caída del salto en la 9, sorbo y «ahh».

## Arte, animación y sonido
Reglas de movimiento: `docs/visual/guia-visual.md` (P6). La producción:

1. **Poses** sobre magenta plano #FF00FF, 1024×1280. Verde no: el termo es verde.
2. **Generar** con una herramienta de imagen a video con primer y último cuadro, 4–5 s. Indicación: «Cámara fija, fondo plano sin cambios; el personaje no cambia de cara, ropa ni proporciones; movimiento: {acción}; sin desenfoque de movimiento». Qué herramienta rinde mejor a fines de 2026 no está verificado (plan): lo mide la prueba.
3. **Cortar** con ffmpeg y bajar a 12 por segundo (`fps=12`). Los bucles cierran en el cuadro anterior al primero.
4. **Limpiar fondo:** clave sobre magenta, quitar el tinte del borde, alfa con 1 px de suavizado (criterio de `import_mate_scene.py`).
5. **Alinear** por la base de los pies, recortar a la celda, empaquetar en webp y escribir los datos, como `import_trabajando.py` escribe `WORK_BOX`.
6. **Revisar** con una hoja de contactos (`design/tools/contact.py`) antes del juez.

## Datos y técnica
- Sin cambios al guardado.
- `design/tools/import_sprites.py` (pasos 3 a 5), en la Mac del dueño; videos en `sprites_src/`, fuera de git. Salida: `app/public/a/spr_{ciclo}.webp` y `app/src/game/sprites.ts` (generado).
- **Reproducción:** `components/Sprite.tsx`, una caja con `overflow: hidden` y la hoja adentro. Un solo `requestAnimationFrame` compartido avanza el cuadro cada 83 ms con `transform: translate` (capa compuesta, sin repintar). Props: `name`, `loop`, `timing` (sostener celdas), `onFrame(n)`, `onEnd`. Se pausa con la app oculta. `img.decode()` antes de reemplazar la pose fija, para que no parpadee.
- `PauchoTrabaja` conserva golpes y pausas y dispara polvo y sonido en `onFrame(4)`. `PauchoMate` reemplaza `pm0..pm4`. `Paucho.tsx` usa el salto.
- Caminar: `AreaScene` mueve la caja entre dos puntos del arte a velocidad constante y espeja la hoja según el sentido.
- Si la prueba se aprueba, se borran `RiveGauchito.tsx`, `Gauchito.tsx`, `guachito.riv` y `@rive-app/react-canvas`.

**La ropa de la tienda sobre sprites.** Hoy es una capa por pose (`WEAR` en `shop.ts`): solo los 2 pañuelos tienen arte, para idle, festejo y avatar (plan: 4 de 6 prendas no se ven puestas). Con 44 celdas, una capa dibujada por celda no escala.

| Alternativa | Cómo | Costo | Límite |
|---|---|---|---|
| A. Teñir con máscara | máscara del pañuelo por ciclo; color aplicado en el cliente | 4 hojas de ≈ 20 KB (estimación) | solo cambia el color de una prenda que ya está |
| B. Hornear variantes | hoja completa por prenda y ciclo | 3 lugares × 3 opciones = 27 combinaciones × 4 ciclos | inviable pasadas 2 o 3 prendas |
| C. Ropa en planos fijos | en el campo, ropa base y pañuelo teñido; la prenda completa en Casita, pestaña Paucho y tarjetas (doc 10) | cero | la prenda no se luce en Inicio |
| D. Esqueleto pago una vez | un animador arma a Paucho en capas en Rive o Spine; la ropa es un cambio de piel | encargo único y, en Rive, plan pago para exportar el view model; a cotizar | tercero y arte rehecho en capas |

Recomendación: A + C. D se evalúa si la prueba falla o cuando la tienda pase de 10 prendas visibles: ahí vender ropa que no se ve en Inicio cuesta ingresos (doc 17).

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `sprite_load_failed` | una hoja no carga o no decodifica | `name`, `net` |
| `sprite_fps_low` | una vez por sesión si baja de 50 cuadros por segundo con un ciclo activo | `name`, `fps`, `device_mem` |

## Casos borde y riesgos
- **La cara cambia** (riesgo principal, plan): lo corta la prueba; no se producen 4 ciclos a ciegas.
- **Manos y ala del sombrero** se deforman a mitad del movimiento: hasta 2 celdas por ciclo se corrigen a mano; más, se regenera.
- **Memoria:** el sorbo se descarga al empezar la obra; con `navigator.deviceMemory` ≤ 2 GB quedan las poses de hoy.
- **La ropa comprada no aparece en el campo:** Paucho lo dice al comprar («Esta me la guardo para las fotos»).
- **Licencia del video generado:** confirmar uso comercial antes de publicar.
- **Bienestar y tiendas:** sin impacto; ningún ciclo expresa reproche.

## Fases
- **V1 (dentro de las 24 semanas):** solo la prueba del martillo y su decisión.
- **V2 (si se aprueba):** sorbo, salto y caminar, en ese orden; máscaras; borrar Rive.
- **Más adelante:** bostezo y frío para estados bajos (doc 06); el perro y los animalitos (doc 03) con el mismo importador.
- **Afuera:** boca sincronizada por fonema; esqueleto, salvo que la prueba falle.

## Criterios de aceptación
- [ ] Tabla de 7 criterios completa y firmada por el juez, con las dos grabaciones.
- [ ] `import_sprites.py` regenera hoja y `sprites.ts` con un solo comando.
- [ ] El martillo corre a 12 cuadros por segundo; polvo y sonido en la celda 4 (± 1).
- [ ] Ninguna hoja supera 2.048 px de lado, 300 KB ni 8 MB decodificados.
- [ ] Sin la hoja, se ve la pose fija sin error; con «reducir movimiento», no corre ningún ciclo.
- [ ] Los pañuelos celeste y amarillo se ven en el martillo con la máscara.
- [ ] `npm run verify` pasa.

## Preguntas abiertas
1. **¿Prueba con el martillo o con el sorbo?** Recomiendo el martillo: más visto, más corto, más fácil de juzgar.
2. **¿Ropa completa solo en planos fijos (C)?** Recomiendo que sí hasta tener 10 prendas.
3. **¿Cotizar el esqueleto durante la prueba?** Recomiendo que sí: no cuesta y da el número si falla.
4. **¿Borrar Rive al aprobar?** Recomiendo que sí: 254 KB más su librería, sin uso.
