# Entrega · landingsenda

Datos que el cliente necesita para no depender de nadie. Sin contraseñas,
claves ni tokens: solo dónde está cada cosa y a nombre de quién.

## Dominio

- **Dominio:** `sendaedu.com.ar`
- **Registrado a nombre de:** el usuario (integrante del equipo de SENDA)
- **Dónde se registró:** NIC Argentina
- **Vence:** 2027-11-14
- **Delegado a:** `braden.ns.cloudflare.com` y `edna.ns.cloudflare.com`, desde el 2026-11-15

## Hosting

- **Proveedor y plan:** Cloudflare Pages, plan gratuito. El DNS de `sendaedu.com.ar` también está en Cloudflare, plan Free
- **Cuenta a nombre de:** el usuario, en su cuenta de Cloudflare
- **Cómo se publica:** cada push a `main` en `MartoHG/landingsenda`. Proyecto de Pages
  `landingsenda` (`landingsenda.pages.dev`), preset Astro, build `npm run build`,
  salida `dist`, variable `NODE_VERSION=24.16.0`. Creado el 2026-11-15
- **Dominio propio en Pages:** [FALTA: conectar `sendaedu.com.ar` y `www` al proyecto cuando haya un deploy aprobado]
- **Acceso de GitHub:** la app «Cloudflare Workers and Pages» tiene acceso a todos los repositorios de MartoHG (lo eligió el usuario)

## Backups

- **Qué se respalda:** no aplica: sitio estático sin base de datos ni archivos subidos; el código vive en GitHub
- **Cada cuánto:** no aplica
- **Dónde quedan:** repositorio `MartoHG/landingsenda` en GitHub
- **Última restauración probada:** no aplica

## Accesos

| Acceso             | Quién lo tiene | Cómo se entregó            |
| ------------------ | -------------- | -------------------------- |
| Repositorio GitHub | Usuario        | Cuenta propia              |
| Cloudflare (DNS y Pages) | Usuario  | Cuenta propia              |
| NIC Argentina      | Usuario        | Clave fiscal propia        |

## Manual

- **Manual del panel:** no aplica: no hay panel

## Mantenimiento

- **Contratado:** no aplica: lo hace el equipo
- **Qué cubre:** canal de contacto, funciones nuevas y, más adelante, precios

## Auditoría

- **Cómo se hizo (2026-11-17):** auditor estático y checklist de `frontend-dls`, criterios de `frontend-dls-investigacion` y Lighthouse 12.6.1 sobre la versión compilada (`astro preview`), en celular y escritorio.
- **Resultado:** sin bloqueantes. Lighthouse en celular: rendimiento 86, accesibilidad 100, buenas prácticas 82 y SEO 100; en escritorio: 99, 100, 81 y 100. Total Blocking Time 0 ms y CLS 0 en los dos.
- **Corregido en la auditoría:** el trazado de la senda bloqueaba el hilo principal (5 s de JS en celular, ahora 36 ms); el foco no se veía sobre los fondos oscuros (1,84:1, ahora 9,95:1; WCAG 1.4.11); el logo de la barra cargaba diferido estando a la vista.
- **Solo del entorno local:** «No usa HTTPS» y la falta de compresión los resuelve Cloudflare Pages; el LCP de 3,5 s en celular se debe a un script que inyecta el antivirus de la computadora de prueba (1,8 s de bloqueo), que no forma parte de la página.
- **Tensiones resueltas:** el bloqueo de copia exime al bloque de contacto, y los colores sin token quedan así porque no va a haber modo oscuro.
