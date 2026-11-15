# 09 · Racha de a dos
> Estado: propuesta · Etapa: Etapas 1–5 del plan (campaña: Día del Amigo, 20 de julio de 2027) · Mejora del plan: 9 · Depende de: 08, 26, 16, 10, 27, 19

## En una línea
«Cebame un mate»: un enlace por WhatsApp arranca una racha compartida con otra persona; cada uno ve si el otro ya cebó hoy y puede mandarle un mate.

## Problema y oportunidad
Hoy nada se comparte y no hay otra forma de crecer sin presupuesto.

- No existe código de compartir, amigos ni tarjetas (plan, problema 8).
- Una instalación vale USD 0,30 a 0,70 y comprarla cuesta USD 0,50 a 1,50 o más; el crecimiento tiene que ser orgánico (plan).
- WhatsApp llega al 93,3 % de los usuarios de internet en Argentina (plan).
- En Duolingo, quien tiene racha con un amigo es 22 % más probable que complete el día (correlación, plan). Finch tiene las «buenas vibras».
- Compartir un mate ya es el gesto social argentino: el mecanismo no hay que explicarlo.

## Objetivo y métricas
| Métrica | Objetivo (estimación) | Cómo se mide |
|---|---|---|
| Primaria: K-factor = invitaciones enviadas por usuario activo × invitaciones que terminan en racha de a dos con instalación nueva | ≥ 0,15 en régimen; ≥ 0,30 en la semana del Día del Amigo | `invite_sent`, `duo_started` con `new_install=true`, sobre activos de 28 días |
| Invitaciones por usuario | 25 % de quienes pasan el día 7 manda al menos una en sus primeros 30 días | `invite_sent` |
| Embudo | enlace abierto 60 % → instalación 35 % → racha de a dos 80 % | `invite_opened`, `invite_installed`, `duo_started` |
| Retención | D30 de quienes tienen racha de a dos contra quienes no (correlación, como Duolingo) | cohortes, doc 27 |
| Guardrail | avisos de «te cebaron» apagados < 5 %; racha de a dos abandonada en 48 h < 20 % | `notif_type_disabled`, `duo_left` |

## Experiencia
**Quien invita**
1. Entrada: tarjeta «Cebale un mate a alguien» en la pestaña Paucho (se abre el tercer día con hábitos) y, una vez, al cerrar `GoalDone` de 7 días.
2. Hoja: Paucho alcanza un mate. «¿A quién le cebamos uno? Si lo toma, arrancan una racha de a dos.» Botón verde: «Mandar por WhatsApp».
3. Se abre la hoja de compartir nativa con el texto: «Te cebé un mate 🧉 Tomalo acá y arrancamos una racha de a dos: https://<dominio>/m/K7P2QX». La vista previa del enlace muestra a Paucho con el mate y «{nombre} te cebó un mate».
4. Estado pendiente en la tarjeta: «Esperando a que lo tome…», con «Reenviar» y «Cancelar». Vence a los 7 días: «Se enfrió. ¿Le cebamos otro?»
5. Cuando el otro acepta, aviso: «¡{amigo} tomó tu mate! Ya van de a dos.»

**Quien recibe**
- **Con la app instalada:** el enlace la abre directo (App Link / Universal Link). Paucho de cerca: «{nombre} te cebó un mate. ¿Arrancan una racha de a dos?» → «¡Dale!» / «Ahora no».
- **Sin la app, Android:** página liviana (< 100 KB) con Paucho y el mate, «{nombre} te cebó un mate» y el botón a Google Play. El enlace a la tienda lleva el código en `referrer`; al primer arranque la app lo lee con la Play Install Referrer API (deferred deep link sin servicios de terceros).
- **Sin la app, iPhone:** misma página, botón a App Store y el código a la vista: «Cuando la instales, volvé a tocar este enlace». Respaldo: campo «¿Te invitaron? Poné el código» en la pestaña Paucho. No se lee el portapapeles: iOS muestra un cartel de permiso que asusta.
- **Mientras la app sea web:** el enlace abre la app con `?m=K7P2QX` y el código se guarda hasta terminar la primera sesión.
- **Primera sesión del invitado** (doc 11): mate, nombre, tres hábitos. Al cebar su primer mate: «Este mate te lo cebó {nombre}. ¡Ya van de a dos!» La racha de a dos arranca sola, sin pantalla extra.

**Qué ve cada uno**
- En `StreakDay`, después de cebar: fila «Con {amigo}» con dos mates, humeante el de quien cebó, vacío el de quien falta, y el número de a dos.
- En la pestaña Paucho: una tarjeta por racha de a dos (nombre, número, récord, días juntos).
- Solo se comparte: el nombre que cada uno escribió, si cebó hoy y los números de la racha de a dos. Nunca hábitos, ánimo, reflexiones ni horarios.

**Mandar un mate**
- Si yo cebé y el otro no: botón «Cebale uno». Le llega: «{nombre} te cebó un mate 🧉 Está calentito.» Al abrir, su `StreakDay` dice «Te lo cebó {nombre}»; igual desliza para tomarlo, y eso cuenta su día.
- Quien lo recibe puede responder con un toque: «¡Gracias!» → al otro le llega «{amigo} tomó tu mate».
- Sin texto libre ni chat.

**Si uno corta**
- El día de a dos cuenta cuando los dos cebaron su mate de esa fecha.
- La primera falta de la semana la cubre sola «el termo de a dos» (se llena cada lunes). El día se ve escarchado, como en la racha propia.
- La segunda falta de la semana vuelve el número a cero. Los dos leen lo mismo, sin nombrar a nadie: «Se enfrió el mate de a dos. Arrancan de nuevo cuando quieran.» Récord y días juntos quedan.
- La racha propia de cada uno no se toca nunca.
- Tras 14 días sin que cebe alguno, queda «dormida»: sin avisos, y revive con un mate.
- «Dejar esta racha» está siempre a mano. El otro ve «Esta racha de a dos terminó», sin motivo.

**Vacíos y errores:** sin conexión, «Mandar por WhatsApp» avisa «Necesito señal para cebarle a alguien»; cebar el propio mate funciona y se sincroniza después. Código vencido o usado: «Ese mate ya se tomó. Pedile otro a {nombre}.»

## Reglas y números
| Regla | Valor inicial | Por qué |
|---|---|---|
| Rachas de a dos por persona | 3 | vínculo cercano, no lista de contactos; tuneable |
| Vigencia del enlace | 7 días, un solo uso | limita reenvíos en grupos |
| Invitaciones pendientes | 5 a la vez | freno al spam |
| Día de a dos | los dos cebaron la misma fecha local | simple; tolera husos distintos |
| Termo de a dos | 1 falta por semana, gratis, automático | amabilidad de Finch sobre la regla de Duolingo |
| «Cebale uno» | 1 por día por racha, entre las 9:00 y las 21:00 del que recibe | no insistir |
| Marca tardía | el servidor acepta el día hasta 48 h después | uso sin conexión |
| Dormida | 14 días | deja de avisar a quien se fue |
| Premio al empezar | 20 herraduras a cada uno, una vez por pareja | (estimación) lo fija doc 04 |
| Metas de a dos | 7 y 30 días: tarjeta para compartir (doc 10) | sin objetos en V1 |

## Contenido necesario
- Texto: 6 líneas de invitación, 10 avisos «te cebaron» y 6 «tomó tu mate» (rotan como en doc 16), 4 líneas de «se enfrió», 3 mensajes de WhatsApp para elegir.
- Arte: Paucho alcanzando el mate (pose nueva, plano medio), dos mates lado a lado (lleno y vacío), imagen de vista previa del enlace de 1200×630, ilustración de la página web.
- Sonido: reutiliza el del mate.

## Arte, animación y sonido
El mate cruza la pantalla de un lado a otro cuando se manda, y el del amigo empieza a humear cuando ceba. La primera vez que los dos cebaron suena el festejo corto de racha (doc 15). Reglas de estilo en `docs/visual/guia-visual.md`.

## Datos y técnica
El mínimo de servidor es una cuenta anónima, tres tablas y una función que manda avisos.

- **Cuenta:** anónima de Supabase (doc 26). Sin mail ni teléfono; no se leen los contactos.
- **Tablas:** `profiles` (id, nombre, nombre de Paucho, `last_mate_day`, token de aviso) · `invites` (código, de quién, vence, usado por) · `duos` (id, a, b, `streak`, `best`, `days_together`, `last_both_day`, `forgiven_week`, estado).
- **Funciones:** `create_invite`, `accept_invite`, `mark_mate(day)` (actualiza las rachas de a dos del usuario), `send_mate(duo)` (aviso remoto por FCM/APNs con `@capacitor/push-notifications`; Web Push en la versión web).
- **Seguridad:** cada fila la leen solo sus dos integrantes (RLS). Códigos de 6 caracteres sin letras ambiguas.
- **Enlaces:** dominio propio con `assetlinks.json` y `apple-app-site-association`; ruta `/m/:code`. No se usa Firebase Dynamic Links (ya no existe) ni un SDK de atribución pago.
- **Cliente:** `store.ts` suma `duos` (copia local para mostrar sin conexión) y `pendingInvite`; `actions.cebarMate` llama a `mark_mate`. Pantallas: `PauchoTab.tsx`, `DayOne.tsx`, hoja nueva `DuoSheet`.
- **Costo:** USD 0 a 10 mil usuarios; USD 25 más uso a 100 mil (plan).
- **Borrado:** borrar la cuenta borra invitaciones y rachas de a dos (Apple 5.1.1(v), plan).

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `invite_sheet_opened` | se abre la hoja | `entry` (paucho_tab, goal_7, evento) |
| `invite_sent` | vuelve de la hoja de compartir | `invite_id`, `channel` si el sistema lo informa |
| `invite_opened` | carga la página o la app con código | `invite_id`, `platform`, `has_app` |
| `invite_installed` | primer arranque con código | `invite_id`, `method` (referrer, enlace, código a mano) |
| `duo_started` | acepta | `duo_id`, `new_install`, `hours_since_invite` |
| `duo_day_kept` | los dos cebaron | `duo_id`, `streak`, `forgiven` |
| `mate_sent` / `mate_thanked` | «Cebale uno» / «¡Gracias!» | `duo_id` |
| `duo_reset` / `duo_left` | vuelve a cero / alguien sale | `streak_before`, `age_days` |

Los nombres de las personas no van a analítica.

## Casos borde y riesgos
- **Presión entre personas.** Es el riesgo principal. Por eso: termo de a dos, textos sin culpable, racha propia intacta, salir sin aviso.
- **Spam e insistencia.** Un «cebale uno» por día, cinco invitaciones pendientes, enlace de un uso.
- **Alguien no deseado.** Aceptar es siempre explícito; «Dejar» corta todo. Sin búsqueda de usuarios ni perfil público.
- **Husos distintos.** Cada uno cierra su fecha local; el día cuenta cuando existen las dos marcas de la misma fecha.
- **Trampa.** Reloj adelantado fabrica días; no hay premio que valga plata, se acepta.
- **Atribución en iPhone.** Parte de las instalaciones no se podrá unir a su invitación; el K-factor de iOS queda subestimado.
- **Tiendas.** Contenido entre usuarios mínimo (nombre de pila); sumar filtro de palabras al nombre. Público 18+.
- **Pago.** La racha de a dos es gratis para siempre; el Plan de a dos (doc 19) solo suma Premium.

## Fases
- **V1:** invitar, aceptar, ver si cebó, «cebale uno», termo de a dos, hasta 3 rachas. Lista cuatro semanas antes del 20 de julio de 2027.
- **Día del Amigo (opinión, plan):** del 14 al 20 de julio, tarjeta en Inicio «El martes es el Día del Amigo. ¿A quién le cebás uno?»; quien arranca una racha de a dos esa semana recibe el mate doble para el cuarto; videos de Paucho y tarjeta para estados (docs 10 y 31).
- **V2:** metas de a dos con objeto, un animalito «por amistad» (doc 03), «¡Gracias!» con variantes.
- **Afuera:** chat, grupos, tablas de posiciones, leer contactos.

## Criterios de aceptación
- [ ] El enlace abre la app instalada en la pantalla de aceptar, en Android y iPhone.
- [ ] Instalando desde el enlace en Android, la racha de a dos arranca al cebar el primer mate sin escribir nada.
- [ ] En iPhone, el código a mano y el segundo toque del enlace funcionan.
- [ ] Cada uno ve el mate del otro cambiar a humeante en menos de 1 minuto con conexión.
- [ ] Una falta por semana no corta; la segunda vuelve a cero y ningún texto nombra a quien faltó.
- [ ] La racha propia no cambia por nada de lo que pase en la de a dos.
- [ ] «Dejar esta racha» y borrar la cuenta eliminan los datos del servidor.
- [ ] Sin conexión se puede cebar y la marca llega después.

## Preguntas abiertas
1. **¿Un mate recibido cuenta el día sin abrir la app?** Recomiendo que no: el gesto de deslizar es la racha.
2. **Límite de rachas de a dos.** Recomiendo 3 y medir.
3. **Dominio.** Hace falta uno propio antes de publicar enlaces; depende de la decisión del nombre (doc 30).
4. **Premio del Día del Amigo.** Recomiendo una cosa del cuarto (barata) y dejar el animalito para V2.
5. **Adelantar la versión web.** Se puede lanzar en la web antes de las tiendas, sin esperar el deep link diferido. Recomiendo hacerlo para medir el K-factor temprano.
