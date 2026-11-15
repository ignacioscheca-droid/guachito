# 10 · Tarjetas para compartir
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: 10 · Depende de: 08, 03, 12, 09, 27, 31

## En una línea
Cada meta de racha, área terminada y animalito nuevo deja una imagen lista para estados de WhatsApp e historias de Instagram, armada en el teléfono y compartida con la hoja nativa en dos toques.

## Problema y oportunidad
Los mejores momentos de la app se festejan y desaparecen sin dejar nada para mostrar.

- `GoalDone` (`Racha.tsx`) y `AreaDone` (`Reveal.tsx`) terminan en un botón que vuelve a Inicio. No hay código de compartir (plan, problema 8).
- Finch creció con videos de sus usuarios; Duolingo entrega una tarjeta en cada hito (plan).
- Comprar instalaciones pierde plata (vale USD 0,30–0,70, cuesta USD 0,50–1,50 o más; plan). La tarjeta es, con la racha de a dos, el único motor propio.
- Los canales son WhatsApp (93,3 %) e Instagram (86,7 %) (plan): por eso dos formatos, 9:16 y 1:1.

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: tarjetas compartidas por usuario activo mensual | 0,3 | `card_shared` sobre activos |
| Tasa de compartir por momento | racha 15 %, área 20 %, animalito 25 % de quienes ven el botón | `card_shared` / `card_offered` |
| Instalaciones atribuidas | 5 % de las instalaciones orgánicas con `r=` de tarjeta | enlace de vuelta, doc 27 |
| Guardrail: tiempo extra en la ceremonia | 0 s si no se comparte | el botón nunca bloquea el «seguir» |
| Guardrail: fallas al generar | < 1 % | `card_failed` |

## Experiencia
1. **Dónde aparece.** Un botón secundario «Compartir» con ícono, debajo del botón principal, en tres lugares:
   - `GoalDone`, paso del premio (metas 7, 14, 30, 50, 100, 365).
   - `AreaDone`, cuando Paucho viene de cerca a decir qué sigue.
   - Llegada de un animalito (doc 03), después de ponerle nombre.
   El botón principal sigue siendo «¡Gracias, Paucho!» o equivalente. No hay ventana que interrumpa.
2. **Vista previa.** Hoja inferior con la tarjeta a tres cuartos de pantalla. Arriba, un selector de dos opciones: «Historia» (9:16, por defecto) y «Cuadrada» (1:1). Abajo, un interruptor «Con mi nombre» (apagado por defecto) y el botón verde «Compartir».
3. **Compartir.** Se abre la hoja nativa del teléfono con la imagen y un texto corto con enlace. La persona elige WhatsApp, Instagram u otra.
4. **Vuelta.** Al volver, Paucho en el campo: «¡Quedó linda!» Sin premio en herraduras.
5. **Después.** Las tarjetas ganadas quedan en la pestaña Paucho → «Mis tarjetas», para compartir más tarde.

**Qué texto lleva cada tarjeta**
| Tarjeta | Título grande | Segunda línea | Pie |
|---|---|---|---|
| Racha | el número: «30» | «mates seguidos con Paucho» (o «{vos} y Paucho: 30 mates seguidos») | nombre de la meta: «¡Un mes de mates!» |
| Área terminada | «El rancho de Paucho» | «¡Terminado!» · «3 obras · 12 días» | «Lo levantamos entre los dos» |
| Animalito | nombre que le puso: «Rulo» | «llegó al rancho» | especie: «Carpincho» |
| Racha de a dos (doc 09) | «7» | «mates de a dos» | «{vos} y {amigo}» solo con el interruptor encendido |

En todas, abajo: la marca «Gauchito» y el dominio corto. Texto que acompaña en la hoja de compartir: «Llegué a 30 mates seguidos con Paucho 🧉 https://<dominio>/t/racha?r=AB12CD».

**Estados vacíos y de error**
- El teléfono no puede compartir archivos: el botón cambia a «Guardar imagen» y descarga el PNG.
- La imagen no se pudo armar: «No pude armar la tarjeta. Probá de nuevo.» y la ceremonia sigue.
- Sin conexión: funciona igual; todo el arte está en el teléfono.
- «Mis tarjetas» vacía: «Acá van a quedar tus mejores momentos con Paucho.»

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Formatos | 1080×1920 (9:16) y 1080×1080 (1:1) | estados e historias; chats y publicaciones |
| Zona segura 9:16 | sin texto en los 250 px de arriba y los 340 px de abajo | ahí van las barras de WhatsApp e Instagram (estimación; verificar en ambos) |
| Archivo | PNG, menos de 1,5 MB; JPEG 0,9 si lo supera | carga rápida con datos móviles |
| Texto | 3 líneas como máximo; título de 12 caracteres o se achica hasta 60 % | se lee en miniatura |
| Nombre de la persona | apagado por defecto | privacidad |
| Datos que nunca aparecen | hábitos, ánimo, reflexiones, horarios | regla de bienestar |
| Momentos que ofrecen tarjeta | 6 metas de racha, cada área, cada animalito, metas de a dos 7 y 30 | lo raro; los festejos diarios no |
| Premio por compartir | ninguno | no se compra el compartir; evita spam y problemas de tienda |
| Tiempo de generación | menos de 800 ms en un Android de gama baja | no se siente espera |
| Código de referido | 6 caracteres por instalación, al azar | medir sin identificar a la persona |

## Contenido necesario
- **Plantillas:** 4 (racha, área, animalito, de a dos) × 2 formatos.
- **Fondos:** amanecer de pampa para racha (el de `StreakDay`), la escena final de cada área (ya existe por etapa), laguna o pasto para animalitos.
- **Poses:** Paucho con el mate en alto (racha), Paucho orgulloso con el martillo (área), Paucho con el animalito (una por especie o una genérica con el animal al lado). Recortes sobre transparente, 1024 px de alto.
- **Marca:** logotipo «Gauchito» en una línea y cinta de madera para el pie.
- **Texto:** 6 nombres de meta (ya están en `GOAL_NAMES`), 1 pie por área, 3 mensajes de acompañamiento por tipo.

## Arte, animación y sonido
La tarjeta se compone en tres franjas, igual en los dos formatos.

- **9:16:** tercio superior con el título en cartel de madera; centro con Paucho ocupando cerca del 55 % del ancho sobre el fondo; tercio inferior con la segunda línea y la cinta de marca.
- **1:1:** Paucho a la izquierda (45 % del ancho), título y líneas a la derecha, cinta abajo.
- El número de racha va en dorado: es un premio (doc 15). El resto usa los tokens de `index.css`.
- La vista previa entra con el rebote corto de las hojas. Al tocar «Compartir» suena el tic de siempre.
- Todo en el estilo único de fieltro (doc 12): una tarjeta con dos Pauchos distintos es lo primero que ve alguien de afuera. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica
La imagen se dibuja en un `<canvas>` en el teléfono; ningún servidor participa.

- **Módulo nuevo** `app/src/game/shareCard.ts`: `renderCard(kind, data, format): Promise<Blob>`.
  1. Espera `document.fonts.ready` para que el canvas use la tipografía de la app.
  2. Carga las capas con `createImageBitmap` desde `app/public/a/` (mismo origen: el canvas no se contamina).
  3. Dibuja fondo, personaje, cartel, textos (medidos con `measureText` y achicados si no entran) y marca.
  4. `canvas.toBlob('image/png')`.
- **Componente** `components/ShareSheet.tsx` sobre `Sheet` de `ui.tsx`; la vista previa es el mismo canvas escalado.
- **Compartir:**
  - Web: `navigator.canShare({ files })` y `navigator.share({ files, text })`.
  - Capacitor: se escribe el archivo en caché con `@capacitor/filesystem` y se abre `@capacitor/share` con su ruta.
  - Respaldo: enlace de descarga.
- **Enlace de vuelta:** las imágenes de estados no llevan enlace tocable. Por eso van las dos cosas: el dominio escrito en la tarjeta y el enlace en el texto que acompaña (se conserva al mandar a un chat). `https://<dominio>/t/<tipo>?r=<código>` abre una página liviana con botones a las tiendas; en Android el código viaja en `referrer` (igual que doc 09).
- **Estado:** `store.ts` suma `cards: { kind, id, day }[]` y `refCode`. Sin migración: las metas y áreas ya logradas se listan desde el estado existente.
- **Pantallas a tocar:** `Racha.tsx`, `Reveal.tsx`, `PauchoTab.tsx`, la llegada del animalito (doc 03).
- **Memoria:** un canvas de 1080×1920 ocupa unos 8 MB; se libera al cerrar la hoja. Medir en un Android de 3 GB (plan, riesgos).

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `card_offered` | se muestra el botón «Compartir» | `kind`, `id` (meta, área, especie) |
| `card_preview_opened` | se abre la hoja | `kind`, `entry` (ceremonia, mis_tarjetas) |
| `card_format_changed` | cambia el selector | `format` |
| `card_shared` | la hoja nativa devuelve éxito | `kind`, `format`, `with_name`, `ms_render` |
| `card_saved` | respaldo de descarga | `kind`, `format` |
| `card_failed` | error al armar o compartir | `kind`, `step` |
| `card_link_opened` | carga la página de vuelta | `kind`, `r` |
| `install_from_card` | primer arranque con `r` de tarjeta | `kind` |

iPhone no informa a qué app se compartió, y cancelar la hoja a veces cuenta como error: `card_shared` es un mínimo en iOS.

## Casos borde y riesgos
- **Nombres largos o con emojis.** El texto se achica y después se corta con «…»; los emojis se dibujan con la fuente del sistema.
- **Nombre del animalito ofensivo.** Es texto del usuario en una imagen con nuestra marca: filtro de palabras al ponerlo (doc 03).
- **Racha fabricada con el reloj.** Una tarjeta de «100» falsa no vale plata; se acepta.
- **Privacidad.** Sin nombre por defecto; nunca hábitos ni ánimo. El código `r` no identifica a nadie fuera de nuestra analítica.
- **Bienestar.** La tarjeta festeja lo logrado; no existe tarjeta de «perdí la racha» ni comparación con otros.
- **Tiendas.** Sin premio por compartir ni compartir obligado.
- **Arte mezclado.** Si las poses nuevas no llegan, V1 usa solo recortes del estilo de fieltro existente (`mate_*`), nunca los `g_*`.
- **Instagram.** La hoja nativa manda la imagen a historias sin sticker de enlace; alcanza con el dominio escrito.

## Fases
- **V1:** tarjeta de racha y de área, dos formatos, hoja nativa, respaldo de descarga, enlace con `r`.
- **V2:** animalitos, racha de a dos, «Mis tarjetas», resumen del año en diciembre (calendario del plan).
- **Más adelante:** clip corto de la revelación de obra (el plan pide «una tarjeta o un clip»); sticker directo a historias de Instagram con SDK nativo.
- **Afuera:** editor de tarjetas, marcos pagos, compartir automático.

## Criterios de aceptación
- [ ] El botón «Compartir» aparece en `GoalDone` y `AreaDone` y nunca reemplaza al principal.
- [ ] La tarjeta se arma en menos de 800 ms en el Android de prueba y pesa menos de 1,5 MB.
- [ ] Los dos formatos respetan la zona segura: nada de texto tapado en estados de WhatsApp ni en historias de Instagram.
- [ ] Con «Con mi nombre» apagado, el nombre no aparece en la imagen ni en el texto.
- [ ] En un teléfono sin compartir archivos, «Guardar imagen» descarga el PNG.
- [ ] El enlace de vuelta abre la página y la instalación desde ella queda atribuida en Android.
- [ ] Ninguna tarjeta muestra hábitos, ánimo ni reflexiones.
- [ ] Funciona sin conexión.

## Preguntas abiertas
1. **Nombre de la persona.** Recomiendo apagado por defecto y que recuerde la última elección.
2. **¿Premio por compartir?** Recomiendo que no; si la tasa queda abajo del 5 %, probar un calco de termo una sola vez.
3. **Marca en la tarjeta.** «Gauchito» o «Paucho» depende de la decisión del nombre (doc 30); la plantilla admite los dos.
4. **Poses nuevas o existentes en V1.** Recomiendo salir con las existentes y pedir las tres poses para V2.
5. **Tarjeta en el día 7.** Es la primera meta y la más alcanzada; recomiendo ofrecerla ahí aunque el número sea chico.
