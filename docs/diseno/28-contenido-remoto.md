# 28 · Contenido remoto

> Estado: propuesta · Etapa: Etapa 4 del plan (antes del primer evento de temporada) · Mejora del plan: fila 9 de «Camino a las tiendas»; sostiene las mejoras 2, 6 y 16 · Depende de: 02, 04, 06, 16, 18, 26, 27

## En una línea

Eventos, textos de avisos, líneas de Paucho y números de la economía salen de un manifiesto JSON y arte en Cloudflare R2; la app los baja, los valida y los guarda, y sin ellos funciona igual que el día en que se publicó.

## Problema y oportunidad

Hoy cambiar una frase pide publicar la app. Todo el contenido está en el código: `content.ts`, `journey.ts`, `room.ts`, `encargos.ts`, los saludos en `sw.js`. En la web un push a `main` alcanza; en las tiendas cada cambio es una revisión de uno a varios días.

El plan necesita tres cosas que no esperan a una revisión: eventos de temporada con fecha (mejora 2), entre 300 y 500 líneas escritas en tanda (mejora 6) y 30 o más textos por tipo de aviso (mejora 16). Y pide que el evento sea «definido por un archivo remoto» para que no se vuelva un impuesto de arte (plan).

La referencia es cualquier estudio de mobile gaming: el binario trae el motor y un contenido base; la operación en vivo es datos. Gossip Harbor le ganó a Travel Town por cadencia de eventos (plan).

## Objetivo y métricas

| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| **Primaria:** tiempo de «texto escrito» a «en los teléfonos» | < 1 hora, sin publicar la app | fecha de subida contra `content_updated` |
| Activos con el manifiesto vigente a las 48 h | ≥ 90 % | propiedad `content_version` |
| Paquetes rechazados por validación en el teléfono | 0 (se frenan antes, en la subida) | `content_rejected` |
| Guardrail: datos bajados por evento | ≤ 1,5 MB (estimación) | `bytes` en `content_updated` |
| Guardrail: arranque | la app nunca espera a la red para mostrar Inicio | prueba en modo avión |
| Guardrail: costo | USD 0–5 al mes (plan) | factura |

## Experiencia

**La persona no ve una descarga.** Al abrir, la app muestra lo que tiene. En segundo plano pide el manifiesto; si hay algo nuevo, lo baja y lo aplica en la próxima apertura. Los textos y números cambian sin aviso.

**Un evento solo empieza cuando está completo en el teléfono.** Con el paquete bajado y verificado, y dentro de sus fechas, Paucho lo anuncia de cerca: «¡Llegó el Día del Amigo! Te armé un caminito con sorpresas.» Si no hay red ese día, el evento arranca cuando la haya; como cuenta días jugados y no del calendario (plan), nadie pierde casilleros por eso.

**Estados de error, sin tecnicismos:**

| Situación | Qué se ve |
|---|---|
| Sin red, nunca bajó nada | la app base, sin evento; ningún mensaje |
| Evento a medio bajar | nada; se reintenta en la próxima apertura |
| Falta el arte de algo que ya ganaste (teléfono nuevo) | una caja de madera con moño en su lugar y «Lo estoy desembalando…»; se baja primero |
| El evento terminó con premios sin reclamar | «Te los guardé», en la libreta de Encargos |
| Versión de la app muy vieja para el evento | Paucho: «Para esta fiesta necesito que actualices la app.» Botón a la tienda. Solo para eventos, nunca para hábitos ni racha |

## Reglas y números

| Regla | Valor inicial | Por qué |
|---|---|---|
| Índice | `manifest.json`, hasta 5 KB, caché de 5 min | se pide en cada apertura |
| Paquetes | inmutables; el nombre lleva la versión y el `sha256` va en el índice | caché para siempre, vuelta atrás trivial |
| Cuándo se consulta | al abrir y al volver tras más de 6 h | fresco sin gastar |
| Qué red | cualquiera hasta 2 MB por tanda; más, solo wifi | datos móviles prepagos |
| Aplicación | en la próxima apertura en frío, nunca a mitad de sesión | que un precio no cambie mientras comprás |
| Validación | esquema, hash, `min_app`, fechas, palabras prohibidas | tabla de abajo |
| Topes en el binario | cada número remoto tiene mínimo y máximo en el código | un JSON malo no rompe la economía |
| Vuelta atrás | volver a apuntar el índice a la versión anterior | menos de 5 min |
| Apagado de emergencia | `"disabled": true` en el índice: la app usa solo lo que trae | botón rojo |
| Fijado | el arte de todo lo que la persona posee no se borra nunca del teléfono | no perder lo ganado |
| Limpieza | paquetes de eventos terminados y no poseídos, a los 30 días | espacio |
| Fechas | con el reloj confiable del doc 26 | no adelantar un evento |
| Pruebas | `manifest.staging.json`, solo para `is_internal` | probar en el teléfono real |

**Topes de ejemplo** (el binario recorta lo que se salga): horas de obra entre 0 y 12; energía por hábito entre 5 y 20; precios entre la mitad y el doble del valor del binario; avisos por día, 3 como máximo.

**Qué puede cambiar el contenido remoto y qué no**

| Sí | No |
|---|---|
| Textos, líneas, avisos | Código, pantallas o mecánicas nuevas |
| Números dentro de sus topes | Poner un hábito, la racha, una obra, una salida o la calma detrás de un pago |
| Eventos con las mecánicas que ya trae el binario | Crear productos de pago o cambiar su precio |
| Cosas del cuarto, prendas, animalitos, recuerdos | El flujo de la primera sesión completo (va en el binario) |

## Contenido necesario

- Cuatro tipos de paquete: `eventos/<id>.json` + arte, `textos/avisos.es-AR.json`, `textos/lineas.es-AR.json`, `tuning.json`.
- Esquemas de los cuatro, compartidos entre la app y el validador.
- Para el primer evento: 1 animalito (3 cuadros), 2 prendas con su capa por pose, 3 cosas del cuarto con su recorte, 1 fondo de calendario, 1 ícono, y unas 25 líneas (plan: 6 piezas de arte por evento).
- Una guía de una página, «Cómo publicar un evento», para el dueño.

**Ejemplo completo: índice y un evento**

```json
{
  "schema": 1,
  "generated_at": "2027-06-24T15:00:00Z",
  "disabled": false,
  "packs": [
    { "id": "tuning", "version": 7, "min_app": "1.2.0", "bytes": 1840,
      "url": "tuning/tuning.v7.json", "sha256": "9f2c…" },
    { "id": "avisos.es-AR", "version": 12, "min_app": "1.2.0", "bytes": 9200,
      "url": "textos/avisos.es-AR.v12.json", "sha256": "41ab…" },
    { "id": "lineas.es-AR", "version": 31, "min_app": "1.2.0", "bytes": 48100,
      "url": "textos/lineas.es-AR.v31.json", "sha256": "c07e…" },
    { "id": "evento.dia-del-amigo-2027", "version": 3, "min_app": "1.3.0", "bytes": 1180000,
      "url": "eventos/dia-del-amigo-2027.v3.json", "sha256": "5d90…" }
  ]
}
```

```json
{
  "schema": 1,
  "id": "dia-del-amigo-2027",
  "version": 3,
  "min_app": "1.3.0",
  "title": "El mes de los amigos",
  "starts": "2027-07-01",
  "ends": "2027-07-31",
  "claim_until": "2027-08-31",
  "steps": 20,
  "advance": "played_day",
  "product_id_gold": "pase_evento_std",
  "art_base": "eventos/dia-del-amigo-2027/v3/",
  "assets": [
    { "file": "fondo.webp", "sha256": "a1…", "bytes": 210000 },
    { "file": "icono.webp", "sha256": "b2…", "bytes": 14000 },
    { "file": "carpincho.webp", "sha256": "c3…", "bytes": 96000 },
    { "file": "gorra.webp", "sha256": "d4…", "bytes": 310000 },
    { "file": "bufanda.webp", "sha256": "e5…", "bytes": 290000 },
    { "file": "cuarto.webp", "sha256": "f6…", "bytes": 240000 }
  ],
  "items": [
    { "id": "ev27a_carpincho", "kind": "animalito", "name": "Carpincho matero",
      "sheet": "carpincho.webp", "frames": 3, "spot": "laguna" },
    { "id": "ev27a_gorra", "kind": "prenda", "slot": "cabeza", "name": "Gorra de lana",
      "sheet": "gorra.webp", "poses": ["base", "contento", "mate", "trabaja"] },
    { "id": "ev27a_bufanda", "kind": "prenda", "slot": "cuello", "name": "Bufanda de los amigos",
      "sheet": "bufanda.webp", "poses": ["base", "contento", "mate", "trabaja"] },
    { "id": "ev27a_banderines", "kind": "cuarto", "slot": "pared", "name": "Banderines",
      "sheet": "cuarto.webp", "box": [0, 0, 420, 180] },
    { "id": "ev27a_mate_doble", "kind": "cuarto", "slot": "mesa", "name": "Dos mates",
      "sheet": "cuarto.webp", "box": [0, 180, 200, 160] },
    { "id": "ev27a_foto", "kind": "cuarto", "slot": "pie", "name": "Foto con amigos",
      "sheet": "cuarto.webp", "box": [200, 180, 220, 160] }
  ],
  "track": [
    { "step": 1, "free": { "coins": 10 } },
    { "step": 3, "free": { "item": "ev27a_banderines" } },
    { "step": 5, "free": { "coins": 15 }, "gold": { "item": "ev27a_gorra" } },
    { "step": 8, "free": { "termo": 1 } },
    { "step": 10, "free": { "item": "ev27a_mate_doble" }, "gold": { "coins": 60 } },
    { "step": 14, "free": { "coins": 20 }, "gold": { "item": "ev27a_foto" } },
    { "step": 17, "free": { "item": "ev27a_bufanda" } },
    { "step": 20, "free": { "item": "ev27a_carpincho" }, "gold": { "coins": 100 } }
  ],
  "lines": {
    "intro": ["¡Llegó el mes de los amigos! Te armé un caminito con sorpresas."],
    "step": ["¡Uno más! Mirá lo que apareció.", "Esto es para vos, por venir hoy."],
    "last": ["¡Llegaste al final! Mirá quién vino a tomar mate con nosotros."],
    "kept": ["Se terminó la fiesta, pero te guardé lo que faltaba."]
  },
  "notifs": [
    { "kind": "event_start", "text": "Paucho armó algo para el mes de los amigos 🧉" }
  ]
}
```

Los casilleros sin entrada en `track` dan 5 herraduras. El animalito va al final del camino gratis: lo exclusivo no se paga (regla del doc 18 a confirmar). El premio principal del camino gratis nunca depende de `gold`.

## Arte, animación y sonido

El arte remoto pasa por los mismos importadores de Python que el del binario (`design/tools/`), en el mismo estilo y tamaños. Una prenda debe traer su capa para cada pose en la que Paucho aparece; si la app suma una pose después, la prenda no se dibuja en esa pose (ya pasa hoy con las de `WEAR` en `shop.ts`). Sonido: los eventos usan los sonidos del binario; no se baja audio en V1. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica

- **Dónde:** Cloudflare R2 con dominio propio, sin costo de salida de datos. Supabase Storage queda de respaldo; no hace falta base de datos para el contenido. Confirmar los topes gratuitos en la página de precios de R2.
- **En la app:** nuevo `src/game/remote.ts` (pedir, validar con el esquema, verificar hash, guardar, exponer). Los archivos van al sistema de archivos de la app (Capacitor Filesystem) y, en la web, a Cache Storage. Se escribe en una carpeta temporal y se cambia de una vez: nunca queda un paquete a medias.
- **Lectura:** `content.ts`, `journey.ts` y `room.ts` pasan a leer sus números por `tune('clave', valorDelBinario, min, max)`. Los textos, por `line('situación')`, que mezcla los remotos con los del binario.
- **Guardado:** el estado suma `event: { id, step, claimed[], gold }` y los ids de lo ganado en `room` y `clothes`. Los ids remotos llevan prefijo (`ev27a_`) para no chocar. Con la nube (doc 26), un teléfono nuevo baja primero el arte de lo poseído.
- **Publicar:** `scripts/publish-content.mjs` valida, calcula hashes, sube los paquetes, y al final el índice. Corre en GitHub Actions al hacer push a una carpeta `contenido/`.
- **Validador (el mismo en la subida y en el teléfono):** esquema; fechas coherentes; cada `item` del camino existe; cada `file` existe y pesa lo que dice; números dentro de los topes; voseo y palabras prohibidas («ansiedad», «tratar», «curar», «diagnóstico», y cualquier frase de culpa por ausencia); ningún texto de aviso de más de 110 caracteres.
- **Migración:** ninguna. La primera versión del índice puede estar vacía.

## Analítica

| Evento | Cuándo | Propiedades |
|---|---|---|
| `content_checked` | pide el índice | `ok`, `ms`, `changed` |
| `content_updated` | paquete aplicado | `pack_id`, `version`, `bytes`, `ms` |
| `content_rejected` | falla una validación | `pack_id`, `version`, `reason` (`schema`, `hash`, `min_app`, `clamp`, `words`) |
| `content_fallback_used` | se usó el valor del binario habiendo uno remoto inválido | `key` |
| `asset_load_failed` | falta un archivo fijado | `item_id` |
| `update_prompt_shown` / `update_prompt_tapped` | evento pide versión nueva | `event_id`, `app_version` |

`content_version` (la fecha del índice aplicado) va como propiedad de usuario en todos los eventos (doc 27).

## Casos borde y riesgos

- **Reglas de Apple.** Lo que recuerdo de las normas: 2.5.2 prohíbe bajar o ejecutar código que agregue o cambie funciones; 4.2.3 pide que la app funcione sin descargas extra en el primer arranque; 3.1.1 exige compra dentro de la app para desbloquear contenido. Por eso: solo datos e imágenes, nunca JavaScript ni HTML; la primera sesión y el juego base van enteros en el binario; el camino dorado se abre con un producto ya creado en la tienda. El contenido remoto queda bajo la misma clasificación por edad: nada de alcohol ni apuestas. Verificar el texto vigente en [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) antes de publicar.
- **Reglas de Google.** La política de abuso de dispositivo y red prohíbe bajar código ejecutable fuera de Play; datos e imágenes están permitidos y siguen sujetos a todas las políticas, incluida la declaración de apps de salud. Verificar en el [centro de políticas de Play](https://support.google.com/googleplay/android-developer/answer/9888379).
- **Actualizaciones en vivo del código web** (Capgo, Appflow): no se usan para funciones nuevas. Es la zona gris que puede costar la cuenta.
- **Trampa:** un JSON modificado en el teléfono no pasa el hash; los premios de evento con valor piden sincronización verificada (doc 26).
- **Error humano:** el riesgo real con una sola persona. Lo cubren el validador, los topes, la prueba interna y la vuelta atrás.
- **Bienestar:** un texto remoto puede romper las reglas de tono sin pasar por revisión de tienda. El validador de palabras corre siempre, y los avisos de racha se pueden apagar.
- **Bucket caído o dominio vencido:** la app sigue con lo último que bajó.
- **Dos eventos que se pisan:** el validador rechaza fechas superpuestas en V1.

## Fases

- **V1:** índice, `tuning.json` con topes, textos de avisos y líneas, validador, publicación por script, apagado de emergencia.
- **V2:** eventos con arte, fijado, caja de madera, pedido de actualización.
- **Más adelante:** paquetes por país y variante de idioma (doc 32), firma de los paquetes con clave propia, audio remoto, panel web para editar sin tocar JSON. Afuera: mecánicas nuevas por datos.

## Criterios de aceptación

- [ ] Cambiar una línea de Paucho en `contenido/` y hacer push la muestra en un teléfono en menos de una hora, sin publicar la app.
- [ ] En modo avión desde la instalación, la app completa la primera sesión y un día entero.
- [ ] Un paquete con el hash alterado se rechaza y la app sigue con el anterior.
- [ ] Un `tuning.json` con horas de obra en 500 deja el valor en 12.
- [ ] Un texto con «ansiedad» no se puede subir.
- [ ] Con `"disabled": true` la app se comporta como recién instalada, sin perder nada ganado.
- [ ] Cortar la red a mitad de la descarga de un evento no lo deja a medias: no arranca.
- [ ] Reinstalar y restaurar la cuenta vuelve a mostrar las prendas del evento tras bajar su arte.
- [ ] El evento de ejemplo de este documento pasa el validador.

## Preguntas abiertas

1. **¿R2 o Supabase Storage?** Recomiendo R2: sin costo de salida y separado de la base de datos.
2. **¿El animalito del evento en el camino gratis?** Recomiendo que sí, al final; lo dorado suma prendas y herraduras. Lo define el doc 18.
3. **¿Los números de la economía remotos desde el día uno?** Recomiendo que sí, con topes: es lo que más se va a tocar tras el lanzamiento suave.
4. **¿Pedir actualizar la app para un evento?** Recomiendo solo si el evento usa una mecánica nueva; los cuatro primeros no deberían.
5. **¿Firmar los paquetes?** Recomiendo dejarlo para después: HTTPS más hash en un índice de dominio propio alcanza con este tamaño.
