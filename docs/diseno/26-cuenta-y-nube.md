# 26 · Cuenta y nube

> Estado: propuesta · Etapa: Etapa 5 del plan («medir y publicar»; antes de la primera tienda) · Mejora del plan: frente 5, fila 5 de «Camino a las tiendas» · Depende de: 05, 06, 17, 27, 28

## En una línea

Cada instalación tiene una cuenta anónima invisible que guarda el rancho en Supabase; Google o Apple la vuelven recuperable; lo que la persona anota nunca sube; y la hora la pone el servidor.

## Problema y oportunidad

Hoy cambiar de teléfono o reinstalar borra la racha y el rancho. Todo el estado vive en `localStorage` bajo `gauchito.v2` (`store.ts:129`, `load`/`save` en 190–210). La única salida es Ajustes → «Copia de seguridad», que baja `gauchito-copia-AAAA-MM-DD.json` e importa con `actions.importData`. Nadie lo usa sin que se lo pidan (estimación).

El reloj es el del teléfono (plan). `clock.ts` devuelve `Date.now()`; `todayKey` y `workRemainingMs` lo leen. Adelantar el teléfono un día fabrica racha y saltea las 8 horas de obra. Importa cuando haya eventos con fecha, racha de a dos y cosas que valen plata.

Duolingo y Finch hacen lo mismo: se juega sin registrarse y la cuenta se pide cuando ya hay algo que perder.

## Objetivo y métricas

| Métrica | Objetivo | Cómo se mide |
|---|---|---|
| **Primaria:** instalaciones con guardado al día | ≥ 95 % de los activos con sincronización en las últimas 48 h | `sync_succeeded` por usuario |
| Cuentas vinculadas a Google o Apple en D7 | ≥ 25 % (estimación) | `account_linked` |
| Restauraciones correctas | ≥ 98 % de `restore_started` terminan en `restore_completed` | embudo |
| Guardrail: caída en el paso de vincular | < 10 % cierra la app en esa pantalla | `account_link_prompted` → siguiente evento |
| Guardrail: conflictos | < 1 % de las sincronizaciones | `sync_conflict` |
| Guardrail: correcciones de reloj a usuarios honestos | 0 reportes; < 0,5 % de sesiones | `clock_corrected` |

## Experiencia

**Primera sesión: nada.** La cuenta anónima se crea en segundo plano al terminar el flujo del doc 11. Sin red, se reintenta después. No hay pantalla ni botón.

**El pedido de vincular** aparece una sola vez por disparador, con Paucho de cerca:

| Disparador | Texto |
|---|---|
| Se termina el Área 1 | «Mirá lo que armamos. ¿Lo guardamos bien, por si cambiás de teléfono?» |
| Racha de 7 | «Siete mates seguidos. Guardemos esto para que no se pierda.» |
| Antes de pagar Premium (doc 17) | «Así tu Premium te sigue a cualquier teléfono.» |

Botones: «Seguir con Google», «Seguir con Apple» (obligatorio en iPhone si se ofrece Google), «Ahora no». «Ahora no» nunca bloquea nada.

**Ajustes → Cuenta** muestra el estado: «Guardado hace 3 min ✓», «Sin conexión: guardo cuando vuelva», o «Tu rancho está solo en este teléfono» con el botón de vincular.

**Teléfono nuevo.** Tras la escena del mate, un enlace chico: «Ya tengo un rancho». Inicia sesión, baja el guardado y abre Inicio con Paucho: «¡{nombre}! Acá está todo como lo dejaste.» Si la persona anotaba ánimo o reflexiones, agrega: «Lo que me contaste de tus días quedó en tu otro teléfono; eso no lo guardo afuera.»

**Conflicto.** Si este teléfono y la nube avanzaron por separado: «Encontré dos ranchos». Dos tarjetas con racha, obras, herraduras y última vez. La de más avance viene marcada. El que pierde se guarda 30 días y se puede recuperar desde Ajustes.

**Borrar la cuenta.** Ajustes → Cuenta → «Borrar mi cuenta y mis datos». Paso 1 explica qué se borra y que la suscripción se cancela aparte en la tienda, con el enlace. Paso 2 pide escribir BORRAR. Se borra en el servidor al momento y el teléfono vuelve a la escena del mate. Sin red: «Necesito conexión para borrar lo que está guardado afuera.»

**Reloj corregido.** Nunca se acusa. La obra muestra su tiempo real: «Le faltan 5 h 20 min». Un día de racha que no existió simplemente no aparece.

## Reglas y números

| Regla | Valor inicial | Por qué |
|---|---|---|
| Cuándo se sube | al pasar a segundo plano, tras ver una obra, comprar o cebar el mate; máximo una vez cada 60 s | pocas escrituras, nada importante sin guardar |
| Cuándo se baja | al abrir y al volver tras más de 10 min | detectar otro dispositivo |
| Control de versiones | `rev` entero; el cliente manda `base_rev` | detectar conflicto sin relojes |
| Resolución V1 | si la nube cambió y lo local no: baja; si lo local cambió y la nube no: sube; si los dos: pantalla «dos ranchos» | simple y sin pérdidas silenciosas |
| Resolución V2 | mezcla por campo (tabla de abajo) | evitar la pantalla en el caso común |
| Historial | últimas 5 revisiones y el perdedor de cada conflicto, 30 días | deshacer |
| Recordatorio de vincular | 3 veces como máximo, 7 días entre una y otra | no insistir |
| Borrado | inmediato; copias de seguridad del proveedor, hasta 30 días | Apple 5.1.1(v) |
| Desvío de reloj tolerado | ± 5 min | relojes mal puestos sin intención |
| Margen de día | la clave de día vale si cae entre ayer y mañana del día del servidor | husos y viajes |
| Días sin conexión | se aceptan a lo sumo tantos días nuevos como días pasaron en el servidor desde la última sincronización | no fabricar racha |
| Con valor en plata (pase, racha de a dos, premios de evento) | piden una sincronización verificada | doc 18, doc 09 |

**Mezcla por campo (V2):** `mates`, `unlocked`, `room`, `clothes`: unión. `completions`, `skips`, `extras`, `log`: por día, unión con el máximo de veces por hábito. `jobsDone`, `termos` gastados: el mayor. `coins`: se recalcula como herraduras ganadas menos gastadas a partir de un libro de movimientos; hasta tener el libro, el de `rev` más alto. `placed`, `outfit`, `habitPlans`, `name`: el último escrito.

**Qué sube y qué no**

| Sube | No sube nunca |
|---|---|
| Progreso, racha, plan, herraduras, cuarto, ropa, encargos | Ánimo del día y reflexiones (doc 05) |
| Nombre de Paucho, del perro y de la persona | Lo que Paucho recuerda en texto libre (doc 06) |
| Hábitos propios (nombre y emoji): hacen falta para restaurar | `pushSubscription`, `dayOffset`, `workSkipMs` |
| Respuestas de la charla (`aboutYou`, opciones cerradas) | Ajustes de sonido, registro de errores |

Lo privado vive en otra clave, `gauchito.v2.privado`, que el código de sincronización no importa. No es un filtro: es otra caja.

## Contenido necesario

- 22 textos: 3 pedidos de vincular, 6 estados de guardado, 4 de restauración, 3 de conflicto, 4 de borrado, 2 de reloj.
- Una página web «Borrar mi cuenta» con el mismo flujo: Google la pide en la ficha de la tienda.
- Política de privacidad con la tabla de arriba.
- Arte: ninguno nuevo. Las dos tarjetas de «dos ranchos» usan la miniatura del área.

## Arte, animación y sonido

Vincular y restaurar usan `PauchoTalk` y los componentes `Modal` y `Card` del sistema de diseño. El estado de guardado es un `Chip`, sin animación. La bienvenida tras restaurar usa la pose contenta de cerca y el sonido de desbloqueo. Reglas en `docs/visual/guia-visual.md`.

## Datos y técnica

**Supabase.** Auth con inicio anónimo y `linkIdentity` para Google y Apple: el `user_id` no cambia al vincular. Tablas, todas con seguridad por fila (`user_id = auth.uid()`):

- `saves`: `user_id` (PK), `rev`, `schema_version`, `state` (jsonb), `updated_at` (hora del servidor), `device_id`, `last_server_day`.
- `save_history`: `user_id`, `rev`, `state`, `reason` (`rev` | `conflict`), `created_at`.

Tres funciones del servidor: `sync` (compara `base_rev`, valida fechas, escribe), `time` (devuelve la hora), `delete_account` (borra filas, usuario de Auth, persona en PostHog y cliente en RevenueCat).

**Archivos.** Nuevo `src/game/cloud.ts` (cola de subida, bajada, conflicto). `store.ts`: `save()` avisa a la cola; salen `dayOffset` y `workSkipMs` de los builds de tienda; se agrega `rev` y `syncedAt` fuera de `GameState`. `Settings.tsx`: sección Cuenta. Exportar e importar se quedan: es la salida para quien no quiere cuenta, y el archivo exportado sí puede incluir lo privado, con aviso, porque queda en manos de la persona.

**Reloj confiable (`clock.ts`).** `now()` pasa a ser `Date.now() + offset`. El `offset` se mide contra `time` al abrir y al volver a primer plano, y se guarda. Reglas:

1. Con red: manda el servidor.
2. Sin red: vale el último `offset`, y lo hecho queda marcado «sin verificar».
3. `now()` nunca retrocede: si da menos que el último valor guardado, se usa el guardado.
4. Al sincronizar, `sync` descarta días futuros, devuelve a «trabajando» una obra cuyo fin todavía no llegó y recorta los días nuevos a los que pasaron de verdad.

Los tests siguen usando `setClock`.

**Offline.** Todo funciona sin red; la cola sube al volver. **Migración:** en la primera apertura con esta versión se crea la cuenta anónima y se sube el guardado local como `rev` 1.

**Costo.** USD 0 con 10 mil usuarios y USD 25 más uso con 100 mil (plan). Un guardado pesa entre 15 y 40 KB al día 60 (estimación): hay que podar `energyGains`, `coinGains` y `log` de más de 60 días antes de escalar. Confirmar los topes del plan gratis en la página de precios de Supabase.

## Analítica

| Evento | Cuándo | Propiedades |
|---|---|---|
| `account_created` | cuenta anónima lista | `ms_since_install` |
| `account_link_prompted` | se muestra el pedido | `trigger` (`area_done`, `streak_7`, `purchase`, `settings`) |
| `account_linked` | vínculo correcto | `provider`, `trigger`, `day_index` |
| `sync_succeeded` / `sync_failed` | cada intento | `direction`, `bytes`, `ms`, `error_code` |
| `sync_conflict` | pantalla «dos ranchos» | `chosen` (`local`, `cloud`), `was_recommended` |
| `restore_started` / `restore_completed` | teléfono nuevo | `provider`, `jobs_done`, `streak` |
| `clock_corrected` | el servidor recortó algo | `kind` (`future_day`, `obra_early`, `backwards`), `drift_min` |
| `account_deleted` | borrado confirmado | `day_index`, `was_linked`, `was_premium` |
| `backup_exported` / `backup_imported` | copia manual | `ok` |

## Casos borde y riesgos

- **Dos teléfonos a la vez** (pareja que comparte cuenta): cada apertura baja lo último; el conflicto queda para el caso sin red.
- **Cuenta anónima perdida** (reinstaló sin vincular): no hay forma de recuperarla. Por eso el pedido aparece en el Área 1 y no en el día 30.
- **Vincular una cuenta de Google que ya tiene rancho:** va a la pantalla «dos ranchos».
- **Viaje a otro huso:** el margen de un día lo cubre; cruzar la línea de fecha puede costar un día, que tapa el termo.
- **Trampa restante:** quien nunca se conecta juega con su reloj. No gana nada que valga plata ni que vea otra persona.
- **Bienestar:** los hábitos propios pueden ser íntimos («tomar la pastilla»). Suben cifrados en tránsito, con seguridad por fila, y jamás van a analítica (doc 27).
- **Tiendas:** borrado dentro de la app (Apple 5.1.1(v)) y por web (Google); declarar en «Seguridad de los datos» y en la etiqueta de privacidad de Apple lo que sube.
- **Proveedor caído:** la app no se entera; sigue local.

## Fases

- **V1:** cuenta anónima, subida y bajada con `rev`, pantalla «dos ranchos», Google, borrado, reloj con `offset` y reglas 1–3.
- **V2:** Apple (con el build de iPhone), mezcla por campo, validación de fechas en `sync`, historial recuperable desde Ajustes.
- **Más adelante:** libro de movimientos de herraduras, validación de compras del lado del servidor. Afuera: correo y contraseña, perfiles públicos.

## Criterios de aceptación

- [ ] Instalar, jugar, borrar la app, reinstalar e iniciar con Google devuelve racha, obras, cuarto y herraduras idénticos.
- [ ] Sin red durante tres días, todo funciona y al volver se sube solo.
- [ ] El contenido de `gauchito.v2.privado` no aparece en ninguna petición de red (revisado con el inspector).
- [ ] Adelantar el reloj 9 horas con red no termina la obra.
- [ ] Adelantar el reloj 3 días sin red y después conectarse deja la racha como estaba.
- [ ] Atrasar el reloj no rompe la cuenta regresiva ni duplica el mate.
- [ ] Borrar la cuenta deja cero filas con ese `user_id` y cierra la sesión.
- [ ] «Ahora no» en vincular no vuelve a aparecer antes de 7 días.
- [ ] El menú de pruebas no existe en el build de tienda.

## Preguntas abiertas

1. **¿Suben los hábitos propios y `aboutYou`?** Recomiendo que sí: sin ellos la restauración no sirve. Nunca a analítica.
2. **¿Las reflexiones se pierden al cambiar de teléfono?** Con la regla actual, sí. Recomiendo mantenerla y ofrecer el archivo exportado; un guardado cifrado con clave de la persona queda para más adelante.
3. **¿Vincular en el Área 1 (D1) o en la racha de 7?** Recomiendo ofrecerlo en los dos y medir cuál vincula más.
4. **¿Supabase en la región de São Paulo?** Recomiendo que sí, por latencia; revisar con un abogado la transferencia de datos desde Argentina.
