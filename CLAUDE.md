# Proyecto Respawn · landingsenda

Skills de la casa: versión sin publicar

Landing de una sola página para presentar y vender SENDA, un sistema de
gestión académica para escuelas secundarias, a las escuelas de Olavarría que
reciben la invitación a su presentación pública.

## Proyecto

- **Cliente:** equipo de SENDA, producto propio; Olavarría, Provincia de
  Buenos Aires. La marca es SENDA: nada de Respawn en la landing.
- **Paquete:** no aplica; es una landing page de una sola página
- **Stack:** Astro y CSS plano, en Cloudflare Pages, registrado en
  `.ai/adrs/ADR-P-001-stack.md`
- **Acción objetivo:** escribirle al equipo para ver SENDA en su escuela
  (canal pendiente)
- **Concepto:** la senda en S del isotipo recorre el fondo blanco y se pinta
  con el scroll, pasando por secciones con capturas reales; el detalle está en
  `.ai/decisiones.md`

## Skills que aplican

| Skill              | Cuándo                                                          |
| ------------------ | --------------------------------------------------------------- |
| `respawn-proyecto` | Registrar o consultar decisiones, deuda, pendientes y estado    |
| `respawn-kickoff`  | Relevar al cliente, encuadrar el paquete y fijar el alcance     |
| `respawn-design`   | Diseñar o criticar pantallas y escribir textos                  |
| `respawn-web`      | Accesibilidad, rendimiento, SEO y links de contacto             |
| `review-respawn`   | Auditar antes de entregar (todavía no existe en la casa)        |

Las skills de `.claude/skills/` son una copia de la casa: no se editan acá.

## Memoria del proyecto

| Archivo                      | Qué guarda                                              |
| ---------------------------- | ------------------------------------------------------- |
| `.ai/brief.md`               | Cliente, visitante, acción objetivo, material y alcance |
| `.ai/decisiones.md`          | Concepto, excepciones al catálogo de slop y decisiones  |
| `.ai/estado.md`              | Etapa, próximo paso y bloqueos                          |
| `.ai/entrega.md`             | Dominio, hosting, backups, accesos y manual             |
| `.ai/adrs/`                  | Decisiones difíciles de revertir                        |
| `.ai/deuda-tecnica.md`       | Desvíos a corregir, si los hay                          |
| `.ai/riesgos-aceptados.md`   | Desvíos conservados a propósito, si los hay             |
| `.ai/problemas-conocidos.md` | Trampas del entorno, si las hay                         |
| `.ai/pendientes-cliente.md`  | Lo que falta que el cliente entregue, si hay algo       |

## Cómo trabajar

- Al empezar una sesión, leer `.ai/estado.md` e informar etapa, próximo paso
  y bloqueos.
- Antes de implementar, acordar el diseño con el usuario.
- Ante un pedido nuevo del cliente, comprobar con `respawn-kickoff` si entra
  en el alcance del brief antes de hacerlo.
- Pantalla por pantalla: terminar una, mostrarla y esperar la revisión antes
  de seguir.
- Nunca inventar precios, reseñas, cifras, clientes ni testimonios. Lo que
  falta queda como `[FALTA: …]`.
- Sin commit ni subida de cambios sin pedido del usuario.
- El trabajo que se delega va a Codex con `codex-dispatch`, no a subagentes
  de Claude. Si Codex no responde, preguntar antes de usar otro.
- Las capturas de pantalla salen de SENDA levantado en local
  (`/home/marto/proyectos/senda`) con los datos de los seeders. Ese
  repositorio no se modifica.
- Al terminar el proyecto se borran `.ai/`, `.claude/skills/` y este
  `CLAUDE.md`: la landing no lleva nada de Respawn.

## Comandos

- Instalar: `npm ci`
- Levantar en local: `npm run dev` (http://localhost:4321)
- Compilar: `npm run build`
- Revisar la versión final: `npm run preview`
- Publicar: push a `main`; Cloudflare Pages compila y publica solo
