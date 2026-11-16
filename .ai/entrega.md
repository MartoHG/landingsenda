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

- **Informe:** {ruta del informe de `review-respawn`}
- **Resultado:** {sin bloqueantes, o qué quedó}
