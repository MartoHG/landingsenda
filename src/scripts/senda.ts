/*
 * Traza la senda en S y la hace avanzar con el scroll.
 *
 * El eje nace debajo de la portada desde el costado izquierdo y dobla a la
 * altura del encabezado de cada sección, por el costado que la sección
 * indica, hasta llegar al contacto. Sobre ese eje se arma una cinta que
 * nace fina y se ensancha, como la S del isotipo.
 * La parte verde llega hasta una línea fija de la pantalla; con menos
 * movimiento la senda se muestra completa y quieta.
 */

const recorrido = document.querySelector<HTMLElement>('[data-recorrido]');
const svg = document.querySelector<SVGSVGElement>('[data-senda]');
const guia = document.querySelector<SVGPathElement>('[data-senda-guia]');
const avance = document.querySelector<SVGPathElement>('[data-senda-avance]');
const recorte = document.querySelector<SVGRectElement>('[data-senda-recorte]');

/** Altura de la pantalla, en proporción, hasta la que llega la senda verde. */
const ALTURA_PUNTA = 0.62;
/** Distancia en píxeles entre muestras del eje al armar la cinta. */
const PASO = 6;
/** Ancho en píxeles con el que nace la senda. */
const ANCHO_INICIAL = 8;

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

let pendiente = false;

interface Punto {
  x: number;
  y: number;
}

/** Curva de Bézier cúbica: inicio, dos puntos de control y final. */
type Tramo = [Punto, Punto, Punto, Punto];

/**
 * Posición de un elemento dentro del recorrido. Se mide con offsetTop y no
 * con getBoundingClientRect para no tomar los desplazamientos de las
 * animaciones de entrada.
 */
function posicion(elemento: HTMLElement, contenedor: HTMLElement): { x: number; y: number; ancho: number; alto: number } {
  let x = 0;
  let y = 0;
  let actual: HTMLElement | null = elemento;
  while (actual && actual !== contenedor) {
    x += actual.offsetLeft;
    y += actual.offsetTop;
    actual = actual.offsetParent as HTMLElement | null;
  }
  return { x, y, ancho: elemento.offsetWidth, alto: elemento.offsetHeight };
}

/** Proporción del ancho por donde pasa la vuelta de la senda en cada costado. */
const COSTADO = { left: 0.1, right: 0.9 } as const;
const COSTADO_CELULAR = { left: -0.01, right: 1.01 } as const;

function puntosDelCamino(contenedor: HTMLElement): Punto[] {
  const ancho = contenedor.clientWidth;
  const hero = contenedor.querySelector<HTMLElement>('[data-hero]');
  const paradas = [...contenedor.querySelectorAll<HTMLElement>('[data-parada]')];

  // Entra desde afuera de la pantalla, en el último tramo de la portada.
  const inicioY = hero ? hero.offsetTop + hero.offsetHeight * 0.82 : 0;
  const puntos: Punto[] = [{ x: -ancho * 0.08, y: inicioY }];

  paradas.forEach((parada) => {
    // La sección del final no dobla: la senda va directo al panel.
    if (parada.querySelector('[data-senda-fin]')) return;
    const ancla = parada.querySelector<HTMLElement>('[data-parada-ancla]') ?? parada;
    const caja = posicion(ancla, contenedor);
    const lado = parada.dataset.lado === 'left' ? 'left' : 'right';
    // En el celular el encabezado ocupa todo el ancho: la vuelta va contra el
    // borde de la pantalla para no pasar por detrás del texto.
    const costado = ancho < 768 ? COSTADO_CELULAR : COSTADO;
    puntos.push({ x: ancho * costado[lado], y: caja.y + caja.alto / 2 });
  });

  // La senda termina entrando en vertical por el borde superior del panel de
  // contacto, del lado contrario a la última vuelta.
  const fin = contenedor.querySelector<HTMLElement>('[data-senda-fin]');
  if (fin) {
    const caja = posicion(fin, contenedor);
    const ultima = puntos[puntos.length - 1];
    const proporcion = ultima.x < ancho / 2 ? 0.78 : 0.22;
    puntos.push({ x: caja.x + caja.ancho * proporcion, y: caja.y + 48 });
  }

  return puntos;
}

/**
 * Une los puntos en S: cada vuelta sale y llega en vertical, como las del
 * isotipo. El primer tramo entra de costado, casi horizontal.
 */
function tramosDelEje(puntos: Punto[]): Tramo[] {
  const [inicio, ...resto] = puntos;
  let previo = inicio;
  return resto.map((punto, i) => {
    const caida = punto.y - previo.y;
    const avance = Math.abs(punto.x - previo.x);
    // En los tramos más anchos que altos, tiradores largos: la vuelta se
    // abre en un arco amplio en lugar de doblar en codo.
    const tirador = caida < avance ? 0.85 : 0.5;
    const tramo: Tramo = [
      previo,
      i === 0
        ? { x: previo.x + (punto.x - previo.x) * 0.4, y: previo.y }
        : { x: previo.x, y: previo.y + caida * tirador },
      { x: punto.x, y: punto.y - caida * tirador },
      punto,
    ];
    previo = punto;
    return tramo;
  });
}

/** Punto de una curva de Bézier cúbica en t (0 a 1). */
function puntoEn([a, b, c, d]: Tramo, t: number): Punto {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

/** Dirección de la curva en t: la derivada de la Bézier. */
function direccionEn([a, b, c, d]: Tramo, t: number): Punto {
  const u = 1 - t;
  return {
    x: 3 * u * u * (b.x - a.x) + 6 * u * t * (c.x - b.x) + 3 * t * t * (d.x - c.x),
    y: 3 * u * u * (b.y - a.y) + 6 * u * t * (c.y - b.y) + 3 * t * t * (d.y - c.y),
  };
}

/** Largo aproximado de un tramo, sumando cuerdas cortas. */
function largoDe(tramo: Tramo): number {
  let largo = 0;
  let previo = tramo[0];
  for (let i = 1; i <= 24; i++) {
    const punto = puntoEn(tramo, i / 24);
    largo += Math.hypot(punto.x - previo.x, punto.y - previo.y);
    previo = punto;
  }
  return largo;
}

/**
 * Ancho de la senda a una distancia dada del inicio. Como la S del isotipo,
 * nace fina y se ensancha de forma pareja hasta el final.
 */
function anchoEn(distancia: number, largoTotal: number, maximo: number): number {
  const avance = distancia / largoTotal;
  return ANCHO_INICIAL + (maximo - ANCHO_INICIAL) * Math.pow(avance, 0.8);
}

/**
 * Arma la cinta: un borde de ida y el otro de vuelta, separados del eje por el
 * ancho. Los puntos y la dirección salen de la fórmula de cada tramo, sin
 * consultar al navegador, para no bloquear el hilo principal en el celular.
 */
function trazadoDeLaCinta(tramos: Tramo[], maximo: number): string {
  const largos = tramos.map(largoDe);
  const largoTotal = largos.reduce((suma, largo) => suma + largo, 0);
  const ida: string[] = [];
  const vuelta: string[] = [];
  let recorrido = 0;

  tramos.forEach((tramo, n) => {
    const pasos = Math.max(2, Math.ceil(largos[n] / PASO));
    for (let i = n === 0 ? 0 : 1; i <= pasos; i++) {
      const t = i / pasos;
      const punto = puntoEn(tramo, t);
      const direccion = direccionEn(tramo, t);
      const largo = Math.hypot(direccion.x, direccion.y) || 1;
      const mitad = anchoEn(recorrido + largos[n] * t, largoTotal, maximo) / 2;
      const nx = (-direccion.y / largo) * mitad;
      const ny = (direccion.x / largo) * mitad;
      ida.push(`${(punto.x + nx).toFixed(1)} ${(punto.y + ny).toFixed(1)}`);
      vuelta.push(`${(punto.x - nx).toFixed(1)} ${(punto.y - ny).toFixed(1)}`);
    }
    recorrido += largos[n];
  });

  return `M ${ida.join(' L ')} L ${vuelta.reverse().join(' L ')} Z`;
}

function medir(): void {
  if (!recorrido || !svg || !guia || !avance || !recorte) return;

  const ancho = recorrido.clientWidth;
  const alto = recorrido.scrollHeight;
  svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  recorte.setAttribute('width', `${ancho}`);

  // En el celular la senda es más angosta para no tapar el contenido.
  const maximo = ancho < 768 ? 36 : Math.min(140, Math.max(70, ancho * 0.085));
  const cinta = trazadoDeLaCinta(tramosDelEje(puntosDelCamino(recorrido)), maximo);
  guia.setAttribute('d', cinta);
  avance.setAttribute('d', cinta);

  pintar();
}

function pintar(): void {
  pendiente = false;
  if (!recorrido || !recorte) return;

  const alto = sinMovimiento.matches
    ? recorrido.scrollHeight
    : window.innerHeight * ALTURA_PUNTA - recorrido.getBoundingClientRect().top;
  recorte.setAttribute('height', `${Math.max(0, alto)}`);
}

function pedirPintura(): void {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(pintar);
}

if (recorrido && svg) {
  let medida = '';
  // Las capturas y las fuentes cambian el alto al cargar: se vuelve a trazar,
  // pero solo si el tamaño cambió de verdad, para no entrar en un bucle.
  new ResizeObserver(() => {
    const actual = `${recorrido.clientWidth}x${recorrido.scrollHeight}`;
    if (actual === medida) return;
    medida = actual;
    medir();
  }).observe(recorrido);
  window.addEventListener('scroll', pedirPintura, { passive: true });
  sinMovimiento.addEventListener('change', pintar);
}
