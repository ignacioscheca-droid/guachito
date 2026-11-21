# 14 · Paucho se mueve de verdad
> Estado: propuesta · Etapa: Etapas 1–5 del plan (solo la prueba de 2 días); el resto, después de las 24 semanas · Mejora del plan: 14 · Depende de: 12, 13, 15

## En una línea
Cuatro ciclos por sprites (sorbo, martillo, salto, caminar) sacados de video generado entre dos poses que ya existen, después de una prueba de 2 días con un solo ciclo que decide si el camino sirve.

## Problema y oportunidad
Paucho es un títere de diapositivas (plan). En el código de `areas`:

- **Martilla con 3 poses.** `PauchoTrabaja` (`AreaScene.tsx`) encadena `arriba` 170 ms → `golpe` 130 ms → `base` 200 ms, de 2 a 4 golpes y una pausa.
- **Respira escalando el bitmap** (`paucho-breathe`: 1,012 × 1,028 cada 3,2 s).
- **Toma mate con 5 imágenes** que se prenden y apagan en un ciclo de 10 s (`pmate__f0..4`, `step-end`).
- **Habla alternando 2 imágenes cada 130 ms**, sin relación con el texto (`PauchoTalk.tsx`).
- **Festeja con un salto de CSS** sobre una pose fija (`paucho--hop`: −12 %, 0,5 s × 2).
- **Nunca camina:** pasa del banquito al caballete por corte.
- **Rive quedó sin uso.** `guachito.riv` (254 KB) es cambio de poses más párpados; `Gauchito.tsx`, el único que lo usa, no lo importa ninguna pantalla. El plan gratis pierde el view model al exportar (`design/rive/README.md`).

Rive y Spine piden partes en capas; las partes modulares del artista no rearman al personaje. El video entre dos poses da peso y tela en movimiento sin armar un esqueleto (plan). Se lo aprendemos al rey de Royal Match, que actúa con todo el cuerpo, y al pajarito de Finch, que camina (plan).

## Objetivo y métricas
- **Primaria (prueba):** un ciclo aprobado por el juez con los 7 criterios de abajo, en 2 días y ≤ 20 generaciones.
- **Secundarias (si se aprueba):** 4 ciclos en producción; toques sobre Paucho por sesión (`paucho_tap`, doc 13).
- **Guardrails:** ≤ 8 MB decodificados por hoja, ≤ 14 MB de hojas cargadas a la vez, ≤ 300 KB por archivo; 60 cuadros por segundo de interfaz en un Android de 3–4 GB; la cara no cambia en ningún cuadro.

## Experiencia
1. **Sorbo (reposo, Área 1).** En el banquito, cada 8 a 14 s levanta el mate, chupa, baja y suelta un «ahh» con vapor. Entre sorbos respira y parpadea.
2. **Martillo (obra en marcha).** Levanta, pega, rebota. Polvo y sonido salen en el cuadro del impacto. Si lo tocás, te mira (la pose fija de hoy).
3. **Salto (festejo).** Con cada hábito: se agacha, salta con los brazos arriba, cae y se asienta. Reemplaza a `paucho--hop`.
4. **Caminar.** Con la barra llena va del banquito al caballete; cuando la obra se revela, vuelve. La cámara lo sigue (doc 13).

Mientras una hoja carga se ve la pose fija de hoy; si falla, queda la pose fija, sin error visible. Con «reducir movimiento» se muestra el cuadro clave y solo queda el parpadeo.

## Reglas y números
Los cuatro ciclos, a 12 cuadros por segundo (83 ms por cuadro). Celda de 288×384 px (salto: 288×480, por el aire).

| Ciclo | Primer → último cuadro | Celdas | Duración | Tipo | Hoja | RAM decodificada |
|---|---|---|---|---|---|---|
| Martillo | `trabaja_arriba` → `trabaja_golpe` → `trabaja_arriba` | 8 (impacto en la 4) | 667 ms | bucle; 2 a 4 golpes y pausa | 4×2 · 1152×768 | 3,5 MB |
| Sorbo | `mate_a1` → `mate_a3_sorbo` → `mate_a4_ahh` → `mate_a1` | 16, mostradas en 24 tiempos (el sorbo y el «ahh» se sostienen) | 2.000 ms | una vez, dentro del reposo | 4×4 · 1152×1536 | 7,1 MB |
| Salto | idle → festejo → idle, en el estilo único (doc 12) | 12 (despegue en la 3, caída en la 9) | 1.000 ms | una vez | 4×3 · 1152×1440 | 6,6 MB |
| Caminar | contacto izquierdo → contacto derecho (2 poses nuevas, tres cuartos) | 8 | 667 ms | bucle; avanza 0,9 × su alto por ciclo | 4×2 · 1152×768 | 3,5 MB |

RAM decodificada = ancho × alto × 4. Las cuatro juntas suman 20,7 MB; nunca hay más de dos cargadas (peor caso, sorbo + salto: 13,7 MB).

| Regla | Valor | Por qué |
|---|---|---|
| Alto de Paucho en la celda | ≤ 344 px | a 1,40× mide 172 px CSS (doc 13): nítido en densidad 2; en densidad 3 se amplía 1,5×, igual que el escenario |
| Lado máximo de hoja | 2.048 px | límite de textura de teléfonos viejos |
| Archivo | webp con alfa, calidad 82 | martillo ≤ 150 KB, el resto ≤ 300 KB (estimación) |
| Por hoja | ≤ 8 MB decodificados | el sorbo es el techo; por eso sostiene cuadros en vez de sumar celdas |
| Simultáneo | ≤ 14 MB | una etapa de área ya ocupa 6,3 MB (doc 13) |
| Carga | el ciclo del estado actual; el siguiente probable con el hilo libre | plan: cargar solo lo activo |
| Ancla | centro de los pies en x 50 %, y 94 % de la celda | misma línea de suelo que las poses |
| Deriva de pies | ≤ 2 px entre celdas | que no patine |
| Generaciones por ciclo | ≤ 20 | acota el costo |

**Prueba de 2 días: el martillo.** Se ve 8 horas por día, es el más corto, sus dos poses ya están alineadas al píxel y el caballete quieto delata cualquier deriva.

- Día 1: 10 generaciones; elegir las 2 mejores; cortar, limpiar, empaquetar.
- Día 2: integrarlo detrás de una opción del menú de pruebas; grabar 10 s a 390×844 en iPhone y en un Android barato; pasarlo al juez lado a lado con el martillo actual.

| Criterio | Aprobado | Rechazado |
|---|---|---|
| Cara | ningún cuadro marcado como «otra cara» frente a `trabaja_base` | 1 o más |
| Bordes | sin halo ni resto de fondo a 300 %, sobre tierra clara y madera oscura | halo en cualquier cuadro |
| Pies y caballete | deriva ≤ 2 px; caballete ≤ 1 px | patina o tiembla |
| Costura del bucle | invisible en 10 repeticiones | salto visible |
| Peso | ≤ 150 KB y ≤ 3,5 MB decodificados | más |
| Rendimiento | sin cuadros perdidos en el Android barato | tirones |
| Costo | ≤ 2 días y ≤ 20 generaciones | más |

7 de 7: se producen los otros tres. 5 o 6: un día más, una sola vez. Menos: se sigue con poses (plan) y se cotiza el esqueleto.

## Contenido necesario
- 4 hojas de sprites y 2 poses nuevas de caminata.
- 4 hojas de máscara del pañuelo, una por ciclo (para la ropa).
- Sin textos nuevos. Sonidos atados a cuadros: martillazo, sorbo, «ahh», caída del salto, pasos (lista en doc 15).

## Arte, animación y sonido
Reglas de movimiento (anticipación, peso, curvas): `docs/visual/guia-visual.md`. La producción:

1. **Preparar las dos poses** sobre magenta plano #FF00FF, 1024×1280. Verde no: el termo es verde.
2. **Generar** con una herramienta de imagen a video que acepte primer y último cuadro, 4–5 s. Indicación: «Cámara fija, fondo plano sin cambios; el personaje no cambia de cara, ropa ni proporciones; movimiento: {acción}; sin desenfoque de movimiento». Qué herramienta rinde mejor a fines de 2026 no está verificado (plan): es lo que mide la prueba.
3. **Cortar** con ffmpeg el tramo útil y bajarlo a 12 por segundo (`fps=12`). Los bucles cierran en el cuadro anterior al primero.
4. **Limpiar fondo:** clave sobre magenta, quitar el tinte del borde, alfa con 1 px de suavizado; mismo criterio de halos que `import_mate_scene.py`.
5. **Alinear** cada cuadro por la base de los pies y recortar a la celda.
6. **Empaquetar** la grilla en webp y escribir sus datos (celdas, grilla, ancla, cuadros con evento), como `import_trabajando.py` escribe `WORK_BOX`.
7. **Revisar** con una hoja de contactos (`design/tools/contact.py`) antes del juez.

Sonido por cuadro: martillazo en la celda 4, pasos en los dos contactos, caída en la 9.

## Datos y técnica
- Sin cambios al guardado.
- `design/tools/import_sprites.py` (pasos 3 a 6). Corre en la Mac del dueño; los videos quedan en `sprites_src/`, fuera de git.
- Salida: `app/public/a/spr_{ciclo}.webp` y `app/src/game/sprites.ts` (generado).
- **Reproducción:** `components/Sprite.tsx` es una caja con `overflow: hidden` y la hoja adentro como `<img>`. Un solo `requestAnimationFrame` compartido avanza el cuadro cada 83 ms y mueve la hoja con `transform: translate` (capa compuesta, sin repintar). Props: `name`, `loop`, `timing` (para sostener celdas), `onFrame(n)`, `onEnd`. Se pausa con la pestaña oculta. La hoja se decodifica con `img.decode()` antes de reemplazar a la pose fija, para que no parpadee.
- `PauchoTrabaja` conserva su lógica de golpes y pausas; cambia el trío de poses por el ciclo y dispara polvo y sonido en `onFrame(4)`. `PauchoMate` reemplaza `pm0..pm4`. `Paucho.tsx` usa el salto en lugar de `paucho--hop`.
- Caminar: `AreaScene` mueve la caja entre dos puntos del arte a velocidad constante y espeja la hoja según el sentido.
- Rive: si la prueba se aprueba, se borran `RiveGauchito.tsx`, `Gauchito.tsx`, `guachito.riv` y `@rive-app/react-canvas`.

**La ropa de la tienda sobre sprites.** Hoy es una capa por pose (`WEAR` en `shop.ts`): solo los 2 pañuelos tienen arte, para idle, festejo y avatar; las poses de trabajo no tienen capa (plan: 4 de 6 prendas no se ven puestas). Con 44 celdas, una capa dibujada por celda no escala.

| Alternativa | Cómo | Costo | Límite |
|---|---|---|---|
| A. Teñir con máscara | una hoja de máscara del pañuelo por ciclo; el color se aplica en el cliente | 4 hojas de ≈ 20 KB (estimación) | solo cambia el color de una prenda que ya está |
| B. Hornear variantes | una hoja completa por prenda y ciclo | 4 hojas por prenda; 3 lugares × 3 opciones = 27 combinaciones × 4 | inviable pasadas 2 o 3 prendas |
| C. Ropa en planos fijos | en el campo, ropa base más pañuelo teñido; la prenda completa se ve en la Casita, la pestaña Paucho y las tarjetas (doc 10) | cero | la prenda no se luce en Inicio |
| D. Esqueleto pago una vez | un animador arma a Paucho en capas en Rive o Spine; la ropa pasa a ser un cambio de piel | un encargo único y, en Rive, el plan pago para exportar el view model; a cotizar | depende de un tercero y de rehacer el arte en capas |

Recomendación: A + C para la prueba y los cuatro ciclos. D se evalúa si la prueba falla o cuando la tienda pase de 10 prendas visibles: ahí vender ropa que no se ve en Inicio empieza a costar ingresos (doc 17).

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `sprite_load_failed` | una hoja no carga o no decodifica | `name`, `net` |
| `sprite_fps_low` | una vez por sesión si el promedio baja de 50 cuadros por segundo con un ciclo activo | `name`, `fps`, `device_mem` |

## Casos borde y riesgos
- **La cara cambia** (riesgo principal, plan): lo corta la prueba; no se producen 4 ciclos a ciegas.
- **Manos y ala del sombrero** se deforman a mitad del movimiento: se corrigen a mano como mucho 2 celdas por ciclo; más, se regenera.
- **Memoria:** el sorbo se descarga al empezar la obra; con `navigator.deviceMemory` ≤ 2 GB quedan las poses de hoy.
- **La ropa comprada no aparece en el campo:** Paucho lo dice al comprar en la Casita («Esta me la guardo para las fotos»), para que no parezca un error.
- **Licencia del video generado:** confirmar que los términos de la herramienta permiten uso comercial antes de publicar.
- **Bienestar y tiendas:** sin impacto; ningún ciclo expresa reproche.

## Fases
- **V1 (dentro de las 24 semanas):** solo la prueba del martillo y su decisión.
- **V2 (después, si se aprueba):** sorbo, salto y caminar, en ese orden; máscaras de pañuelo; borrar Rive.
- **Más adelante:** bostezo y frío para los estados bajos (doc 06); el perro y los animalitos (doc 03) con el mismo importador.
- **Afuera:** boca sincronizada por fonema; esqueleto, salvo que la prueba falle.

## Criterios de aceptación
- [ ] La tabla de 7 criterios de la prueba está completa y firmada por el juez, con las dos grabaciones.
- [ ] `import_sprites.py` regenera hoja y `sprites.ts` desde el video con un solo comando.
- [ ] El martillo corre a 12 cuadros por segundo; polvo y sonido salen en la celda 4 (± 1).
- [ ] Ninguna hoja supera 2.048 px de lado, 300 KB ni 8 MB decodificados.
- [ ] Sin la hoja, se ve la pose fija y no hay error en pantalla.
- [ ] Con «reducir movimiento», no corre ningún ciclo.
- [ ] El pañuelo celeste y el amarillo se ven en el martillo con la máscara.
- [ ] `npm run verify` pasa.

## Preguntas abiertas
1. **¿La prueba es con el martillo o con el sorbo?** Recomiendo el martillo: más visto, más corto, más fácil de juzgar.
2. **¿Ropa completa solo en planos fijos (C)?** Recomiendo que sí hasta tener 10 prendas.
3. **¿Cotizar el esqueleto durante la prueba?** Recomiendo que sí: no cuesta y da el número si falla.
4. **¿Se borra Rive al aprobar?** Recomiendo que sí: 254 KB más su librería que no se ven en ninguna pantalla.
