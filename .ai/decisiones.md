# Decisiones · landingsenda

Lo que se decidió y por qué. Cada parte dice lo vigente: una decisión que
cambia reescribe su fila.

## Concepto

**La senda del isotipo.** La página es un recorrido sobre fondo blanco que
sigue la S del isotipo de SENDA. La senda nace fina al final de la portada,
entra desde el costado izquierdo y baja en S, ensanchándose de forma pareja,
hasta meterse en el panel de contacto del final. Una guía clara muestra el
camino completo y el verde lo recorre a medida que el visitante baja. En cada
vuelta de la senda hay una sección con su encabezado y sus tarjetas: lo que se
carga una vez en el aula, lo que SENDA arma solo, el EDTE, por qué SENDA, los
módulos y para quién es. Sale de la forma del isotipo (una montaña cruzada por
una senda en S que se abre hacia abajo) y del hecho que distingue a SENDA: se
carga una vez y el resto baja solo.

## Excepciones al catálogo de slop

Un patrón del catálogo solo se usa si el concepto lo justifica. Sin fila acá,
el patrón no va.

| Patrón del catálogo | Dónde aparece | Cómo sale del concepto |
| ------------------- | ------------- | ---------------------- |
| F4 Fondo decorativo (línea que recorre la página) | La senda que baja desde la portada hasta el contacto, detrás de las secciones | Es la S del isotipo: nace fina y se ensancha como en el logo, y su avance con el scroll muestra que lo cargado arriba baja solo |
| K4 Vidrio esmerilado | Tarjetas, tabla comparativa y barra de navegación | La senda tiene que seguir intuyéndose detrás de las tarjetas para no perder el recorrido. Sin soporte de desenfoque, la superficie es sólida |

## Registro

Temas: concepto, tipografía, paleta, espaciado, imágenes, movimiento, voz,
contenido, alcance, técnica, negocio.

| Fecha        | Tema   | Decisión   | Por qué   |
| ------------ | ------ | ---------- | --------- |
| 2026-11-15 | negocio | La marca es SENDA y la landing no menciona a Respawn | Es un producto propio del equipo; Respawn solo aporta las herramientas de trabajo |
| 2026-11-15 | tipografía | DM Sans para títulos e IBM Plex Sans para texto, alojadas en el sitio; sin Inter | Son las fuentes de SENDA: la landing y el sistema se reconocen como lo mismo |
| 2026-11-15 | voz | La de SENDA: voseo bonaerense, capitalización tipo oración, «docente», «estudiante» y «personal»; títulos con hechos, sin cifras ni adjetivos de relleno | Es como habla el sistema que las escuelas van a usar |
| 2026-11-15 | técnica | Sitio estático sin panel ni formulario | El contenido casi no cambia y lo actualiza el equipo desde el repositorio; ver ADR-P-001 |
| 2026-11-15 | imágenes | Las pantallas de SENDA son siempre capturas reales, sacadas de SENDA en local con los datos de los seeders; nunca generadas ni redibujadas | Son la prueba de que el sistema existe para un visitante que no conoce al equipo; los datos de prueba no exponen a personas reales |
| 2026-11-16 | concepto | Senda en S del isotipo sobre fondo blanco, en lugar de la montaña fotográfica con cámara | El usuario rechazó la montaña; la senda vectorial se adapta al alto de la página y pesa casi nada |
| 2026-11-16 | movimiento | La senda nace fina y se ensancha de forma pareja hasta el contacto, sin ondulaciones; sus vueltas son arcos amplios, sin codos | Así es la S del isotipo; el usuario rechazó el grosor irregular y la curva en codo |
| 2026-11-16 | movimiento | La senda se traza con la posición real de cada sección y se pinta de verde con el scroll; con menos movimiento se muestra completa y quieta | Acompaña cualquier alto de página y orienta al visitante en el recorrido |
| 2026-11-16 | paleta | Fondo blanco; verde `#1a6b3a` para la senda, el acento y la acción; verde oscuro `#1a3d2b` para títulos, contacto y pie; portada sobre verde muy suave | El usuario pidió fondo blanco con la senda verde; la portada necesitaba destacarse |
| 2026-11-16 | espaciado | Contenido de hasta 88rem de ancho; radio de 8 px en controles e imágenes y de 16 px en tarjetas | El usuario pidió una página más ancha para cargar más información |
| 2026-11-16 | estructura | Barra fija separada del contenido con borde y sombra; portada con la pantalla de ingreso real; secciones con encabezado y grillas; cierre en panel oscuro y pie con secciones y acceso | El usuario pidió secciones claras en lugar de tarjetas sueltas al costado de la senda |
| 2026-11-16 | negocio | Se nombra a la E.E.S.T. N.º 2 de Olavarría como «En implementación» | Es la primera escuela de SENDA; el usuario lo pidió y rechazó «Nació en» |
| 2026-11-17 | estilo | Botones y resaltado del nav con 12 px de radio | Es el redondeo de los botones de SENDA; lo pidió el usuario |
| 2026-11-16 | acción | La acción principal sigue siendo escribirle al equipo; se suma «Ingresar a SENDA» hacia `https://senda.pp32026.com.ar/login` para quien ya usa el sistema | El usuario pidió el acceso al login desde la portada |
| 2026-11-16 | contenido | Secciones: qué hace (carga una vez y sale solo), EDTE (modo automático y paso a paso), por qué SENDA (pilares, celular y comparación con el papel), módulos y para quién (docente, preceptor, equipo directivo y EDTE) | Cada función nombrada se verificó contra las rutas, los permisos y las pantallas de SENDA |
| 2026-11-16 | contenido | El boletín y las alertas de asistencia a las familias van como tarjetas sin captura | El equipo los confirmó, pero no están en el código de SENDA revisado; sin captura no se muestra una pantalla que no existe |
| 2026-11-16 | contenido | Nota en letra chica bajo las secciones con capturas: SENDA está en desarrollo y usa datos de prueba | Las pantallas pueden cambiar; el usuario pidió la aclaración y rechazó el recuadro por llamativo |
| 2026-11-16 | imágenes | Capturas a 2x recortadas en 16:9 al ancho del contenido; el calificador y el RITE salen de los PDF reales a 3x; tres pantallas de celular de una docente | Las capturas originales a 1x se veían borrosas y mostraban poca información |
| 2026-11-16 | imágenes | En cada fila de tarjetas las capturas arrancan y terminan a la misma altura (subgrid y proporción fija) | El usuario vio imágenes desparejas entre tarjetas vecinas |
| 2026-11-16 | material | Vidrio con blanco del 70 % al 55 %, desenfoque de 20 px y borde luminoso; se ve igual con o sin la transparencia reducida del sistema | El usuario pidió que todos lo vean igual; el contraste más bajo medido con la senda detrás del texto es 5,91:1 |
| 2026-11-16 | movimiento | Tarjetas que suben 40 px y crecen del 97 % al 100 % al entrar; encabezados escalonados (etiqueta, título que se descubre, trazo verde y bajada), todo atado al scroll | El usuario se mareó con una versión más fuerte; el título conserva una entrada larga y suave a pedido del usuario |
| 2026-11-16 | adaptación | La versión de celular se ajusta al final | El usuario la dejó para cuando el diseño de escritorio esté cerrado |
| 2026-11-16 | interacción | Desactivar selección, copia, corte, arrastre y menú contextual en la landing; sin bloquear la navegación con teclado | Pedido explícito del usuario. Disuade la copia directa; no impide capturas ni extracción de recursos públicos |
