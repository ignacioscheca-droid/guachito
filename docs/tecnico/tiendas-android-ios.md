# Gauchito en las tiendas: Android (Google Play) e iOS (App Store), paso a paso

> Estado: guía de ejecución · Decisiones ya tomadas (plan, «Camino a las tiendas»): Capacitor sin reescribir, Android primero, una persona con IA, Mac + iPhone.
> Verificado en la web el 15 de noviembre de 2026. Cada dato sensible a la fecha lleva su enlace; lo que no se pudo confirmar dice **sin verificar**. Versiones de paquetes: consultadas en el registro de npm ese mismo día.
> Código leído: rama `areas` («Gauchito 2»). Ojo: ahí la clave de guardado es `gauchito.v2` (`store.ts:129`), no `guachito.v1`; `guachito.v1` es del MVP 1 en `main`.

## 0. Resumen y orden

La app ya es casi un binario: `vite build` sin `BASE_PATH` produce un sitio estático que Capacitor copia adentro de un proyecto Android y uno iOS. El trabajo real son cinco cosas: (1) la prueba cerrada de Google, que es puro calendario; (2) reemplazar Web Push por avisos locales; (3) mover el guardado fuera de `localStorage`; (4) sacar todo lo que huele a web o a prueba; (5) las fichas y formularios de las dos consolas.

```
Cuenta Play (día 1) ──► verificación de identidad ──► app creada en Play Console
                                                        │
Dominio + ids ──► Capacitor (§3) ──► Web lista (§2) ──► AAB firmado ──► prueba interna
                        │                                   │
                        │                                   └─► PRUEBA CERRADA 12 testers × 14 días ──► pedir producción (≤ 7 días) ──► lanzamiento gradual
                        ├─► Persistencia (§4) ─┐
                        ├─► Avisos locales ────┼─► entran como actualizaciones DURANTE los 14 días
                        ├─► Sentry, PostHog ───┘
                        └─► (corte de etapa 2) ──► Cuenta Apple ──► iOS + TestFlight ──► revisión App Store
Supabase ──► borrar cuenta (obligatorio en ambas) ──► RevenueCat ──► Premium
Widget (único código nativo propio) y AdMob: después de las 24 semanas / con escala
```

Regla de oro: **el reloj de 14 días corre con una app imperfecta**. Subí el primer AAB apenas abra y no se rompa; todo lo demás se sube como actualización de la misma prueba.

| Tarea | Sesión en la nube | Exige la Mac del dueño |
|---|---|---|
| Cambios web (§2, §4, §5 en TypeScript), `npm run verify` | Sí | — |
| `npx cap add android`, editar `android/`, config, manifest | Sí | — |
| Compilar AAB | Sí, en GitHub Actions (`ubuntu-latest`) | Opcional (Android Studio) |
| Probar en un Android real, ver la WebView con `chrome://inspect` | No | Sí (o cualquier PC con adb) |
| `npx cap add ios`, compilar, firmar, subir a TestFlight | No (salvo runner macOS de Actions o Codemagic) | Sí, Xcode 26 |
| Widget (Swift / Kotlin) | Escribir el código sí; probarlo no | Sí |
| Altas de cuentas, verificación de identidad, formularios, fichas, cobros | No: son del dueño, con su documento y su banco | Navegador |
| Regenerar arte (`guachito_assets/`, no está en git) | No | Sí |

## 1. Requisitos previos

Abrí la cuenta de Google hoy; todo lo demás puede esperar.

**Cuentas**

| Cuenta | Costo | Notas |
|---|---|---|
| Google Play Console, tipo **personal** | USD 25, una sola vez | Pide verificar identidad (documento) y un teléfono Android real para verificar la cuenta desde la app Play Console. Las cuentas personales creadas después del 13-nov-2023 deben pasar la prueba cerrada (§6). [Requisito oficial](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) |
| Google Play, tipo **organización** | USD 25 + número D-U-N-S | Evita la prueba de 12 testers, pero exige persona jurídica y el D-U-N-S tarda (hasta 30 días según fuentes secundarias, sin verificar). No conviene para una sola persona. |
| Apple Developer Program, individual | USD 99 por año | Recién al abrir iOS (después del corte de la etapa 2). Con cuenta individual, el nombre del vendedor en la tienda es el nombre legal del dueño. |
| Cuenta de comerciante (Play) y Acuerdo de apps pagas + datos bancarios e impositivos (App Store Connect) | USD 0 | Sin esto no se pueden crear productos ni probar compras. Tarda días: empezarlo antes de integrar RevenueCat. |

Desde 2026 Google también exige que toda app instalable en Android certificado esté registrada por un desarrollador verificado; arrancó en septiembre de 2026 en Brasil, Indonesia, Singapur y Tailandia y se extiende al resto en 2027 ([calendario](https://support.google.com/android-developer-console/answer/16650243)). Una cuenta de Play Console verificada ya cumple (sin verificar el detalle para Argentina).

**Herramientas** (Capacitor 8, la versión mayor vigente: `@capacitor/core` 8.6.2 en npm; la 9 está en `9.0.0-rc.0`, no usarla todavía)

| Herramienta | Mínimo | Fuente |
|---|---|---|
| Node.js | 22 o superior | [Guía Capacitor 8](https://capacitorjs.com/docs/updating/8-0) |
| Android Studio | Otter 2025.2.1 o superior | ídem |
| Android: `minSdkVersion` 24, `compileSdk`/`targetSdk` 36, AGP 8.13.0, Gradle 8.14.3 | valores por defecto de la plantilla | ídem |
| JDK | 21 (el que trae Android Studio Otter) | [guía de Capgo](https://capgo.app/blog/upgrade-capacitor-app-to-capacitor-8/); la guía oficial no lo dice |
| Xcode | 26.0 o superior | Capacitor 8 y [Apple, desde el 28-abr-2026](https://developer.apple.com/news/upcoming-requirements/) |
| iOS deployment target | 15.0 por defecto; **recomiendo 16.4** (§9) | Guía Capacitor 8 |
| Dependencias iOS | **Swift Package Manager** por defecto; CocoaPods solo con `--packagemanager CocoaPods` | ídem |

**Identificadores.** El `applicationId` de Android y el bundle id de iOS no se pueden cambiar nunca después de publicar: cambiarlos es publicar otra app, sin reseñas ni usuarios. Propuesta: **`app.gauchito.paucho`** en las dos plataformas, comprando antes el dominio `gauchito.app` (disponibilidad sin verificar). El id no lo ve casi nadie y sobrevive a la decisión de nombre (Gauchito, Paucho o «Paucho: tu gauchito»). El dominio sí hace falta: política de privacidad, página de borrado de cuenta y enlaces «cebame un mate» (§5.4). No usar la grafía vieja «guachito» en nada nuevo.

**Nombre.** Decisión abierta del dueño (plan). El título en Play admite 30 caracteres y el nombre en App Store 30 (sin verificar hoy; son los límites históricos). El nombre bajo el ícono conviene de ≤ 12 caracteres: «Gauchito». Antes de fijarlo: buscar en ambas tiendas y revisar el INPI (pendiente del plan).

## 2. Preparar la web para vivir en un binario

Todo esto es TypeScript y CSS, se hace en la nube y no rompe la PWA. La pieza central es un módulo nuevo, `app/src/platform.ts`:

```ts
import { Capacitor } from '@capacitor/core'
export const isNative = Capacitor.isNativePlatform()      // true dentro del binario
export const platform = Capacitor.getPlatform()           // 'android' | 'ios' | 'web'
export const TEST_MENU = import.meta.env.VITE_TEST_MENU === '1'
```

| # | Tema | Hoy (rama `areas`) | Qué hacer |
|---|---|---|---|
| 1 | Base path | `vite.config.ts`: `base: process.env.BASE_PATH ?? '/'`; todo el arte se pide con `import.meta.env.BASE_URL` (`content.ts:4`, `sound.ts:78`, `RiveGauchito.tsx:15`) | Nada: compilar **sin** `BASE_PATH`. Capacitor sirve desde `https://localhost` (Android) y `capacitor://localhost` (iOS), raíz `/`. Agregar el script `"build:native": "tsc -b && vite build --mode native"` y un `.env.native` con `VITE_TEST_MENU=0`. |
| 2 | Service worker | `main.tsx` llama `registerServiceWorker()` siempre | `if (!isNative) registerServiceWorker()`. En iOS el esquema `capacitor://` no admite service workers y en Android no aporta nada. `sw.js`, el manifest, VAPID y `reminderSnapshot.ts` quedan solo para la web. |
| 3 | Textos de los avisos | Viven en `public/sw.js` (`composeReminder`, `GREETINGS`) | Extraerlos a `src/game/reminderText.ts` (funciones puras, con tests) y que `sw.js` y los avisos locales usen la misma fuente. Si no, hay dos copias que se desfasan. |
| 4 | Detección de plataforma | `isIOS()` por user agent, `isStandalone()` (`push.ts`) | Dentro del binario usar `isNative`/`platform`. `shouldAskPush` y `enableReminders` pasan a una interfaz `notifications` con dos implementaciones (web push / locales). |
| 5 | Safe areas | `viewport-fit=cover` ya está; `--safe-top/--safe-bottom` con `env()` (`index.css:51-52`) | iOS: funciona igual. Android: con target 35+ la app va de borde a borde sí o sí, y Capacitor 8 quitó `adjustMarginsForEdgeToEdge`; ahora los márgenes se manejan con `env()`/variables CSS y el plugin de núcleo [System Bars](https://capacitorjs.com/docs/apis/system-bars). Dejar `--safe-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px))` (nombre exacto de la variable: sin verificar, leer esa página). Probar con barra de gestos y con barra de 3 botones. |
| 6 | Botón atrás (Android) | No existe en iPhone; la app no usa rutas | `App.addListener('backButton', …)` de `@capacitor/app`: cierra la hoja o ceremonia abierta; si no hay nada, vuelve a Home; en Home, `App.minimizeApp()` (nunca `exitApp`). Hace falta una pila única de «cosas abiertas» en `App.tsx`. Con target 36 el gesto predictivo de atrás es obligatorio: probarlo en Android 16 (sin verificar cómo lo emite el plugin). |
| 7 | Teclado | Inputs de nombre (Paucho, jugador, perro, hábito propio) | `@capacitor/keyboard` con `resize: 'body'` en iOS; en Android comprobar que el input no quede tapado yendo de borde a borde. Probar las cuatro pantallas con teclado abierto. |
| 8 | Status bar | `theme-color #fbf3e4` | Íconos oscuros sobre fondo claro (System Bars o `@capacitor/status-bar`, `Style.Light`). Barra de navegación de Android transparente. |
| 9 | Splash | No hay | `@capacitor/splash-screen`: fondo `#fbf3e4` + logo; `launchAutoHide: false` y `SplashScreen.hide()` cuando React pintó el primer cuadro con el estado ya cargado (§4). Android 12+ solo permite ícono centrado sobre color. |
| 10 | Orientación | `"orientation": "portrait"` en el manifest | Android: `android:screenOrientation="portrait"` en la activity. iOS: dejar solo Portrait en Xcode. **Trampa:** en Android 16+ los bloqueos de orientación no valen en pantallas grandes (tablets, plegables) ([guía Capacitor 8](https://capacitorjs.com/docs/updating/8-0)): limitar el ancho del contenido (`max-width: 480px`, centrado, fondo de color) para que no se deforme. |
| 11 | Audio | Arranca con el primer toque (`startAudio`), `audioSession.type = 'ambient'`, pausa con `visibilitychange` | Mantener el arranque por toque: es lo que piden las dos WebView por defecto. Probar en el binario: (a) que respeta el interruptor de silencio del iPhone, (b) que no corta Spotify, (c) que la música para al ir a segundo plano; si `visibilitychange` falla, usar `App.addListener('appStateChange')`. |
| 12 | Hápticos | `navigator.vibrate` en Android y el truco del checkbox en iPhone (`sound.ts`) | Reemplazar por `@capacitor/haptics` cuando `isNative` (§5.2). El truco del checkbox no funciona en WKWebView embebida (sin verificar) y es justo lo que un revisor lee como «web». |
| 13 | Zoom, selección, rebote | `user-select: none` y `overscroll-behavior-y: none` ya están | Agregar `maximum-scale=1, user-scalable=no` al viewport solo en nativo, `-webkit-touch-callout: none`, `-webkit-tap-highlight-color: transparent`. En iOS el rebote se apaga en la config (`ios.scrollEnabled: false`, ya que cada pantalla hace su propio scroll interno; verificar que las hojas siguen deslizando). `android.webContentsDebuggingEnabled: false` en release. |
| 14 | «Agregar a inicio» | `push.ts:40`: «Primero agregá Gauchito a tu pantalla de inicio…»; Ajustes muestra el código de suscripción y «tiene que estar en GitHub» (`Settings.tsx:229`) | Todo eso se oculta con `isNative`. En el binario Ajustes muestra solo interruptores de avisos y horarios. |
| 15 | Menú de pruebas | 5 toques en el saludo o `?test` (`App.tsx:91`, `TestMenu.tsx`) | Condicionar las dos entradas a `TEST_MENU`. Con `VITE_TEST_MENU=0` el import dinámico de `TestMenu` no entra al bundle. La pantalla Ajustes → Errores (`errorLog.ts`) también queda detrás de la bandera; la reemplaza Sentry. |
| 16 | Nombre y restos de prueba | `<title>Gauchito 2</title>`, manifest «Gauchito 2 (áreas)» | Nombre final en `index.html`, `capacitor.config.ts`, `strings.xml` e `Info.plist`. |
| 17 | Reseñas inventadas | `PlanScreens.tsx:27`: ★★★★★ de relleno en «Armando tus metas…» | **Sacarlas antes de cualquier build de tienda** (§7.6). Reemplazo: tres frases de Paucho sobre el plan. |
| 18 | Arte dentro del binario | `public/a` 13 MB (313 webp), `public/audio` 2,4 MB, Rive 260 KB, fuentes Nunito por npm | Ya queda todo adentro al copiar `dist/`. No cargar nada por red en el primer arranque. Lo remoto (eventos de temporada, mejora 28) llega después y siempre con respaldo local. |
| 19 | Descargar la copia | `Settings.tsx:148`: `Blob` + `<a download>` | No funciona en WebView. En nativo: escribir el JSON con `@capacitor/filesystem` en caché y abrir `Share.share({ files: [uri] })`. Importar: `<input type="file">` sí funciona. |
| 20 | Enlaces externos | — | Privacidad, términos y soporte se abren con `@capacitor/browser`, nunca dentro de la WebView. |

## 3. Capacitor paso a paso

Capacitor se instala **dentro de `app/`**, al lado de `package.json`. Comandos exactos (Node 22):

```bash
cd app
npm i @capacitor/core@8 @capacitor/app@8 @capacitor/preferences@8 @capacitor/splash-screen@8 \
      @capacitor/status-bar@8 @capacitor/keyboard@8 @capacitor/haptics@8 @capacitor/share@8 \
      @capacitor/filesystem@8 @capacitor/browser@8 @capacitor/local-notifications@8
npm i -D @capacitor/cli@8 @capacitor/assets
npx cap init "Gauchito" "app.gauchito.paucho" --web-dir dist
npm i @capacitor/android@8 && npx cap add android
npm i @capacitor/ios@8 && npx cap add ios          # solo en la Mac; crea proyecto SPM
npm run build:native && npx cap sync               # copia dist/ y actualiza plugins nativos
npx cap open android                               # o: npx cap run android --target <id>
```

Scripts a sumar en `package.json`: `"sync": "npm run build:native && cap sync"`, `"android": "npm run sync && cap run android"`, `"ios": "npm run sync && cap run ios"`.

`app/capacitor.config.ts`:

```ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.gauchito.paucho',
  appName: 'Gauchito',
  webDir: 'dist',
  backgroundColor: '#fbf3e4',
  android: { minWebViewVersion: 111, webContentsDebuggingEnabled: false },
  ios: { contentInset: 'never', scrollEnabled: false },
  plugins: {
    SplashScreen: { launchAutoHide: false, backgroundColor: '#fbf3e4', showSpinner: false },
    Keyboard: { resize: 'body' },
    LocalNotifications: { smallIcon: 'ic_stat_mate', iconColor: '#C9772B' },
  },
  // Nunca dejar `server.url` en un build de tienda: convierte la app en un sitio remoto (rechazo 4.2).
}
export default config
```

Para recarga en vivo en el teléfono durante el desarrollo: `npx cap run android -l --external` (agrega `server.url` solo en esa corrida).

**Estructura y git**

```
app/
  capacitor.config.ts      ← git
  src/, public/            ← git (la web)
  dist/                    ← NO (ya ignorado)
  android/                 ← git (proyecto nativo: manifest, íconos, widget Kotlin)
    app/src/main/assets/public/   ← NO (copia de dist/; el .gitignore de la plantilla ya lo excluye)
    keystore/*.jks, keystore.properties, local.properties, google-services.json ← NUNCA
  ios/                     ← git
    App/App/public/        ← NO (copia de dist/)
  resources/               ← git (icon.png 1024, splash.png 2732: fuente de @capacitor/assets)
```

Los proyectos `android/` e `ios/` son código fuente propio, no artefactos: se editan a mano (permisos, widget) y `cap sync` no los pisa. Regla para agentes: **después de cada `npm i` de un plugin, `npx cap sync`**; después de tocar solo la web, `npx cap copy` alcanza.

## 4. Persistencia

`localStorage` dentro de una WebView no es almacenamiento garantizado: el sistema puede vaciarlo cuando falta espacio, sobre todo en iOS ([guía de almacenamiento de Capacitor](https://capacitorjs.com/docs/guides/storage)). Perder la racha y el rancho es el peor error posible de esta app, así que el estado pasa a almacenamiento nativo antes de la prueba cerrada.

**Elección: `@capacitor/preferences`** (UserDefaults en iOS, SharedPreferences en Android). El estado es un solo JSON chico (hábitos, `completions` por día, cuarto, racha): decenas de KB por año de uso (estimación). SQLite no aporta nada hasta que exista historial pesado; Filesystem queda para el archivo de respaldo.

**Diseño: `localStorage` sigue siendo el caché síncrono; Preferences es la verdad.** Así `store.ts` no cambia su API ni sus tests.

1. Nuevo `src/game/persist.ts` con `hydrate()` y `persist(json)`.
2. `main.tsx`: `await hydrate()` **antes** de `createRoot(...).render()`. `hydrate()` en nativo lee `Preferences.get({ key: 'gauchito.v2' })`; si hay valor, lo copia a `localStorage` y el store arranca como siempre. Si Preferences está vacío y `localStorage` tiene algo (primer arranque tras actualizar), lo sube a Preferences.
3. `store.ts:206` (`localStorage.setItem`): además llama a `persist(json)`, que escribe en Preferences con un debounce de 300 ms y fuerza la escritura en `App.addListener('pause')`.
4. Lo mismo para `gauchito.sound` (ajustes de sonido).
5. El splash se oculta recién cuando terminó `hydrate()` (§2, fila 9): nunca se ve un Home vacío.
6. Si el JSON no pasa la validación de `store.ts:173` (`version !== 2`), **no pisar**: guardar el texto crudo en `gauchito.v2.broken`, avisar a Sentry y arrancar limpio.

**Migración: el binario no hereda los datos de la PWA.** La app instalada desde Safari o Chrome guarda en el origen `ignacioscheca-droid.github.io`; la app de tienda vive en `https://localhost` / `capacitor://localhost`, otro almacenamiento. No hay forma automática de leerlo. Camino para el dueño y los testers actuales: Ajustes → exportar copia en la PWA → en la app nueva, pantalla de bienvenida con «Ya tenía a Paucho → Traer mi copia» (importar el `.json`). El importador ya valida y migra (`migrateRoom`); agregar el caso `guachito.v1` solo si alguien del MVP 1 lo necesita (hoy: una persona).

**Respaldo, en tres capas**

| Capa | Qué cubre | Estado |
|---|---|---|
| Respaldo del sistema | Android Auto Backup (`android:allowBackup="true"`, incluye SharedPreferences, tope 25 MB) e iCloud/Finder en iOS (incluye UserDefaults). Restaura al cambiar de teléfono si el usuario tiene el respaldo activo. | Gratis; verificar con una reinstalación real. No sirve como promesa al usuario. |
| Copia manual | Exportar/importar JSON por la hoja de compartir (§2, fila 19) | Ya existe; adaptar. |
| Nube | Supabase (§5.7, mejora 26) | Etapa posterior. |

Lo que la persona anota (ánimo, reflexión) queda solo en el teléfono: entra en Preferences y en el respaldo del sistema, pero no en analítica ni en Supabase. Si el dueño quiere que tampoco viaje en el respaldo del sistema, va en una clave aparte excluida con `android:dataExtractionRules` y, en iOS, en un archivo marcado `isExcludedFromBackup`.

## 5. Funciones nativas, en el orden del plan

Cada función entra como una capa detrás de `isNative`, con la web como respaldo. Qué hace cada una ya está decidido en los docs de diseño; acá va solo cómo se enchufa.

### 5.1 Avisos locales (doc 16)

Plugin `@capacitor/local-notifications@8` (8.3.1 en npm, peer `@capacitor/core >=8`). Sin servidor: al publicar se retiran `reminder.yml`, `send-reminder.mjs` y el VAPID del binario.

1. `src/game/notifications.ts` con `reschedule(state)` (doc 16): `cancel` de todo lo pendiente y `schedule` de nuevo, con ids fijos por tipo (100 = mañana, 200 = obra lista, 300 = racha, 400–404 = escalera) para no duplicar.
2. Canales Android al arrancar (`createChannel`): `manana`, `obra`, `racha`, `vuelta`, con importancia `DEFAULT`. Cada uno se puede apagar desde el sistema; el nombre lo ve la persona, en voseo («Obra lista»).
3. Permiso: `checkPermissions()` → si `prompt`, primero el pedido de Paucho (doc 16), después `requestPermissions()`. Si `denied`, no se vuelve a pedir: Ajustes ofrece «Abrir ajustes del teléfono».
4. Ícono `ic_stat_mate`: silueta blanca sobre transparente, en `android/app/src/main/res/drawable-*`. Si falta, Android muestra un cuadrado gris.
5. Tocar un aviso: `addListener('localNotificationActionPerformed')` lleva a la pantalla que indica `extra.kind`.

| Trampa | Qué hacer |
|---|---|
| Android 13+ exige `POST_NOTIFICATIONS` en tiempo de ejecución | El plugin lo declara; igual pedirlo después del pre-permiso, nunca al arrancar. |
| Alarmas exactas (`SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM`): Play solo las acepta para alarmas y calendarios | No declararlas. Usar `allowWhileIdle: true`; un aviso de «obra lista» con 10 min de atraso no importa (doc 16). Si el plugin agrega el permiso por defecto, quitarlo con `tools:node="remove"` en el manifest (sin verificar si la 8.x lo agrega). |
| Fabricantes con ahorro agresivo (Xiaomi, Samsung, Motorola) matan alarmas | Reprogramar en cada apertura; el widget cubre el hueco (doc 25). No pedir «ignorar optimización de batería»: Play lo restringe. |
| Reinicio del teléfono | El plugin reprograma tras el arranque; verificarlo en QA (§9). |
| iOS guarda como máximo 64 avisos pendientes | El diseño usa ≤ 10. Si algún día pasa de 64, iOS descarta en silencio los más lejanos. |
| Cambio de huso horario o de hora | Programar con `at` calculado en hora local y reprogramar en `appStateChange`. |

### 5.2 a 5.6: hápticos, compartir, enlaces, errores, analítica

| # | Función | Plugin | Pasos | Trampas |
|---|---|---|---|---|
| 5.2 | Hápticos | `@capacitor/haptics` | `sound.ts`: si `isNative`, `Haptics.impact({ style: Light })` al tildar, `notification({ type: Success })` en la barra llena | Respetar el interruptor de vibración de Ajustes. Android sin motor bueno vibra feo: usar `impact`, no `vibrate(ms)`. |
| 5.3 | Compartir (doc 10) | `@capacitor/share` + `@capacitor/filesystem` | Generar la tarjeta en canvas → `Filesystem.writeFile` en `Directory.Cache` → `Share.share({ files: [uri] })` | En Android hace falta el `FileProvider` que trae la plantilla; probar WhatsApp e Instagram reales. |
| 5.4 | Deep links | `@capacitor/app` (`appUrlOpen`) | Rutas `https://gauchito.app/m/...` (mate de a dos, doc 9). Android: `intent-filter` con `android:autoVerify="true"` + `/.well-known/assetlinks.json` con el SHA-256 **de la clave de firma de Play** (no la de subida). iOS: capability Associated Domains `applinks:gauchito.app` + `/.well-known/apple-app-site-association` sin extensión, servido como JSON | Los dos archivos tienen que estar en el dominio propio, no en `github.io/guachito`. Tomar el SHA-256 de Play Console → Integridad de la app. Sin app instalada, la URL abre una página web con botones a las tiendas. |
| 5.5 | Errores (doc 27) | `@sentry/capacitor` 4.6.0 + `@sentry/react` en la versión exacta que pide (10.76.2 hoy) | `Sentry.init` en `main.tsx` con `release = versión` y `dist = versionCode`; subir source maps en CI | La versión de `@sentry/react` debe coincidir con el peer o falla el build. Limpiar nombres del estado adjunto (doc 27). |
| 5.6 | Analítica (doc 27) | `posthog-js` (web, sin plugin nativo) | `persistence: 'localStorage'`, sin autocaptura ni grabación; `distinct_id` del doc 26 | En iOS, si no hay rastreo entre apps, **no** hace falta ATT; declararlo igual en la etiqueta de privacidad (§7). Cola propia si no hay red. |

### 5.7 Cuenta y nube: Supabase (doc 26)

`@supabase/supabase-js` corre en la WebView sin plugin. Lo nativo es el inicio de sesión.

1. Anónimo: `supabase.auth.signInAnonymously()` al primer arranque.
2. Google: en Android, inicio nativo con Credential Manager (plugin comunitario, p. ej. `@capacitor-firebase/authentication` 8.6.0 o uno equivalente sin Firebase; elección sin verificar) que devuelve un `idToken`, y `supabase.auth.linkIdentity` / `signInWithIdToken`. Nunca OAuth dentro de la WebView: Google lo bloquea.
3. Apple: obligatorio en iPhone si se ofrece Google (doc 26, guía 4.8). Capability «Sign in with Apple» + `idToken` nativo.
4. `delete_account` del servidor (doc 26) + página web de borrado para Play (§6).
5. Sesión guardada en Preferences, no en `localStorage` (mismo motivo que §4).

### 5.8 Compras: RevenueCat (doc 17)

`@revenuecat/purchases-capacitor` 14.1.0 (5-nov-2026), peer `@capacitor/core >=8`: compatible con Capacitor 8 (npm, verificado hoy).

1. **Antes de codificar**: Play → perfil de pagos (cuenta de comerciante); App Store Connect → Acuerdo de apps pagas + banco + impuestos. Sin eso no hay productos.
2. Crear productos con los ids del doc 17. Play: suscripción `gauchito_premium` con planes base `anual` y `mensual` y la oferta `prueba-14d`; **Play solo deja crear productos después de subir un AAB con el permiso `BILLING`** (el SDK lo agrega). iOS: grupo «Gauchito Premium», dos productos, oferta introductoria.
3. RevenueCat: proyecto con dos apps; en Play, cuenta de servicio con acceso a la API de Play Developer y notificaciones en tiempo real (Pub/Sub); en iOS, clave In-App Purchase (.p8) y notificaciones del servidor v2. Entitlement `premium`, offering `default`.
4. Código: `Purchases.configure({ apiKey, appUserID: user_id })` con el id de Supabase; `getOfferings()` → paywall; `purchasePackage()`; `restorePurchases()` visible en Ajustes y en el paywall (Apple lo exige).
5. Sandbox. Android: cuentas en «Pruebas de licencias» de Play Console, instaladas desde la pista interna (no por USB con otra firma). iOS: probar primero con un archivo StoreKit en Xcode, después con un tester de sandbox en el iPhone. Las suscripciones de prueba se renuevan cada pocos minutos.

### 5.9 Anuncios: AdMob + UMP + ATT (doc 23, con escala)

`@capacitor-community/admob` 8.3.0, que apunta a Capacitor 8.5+ e incluye UMP y ATT ([README](https://github.com/capacitor-community/admob)). El plan lo marcaba «sin verificar»: hoy queda confirmado.

1. App ID de AdMob en `AndroidManifest.xml` (`com.google.android.gms.ads.APPLICATION_ID`) y en `Info.plist` (`GADApplicationIdentifier`), más `SKAdNetworkItems`.
2. Orden al arrancar: `requestConsentInfo()` → si hace falta, `showConsentForm()` (UMP, obligatorio en EEE y Reino Unido) → en iOS `requestTrackingAuthorization()` con `NSUserTrackingUsageDescription` en voseo → `initialize()`.
3. Solo anuncios con recompensa, elegidos por la persona (doc 23). Ids de prueba de Google en debug: un clic propio en un anuncio real puede suspender la cuenta.
4. Entra en «Seguridad de los datos» y en la etiqueta de Apple como recolección de terceros. Hasta que entre AdMob, la app no pide ATT.

### 5.10 Widgets: el único código nativo propio (doc 25)

El widget no puede leer la WebView. La app escribe tres datos en un almacén compartido y el widget los lee.

**Puente.** Un plugin local de Capacitor, `WidgetBridge`, con un solo método:

```ts
WidgetBridge.update({ lastMateDay: '2026-11-15', streak: 12, workEndsAt: 1763222400000, paused: false })
```

Se llama desde `reschedule(state)` (§5.1), así avisos y widget nunca se contradicen.

| | iOS | Android |
|---|---|---|
| Almacén compartido | App Group `group.app.gauchito.paucho` → `UserDefaults(suiteName:)` | `SharedPreferences` propias (`widget_state`) |
| Plugin | `ios/App/App/WidgetBridgePlugin.swift` escribe y llama `WidgetCenter.shared.reloadAllTimelines()` | `android/app/src/main/java/.../WidgetBridgePlugin.kt` escribe y pide `GlanceAppWidgetManager` / `updateAll` |
| Widget | Target «Widget Extension» en Xcode (SwiftUI, WidgetKit), con el mismo App Group en las dos targets | `GlanceAppWidget` (Jetpack Glance, Kotlin) + `AppWidgetProviderInfo` XML; o `AppWidgetProvider` clásico con `RemoteViews` |
| Refresco | Línea de tiempo de 48 h (doc 25) | `WorkManager` + `updatePeriodMillis` 30 min (doc 25) |
| Arte | PNG ≤ 360 px en el catálogo de la extensión | `res/drawable-nodpi` |

Trampas: el plugin local se registra a mano (`bridge.registerPluginInstance` en iOS; `registerPlugin` en `MainActivity` en Android). La extensión iOS tiene su propio bundle id (`app.gauchito.paucho.widget`) y su propio perfil: la firma automática lo resuelve si el App Group está tildado en las dos. Escribir Kotlin y Swift se puede en la nube; probarlos, no.

## 6. Android hasta Google Play

El cuello de botella es el calendario de la prueba cerrada, no el código.

| Paso | Qué hacer | Trampa |
|---|---|---|
| Ícono adaptativo | `npx @capacitor/assets generate --android` desde `resources/icon-foreground.png` (Paucho dentro del círculo seguro de 66 %) + `icon-background.png` (`#fbf3e4`); ícono monocromo para Android 13+ | Probar con máscara redonda y de gota. |
| Ícono de ficha | 512×512, PNG de 32 bits, ≤ 1 MB ([Play](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)) | — |
| Firma | **Play App Signing** (obligatorio para AAB): Google guarda la clave de la app; vos firmás con una **clave de subida**. `keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000` | Guardar `upload.jks` y su contraseña en dos lugares (gestor de contraseñas + copia cifrada fuera de la Mac). Si se pierde, se pide un reseteo a Google: días, no catástrofe. Nunca a git. |
| Versión | `versionName` = `1.0.0`; `versionCode` entero que siempre sube. Regla: `MAJOR*10000 + MINOR*100 + PATCH`, o el número de corrida de CI | Play rechaza un `versionCode` repetido, aunque el AAB anterior se haya descartado. |
| Target API | `targetSdk 36` (Android 16): obligatorio para apps nuevas y actualizaciones desde el 31-ago-2026 ([Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)). Es el valor por defecto de Capacitor 8 | Cada agosto sube uno: agendar la actualización. |
| AAB | `cd android && ./gradlew bundleRelease` → `app/build/outputs/bundle/release/app-release.aab` | Play no acepta APK para apps nuevas. |
| Prueba cerrada | ≥ 12 testers con opt-in **continuo** durante los 14 días previos al pedido de producción; la revisión suele tardar ≤ 7 días ([Play](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)) | Empezarla el día 1 con 15–20 personas (margen por bajas). Quien sale y vuelve reinicia sus 14 días. Pedir que abran la app varios días: Google pregunta por la participación. |
| Seguridad de los datos | Formulario en Contenido de la app: hoy «no se recopilan datos»; con PostHog, Sentry, Supabase y RevenueCat: identificadores, uso de la app, diagnósticos, compras; cifrado en tránsito; borrado posible | Debe coincidir con la política de privacidad y con lo que mandan los SDK. |
| Clasificación (IARC) | Cuestionario: sin violencia, sin apuestas, compras dentro de la app | — |
| Público objetivo | **Solo 18+** (regla del brief) | Un chibi puede leerse como «atractivo para chicos»: responder que no, y que la ficha muestre adultos, mate, trabajo y hábitos, no juguetes. Si Google la marca, entra en la política de Familias (sin AdMob personalizado, más revisión). |
| Declaración de apps de salud | Obligatoria para toda app, también en pistas de prueba ([Play](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en)). Marcar solo «bienestar / hábitos»; nada médico | Sin «ansiedad», «tratar» ni «curar» en ficha ni app. |
| Privacidad y borrado | URL de política + URL web de borrado de cuenta (doc 26) | Obligatoria apenas haya cuentas. |
| Ficha | Título ≤ 30 (sin verificar), descripción corta ≤ 80 ([Play](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)), larga ≤ 4.000 (sin verificar); 2 a 8 capturas por tipo, 9:16 de 1080×1920 o más; gráfico destacado 1024×500 | Capturas sin alfa. |
| Pistas | interna (hasta 100, minutos) → cerrada (el reloj) → abierta (opcional) → producción | — |
| Lanzamiento | Gradual: 5 % → 20 % → 50 % → 100 %, mirando vitals 48 h por escalón | Se puede frenar, no deshacer. |
| Pre-launch report | Corre solo en cada AAB de prueba: mirar cierres, accesibilidad y capturas | La escena del mate con toques lentos puede dar falsos «sin respuesta». |
| Android vitals | Umbrales «mal comportamiento»: cierres > 1,09 % y ANR > 0,47 % de usuarios por día (sin verificar hoy) | Pasarlos baja la visibilidad en la tienda. |

## 7. iOS hasta App Store

Todo pasa en la Mac con Xcode 26 (Apple exige SDK de iOS 26 desde el 28-abr-2026, [Apple](https://developer.apple.com/news/upcoming-requirements/)).

1. **Firma automática**: Xcode → target App → Signing & Capabilities → equipo del dueño, «Automatically manage signing». Crea certificados y perfiles solo.
2. **Capabilities**: Push Notifications no hace falta (avisos locales). Sí: App Groups (widget), Associated Domains (§5.4), Sign in with Apple (§5.7), In-App Purchase.
3. **`Info.plist`**: `CFBundleDisplayName` = «Gauchito»; `ITSAppUsesNonExemptEncryption` = `NO` (solo HTTPS); `NSUserTrackingUsageDescription` solo cuando entre AdMob; `UISupportedInterfaceOrientations` solo vertical; `UIRequiresFullScreen` = `YES` si se excluye iPad.
4. **`PrivacyInfo.xcprivacy`**: declarar las APIs de «razón requerida» que usa la app (`NSPrivacyAccessedAPICategoryUserDefaults`, motivo `CA92.1`, por Preferences) y los datos recolectados. Los SDK (Sentry, RevenueCat, AdMob) traen el suyo; Xcode los junta en el reporte de privacidad del archivo.
5. **Íconos y launch screen**: `npx @capacitor/assets generate --ios` (1024×1024 sin alfa). Launch screen = storyboard con color `#fbf3e4` y logo, igual que el splash.
6. **iPad**: solo iPhone en la v1 (sin capturas de iPad ni QA extra).
7. **TestFlight**: Product → Archive → Distribute → App Store Connect. Interno (hasta 100 del equipo) sin revisión; externo (hasta 10.000) con una revisión corta del primer build.
8. **App Store Connect**:
   - Ficha: nombre ≤ 30 y subtítulo ≤ 30 (sin verificar hoy), palabras clave ≤ 100, URL de soporte y de privacidad.
   - Capturas: obligatoria al menos una de iPhone con Dynamic Island mediano, 1179×2556 o 1206×2622; hasta 10 ([Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)). Recomiendo además 1320×2868 (grande).
   - Etiquetas de privacidad: lo mismo que «Seguridad de los datos».
   - Edad: el cuestionario nuevo (4+, 9+, 13+, 16+, 18+; [Apple](https://developer.apple.com/news/?id=ks775ehf)). Responder honesto; para quedar 18+ hay que elegir la restricción manual más alta (cómo, sin verificar).
   - Suscripciones: grupo, precios por país, textos de la oferta, captura del paywall para revisión.
   - Small Business Program: anotarse antes del primer cobro; baja la comisión a 15 % por debajo de USD 1 millón al año (plan).

**Bajar el riesgo de rechazo, en esta app**

| Regla | Riesgo | Qué sacar o agregar |
|---|---|---|
| 4.2 Funcionalidad mínima | «Es un sitio envuelto» | Agregar: avisos locales, hápticos, compartir nativo, widget, compras. Sacar: «Agregar a inicio», textos de Web Push, código de suscripción en Ajustes, `server.url`. Todo el arte adentro. |
| 2.3 Metadatos | Capturas o textos de funciones que no existen | Capturas del build real; nada de «aventuras» si no están. |
| Reseñas inventadas (5.6 / 2.3) | ★★★★★ falsas en `PlanScreens.tsx` | Sacarlas (§2, fila 17). |
| 2.1 Completitud | Menú de pruebas, «Gauchito 2 (áreas)», botones muertos | `TEST_MENU=0`, nombre final, sacar `dayOffset` y `workSkipMs` (doc 26). |
| 5.1.1(v) | Hay cuenta pero no se borra | Borrado dentro de la app (doc 26). |
| 3.1.1 | Premium desbloqueado por otra vía | Solo compra de Apple; «Restaurar compras» visible. |
| 3.1.2 | Suscripción mal explicada | Paywall con precio total, período, prueba, renovación automática y enlaces a términos (EULA de Apple) y privacidad (doc 17). |
| 1.4.1 / salud | Que parezca terapia | Nada de «ansiedad», «tratar», «curar»; el minuto de calma es un juego de respiración, no una práctica clínica. |
| 4.8 | Google sin Apple | Sign in with Apple junto a Google. |

## 8. CI/CD y actualizaciones

GitHub Actions compila Android en `ubuntu-latest` y iOS en `macos-latest`; Fastlane sube a las dos tiendas. Alternativa más simple para iOS: Xcode Cloud (25 h/mes incluidas con el programa, sin verificar) o subir a mano desde la Mac las primeras veces.

| Flujo | Dispara | Hace |
|---|---|---|
| `verify.yml` | cada push | `npx tsc -b && npm run build` y los tests |
| `android.yml` | tag `v*` | `npm ci` → `build:native` → `cap sync android` → decodifica el keystore → `bundleRelease` → `fastlane supply --track internal` |
| `ios.yml` | tag `v*`, manual | `cap sync ios` → `fastlane match` (certificados en un repo privado) → `gym` → `pilot` (TestFlight) |

Secretos: `ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `PLAY_SERVICE_ACCOUNT_JSON`; `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` (clave de API de App Store Connect), `MATCH_PASSWORD`; `SENTRY_AUTH_TOKEN`. Las claves públicas (RevenueCat, PostHog) van en `.env.native`, no son secretas.

Versionado: un solo `version` en `app/package.json`; un script escribe `versionName`/`CFBundleShortVersionString` y usa `github.run_number` como `versionCode`/`CFBundleVersion`.

**OTA de la capa web.** Plugins como `@capawesome/capacitor-live-update` (8.8.1) o `@capgo/capacitor-updater` bajan un `dist/` nuevo sin pasar por la tienda. Apple lo permite para código interpretado que no cambie el propósito de la app ni agregue funciones sin revisión ([guías](https://developer.apple.com/app-store/review/guidelines/), 2.5.2; texto no releído hoy). Google permite JavaScript en una WebView, no código nativo descargado ([política](https://support.google.com/googleplay/android-developer/answer/9888379); sin verificar hoy). Recomiendo no usar OTA al principio: el contenido remoto (doc 28) cubre textos y eventos.

## 9. Rendimiento y QA

El riesgo real es la memoria, no el peso.

- **Memoria**: una escena de 1024×1536 decodificada ocupa ~6 MB (plan). En un Android de 3–4 GB la WebView puede morir con 10–15 escenas vivas. Reglas: servir escenas a 768 px de ancho en nativo (estimación: ~3,4 MB), descargar `<img>` de pantallas ocultas, máximo 3 escenas decodificadas a la vez; medir con `chrome://inspect` → Memory.
- **WebView mínima**: `minWebViewVersion: 111` (§3); por debajo, Capacitor muestra un error. `minSdk 24` (Android 7) por defecto; recomiendo subirlo a 26 (estimación: < 2 % de teléfonos argentinos afuera, sin verificar). iOS 16.4 como mínimo (§1).
- **Binario**: ~16 MB de arte y audio (§2, fila 18) + ~8 MB de Capacitor y SDK (estimación). Meta: AAB < 40 MB.
- **Offline**: todo funciona sin red salvo nube, compras y borrado de cuenta, que dicen por qué no.
- **Matriz**: Motorola Moto G (gama baja, 3–4 GB, el más vendido en Argentina, sin verificar), Samsung Galaxy A (gama media), un Pixel con Android 16, el iPhone del dueño, un iPhone viejo con iOS 16.

**Checklist de QA de release**

- [ ] Instalar desde la pista, no por cable; primer arranque sin red.
- [ ] Onboarding completo; cerrar a la fuerza a mitad y volver.
- [ ] Datos intactos tras actualizar desde la versión anterior.
- [ ] Avisos: permiso negado, aceptado, reinicio del teléfono, cambio de hora.
- [ ] Botón y gesto atrás en cada hoja; teclado en los 4 inputs.
- [ ] Audio con modo silencio y con Spotify sonando.
- [ ] Compra, cancelación y restauración en sandbox.
- [ ] Widget: cambio de día a medianoche (doc 25).
- [ ] Sin menú de pruebas, sin textos de web, sin reseñas.
- [ ] 30 minutos de uso en el Moto G sin cierre.

## 10. Legal mínimo

Sin esto no se publica.

- **Privacidad y términos**: dos páginas en `gauchito.app`, en voseo, que nombren a cada proveedor (PostHog, Sentry, Supabase, RevenueCat, Google, Apple) y digan que lo que anotás queda en el teléfono. Argentina: Ley 25.326; el registro de bases de datos ante la AAIP, a confirmar con abogado.
- **Borrar datos**: dentro de la app y por web (doc 26).
- **Impuestos**: la tienda retiene IVA y percepciones al comprador; el dueño cobra en dólares del exterior y factura como exportación de servicios (monotributo o responsable inscripto). **Confirmar con contador**, junto con la liquidación de divisas (plan, «Sin verificar»).
- **Música y sonidos**: guardar la licencia escrita de cada pista de `public/audio`, con permiso de uso comercial en apps. Sin licencia, se reemplaza antes de subir.

## 11. Cronograma y checklists

Semanas del plan de 24, una persona con IA.

| Semana | Android | iOS |
|---|---|---|
| 1 | Cuenta Play, verificación, dominio, ids | — |
| 2–3 | §2 + §3 + §4; AAB a la pista interna | — |
| 3 | **Arranca la prueba cerrada** (15–20 testers) | — |
| 3–5 | Avisos locales, hápticos, Sentry, PostHog como actualizaciones | — |
| 5–6 | Pedido de producción; lanzamiento gradual | — |
| 7–10 | Supabase, borrado, compartir | Corte de la etapa 2 → cuenta Apple |
| 10–13 | RevenueCat + Premium (lanzamiento suave, plan) | `cap add ios`, TestFlight, compras en sandbox |
| 13–15 | Widget Android | Widget iOS, revisión App Store |
| 24+ | AdMob (con escala) | AdMob + ATT |

**Checklist Android**: cuenta verificada · id `app.gauchito.paucho` · target 36 · AAB firmado y keystore respaldado · 12+ testers × 14 días · seguridad de los datos · IARC · público 18+ · declaración de salud · privacidad y borrado web · ficha y capturas · gradual con vitals.

**Checklist iOS**: Xcode 26 · firma automática · App Groups y Associated Domains · `PrivacyInfo.xcprivacy` · íconos sin alfa · TestFlight · capturas 1206×2622 · etiquetas de privacidad · edad · suscripciones con Restaurar · Small Business Program · tabla de 4.2 cumplida.

## 12. Qué queda sin verificar

- Límites de caracteres de título y descripción larga en Play y de nombre y subtítulo en App Store.
- Si `@capacitor/local-notifications` 8.x declara `SCHEDULE_EXACT_ALARM` por defecto.
- Cómo emite Capacitor el gesto atrás predictivo de Android 16 y el nombre exacto de la variable de safe area de System Bars.
- Plugin de inicio de sesión con Google sin Firebase para Capacitor 8.
- Umbrales actuales de Android vitals; horas incluidas de Xcode Cloud.
- Texto vigente de Apple 2.5.2 y de la política de Google sobre código descargado.
- Cómo forzar 18+ en el cuestionario nuevo de Apple.
- Disponibilidad de `gauchito.app`, modelos de teléfono más usados en Argentina, AAIP e impuestos.
