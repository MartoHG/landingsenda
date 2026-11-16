# Decisiones · landingsenda

Lo que se decidió y por qué. Cada parte dice lo vigente: una decisión que
cambia reescribe su fila.

## Concepto

**Bajar la senda.** La página es la bajada por la senda de la montaña del
isotipo de SENDA. En la cumbre, el docente carga una sola vez la asistencia,
el libro de temas y las calificaciones. Bajando por la senda, cada parada
muestra lo que esa carga completa sola: calificador, RITE, intensificación y
plan de acompañamiento. Al pie de la montaña está el contacto. Sale del isotipo (una
montaña cruzada por una senda en S), del pedido del equipo de «bajar una senda
de una montaña» y del hecho que distingue a SENDA: se carga una vez y el resto
baja solo.

## Excepciones al catálogo de slop

Un patrón del catálogo solo se usa si el concepto lo justifica. Sin fila acá,
el patrón no va.

| Patrón del catálogo | Dónde aparece | Cómo sale del concepto |
| ------------------- | ------------- | ---------------------- |
| F4 Fondo decorativo (línea que recorre la página) | La senda que baja de la cumbre al pie, uniendo las paradas | Es la senda del isotipo, con su misma forma en S: muestra que lo cargado arriba baja solo. En celular pasa a una línea vertical simple |
| K4 Vidrio esmerilado | Paneles de las paradas, hitos laterales, encabezado y minimapa | Los paneles flotan sobre la montaña y la senda se tiene que seguir intuyendo detrás para no perder la bajada. En el modo quieto y sin soporte de desenfoque, el panel es sólido |

## Registro

Temas: concepto, tipografía, paleta, espaciado, imágenes, movimiento, voz,
contenido, alcance, técnica, negocio.

| Fecha        | Tema   | Decisión   | Por qué   |
| ------------ | ------ | ---------- | --------- |
| 2026-11-15 | negocio | La marca es SENDA y la landing no menciona a Respawn | Es un producto propio del equipo; Respawn solo aporta las herramientas de trabajo |
| 2026-11-15 | contenido | SENDA se presenta como producto terminado, sin escuelas usuarias, testimonios ni cifras | Ninguna escuela lo usa todavía; cada función nombrada tiene que funcionar el día del mail |
| 2026-11-15 | alcance | Sin precios, sin fecha de la presentación, sin importador de Excel, sin permisos ni inspección y sin nombrar a la E.E.S.T. N.º 2 | El precio no está definido, la landing queda publicada después de la presentación y la escuela todavía no lo usa |
| 2026-11-15 | imágenes | Capturas reales de SENDA en local con los datos de los seeders; sin fotos de banco | Es lo único que muestra el producto sin datos reales de estudiantes |
| 2026-11-15 | concepto | «Bajar la senda»: cumbre con la carga única, paradas con lo que se completa solo, pie con el contacto | Lo pidió el equipo y sale del isotipo; las paradas muestran el hecho que distingue a SENDA |
| 2026-11-15 | tipografía | DM Sans para títulos e IBM Plex Sans para texto, alojadas en el sitio; sin Inter | Son las fuentes de SENDA: la landing y el sistema se reconocen como lo mismo |
| 2026-11-15 | paleta | Fondo `#f6f7f5`, verde `#1a6b3a` para acento y acción, verde oscuro `#1a3d2b` para títulos y para el pie, verde claro `#d5f1d6` para destacar; grises teñidos de verde | Son los tokens de SENDA y el verde del isotipo; el pie oscuro marca la llegada al valle |
| 2026-11-15 | espaciado | Escala 4, 8, 12, 16, 24, 32, 48, 64, 96 px; poco aire dentro de una parada y mucho entre paradas; radio único de 8 px | Cada parada se lee como un tramo de la bajada; 8 px es el radio más usado en SENDA |
| 2026-11-15 | imágenes | Una sola montaña continua, fotográfica y natural, generada con IA (Codex), de la cumbre al valle, con una senda sin cortes; sin texto, personas ni edificios. Las pantallas de SENDA son siempre capturas reales, nunca generadas | Lo pidió el equipo: que parezca una montaña real y un único camino fluido. El paisaje es la metáfora y no simula el negocio |
| 2026-11-15 | movimiento | Cámara guiada por el scroll: baja por la montaña siguiendo la senda; en cada parada se desplaza hacia el claro, se acerca entre un 10 y un 20 % y se detiene un tramo de scroll mientras se lee el panel; después sigue bajando. Sin secuestrar el scroll ni saltar de parada en parada. Con menos movimiento o sin la animación, cada parada se ve quieta con su recorte. Se construye después de aprobar el fondo y las paradas quietas | Lo pidió el equipo; orienta dónde está el visitante en la bajada y explica que lo cargado arriba baja solo |
| 2026-11-15 | voz | La de SENDA: voseo bonaerense, capitalización tipo oración, «docente», «estudiante» y «personal»; títulos con hechos, sin cifras ni adjetivos de relleno | Es como habla el sistema que las escuelas van a usar |
| 2026-11-15 | alcance | La parada 02 es el calificador del curso; el boletín no se menciona | El boletín no está implementado en SENDA (solo hay narrativas; `PENDIENTES.md` lo marca sin implementar). Lo eligió el usuario |
| 2026-11-15 | movimiento | Travesías cortas entre paradas (0,7 a 1 pantalla de scroll) y minimapa de la senda con las seis paradas como enlaces; sin hitos de texto en las travesías por ahora | El usuario vio zonas muertas con las travesías largas; los hitos se suman solo si todavía se siente vacío |
| 2026-11-16 | imágenes | Paneles más grandes con la captura como protagonista, legible y sin miniatura | Las capturas son la prueba de que SENDA funciona; en miniatura no se leían |
| 2026-11-16 | movimiento | Entre la cumbre y la parada 02 la cámara baja en línea recta; en el resto sigue la senda | Las horquillas de la cumbre hacían zigzaguear la cámara y se veía mal a más velocidad. Lo pidió el usuario |
| 2026-11-16 | movimiento | A mitad de cada viaje la cámara se abre un 27 % respecto de las paradas que une | Se ve la senda entera y el próximo claro, en vez de una pantalla de pasto: elimina las zonas muertas |
| 2026-11-16 | movimiento | Sin chip que baje por la senda; en su lugar, dos mensajes del brief a los lados del camino durante cada viaje | El usuario vio el chip y no le gustó; los datos al costado llenan el pasto vacío de las travesías |
| 2026-11-15 | técnica | Sitio estático sin panel ni formulario | El contenido casi no cambia y lo actualiza el equipo desde el repositorio; ver ADR-P-001 |

| 2026-11-16 | material | Cristal blanco translúcido, desenfoque de 24 px, borde luminoso y radio de 28 px; controles internos conservan 8 px | Referencia explícita del usuario: contraste entre naturaleza y cristal, con el paisaje visible detrás |
| 2026-11-16 | contenido | Hitos laterales con información confirmada del brief durante las cinco travesías; sin métricas ficticias ni chip móvil | El usuario pidió aprovechar el espacio junto al camino durante toda la bajada |
| 2026-11-16 | marca | Logo SENDA grande y descripción en el cielo de la cumbre | La portada necesitaba presencia de marca, según el usuario |
| 2026-11-16 | movimiento | La pantalla final de la cámara queda dentro de la sección de contacto; se elimina el prado vacío posterior | El usuario pidió eliminar completamente las zonas muertas |

| 2026-11-16 | movimiento | Los hitos quedan anclados a coordenadas del paisaje, con posición y escala proyectadas por la cámara; nunca siguen al visitante | Corrección explícita del usuario durante la prueba: deben quedar fijos a los costados |

| 2026-11-16 | movimiento | Cámara continua incluso durante la lectura; paneles y hitos anclados al terreno y sin desaparición por progreso de scroll | El usuario rechazó avanzar el scroll sin movimiento y que los paneles se ocultaran |
| 2026-11-16 | acción | Botón compacto redondeado «Ver SENDA en mi escuela», con ancho según contenido | El usuario rechazó el bloque verde ancho de la portada |

| 2026-11-16 | marca | Logo SVG original de SENDA y descripción dentro de una placa con el mismo vidrio de las tarjetas; sin efectos sobre las letras | El usuario eligió explícitamente esta dirección después de rechazar el nombre sólido y el acabado de relieve sobre el cielo |
| 2026-11-16 | adaptación | En celular, un hito anclado entre cada par de paneles, sin scroll interno; escritorio conserva dos hitos a los lados | Evita superposiciones y mantiene la lectura en una pantalla angosta |
| 2026-11-16 | interacción | Desactivar selección, copia, corte, arrastre y menú contextual en la landing; sin bloquear la navegación con teclado | Pedido explícito del usuario. Disuade la copia directa; no impide capturas ni extracción de recursos públicos |
