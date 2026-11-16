# Estado · landingsenda

Este archivo se reescribe entero al cerrar cada sesión.

- **Etapa:** Diseño
- **Próximo paso:** proponer el concepto de la landing con `respawn-design` y
  sacar las capturas de SENDA en local.

## Bloqueos

- Canal de contacto sin definir: lo define el equipo. Sin él la landing no se
  publica.
- `sendaedu.com.ar` delegado a Cloudflare el 2026-11-15, pero la zona `com.ar`
  todavía no lo publica: comprobar antes de conectar Pages. Si no llega, se
  publica con la dirección de Cloudflare Pages.
- Plazo: en línea el 2026-11-16, a más tardar el 2026-11-17.

## Última sesión

2026-11-15: inicialización con `respawn-init`, repositorio conectado a
`MartoHG/landingsenda` y kickoff completo: brief, ADR-P-001 (Astro y CSS
plano en Cloudflare Pages), `CLAUDE.md` y pendientes. Dominio agregado a
Cloudflare (Free) y delegado en NIC Argentina.

## Para la casa

- El kickoff da por hecho un cliente de Respawn con paquete; un producto
  propio sin paquete ni alcance para el cliente no está previsto ·
  `respawn-kickoff` · sumar el caso «proyecto propio» al encuadre.
- `review-respawn` figura en la plantilla del `CLAUDE.md` y en el kickoff,
  pero no existe en la casa · `respawn-proyecto` · crearla o quitarla de la
  plantilla.
