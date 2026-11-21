# Documentación de diseño de Gauchito

Todo lo que la app tiene que tener según el [plan de mejora 10×](https://claude.ai/artifact/2wjD8xK1eHbSm8qUTZBKK5), para el lanzamiento y para después. Nada de esto está implementado: son propuestas para decidir y construir.

| Documento | Para qué sirve |
|---|---|
| [Guía visual](visual/guia-visual.md) | Reglas de arte, UI, animación y sonido con ejemplos de sí y no, auditoría de la app de hoy, checklist de lanzamiento de cada funcionalidad y backlog visual |
| [Tiendas: Android e iOS](tecnico/tiendas-android-ios.md) | Pasos para convertir la PWA en apps de Google Play y App Store con Capacitor |

Cada documento de diseño sigue la misma plantilla: problema, métricas, experiencia, reglas y números, contenido, arte, técnica, analítica, riesgos, fases, criterios de aceptación y preguntas abiertas para el dueño.

## A. Un juego que no se termina

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 01 | [La salida del día](diseno/01-salida-del-dia.md) | Cuando la barra se llena y no toca obra, Paucho sale dos horas a un lugar del pago y vuelve con un cuento de tres líneas y un recuerdo para la libreta: 150 recuerdos, cinco meses de novedad diaria. | Etapa 1 del plan (antes del primer corte numérico), V1 solo texto |
| 02 | [Eventos de temporada](diseno/02-eventos-de-temporada.md) | Cuatro veces al año, un calendario de 20 casilleros avanza con cada día jugado y entrega un animalito, dos prendas y tres cosas para el cuarto; lo que no se alcanzó se termina después, sin apuro. | Etapa 4 del plan (primer evento); mensuales después de las 24 semanas |
| 03 | [Animalitos para juntar](diseno/03-animalitos.md) | Ocho bichos de la pampa llegan por salidas, eventos y amistad, viven en la estancia, uno acompaña a Paucho, y los mimos son el gasto chico de todos los días. | Etapa 4 del plan (el primero llega con el primer evento); elenco completo después de las 24 semanas |
| 04 | [Economía con algo que desear](diseno/04-economia.md) | No se toca lo que el jugador cobra: se duplica lo que puede desear, se suman gastos que se repiten y la simulación pasa a contar los encargos. | Etapa 1 del plan (precios y simulación, antes del lanzamiento suave); gastos nuevos con 01, 02 y 03 |

## B. Un Paucho que te conoce

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 05 | [¿Cómo viene el día?](diseno/05-como-viene-el-dia.md) | Un toque por día sobre cinco mates, de «helado» a «espumoso», y a la noche una línea opcional, «lo mejor de hoy»; Paucho contesta según lo elegido y todo queda solo en el teléfono. | Etapas 1–5 del plan |
| 06 | [Memoria y voz de Paucho](diseno/06-memoria-y-voz.md) | Paucho pasa de 6 frases de festejo a un banco de 480 líneas por situación, con memoria de tus hábitos, tu meta y lo que anotaste, y con días en que anda con sueño, con frío o cansado de la obra. | Etapas 1–5 del plan |
| 07 | [Un minuto de calma con el mate](diseno/07-minuto-de-calma.md) | Sesenta segundos de respirar al ritmo del vapor del mate, con Paucho al lado, más dos ejercicios cortos; se hacen dentro de la app, cuentan como hábito y son gratis para siempre. | Etapas 1–5 del plan |
| 29 | [Hábitos pensados para acá](diseno/29-habitos-locales.md) | Un catálogo de 61 hábitos escritos para la vida en Argentina, ordenados por las ocho áreas del cuestionario, cada uno con emoji, momento del día y texto final; salen los que chocan con un país que cena tarde. | Etapas 1–5 del plan |
| 30 | [Personaje, nombre y tono](diseno/30-personaje-nombre-y-tono.md) | Paucho es un pibe de campo dormilón y tierno, que habla en voseo con humor seco; la marca para las tiendas debería ser «Paucho: tu gauchito», con Paucho como nombre propio y «gauchito» como descripción. | Lanzamiento suave |

## C. La racha, más lejos y de a dos

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 08 | [Racha por capas](diseno/08-racha-por-capas.md) | La racha sigue siendo cebar el mate de la mañana, tan fácil como hoy; arriba se le suman capas que premian más sin exigir más: premios con objeto en 14, 30, 50 y 100 días, una «semana redonda» aparte para quien hizo hábitos los siete días, un aviso nocturno solo si falta y el widget. | Etapas 1–5 del plan |
| 09 | [Racha de a dos](diseno/09-racha-de-a-dos.md) | «Cebame un mate»: un enlace por WhatsApp arranca una racha compartida con otra persona; cada uno ve si el otro ya cebó hoy y puede mandarle un mate. | Etapas 1–5 del plan (campaña: Día del Amigo, 20 de julio de 2027) |
| 10 | [Tarjetas para compartir](diseno/10-tarjetas-para-compartir.md) | Cada meta de racha, área terminada y animalito nuevo deja una imagen lista para estados de WhatsApp e historias de Instagram, armada en el teléfono y compartida con la hoja nativa en dos toques. | Etapas 1–5 del plan |
| 25 | [Widget de racha](diseno/25-widget-de-racha.md) | Un widget de pantalla de inicio con Paucho y el mate: humeante si hoy cebaste, frío si falta, con el número de la racha; es el único recordatorio que no se puede silenciar. | Etapas 1–5 del plan (con el envoltorio Capacitor) |

## D. Primera sesión

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 11 | [Primera sesión](diseno/11-primera-sesion.md) | Mate, nombre, tres hábitos y la casita levantada a la vista antes del segundo minuto; el cuestionario pasa al día 2 como charla, y las obras tardan 0, 2, 4 y después 8 horas. | Etapa 1 del plan (se prueba en la web antes de envolver) |

## E. Arte y animación

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 12 | [Un solo Paucho, un solo estilo](diseno/12-un-solo-estilo.md) | Fijar el Paucho de fieltro (`mate_*`, ala ancha) como único modelo, rehacer solo las 14 piezas del estilo viejo que todavía se ven, limpiar la primera escena y regenerar los íconos en una sola hoja con la misma luz. | Etapas 1–5 del plan (antes del lanzamiento suave) |
| 13 | [La cámara más cerca](diseno/13-camara-mas-cerca.md) | La escena de Inicio se escala hasta 1,4× centrada en Paucho y se mueve sola hacia la obra cuando pasa algo, para que sus expresiones se lean sin una sola pieza de arte nueva. | Etapas 1–5 del plan (antes del lanzamiento suave) |
| 14 | [Paucho se mueve de verdad](diseno/14-paucho-se-mueve.md) | Cuatro ciclos por sprites (sorbo, martillo, salto, caminar) sacados de video generado entre dos poses que ya existen, después de una prueba de 2 días con un solo ciclo que decide si el camino sirve. | Etapas 1–5 del plan (solo la prueba de 2 días); el resto, después de las 24 semanas |
| 15 | [Ceremonias cortas, festejo con jerarquía y sonido de verdad](diseno/15-ceremonias-festejo-sonido.md) | Lo diario dura 3 s y no pide toques; lo raro tiene cartel de madera, guitarra y dorado; todo suena grabado y Paucho habla en sílabas. | Etapas 1–5 del plan |

## F. Avisos

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 16 | [Avisos locales](diseno/16-avisos-locales.md) | Los avisos pasan a programarse en el teléfono, en la hora de cada persona y con la voz de Paucho: uno a la mañana, «obra lista», el de racha solo si falta, y una escalera corta que se calla sola para quien se fue. | Etapas 1–5 del plan |

## Monetización

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 17 | [Gauchito Premium](diseno/17-gauchito-premium.md) | Una suscripción barata, mensual o anual, con 14 días de prueba, que abre lo que embellece el mundo de Paucho y nunca lo que te hace bien. | Lanzamiento suave |
| 18 | [Pase del evento](diseno/18-pase-del-evento.md) | Una compra chica y única por evento que abre su camino dorado, incluida en Premium, que no vence y que se puede comprar tarde sin perder nada. | Etapas 1–5 del plan (con el primer evento) |
| 19 | [Plan de a dos](diseno/19-plan-de-a-dos.md) | Una sola persona paga cerca de 1,5 veces Premium y lo comparte con su compañero de racha: dos cuentas, dos Pauchos, un pago, y dos cosas que solo existen de a dos. | Después de las 24 semanas (si Premium convierte) |
| 20 | [Paquete de bienvenida](diseno/20-paquete-de-bienvenida.md) | Una oferta única y barata (un animalito, un pañuelo y herraduras) que aparece desde el tercer día, dura 14 días de verdad y no vuelve nunca. | Etapas 1–5 del plan (con el primer evento) |
| 21 | [Amigo de Paucho para siempre](diseno/21-amigo-para-siempre.md) | Un pago único que da Premium de por vida, para quien no quiere suscripciones, puesto en un lugar discreto y a un precio que no se come al plan anual. | Después de las 24 semanas (si Premium convierte) |
| 22 | [El mate pendiente](diseno/22-mate-pendiente.md) | Quien quiere, deja pago un mes de Premium en el pizarrón de la pulpería; alguien que no puede pagarlo lo pide y lo recibe, sin que ninguno sepa quién es el otro. | Después de las 24 semanas (si Premium convierte) |
| 23 | [Anuncios con recompensa](diseno/23-anuncios-con-recompensa.md) | Quien no paga puede, si quiere, prender la radio de Paucho hasta tres veces por día: escucha una tanda y Paucho le pasa herraduras o, de vez en cuando, un termo. | Con escala |
| 24 | [Marcas en el mundo](diseno/24-marcas-en-el-mundo.md) | Una yerba o una fintech auspicia el evento de la temporada con un objeto propio que Paucho usa en su cuarto; se ve como parte del mundo, dice «Auspicio» y nunca toca un hábito. | Con escala |

## Plataforma

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 26 | [Cuenta y nube](diseno/26-cuenta-y-nube.md) | Cada instalación tiene una cuenta anónima invisible que guarda el rancho en Supabase; Google o Apple la vuelven recuperable; lo que la persona anota nunca sube; y la hora la pone el servidor. | Etapa 5 del plan («medir y publicar»; antes de la primera tienda) |
| 27 | [Analítica y experimentos](diseno/27-analitica-y-experimentos.md) | Unos 45 eventos con nombre fijo, tres definiciones de retención que no se discuten, cinco tableros y una prueba A/B por vez en PostHog; errores en Sentry; y una lista corta de cosas que no se miden nunca. | Etapa 1 del plan (lo primero que se construye; se prueba en la web) |
| 28 | [Contenido remoto](diseno/28-contenido-remoto.md) | Eventos, textos de avisos, líneas de Paucho y números de la economía salen de un manifiesto JSON y arte en Cloudflare R2; la app los baja, los valida y los guarda, y sin ellos funciona igual que el día en que se publicó. | Etapa 4 del plan (antes del primer evento de temporada) |

## Crecimiento y mercados

| # | Documento | En una línea | Etapa |
|---|---|---|---|
| 31 | [Adquisición y distribución](diseno/31-adquisicion-y-distribucion.md) | Paucho tiene vida propia en TikTok e Instagram desde la semana 1; con eso, creadores chicos, prensa y una ficha de tienda bien escrita, la app junta gente sin comprarla. | Etapas 1–5 del plan (desde la semana 1) |
| 32 | [Expansión y localización](diseno/32-expansion-y-localizacion.md) | Un solo Paucho que viaja y hace amigos locales: los textos se escriben una vez en voseo y se adaptan por país, y cada país se abre solo si el anterior pasó su corte. | Después de las 24 semanas |
