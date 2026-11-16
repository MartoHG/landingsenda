# Landing de SENDA

Página de presentación de SENDA, el sistema de gestión académica para escuelas
secundarias de la Provincia de Buenos Aires. Es una sola página estática: una
senda en S, como la del isotipo, recorre el fondo y se pinta de verde a medida
que se baja, pasando por las secciones con capturas reales del sistema.

- **Sitio:** `sendaedu.com.ar` (por conectar) · versión publicada en https://landingsenda.pages.dev/
- **Stack:** Astro 7 y CSS plano, sin frameworks de interfaz ni base de datos.
- **Hosting:** Cloudflare Pages. Cada push a `main` publica la página.

## Requisitos

- Node.js 22 o superior (en Cloudflare se usa `24.16.0`).

## Comandos

| Comando           | Qué hace                                                      |
| ----------------- | ------------------------------------------------------------- |
| `npm ci`          | Instala las dependencias exactas del `package-lock.json`      |
| `npm run dev`     | Levanta la página en http://localhost:4321 con recarga en vivo |
| `npm run build`   | Genera el sitio final en `dist/`                              |
| `npm run preview` | Sirve `dist/` para revisar la versión final, sin la barra de desarrollo |

## Dónde está cada cosa

| Ruta                       | Qué contiene                                                       |
| -------------------------- | ------------------------------------------------------------------ |
| `src/data/secciones.ts`    | **Todos los textos** de la página, las capturas de cada tarjeta, el canal de contacto y el acceso al sistema |
| `src/pages/index.astro`    | El orden de las secciones                                          |
| `src/components/`          | Las piezas de la página: barra, portada, secciones, tarjetas, senda, cierre y pie |
| `src/scripts/senda.ts`     | Traza la senda según la posición de cada sección y la pinta con el scroll |
| `src/scripts/revelar.ts`   | Hace aparecer las tarjetas en navegadores sin animaciones atadas al scroll |
| `src/styles/tokens.css`    | Colores, tipografía, espaciado, vidrio y movimiento                |
| `src/styles/base.css`      | Los estilos de la página                                           |
| `src/assets/capturas/`     | Las capturas de SENDA                                              |
| `public/`                  | Íconos e imagen para compartir (`og.png`)                          |

## Cómo cambiar el contenido

- **Un texto:** se edita en `src/data/secciones.ts`. La página usa voseo y
  capitalización tipo oración, como SENDA.
- **El canal de contacto:** en `contacto`, dentro de `src/data/secciones.ts`,
  se completa `href` (por ejemplo, `https://wa.me/549…` o `mailto:…`) y se pasa
  `disponible` a `true`. Mientras siga en `false`, el cierre muestra el
  pendiente en naranja.
- **Una captura:** se guarda en `src/assets/capturas/` y se nombra en la tarjeta
  que corresponde. Conviene sacarla de SENDA en local con los datos de los
  seeders, a doble resolución y en proporción 16:9. Si se reemplaza una imagen,
  conviene cambiarle el nombre: Astro guarda en caché las versiones optimizadas
  según el nombre del archivo.

## Publicar

1. Revisar la versión final con `npm run build` y `npm run preview`.
2. Subir los cambios a `main`. Cloudflare Pages compila y publica solo; las
   otras ramas generan una vista previa con su propia dirección.
