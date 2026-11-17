/*
 * Contenido de la landing, de arriba hacia abajo.
 * Textos en borrador: los revisa el equipo de SENDA sección por sección.
 * Cada función nombrada se verificó contra el código de SENDA: rutas,
 * permisos por rol y pantallas reales capturadas con datos de prueba.
 */

type Lado = 'left' | 'right';

export interface Captura {
  /** Archivo en src/assets/capturas/; null mientras falte la captura real. */
  archivo: string | null;
  alt: string;
  /** Qué captura falta, visible mientras archivo sea null. */
  falta: string;
}

export interface Tarjeta {
  etiqueta: string;
  titulo: string;
  texto: string;
  captura?: Captura;
}

export interface Seccion {
  id: string;
  /** Costado por donde dobla la senda al pasar por la sección. */
  lado: Lado;
  etiqueta: string;
  titulo: string;
  texto: string;
}

export const escuela = 'E.E.S.T. N.º 2 de Olavarría';

/** Aclaración sobre las capturas: SENDA sigue en desarrollo y usa datos de prueba. */
export const avisos = {
  capturas:
    'Las capturas muestran SENDA en desarrollo, con datos de prueba. La versión final del sistema puede verse distinta.',
  edte: 'El EDTE está en desarrollo: estas pantallas no son la versión final y pueden cambiar.',
  pie: 'Las pantallas que se muestran corresponden a una versión en desarrollo, con datos de prueba.',
};

export const portada = {
  bajada: `En implementación en la ${escuela}`,
  titulo: 'Cada docente carga una sola vez. SENDA completa el resto.',
  texto:
    'Asistencia, libro de temas y calificaciones en un solo lugar. Con eso, SENDA arma el calificador, el RITE, la intensificación y el plan de acompañamiento, según el régimen académico bonaerense.',
  captura: {
    archivo: '00-ingreso.png',
    alt: 'Pantalla de ingreso a SENDA con correo electrónico y contraseña',
    falta: 'captura de la pantalla de ingreso de SENDA',
  } satisfies Captura,
  nota: 'Cada integrante del personal entra con su cuenta y ve solo lo que le corresponde.',
};

/** Acceso al sistema para quien ya usa SENDA. */
export const ingreso = {
  rotulo: 'Ingresar a SENDA',
  /** URL del login en producción; null mientras el equipo no la confirme. */
  href: 'https://senda.pp32026.com.ar/login' as string | null,
  falta: 'URL de ingreso a SENDA en producción',
};

/** Canal de contacto: pendiente del equipo (.ai/pendientes-cliente.md). */
export const contacto = {
  disponible: false,
  rotulo: 'Ver SENDA en mi escuela',
  href: '#contacto',
  falta: 'canal de contacto: WhatsApp o mail, número o casilla',
};

export const queHace = {
  seccion: {
    id: 'que-hace',
    lado: 'right',
    etiqueta: 'Qué hace SENDA',
    titulo: 'Lo que se carga en el aula se completa solo',
    texto:
      'El docente registra el día a día una sola vez. Con esa carga, SENDA arma la documentación del curso, de cada estudiante y de su trayectoria.',
  } satisfies Seccion,
  carga: [
    {
      etiqueta: 'Se carga una vez',
      titulo: 'Gestión diaria del curso',
      texto:
        'Cada docente entra a sus cursos y desde ahí completa el libro de temas, la asistencia y las calificaciones de sus materias.',
      captura: {
        archivo: '11-gestion-diaria.png',
        alt: 'Gestión diaria de SENDA con las tarjetas de los cursos del ciclo lectivo',
        falta: 'captura de la gestión diaria',
      },
    },
    {
      etiqueta: 'Se carga una vez',
      titulo: 'Asistencia en el aula',
      texto:
        'Presente, tarde o ausente, estudiante por estudiante. La asistencia de cada materia y la del curso alimentan el RITE y la trayectoria.',
      captura: {
        archivo: '01-asistencia-2x.png',
        alt: 'Planilla de asistencia de SENDA: el docente marca presente, tarde o ausente a cada estudiante',
        falta: 'captura de la asistencia',
      },
    },
  ] satisfies Tarjeta[],
  resultado: [
    {
      etiqueta: 'Se completa automáticamente',
      titulo: 'Calificador del curso',
      texto: 'SENDA calcula la calificación anual y exporta el calificador, listo para imprimir y archivar.',
      captura: {
        archivo: '02-calificador-pdf.png',
        alt: 'Calificador en PDF generado por SENDA con las notas del primer cuatrimestre de un estudiante',
        falta: 'captura del calificador',
      },
    },
    {
      etiqueta: 'Se completa automáticamente',
      titulo: 'RITE de cada estudiante',
      texto: 'Toma las notas y la asistencia del año. Se revisa en pantalla y se exporta en PDF, por estudiante o por curso.',
      captura: {
        archivo: '03-rite-pdf.png',
        alt: 'RITE en PDF generado por SENDA con las valoraciones y calificaciones de cada materia',
        falta: 'captura del RITE',
      },
    },
    {
      etiqueta: 'Se completa automáticamente',
      titulo: 'Intensificación',
      texto: 'Cada materia sin aprobar pasa a intensificación con su período, su modelo y la calificación de cada instancia.',
      captura: {
        archivo: '04-intensificacion-amplia.png',
        alt: 'Listado de intensificaciones de SENDA',
        falta: 'captura de la intensificación',
      },
    },
    {
      etiqueta: 'Se completa automáticamente',
      titulo: 'Plan de acompañamiento',
      texto: 'Si un estudiante supera el tope de materias pendientes, el EDTE recibe el caso con la trayectoria a la vista y genera el acta en PDF.',
      captura: {
        archivo: '05-plan-amplia.png',
        alt: 'Plan de acompañamiento en SENDA con las materias a recursar y el horario semanal',
        falta: 'captura del plan de acompañamiento',
      },
    },
  ] satisfies Tarjeta[],
};

export const edte = {
  seccion: {
    id: 'edte',
    lado: 'left',
    etiqueta: 'EDTE',
    titulo: 'El plan de acompañamiento, automático o paso a paso',
    texto:
      'Cuando un estudiante supera el tope de materias pendientes, el EDTE arma su plan con la trayectoria y el horario a la vista. Puede partir de una propuesta automática o decidir materia por materia.',
  } satisfies Seccion,
  modos: [
    {
      etiqueta: 'Automático',
      titulo: 'Tres propuestas listas para elegir',
      texto:
        'SENDA arma tres planes completos: equilibrado, de carga mínima y de máxima intensificación. Respetan el tope de materias, muestran las horas extra por semana y avisan los choques de horario. El equipo elige uno y lo ajusta como borrador.',
      captura: {
        archivo: '16-edte-automatico.png',
        alt: 'Opciones automáticas del plan de acompañamiento: tres propuestas con las materias a intensificar, recursar o no cursar',
        falta: 'captura de las opciones automáticas del EDTE',
      },
    },
    {
      etiqueta: 'Semiautomático',
      titulo: 'Paso a paso, materia por materia',
      texto:
        'El equipo decide qué hace con cada materia pendiente. SENDA sugiere una opción, muestra cómo queda el horario semanal y marca los choques antes de pasar a la siguiente.',
      captura: {
        archivo: '17-edte-paso-a-paso.png',
        alt: 'Asistente paso a paso del plan de acompañamiento: decisión sobre una materia con el horario semanal al costado',
        falta: 'captura del asistente paso a paso del EDTE',
      },
    },
  ] satisfies Tarjeta[],
};

export const porQue = {
  seccion: {
    id: 'por-que',
    lado: 'right',
    etiqueta: '¿Por qué SENDA?',
    titulo: 'Pensado desde el aula y la preceptoría',
    texto: 'Lo que hoy se copia de un papel a una planilla y de una planilla a otra, en SENDA se carga una vez.',
  } satisfies Seccion,
  pilares: [
    {
      etiqueta: '01',
      titulo: 'Una sola carga',
      texto: 'Lo que el docente registra en el aula llega al calificador, al RITE y a la trayectoria sin volver a escribirlo.',
    },
    {
      etiqueta: '02',
      titulo: 'Cada rol ve lo suyo',
      texto: 'Docentes, preceptores y equipo directivo acceden según su rol. La escuela puede crear roles propios, como el EDTE.',
    },
    {
      etiqueta: '03',
      titulo: 'Todo queda registrado',
      texto: 'La auditoría guarda quién cambió qué y cuándo, y lo eliminado se puede restaurar desde la papelera.',
    },
  ] satisfies Tarjeta[],
  celular: {
    etiqueta: 'Desde el celular',
    titulo: 'El aula no espera a la computadora',
    texto:
      'SENDA se adapta al celular. Docentes y preceptores pasan asistencia, completan el libro de temas y cargan notas desde el aula, sin depender de una computadora de la escuela.',
    capturas: [
      {
        archivo: '13-celular-curso.png',
        alt: 'SENDA en el celular: materias de un curso con accesos al libro de temas, las calificaciones y la asistencia',
        falta: 'captura de las materias de un curso en el celular',
      },
      {
        archivo: '14-celular-tomando-asistencia.png',
        alt: 'SENDA en el celular: un docente tomando asistencia, con estudiantes marcados presente y tarde',
        falta: 'captura de la asistencia en el celular',
      },
      {
        archivo: '15-celular-calificaciones.png',
        alt: 'SENDA en el celular: calificaciones de cada estudiante por cuatrimestre',
        falta: 'captura de las calificaciones en el celular',
      },
    ] satisfies Captura[],
  },
  filas: [
    {
      tema: 'Asistencia',
      hoy: 'Se pasa en papel y después se copia a una planilla.',
      senda: 'Se marca una vez y queda disponible para todo lo demás.',
    },
    {
      tema: 'Calificaciones',
      hoy: 'Cada docente las lleva en su propio Excel o Drive.',
      senda: 'Las notas de cada materia arman solas el calificador del curso.',
    },
    {
      tema: 'RITE',
      hoy: 'Se completa a mano, estudiante por estudiante.',
      senda: 'Toma las notas y la asistencia del año y se exporta en PDF.',
    },
    {
      tema: 'Intensificación',
      hoy: 'Se sigue en planillas aparte que hay que mantener al día.',
      senda: 'Cada materia sin aprobar pasa sola a intensificación.',
    },
    {
      tema: 'Los datos',
      hoy: 'Quedan repartidos en carpetas, cuadernos y computadoras.',
      senda: 'Quedan en una base de datos con copias de seguridad periódicas.',
    },
  ],
};

export const modulos = {
  seccion: {
    id: 'modulos',
    lado: 'left',
    etiqueta: 'Módulos',
    titulo: 'Toda la escuela conectada en un mismo recorrido',
    texto: 'Cada área trabaja sobre los mismos datos, actualizados en el momento en que alguien los carga.',
  } satisfies Seccion,
  destacado: {
    etiqueta: 'Panel de inicio',
    titulo: 'La escuela de un vistazo',
    texto:
      'Al entrar, cada cuenta ve los accesos que usa, lo que requiere atención y el avance del ciclo lectivo, con las fechas de inicio, cierre y el período en curso.',
    captura: {
      archivo: '06-panel.png',
      alt: 'Panel de inicio de SENDA con accesos rápidos, alertas y el avance del ciclo lectivo',
      falta: 'captura del panel de inicio',
    },
  } satisfies Tarjeta,
  lista: [
    {
      etiqueta: 'Estudiantes',
      titulo: 'Legajo, tutores y pases',
      texto: 'Datos personales, tutores, historial de cursos y observaciones en un perfil, con accesos a la trayectoria, el RITE y el calificador.',
      captura: {
        archivo: '08-perfil-estudiante-amplia.png',
        alt: 'Perfil de un estudiante en SENDA con sus datos personales y accesos a trayectoria, RITE y calificador',
        falta: 'captura del perfil del estudiante',
      },
    },
    {
      etiqueta: 'Cursos',
      titulo: 'Cada curso, con su gente y su horario',
      texto: 'El curso se arma a partir de su resolución. En su ficha están los estudiantes matriculados y los preceptores, y desde ahí se abren el horario y el libro de temas y se descargan el RITE y el calificador.',
      captura: {
        archivo: '12-curso-detalle.png',
        alt: 'Ficha de un curso en SENDA con los estudiantes matriculados, los preceptores a cargo y los accesos al horario y al libro de temas',
        falta: 'captura de cursos',
      },
    },
    {
      etiqueta: 'Libro matriz',
      titulo: 'Libros y folios digitales',
      texto: 'Cada estudiante queda asociado a su libro y folio. Se busca por número o por estudiante.',
      captura: {
        archivo: '10-libro-matriz-amplia.png',
        alt: 'Libro matriz de SENDA con los libros, sus folios y la búsqueda por estudiante',
        falta: 'captura del libro matriz',
      },
    },
    {
      etiqueta: 'Auditoría',
      titulo: 'Cada cambio, con nombre y fecha',
      texto: 'Se filtra por cuenta, módulo, acción y fecha, se ve el historial de cada persona y se exporta.',
      captura: {
        archivo: '09-auditoria-amplia.png',
        alt: 'Auditoría de SENDA con el registro de cambios por fecha, cuenta y módulo',
        falta: 'captura de la auditoría',
      },
    },
  ] satisfies Tarjeta[],
  horarios: {
    etiqueta: 'Horarios',
    titulo: 'Plantillas horarias para todos los turnos',
    texto:
      'Se arman una vez los módulos de cada día, con sus turnos y recreos, y se asignan a los cursos. Cuando una plantilla la usan cursos de un ciclo cerrado queda en solo lectura, para no alterar esos horarios: se duplica y se ajusta.',
    captura: {
      archivo: '18-plantilla-horaria.png',
      alt: 'Plantilla horaria de doble turno en SENDA con los módulos y recreos de cada día y los cursos asignados',
      falta: 'captura de una plantilla horaria',
    },
  } satisfies Tarjeta,
  /** Confirmados por el equipo; todavía no están en el código de SENDA, por eso van sin captura. */
  sinCaptura: [
    {
      etiqueta: 'Boletín',
      titulo: 'El boletín de cada estudiante',
      texto: 'Las calificaciones cargadas durante el año arman el boletín, listo para entregar a cada familia.',
    },
    {
      etiqueta: 'Familias',
      titulo: 'Alertas de asistencia a las familias',
      texto: 'Los tutores de cada estudiante reciben un aviso cuando se registran inasistencias.',
    },
  ] satisfies Tarjeta[],
};

export const perfiles = {
  seccion: {
    id: 'para-quien',
    lado: 'right',
    etiqueta: 'Para quién',
    titulo: 'Le sirve a cada integrante de la escuela',
    texto: 'Cada cuenta ve lo que necesita según su rol, sobre los mismos datos.',
  } satisfies Seccion,
  lista: [
    {
      etiqueta: 'Docente',
      titulo: 'Carga en el aula',
      texto:
        'Pasa asistencia, completa el libro de temas y carga las notas de sus materias. Califica las intensificaciones sin planillas aparte.',
    },
    {
      etiqueta: 'Preceptor',
      titulo: 'Sigue a sus cursos',
      texto:
        'Toma la asistencia del curso, registra pases y observaciones de estudiantes y exporta el calificador y el RITE.',
    },
    {
      etiqueta: 'Equipo directivo',
      titulo: 'Ve toda la escuela',
      texto:
        'Cursos, asistencia, calificaciones y trayectorias en un solo lugar, sin pedir planillas a nadie.',
    },
    {
      etiqueta: 'EDTE',
      titulo: 'Acompaña trayectorias',
      texto:
        'Recibe a cada estudiante con materias pendientes y decide qué intensifica y qué recursa en su plan.',
    },
  ] satisfies Tarjeta[],
};

export const cierre = {
  id: 'contacto',
  etiqueta: `En implementación en la ${escuela}`,
  titulo: 'Veamos SENDA funcionando en tu escuela',
  texto:
    'SENDA se construye junto a una escuela técnica real, con sus docentes y preceptores. Coordinamos una demostración con los datos de tu escuela y te contamos cómo es la puesta en marcha.',
  incluye: {
    titulo: 'La puesta en marcha incluye',
    lista: [
      'Capacitación para todo el personal',
      'Soporte continuo durante el ciclo lectivo',
      'Copias de seguridad periódicas de los datos',
      'Acceso desde la computadora y el celular',
    ],
  },
};

export const pie = {
  descripcion: 'Gestión académica para escuelas secundarias de la Provincia de Buenos Aires.',
  lugar: 'Olavarría, Provincia de Buenos Aires',
  secciones: [
    { href: '#que-hace', rotulo: 'Qué hace' },
    { href: '#edte', rotulo: 'EDTE' },
    { href: '#por-que', rotulo: '¿Por qué SENDA?' },
    { href: '#modulos', rotulo: 'Módulos' },
    { href: '#para-quien', rotulo: 'Para quién' },
    { href: '#contacto', rotulo: 'Contacto' },
  ],
};
