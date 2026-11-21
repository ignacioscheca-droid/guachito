# 15 · Ceremonias cortas, festejo con jerarquía y sonido de verdad
> Estado: propuesta · Etapa: Etapas 1–5 del plan · Mejora del plan: 15 · Depende de: 12, 13, 14

## En una línea
Lo diario dura 3 s y no pide toques; lo raro tiene cartel de madera, guitarra y dorado; todo suena grabado y Paucho habla en sílabas.

## Problema y oportunidad
La barra llena dura cinco tiempos todos los días, todo rebota igual, el dorado está en todos los botones y los efectos son osciladores (plan). En el código de `areas`:

- **Barra llena:** «¡Yujuuu!» y, a los 1.400 ms, `FullTalk`: 6 herraduras vuelan, un toque, la frase de la obra, otro toque en «¡Dale, Paucho! 🔨» y «¡Toc, toc!» 5.000 ms. ≈ 10–12 s con lectura (estimación), todos los días.
- **Un rebote para todo:** `cubic-bezier(0.3, 1.6, 0.5, 1)` 22 veces en `index.css`.
- **Dorado en todo:** 25 botones `variant="gold"`; «¡A ver!», «Seguir» y «¡Dale!» igual que «¡Cobrar todo!».
- **Sonido sintetizado:** los 17 efectos de `sound.ts` son osciladores y ruido; solo la música es grabada (`musica.m4a`, 2,5 MB).
- **Confeti igual:** `Confetti.tsx` tira 26 piezas tanto para un hábito como para una obra.

Se lo aprendemos a Royal Match, Homescapes y Animal Crossing (plan).

## Objetivo y métricas
- **Primaria:** del último hábito a Paucho trabajando, día 2 en adelante: de ≈ 10 s y 2 toques a ≤ 3,2 s y 0 toques.
- **Secundarias:** sonido encendido a los 7 días ≥ 70 % de quienes empezaron con él (estimación); el juez distingue los 3 niveles solo por sonido y háptico.
- **Guardrails:** ceremonias raras saltadas < 30 %; retención del día 7 sin baja (doc 27); 60 cuadros por segundo en un Android de 3–4 GB.

## Experiencia
**Jerarquía de festejo.** Cada momento tiene un nivel fijo.

| Nivel | Momentos | Duración | Toques | Visual | Sonido | Háptico |
|---|---|---|---|---|---|---|
| Micro | hábito hecho, herradura que llega, cobrar, comprar, colocar | ≤ 700 ms | 0 | 12 piezas de confeti; nada se oscurece | 1 efecto ≤ 350 ms | 1 pulso |
| Hito | barra llena (día 2+), obra revelada, meta de racha | 2.000–3.200 ms | 0 o 1 | polvo, brillo, 26 piezas; Paucho salta | efecto + rasgueo ≤ 1.000 ms | 2–3 pulsos |
| Raro | primera barra llena, área completada, vuelta del viaje, primer animalito, fin de evento | 4.000–8.000 ms | 1 al final | cartel de madera, dorado, 40 piezas, escena al 35 % | remate de guitarra 2,5 s | patrón largo + golpe |

**Barra llena, día 2 en adelante.** La barra destella con «¡Al máximo!», Paucho salta, las herraduras van al contador, un globo dice «¡Voy con el fogón! A las 17:40 te lo muestro», Paucho camina al caballete (doc 14) y la obra arranca sola. Un toque adelanta al final. Con viaje o última obra del área, secuencia completa.

**Revelación.** La obra cae desde arriba, rebota dos veces y un brillo diagonal la recorre; recién ahí habla Paucho.

**Cartel de madera,** solo en raros: «¡Al máximo!» (día 1), «¡Área completada!», «¡Volvimos del sur!», «¡7 días de mate!». Cuelga de dos sogas y cae.

**Botones.** Principal verde (`--tick` #5aa04a, borde `--tick-deep`). Dorado solo si entrega un premio: «¡Cobrar todo!», «¡Cobrar!», «Abrir». «¡A ver!», «Seguir», «¡Dale!» y «¡Buen viaje!» pasan a verde.

Antes del primer toque, todo mudo. Con «reducir movimiento», fundidos de 150 ms en vez de caídas.

## Reglas y números
**Momento por momento (ms desde el disparo).**

| Momento | HOY | PROPUESTA |
|---|---|---|
| Toque de botón | oscilador 60 + pulso 8 | madera grabada 40 + pulso 8 |
| Hábito hecho | confeti 26 piezas 1.100–1.500 · 2 notas ≈ 690 · tilde 380 y pliegue · vuelo 650 · salto 2 × 500 | confeti 12 piezas 700 · punteo 350 · tilde 300 · vuelo 500 · salto 1.000 (sprite) |
| La barra sube | blip por punto y pulso cada 2 · relleno 700 | un blip al llegar · relleno 500 · 1 pulso |
| Barra llena, día 1 | 0 «¡Yujuuu!» · 1.400 Paucho de cerca · 2.500 vuelan 6 herraduras (130 entre sí) · 3.970 llegan · toque · frase · toque «¡Dale!» · «¡Toc, toc!» 5.000 | 0 destello y rasgueo · 400 cartel cae (260 + vaivén 600) · 1.400 Paucho de cerca · 2.200 herraduras (90 entre sí, 600 de vuelo) · 3.250 llegan · toque · frase · toque «¡Dale!» verde |
| Barra llena, día 2+ | igual que el día 1 | 0 destello y rasgueo 900 · 200 salto · 500 herraduras (90 entre sí) · 1.550 llegan · 1.300 globo · 1.900 camina y la cámara abre (doc 13) · 3.000 la obra arranca; 0 toques |
| Revelación de obra | 0 la pila tiembla 600 · 1.350 golpe y aparece · 1.400 confeti · 1.700 pulso · 2.300 habla | 0 tiembla 500 (3 sacudidas) · 500 polvo 250 · 750 cae desde −40 % de su alto en 280, acelerando · 1.030 impacto: aplaste 1,08 × 0,92 por 80, golpe, pulso fuerte · 1.110 rebote de 12 px en 160 · 1.270 rebote de 4 px en 120 · 1.400 brillo 600 · 1.450 confeti 26 · 1.500 campanita · 2.100 habla |
| Herradura llega | oscilador 180–300 | tintineo 180 (3 variantes) · contador 1,15× en 150 |
| Área completada | 1.300 título y fanfarria · 2.300 salta · 3.300 vuelan 50 · 5.000 habla | 1.300 cartel cae y remate 2.500, música −8 dB · 1.560 vaivén 600 · resto igual |
| Comprar | oscilador 600 | caja y moneda 300 |

| Regla | Valor | Por qué |
|---|---|---|
| Ceremonia completa de barra llena | solo la primera vez | lo diario dura poco (P3) |
| Hito máximo | 3.200 ms | el fin de nivel de Royal Match dura ≈ 2 s (plan) |
| Raros por día | ≤ 1; el segundo baja a hito | lo raro se siente raro |
| Curvas (tokens) | `--ease-micro` (0.3, 1.3, 0.5, 1) 200 ms · `--ease-hito` (0.3, 1.6, 0.5, 1) · `--ease-caida` (0.55, 0, 1, 0.45) · `--ease-salida` (0.2, 0, 0, 1) · vaivén por fotogramas | reemplazan las 22 copias (AN-01) |
| Confeti | 12 · 26 · 40 piezas | el conteo dice el nivel |
| Cartel | 300 × 88 px a 390 de ancho; cae en 260 ms; gira −4° → +2° → 0° en 600 | objeto colgado, no etiqueta |
| Brillo | banda blanca a 45°, 30 % del ancho, opacidad 0,7, recortada por el alfa de la obra | Homescapes |
| Mezcla | música −20 dB · voz −14 · micro −12 · hito −8 · raro −6; en raros la música baja 8 dB y vuelve en 800 ms | lo raro sobresale |

**Voz de Paucho, al estilo Animal Crossing.** Mientras el texto se escribe suena una sílaba grabada cada 2 letras, a 65 ms por sílaba. Afinación al azar ±1 semitono; la última antes de «?» sube 3 semitonos; con «!», +3 dB. Emojis y puntuación no suenan. La boca se abre con cada sílaba, no con el reloj fijo de 130 ms de `PauchoTalk.tsx`. Un toque completa el texto y corta la voz. Ajustes suma «Voz de Paucho».

**Hápticos.** Los patrones de `sound.ts`, por nivel: micro `tap` [8] o `success` [12, 70, 18]; hito [14, 70, 28]; raro `celebrate` [14, 70, 14, 70, 28] más `heavy` [30] en el impacto. En iPhone cada pulso es un tic del interruptor oculto; dos tics a menos de 60 ms se sienten como uno (estimación): ningún hueco baja de 70. Se quita el pulso por punto de la barra.

## Contenido necesario
**18 efectos grabados,** AAC mono 96 kbps (`.m4a`).

| Efecto | Duración | Variantes | Fuente posible |
|---|---|---|---|
| Toque de madera | 40 ms | 2 | [Kenney, CC0](https://kenney.nl/assets) |
| Hábito: punteo de guitarra criolla | 350 ms | 3 | grabación propia |
| Energía llega a la barra | 120 ms | 1 | Kenney |
| Herradura: tintineo | 180 ms | 3 | grabación propia |
| Barra llena: rasgueo | 900 ms | 2 | grabación propia |
| Remate raro: guitarra y bombo legüero | 2.500 ms | 2 | grabación propia o encargo |
| Martillazo | 150 ms | 3 | [Freesound](https://freesound.org), solo CC0 |
| Pila que cruje | 500 ms | 1 | Freesound CC0 |
| Obra que cae | 250 ms | 1 | [Sonniss GDC](https://sonniss.com/gameaudiogdc), libre de regalías |
| Brillo: campanita | 500 ms | 1 | Kenney |
| Cartel: soga y madera | 400 ms | 1 | Freesound CC0 |
| Mate: sorbo | 400 ms | 2 | grabación propia |
| Ladrido | 300 ms | 2 | grabación propia |
| Pasos en tierra | 80 ms | 4 | Sonniss |
| Aterrizaje del salto | 120 ms | 1 | Sonniss |
| Comprar: caja y moneda | 300 ms | 1 | Kenney |
| Colocar mueble | 150 ms | 2 | Freesound CC0 |
| Bloqueado: toc suave | 150 ms | 1 | Kenney |

≈ 32 archivos, ≤ 350 KB (estimación); decodificados en mono a 44,1 kHz ocupan 176 KB por segundo, ≈ 2,5 MB en total.

**Voz:** 40 sílabas («pa», «che», «mi», «to»…) de 60–90 ms y 6 interjecciones («¡Yujuuu!», «¡Ahh!», «¡Epa!», «Mmm», «¡Che!», bostezo), por un actor con cesión firmada; una hoja de audio ≈ 60 KB.

**Música.** Hoy suena «At Peace With the Plains» recortada; su licencia comercial está pendiente (plan) y sin licencia escrita no entra en la versión de tiendas. Plan B: 2 bucles de guitarra criolla de 90 s (día y noche) por encargo con cesión total, ≤ 1,5 MB cada uno.

**Arte y textos:** cartel en 9 partes (bordes de 24 px), webp ≤ 30 KB; textura de brillo 64 × 256 ≤ 5 KB; 4 títulos de cartel; 3 variantes del globo de barra llena.

## Arte, animación y sonido
Reglas generales: guía visual (P3, P4, P6, CO-02, AN-01, CE-02, SO-01). Cartel: tipografía de títulos en crema, contorno `--earth` de 2 px. Créditos en `public/audio/CREDITOS.txt`.

## Datos y técnica
- Guardado: `fullCeremonySeen` (migración: `true` si `jobsDone` > 0) y `raroDay` (fecha del último raro). Teléfono (`gauchito.sound`): `voice`, `voiceVolume`.
- `sound.ts`: `SOUNDS` pasa a buffers de `public/audio/sfx/*.m4a` precargados con `decodeAudioData`; variante al azar y ±1 semitono con `playbackRate`; los osciladores quedan de respaldo. Nuevo `voice(text, onSyllable)`.
- `App.tsx`/`FullTalk.tsx`: rama corta con `fullCeremonySeen`; `actions.startWork()` y `scheduleDonePush` a los 3.000 ms.
- `Home.tsx` (`openObra`) y `Reveal.tsx`: nueva línea de tiempo; clases `.sobra__obra--drop` y `.sobra__glint`.
- `Confetti.tsx`: prop `level`. Nuevo `WoodSign.tsx`. `ui.tsx`: `variant="primary"` verde.

## Analítica
| Evento | Cuándo | Propiedades |
|---|---|---|
| `ceremony_shown` | empieza un hito o un raro | `moment`, `level`, `first_time` |
| `ceremony_skipped` | un toque lo adelanta | `moment`, `level`, `at_ms` |
| `sound_setting_changed` | cambia música, efectos, voz o háptico | `setting`, `on`, `volume` |

## Casos borde y riesgos
- **Dos raros el mismo día:** el segundo baja a hito.
- **La obra arranca sola y no la viste:** el globo y la cuenta de 8 horas quedan en Inicio; el aviso de obra lista no cambia.
- **iPhone en silencio:** `audioSession` ambiente ya respeta el interruptor; los hápticos siguen.
- **Licencias:** ningún sonido sin fuente y licencia anotadas; nada CC-BY-NC.
- **Bienestar:** ningún sonido de error para un hábito no hecho ni sonido triste en un día sin barra llena.

## Fases
- **V1:** barra llena corta, revelación con caída y brillo, botones verdes, jerarquía de confeti y hápticos, 18 efectos.
- **V2:** voz en sílabas, cartel de madera, música con licencia o encargo.
- **Más adelante:** música por área y hora del día. **Afuera:** voz con palabras reales.

## Criterios de aceptación
- [ ] Día 2+: del último hábito a Paucho trabajando ≤ 3.200 ms, sin toques.
- [ ] Revelación: impacto a 1.030 ± 30 ms, dos rebotes y un brillo.
- [ ] Ningún botón dorado que no entregue premio.
- [ ] Las 22 copias de la curva pasan a tokens.
- [ ] Con los archivos presentes no suena ningún oscilador.
- [ ] `CREDITOS.txt` lista fuente y licencia de cada archivo.
- [ ] El juez distingue micro, hito y raro solo por sonido y háptico.

## Preguntas abiertas
1. **¿La obra arranca sola, sin «¡Dale!»?** Cambia una decisión tomada. Recomiendo que sí desde el día 2.
2. **¿Licencia o reemplazo de «At Peace With the Plains»?** Recomiendo pedir la licencia ya y encargar el plan B en paralelo.
3. **¿Voz de un actor o del dueño?** Recomiendo actor con cesión firmada.
