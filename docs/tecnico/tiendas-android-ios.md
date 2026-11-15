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

<!-- CONTINÚA: secciones 5–12 -->
