/*
 * Contenido de las paradas de la senda, de la cumbre al valle.
 * El id coincide con el claro de src/data/claros.json.
 * Textos en borrador: los revisa el equipo de SENDA parada por parada.
 */

export type Lado = 'left' | 'right' | 'center' | 'bottom';

export interface Captura {
  /** Archivo en src/assets/capturas/; null mientras falte la captura real. */
  archivo: string | null;
  alt: string;
  /** Qué captura falta, visible mientras archivo sea null. */
  falta: string;
}

export interface Parada {
  id: '01' | '02' | '03' | '04' | '05' | '06';
  lado: Lado;
  titulo: string;
  parrafos: string[];
  captura?: Captura;
}

export const paradas: Parada[] = [
  {
    id: '01',
    lado: 'right',
    titulo: 'Cada docente carga una sola vez. SENDA completa el resto.',
    parrafos: [
      'Sistema de gestión académica para escuelas secundarias de la Provincia de Buenos Aires. La asistencia, el libro de temas y las calificaciones se cargan en el aula, y con eso se arman el RITE, la intensificación y el plan de acompañamiento.',
    ],
    captura: {
      archivo: '01-asistencia.png',
      alt: 'Planilla de asistencia de SENDA: el docente marca presente, tarde o ausente a cada estudiante',
      falta: 'captura de la gestión diaria del docente',
    },
  },
  {
    id: '02',
    lado: 'left',
    titulo: 'El calificador de cada curso sale listo para imprimir',
    parrafos: [
      'Con las notas que cada docente cargó durante el año, SENDA calcula la calificación anual y exporta el calificador del curso, listo para imprimir y archivar.',
    ],
    captura: {
      archivo: '02-calificador.png',
      alt: 'Calificador exportado por SENDA con las notas del primer cuatrimestre de un estudiante',
      falta: 'captura del calificador de un curso',
    },
  },
  {
    id: '03',
    lado: 'right',
    titulo: 'El RITE se completa con lo que ya se cargó',
    parrafos: [
      'El RITE de cada estudiante toma las notas y la asistencia del año. Se revisa en pantalla y se exporta en PDF, por estudiante o por curso completo.',
    ],
    captura: {
      archivo: '03-rite.png',
      alt: 'RITE exportado por SENDA con las calificaciones de un estudiante',
      falta: 'captura de la vista previa del RITE',
    },
  },
  {
    id: '04',
    lado: 'left',
    titulo: 'Las materias para intensificar ya están anotadas',
    parrafos: [
      'Cuando una materia queda sin aprobar, pasa a intensificación con su período. Cada docente carga ahí la asistencia y la calificación de cada instancia, sin planillas aparte.',
    ],
    captura: {
      archivo: '04-intensificacion.png',
      alt: 'Listado de intensificaciones de SENDA',
      falta: 'captura del listado de intensificación',
    },
  },
  {
    id: '05',
    lado: 'right',
    titulo: 'El EDTE recibe cada caso con la trayectoria a la vista',
    parrafos: [
      'Si un estudiante supera el tope de materias pendientes, SENDA lo deriva al EDTE. El equipo arma el plan de acompañamiento, decide qué materias intensifica y cuáles recursa, y genera el acta en PDF.',
    ],
    captura: {
      archivo: '05-plan.png',
      alt: 'Plan de acompañamiento de un estudiante en SENDA',
      falta: 'captura del plan de acompañamiento',
    },
  },
  {
    id: '06',
    lado: 'bottom',
    titulo: 'Veamos SENDA funcionando en tu escuela',
    parrafos: [
      'Acompañamos la puesta en marcha con capacitación para el personal y soporte continuo. Los datos quedan en una base de datos con copias de seguridad periódicas.',
    ],
  },
];

/** Canal de contacto: pendiente del equipo (.ai/pendientes-cliente.md). */
export const contacto = {
  disponible: false,
  rotulo: 'Escribinos para verlo en tu escuela',
  href: '#parada-06',
  falta: 'canal de contacto: WhatsApp o mail, número o casilla',
};
