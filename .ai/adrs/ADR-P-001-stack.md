# ADR-P-001: Stack del proyecto

## Contexto

La landing presenta SENDA a escuelas secundarias que llegan desde un mail. Es
una sola página, sin panel, sin base de datos y sin cobro: el contenido casi
no cambia y lo actualiza el propio equipo desde el repositorio. El contacto es
por WhatsApp o mail, sin formulario. Tiene que estar en línea el 2026-11-16, a
más tardar el 2026-11-17, y publicarse en `sendaedu.com.ar`.

## Alternativas evaluadas

| Opción                          | Por qué se descartó |
| ------------------------------- | ------------------- |
| Laravel, Blade, Tailwind y HTMX | Es el stack para proyectos con backend; acá no hay panel, base de datos ni cobro, y suma servidor que mantener |
| Ruta pública dentro de SENDA    | Ata la landing al deploy y a los tiempos del sistema, que todavía tiene trabajo pendiente |
| Astro y CSS plano, en Cloudflare Pages | — (es la decisión) |

## Decisión

**Hacer la landing como sitio estático con Astro y CSS plano, publicado en
Cloudflare Pages desde el repositorio `MartoHG/landingsenda`.**

Sigue el estándar de la casa para proyectos sin backend. El hosting lo eligió
el usuario el 2026-11-15.

## Consecuencias

- **Ganamos:** hosting gratis, publicación automática con cada push a `main`,
  sitio rápido y nada que mantener en un servidor.
- **Perdemos:** no hay formulario que guarde o envíe datos; un cambio de
  contenido necesita a alguien que edite el repositorio.
- **Revisar si:** el equipo quiere un formulario de contacto propio, editar
  contenido sin programar o mostrar precios que cambian seguido.
