# Brief · landingsenda

Relevado con el usuario el 2026-11-15. Lo que no se dijo queda como
`[FALTA: …]` y como pendiente.

## El negocio

- **Qué es:** SENDA, un sistema de gestión académica para escuelas
  secundarias. El docente carga una sola vez la asistencia, el libro de temas
  y las calificaciones, y con eso se completa solo todo lo demás: RITE,
  calificador, intensificación o recursado y plan de acompañamiento. El
  boletín no está implementado al 2026-11-15 y no va en la landing. Cubre la
  mayor parte de las tareas administrativas de un docente. *(Usuario; código
  en `/home/marto/proyectos/senda`.)*
- **Dónde:** Olavarría, Provincia de Buenos Aires. Sigue el régimen académico
  bonaerense (Res. N.° 1650/24). Apunta a cualquier escuela secundaria desde
  el principio.
- **Qué lo distingue:** hace solo, o increíblemente rápido, lo que hoy las
  escuelas no hacen por tedioso o complicado: se carga una vez y el resto sale
  solo. Lo más complicado del EDTE lo resuelve automáticamente (ese módulo
  está en proceso).
- **Cómo consigue clientes hoy:** todavía ninguna escuela lo usa. El equipo
  manda un mail a todas las escuelas secundarias de Olavarría con la
  invitación a la presentación pública y el link a esta landing. También
  invita a inspectores.
- **Qué no hace:** no es para primarias ni terciarios, no cobra cuotas, no
  gestiona sueldos ni licencias del personal y las familias no entran al
  sistema. Las notificaciones son internas, para el personal.
- **Marca:** SENDA. La landing no lleva marca, links ni textos de Respawn.

## El visitante

- **Quién entra a la web:** personal directivo o de secretaría de escuelas
  secundarias de Olavarría, e inspectores, que llegan desde el link del mail y
  no conocen al equipo. Quién decide la adopción en cada escuela:
  [FALTA: se averigua en la presentación]. Dispositivo sin confirmar: se
  diseña para celular y computadora.
- **Qué quiere saber:**
  - Si le sirve a su escuela: sí, a cualquier secundaria.
  - Qué cambia frente a lo que usa hoy: papel y lápiz, o Excel y Drive.
  - Dónde quedan los datos: en una base de datos con copias de seguridad
    periódicas.
  - Si los docentes van a poder usarlo: es de uso sencillo y el equipo da
    soporte y capacitación continua.
- **Qué lo frena:** que sea un sistema nuevo de un equipo que no conoce, el
  miedo a que el personal no se adapte y no ver el precio. El precio todavía
  no está definido y no va en la landing; los permisos no hacen falta y
  tampoco van.

## La acción objetivo

- **Qué tiene que hacer el visitante:** escribirle al equipo para ver SENDA en
  su escuela. Es la única acción principal. La landing no lleva la fecha de la
  presentación porque queda publicada después; los datos de la presentación
  van en el mail.
- **Canal:** [FALTA: canal de contacto: WhatsApp o mail, número o casilla y
  quién responde. Lo define el equipo.]

## Material real

| Material             | Hay | Detalle                                 |
| -------------------- | --- | --------------------------------------- |
| Logo                 | Sí  | `logo.svg`, `isotipo.svg`, favicons e imagen Open Graph en `senda/public/images/brand/`. Verde de marca `#1a6b3a` |
| Fotos propias        | No  | Se usan capturas reales de SENDA levantado en local con los datos de los seeders. Las saca el agente en la etapa de diseño. Sin fotos de banco |
| Textos               | No  | Los escribe el agente con este relevamiento y el equipo los revisa sección por sección. Tono de SENDA: voseo, capitalización tipo oración, «estudiante» y «personal», nunca «alumno» ni «usuario» |
| Productos o servicios | Sí | Asistencia, libro de temas y calificaciones; a partir de ellos, RITE, boletín, intensificación o recursado y plan de acompañamiento. Sin precios |
| Redes y reseñas reales | No | Ninguna escuela lo usa todavía. No se nombra a la E.E.S.T. N.º 2 ni hay testimonios |

Lo que falta se anota en `.ai/pendientes-cliente.md`.

## Quién actualiza el contenido

El equipo de SENDA, desde el repositorio. Sin panel: es un sitio estático.

| Qué cambia                | Quién lo cambia | Cada cuánto        | Desde dónde             |
| ------------------------- | --------------- | ------------------ | ----------------------- |
| Canal de contacto, funciones nuevas y, más adelante, precios | Equipo de desarrollo | Ocasional | Computadora, desde el repositorio |

## Paquete y alcance

- **Paquete:** no aplica. Es un producto propio del equipo y Respawn no
  participa: sus skills se usan como herramienta y se borran al terminar. Tipo
  de trabajo: landing page de una sola página.
- **Incluye:** una sola página, adaptada al celular, con: qué es SENDA, qué
  hace solo a partir de la carga del docente, para qué escuelas es, cómo
  cambia el trabajo frente al papel y las planillas, dónde quedan los datos,
  soporte y capacitación, y contacto. Capturas reales del sistema.
- **No incluye:** precios, fecha de la presentación, importador de Excel,
  permisos o inspección, el nombre de la E.E.S.T. N.º 2, testimonios o cifras,
  formulario que guarde o envíe datos, panel y cualquier mención a Respawn.
- **Dominio y hosting:** dominio `sendaedu.com.ar`, a nombre del usuario,
  delegado a Cloudflare el 2026-11-15. Hosting: Cloudflare Pages, en la cuenta
  de Cloudflare del usuario.
- **Mantenimiento:** lo hace el equipo.
- **Rondas de cambios:** no aplica; el equipo revisa sección por sección.
- **Obligaciones:** ninguna. No cobra en línea, no junta datos de personas y no
  tiene suscripciones.

## Plazos

- **Entrega acordada:** en línea el lunes 2026-11-16, a más tardar el martes
  2026-11-17, que es cuando salen los mails. Presentación pública: jueves
  2026-11-26.
- **Depende de:** el canal de contacto (equipo) y la revisión de los textos
  (equipo).

## Estimación

No aplica: no es un sistema a medida.
