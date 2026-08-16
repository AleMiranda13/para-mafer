# ✨ Para vos

Una pequeña experiencia interactiva y cinematográfica, hecha como regalo.
No es una página web común: son 12 escenas encadenadas con animaciones,
partículas, un personaje que respira y te mira, cartas, recuerdos, una
galaxia con secretos, lluvia, y un abrazo.

**Sin frameworks, sin dependencias, sin internet.** Solo HTML, CSS y
JavaScript vanilla. Se abre haciendo doble clic en `index.html`.

---

## 📑 Índice

1. [Cómo ejecutar el proyecto](#1-cómo-ejecutar-el-proyecto)
2. [Dónde poner las fotos](#2-dónde-poner-las-fotos)
3. [Dónde poner la música](#3-dónde-poner-la-música)
4. [Dónde cambiar su nombre](#4-dónde-cambiar-su-nombre)
5. [Dónde cambiar los mensajes](#5-dónde-cambiar-los-mensajes)
6. [Dónde agregar recuerdos](#6-dónde-agregar-recuerdos)
7. [Cómo cambiar el personaje](#7-cómo-cambiar-el-personaje)
8. [Cómo publicarla gratis](#8-cómo-publicarla-gratis)
9. [Las 12 escenas](#-las-12-escenas)
10. [Estructura del proyecto](#-estructura-del-proyecto)
11. [Detalles escondidos](#-detalles-escondidos)
12. [Rendimiento](#-rendimiento)

---

## 1. Cómo ejecutar el proyecto

**La forma más simple:** doble clic en `index.html`. Listo.

Todo funciona desde el archivo local: no hay build, ni `npm install`, ni
servidor. Las únicas cosas que necesitan internet son las tipografías de
Google Fonts (si no hay internet, el navegador usa una tipografía parecida
y la experiencia sigue funcionando).

**Con un servidor local** (recomendado si vas a probar audio, porque algunos
navegadores bloquean el sonido en archivos `file://`):

```bash
python -m http.server 8000
```

Y abrí `http://localhost:8000`.

### Atajo para probar escenas

Mientras editás, no hace falta recorrer todo de nuevo. Agregá al final de
la URL `#escena=` con el nombre de la escena:

```
index.html#escena=hug
```

Nombres válidos: `intro`, `character`, `sky`, `memories`, `letters`,
`galaxy`, `rain`, `warm`, `hug`, `gift`, `final`.

---

## 2. Dónde poner las fotos

Carpeta: **`assets/images/`**

Poné ahí tus fotos con estos nombres (son los que el proyecto busca por
defecto):

```
assets/images/recuerdo-1.jpg
assets/images/recuerdo-2.jpg
assets/images/recuerdo-3.jpg
assets/images/recuerdo-4.jpg
```

Mientras los archivos no existan, la página muestra un placeholder elegante
que dice exactamente qué archivo falta. **No se rompe nada.**

> 💡 Recortalas cuadradas (por ejemplo 1000×1000 px) y guardalas como `.jpg`
> de menos de 400 KB para que carguen rápido en el celular.

Si querés usar otros nombres o más fotos, mirá el
[punto 6](#6-dónde-agregar-recuerdos).

---

## 3. Dónde poner la música

Archivo: **`assets/music.mp3`**

Simplemente copiá tu canción ahí con ese nombre exacto. La música:

- nunca arranca sola (los navegadores lo bloquean y además queda feo)
- se activa con el botón **🎵 Activar música** de la primera pantalla o con
  el botón de arriba a la derecha
- entra con un *fade in* suave y sube apenas durante el abrazo
- si el archivo no existe, no pasa absolutamente nada

### Efectos de sonido (opcionales)

Carpeta: **`assets/sounds/`**

```
assets/sounds/click.mp3     → botones
assets/sounds/letter.mp3    → abrir un sobre
assets/sounds/star.mp3      → descubrir una estrella
assets/sounds/gift.mp3      → abrir la caja de regalo
assets/sounds/hug.mp3       → el abrazo
```

Cualquiera que falte, se ignora en silencio.

**Música y sonidos gratis y sin derechos de autor:**
[Pixabay Music](https://pixabay.com/music/), [Pixabay
Sound Effects](https://pixabay.com/sound-effects/), [Free Music
Archive](https://freemusicarchive.org/) (revisá siempre la licencia).
Para el clima de la página buscá algo como *"romantic piano"*,
*"emotional ambient"* o *"soft lofi"*.

### Cambiar el volumen

En `js/main.js`, dentro de `CONFIG`:

```js
audio: {
  music: "assets/music.mp3",
  musicVolume: 0.32,   // ← volumen de la música (0 a 1)
  sfxVolume: 0.35,     // ← volumen de los efectos
  ...
}
```

---

## 4. Dónde cambiar su nombre

Archivo: **`js/main.js`**, en las primeras líneas:

```js
const CONFIG = {
  herName: "Mi amor",   // ← el nombre de ella
  myName:  "Yo",        // ← tu nombre
  ...
```

`herName` aparece en la estrella de ella (escena 3) y `myName` en tu estrella
y como firma al pie de cada carta.

---

## 5. Dónde cambiar los mensajes

**Todo el texto de la experiencia está en un solo lugar:** el objeto `CONFIG`
al principio de `js/main.js`. No hace falta buscar texto por el código.

| Qué querés cambiar | Dónde |
|---|---|
| Nombres | `CONFIG.herName`, `CONFIG.myName` |
| Mensaje de la caja de regalo | `CONFIG.giftMessage` |
| Mensaje final ("Te amo") | `CONFIG.finalMessage` |
| Recuerdos / fotos | `CONFIG.memories` |
| Cartas | `CONFIG.letters` |
| Estrellas de la galaxia | `CONFIG.specialDates` |
| Premio al encontrar las 5 estrellas | `CONFIG.galaxyReward` |
| Frase del gatito escondido | `CONFIG.catMessage` |
| Textos del preloader | `CONFIG.loadingText`, `CONFIG.loadedText` |
| **Las frases de cada escena** | `CONFIG.texts` |
| Colores | `CONFIG.theme` |

### Cómo funciona `CONFIG.texts`

Cada escena tiene sus frases y el texto de su botón:

```js
warm: {
  mode: "replace",     // "replace" = cada frase reemplaza a la anterior
                       // "stack"   = las frases se van acumulando
  lines: [
    { text: "Porque si pudiera estar ahí...", delay: 1400, hold: 2600 },
    { text: "...te abrazaría.",               delay: 900,  hold: 1200 }
  ],
  button: "🫂 Acercate"
}
```

- `delay` → cuánto espera (en milisegundos) antes de que aparezca la frase
- `hold` → cuánto se queda antes de pasar a la siguiente

Podés agregar todas las frases que quieras a `lines`, o sacar las que no
te gusten. Para cambiar el ritmo de una escena, tocá `delay` y `hold`.

### Cambiar los colores

```js
theme: {
  night:  "#060a1f",   // azul noche
  night2: "#0d1240",
  violet: "#8b5cf6",
  pink:   "#ff9ecb",
  rose:   "#ffd7e8",
  white:  "#fdfbff",
  gold:   "#f5d491",   // los detalles dorados
  warm:   "#ffb27a"    // el naranja cálido del final
}
```

Se aplican a toda la página automáticamente.

---

## 6. Dónde agregar recuerdos

### Fotos (escena 4)

En `CONFIG.memories`. Agregá o sacá objetos de la lista; la página se
adapta sola:

```js
memories: [
  {
    img: "assets/images/recuerdo-1.jpg",   // ruta de la foto
    title: "Nuestro primer recuerdo",      // texto de la polaroid
    caption: "El día que todo empezó."     // texto al abrirla
  },
  // ...agregá todos los que quieras
]
```

### Cartas (escena 5)

En `CONFIG.letters`. Usá `\n` para saltos de línea:

```js
letters: [
  {
    title: "💌 Una promesa",
    text: "Primera línea.\nSegunda línea."
  }
]
```

### Estrellas de la galaxia (escena 6)

En `CONFIG.specialDates`. El contador (`0 / 5`) se ajusta solo a la
cantidad que pongas:

```js
specialDates: [
  { date: "El día que nos conocimos", title: "El principio",
    text: "Sin saberlo, ese día cambió todo." }
]
```

---

## 7. Cómo cambiar el personaje

El personaje **no es una imagen**: es un SVG dibujado dentro de
`index.html`, en el bloque `<template id="tpl-character">`. Por eso puede
respirar, parpadear, mirar el cursor, caminar y abrir los brazos.

**Opción A — cambiarle los colores (lo más fácil).**
En `index.html`, buscá `<svg id="svg-defs">` y editá los degradados:

```html
<linearGradient id="cBody">  <!-- cuerpo -->
<linearGradient id="cHead">  <!-- cabeza -->
<radialGradient id="cBlush"> <!-- cachetes -->
<linearGradient id="cScarf"> <!-- bufanda -->
```

**Opción B — usar tu propio dibujo SVG.**
Reemplazá el contenido del `<template id="tpl-character">` por tu SVG,
manteniendo estas clases (son las que el código anima):

| Clase | Para qué se usa |
|---|---|
| `.char-body-group` | respiración |
| `.char-head` | mira hacia el cursor |
| `.char-eyes` | parpadeo |
| `.char-mouth` | sonrisa |
| `.char-arm-l` / `.char-arm-r` | el abrazo |
| `.char-leg-l` / `.char-leg-r` | la caminata |
| `.char-shadow` | sombra en el piso |
| `.char-aura` | halo de luz |

**Opción C — usar un PNG.**
Guardalo en `assets/characters/` y reemplazá el `<svg>` del template por:

```html
<img class="char" src="assets/characters/personaje.png" alt="">
```

Ojo: así perdés el parpadeo, la mirada y el abrazo animado.

---

## 8. Cómo publicarla gratis

### GitHub Pages (el que ya está usando este repo)

1. Subí el proyecto a un repositorio de GitHub.
2. En el repo: **Settings → Pages**.
3. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. Guardá. En un par de minutos la página queda publicada en
   `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Cada vez que hagas `git push`, se actualiza sola.

### Netlify (sin usar la terminal, 30 segundos)

1. Entrá a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastrá la carpeta del proyecto entera a la ventana.
3. Te da un link al instante. En *Site settings* podés cambiar el nombre
   para que quede algo como `para-vos.netlify.app`.

### Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) y conectá el repo.
2. Framework: **Other**. No hay comando de build.
3. Deploy.

> 💡 **Consejo para el regalo:** mandale solo el link, sin explicar nada.
> Que lo descubra sola.

---

## 🎬 Las 12 escenas

| # | Escena | Qué pasa |
|---|---|---|
| 1 | **Intro** | Cielo nocturno, estrellas, "Preparé algo para vos..." y el botón de entrar (con onda de luz y zoom cinematográfico). |
| 2 | **El personaje** | Aparece el personaje. Respira, parpadea y te mira. Tocalo y reacciona. |
| 3 | **El cielo** | Dos estrellas (vos y ella) lejísimos, que se acercan y quedan unidas por un lazo de luz. |
| 4 | **Recuerdos** | Polaroids flotando en el espacio. Tocá una y se agranda con su texto. |
| 5 | **Cartas** | Sobres que se abren con animación y muestran la carta. |
| 6 | **Galaxia** | Galaxia interactiva con 5 estrellas escondidas. Al encontrarlas todas, se desbloquea una sorpresa. |
| 7 | **Interacciones** | No es una escena: son los detalles que están en toda la experiencia (ver más abajo). |
| 8 | **Lluvia** | Una ventana con lluvia real en canvas, gotas resbalando por el vidrio y el personaje mirando afuera. |
| 9 | **Calidez** | Todo se pone tibio: pétalos, corazones, luz naranja. |
| 10 | **El abrazo** | El momento importante: el personaje camina hacia vos desde la oscuridad, deja partículas en cada paso y abre los brazos hacia la cámara. |
| 11 | **La caja** | Una caja de regalo que se abre con luz, confeti y el mensaje personalizado. |
| 12 | **Final** | El personaje sentado mirando las estrellas y el mensaje de cierre. |

---

## 📁 Estructura del proyecto

```
/
├── index.html              ← estructura + el SVG del personaje
├── css/
│   ├── style.css           ← paleta, layout y componentes
│   ├── animations.css      ← todos los @keyframes
│   └── responsive.css      ← celular, tablet, landscape, táctil
├── js/
│   ├── main.js             ← ⭐ CONFIG (todo lo editable) + motor de animación
│   ├── audio.js            ← música y efectos (tolerante a archivos faltantes)
│   ├── particles.js        ← cielo, partículas, lluvia y galaxia (Canvas 2D)
│   ├── interactions.js     ← puntero, parallax y el personaje
│   └── scenes.js           ← el guion: qué pasa en cada escena
├── assets/
│   ├── images/             ← tus fotos
│   ├── sounds/             ← efectos de sonido
│   ├── characters/         ← si querés cambiar el personaje
│   └── music.mp3           ← tu canción (ponela vos)
└── README.md
```

### Sobre las librerías

No usa ninguna. Ni GSAP, ni Howler, ni jQuery. Las animaciones usan la
**Web Animations API** y CSS, y las partículas van en **Canvas 2D**. La
ventaja es que la página pesa poco, abre sin internet y no se rompe nunca
porque un CDN esté caído.

---

## 🔍 Detalles escondidos

- Cada click en cualquier lado suelta corazoncitos y una onda de luz.
- El mouse deja una estela luminosa.
- Las estrellas del fondo se avivan cuando pasás cerca.
- El personaje sigue el cursor con la mirada (y en el celular, el dedo).
- Si lo tocás, salta y le salen corazones.
- Hay un **gatito escondido** abajo a la izquierda de la galaxia. Tocalo.
- Las estrellas fugaces aparecen solas, cada tanto.
- El fondo tiene parallax: se mueve apenas con el mouse (y con el giroscopio
  en el celular).

---

## ⚡ Rendimiento

Está pensado para que no caliente el celular:

- un único bucle de render para todos los canvas
- todo se pausa cuando la pestaña no está visible
- la cantidad de estrellas y partículas baja sola en pantallas chicas
- las partículas usan sprites pre-renderizados en vez de dibujar formas
- respeta la opción *"reducir movimiento"* del sistema operativo

Si aun así lo notás pesado en algún celular, bajá estos números en
`CONFIG.perf` (en `js/main.js`):

```js
perf: {
  starsDesktop: 260,
  starsMobile:  130,   // ← bajalo a 80
  bokehDesktop: 14,
  bokehMobile:  8,     // ← bajalo a 4
  maxParticles: 320    // ← bajalo a 200
}
```

---

## ✅ Compatibilidad

Probado en Chrome, Edge, Firefox y Safari (incluido iOS), en escritorio y
en celular. Necesita un navegador moderno (2021 en adelante).

---

Hecho con mucho cariño. 💜
