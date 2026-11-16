import datosMontana from '../data/montana.json';

// El glob admite una senda ausente; en ese caso une los focos de los claros.
const archivosSenda = import.meta.glob('../data/senda.json', { eager: true, import: 'default' });

// Anchos de tira respecto de la ventana; las coordenadas siguen siendo 1536×8450.
const AJUSTES = {
  anchoEscritorio: 2.4,
  anchoMovil: 3.3,
  zoomCumbre: 1.14,
  paradaEscritorioMin: 1.4,
  paradaEscritorioMax: 2.2,
  paradaMovilMin: 2.2,
  paradaMovilMax: 3.3,
  ocupacionEncuentro: 0.7, // Senda → extremo del área del panel, con terreno alrededor.
  porcionClaroMovil: 0.45,
  pesoSendaMovil: 0.7,
  lugarEncuentroEscritorio: 0.28,
  altoPanelEscritorio: 0.84,
  altoPanelMovil: 0.72,
  margenSeguro: 16,
  arroyoValle: { x: 1430, y: 8150 }, // Referencia visible en la tira v3.
  respiracion: 0.27, // A mitad del viaje, 0.73× el zoom de las paradas que une.
  tramosRectos: ['02'], // Viajes que llegan a estas paradas van en línea recta: evitan las horquillas.
  pausa: 1.2, // Pantallas de lectura, además del viaje de cada sección.
  viajeBase: 0.85,
  viajeMinimo: 0.7,
  viajeMaximo: 1,
  fundido: 0.15,
  enlaceConSenda: 0.3,
  suavizadoSenda: 1, // Un vecino a cada lado: conserva las horquillas de la cumbre.
  bordeCumbre: 200, // Apertura con cielo y cumbre, en coordenadas de la tira.
};

type Punto = { x: number; y: number };
type Pose = Punto & { zoom: number };
type Claro = (typeof datosMontana.claros)[number];
type Parada = {
  seccion: HTMLElement; panel: HTMLElement; anclaje: HTMLElement; claro: Claro;
  inicio: number; llegada: number; fin: number; viaje: number; pausa: number;
  entrada: number; salida: number; pose: Pose; enfoque: number; encuentro: Punto; panelPunto: Punto; panelReferencia: number; panelAncho: number; panelAlto: number;
  hitos: { elemento: HTMLElement; ancho: number; alto: number; punto: Punto; referencia: number }[];
};
type Vista = { ancho: number; alto: number; anchoTira: number; altoTira: number; movil: boolean; margen: number };
type Marcador = { digitos: HTMLElement[]; valor: number };
type Minimapa = {
  nav: HTMLElement; marca: HTMLElement; enlaces: HTMLAnchorElement[];
  creado: boolean; oculto: boolean; contenido: Node[];
  ancho: number; alto: number; minX: number; maxX: number; minY: number; maxY: number;
  activo: number;
};
const limitar = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;
const suavizar = (t: number) => { const p = limitar(t); return p * p * (3 - 2 * p); };

function buscarEncuentro(claro: Claro, puntos: Punto[]): Punto {
  if (claro.id === '06') return puntos[puntos.length - 1];
  const caja = claro.caja;
  const borde = claro.lado === 'left' ? caja.x + caja.width : caja.x;
  const candidatos = puntos.filter(p => p.y >= caja.y && p.y <= caja.y + caja.height);
  return (candidatos.length ? candidatos : puntos).reduce((mejor, p) =>
    Math.abs(p.x - borde) < Math.abs(mejor.x - borde) ? p : mejor,
  );
}

function calcularEncuadre(claro: Claro, encuentro: Punto, vista: Vista) {
  const { ancho, alto, anchoTira, altoTira, movil, margen } = vista;
  const escalaViaje = ancho * (movil ? AJUSTES.anchoMovil : AJUSTES.anchoEscritorio) / anchoTira;
  const segura = claro.cajaSegura;
  if (claro.id === '01') return {
    pose: { x: anchoTira / 2, y: alto / (2 * escalaViaje * AJUSTES.zoomCumbre) + AJUSTES.bordeCumbre, zoom: AJUSTES.zoomCumbre },
    altoPanelMax: movil ? alto * AJUSTES.altoPanelMovil : alto - 96,
    topeMin: 72, topeMax: alto - AJUSTES.margenSeguro,
  };

  const izquierda = claro.lado === 'left';
  const extremo = movil
    ? izquierda ? segura.x + segura.width * (1 - AJUSTES.porcionClaroMovil) : segura.x + segura.width * AJUSTES.porcionClaroMovil
    : izquierda ? segura.x : segura.x + segura.width;
  const esValle = claro.id === '06';
  const tramo = esValle ? Math.abs(AJUSTES.arroyoValle.x - encuentro.x) : Math.abs(extremo - encuentro.x);
  const anchoRelativo = limitar(AJUSTES.ocupacionEncuentro * anchoTira / Math.max(1, tramo),
    movil ? AJUSTES.paradaMovilMin : AJUSTES.paradaEscritorioMin,
    movil ? AJUSTES.paradaMovilMax : AJUSTES.paradaEscritorioMax);
  const factor = ancho * anchoRelativo / anchoTira;
  let x: number, y: number;
  if (movil) {
    const altoPanelMax = alto * AJUSTES.altoPanelMovil;
    const espacioFoto = alto - altoPanelMax - AJUSTES.margenSeguro;
    x = esValle ? claro.caja.x + ancho / (factor * 5) : mezclar(extremo, encuentro.x, AJUSTES.pesoSendaMovil);
    y = encuentro.y + (alto / 2 - espacioFoto / 2) / factor;
  } else {
    x = esValle ? (encuentro.x + AJUSTES.arroyoValle.x) / 2
      : extremo + (ancho / 2 - (izquierda ? margen - AJUSTES.margenSeguro : ancho - margen + AJUSTES.margenSeguro)) / factor;
    y = encuentro.y + alto * (esValle ? -0.25 : 0.5 - AJUSTES.lugarEncuentroEscritorio) / factor;
  }
  const pose = {
    x: limitar(x, ancho / (2 * factor), anchoTira - ancho / (2 * factor)),
    y: limitar(y, alto / (2 * factor), altoTira - alto / (2 * factor)),
    zoom: factor / escalaViaje,
  };
  // El panel de vidrio se centra en la ventana: la montaña se sigue viendo detrás.
  const topeMin = movil ? 0 : 72;
  const topeMax = movil ? alto : alto - AJUSTES.margenSeguro;
  return {
    pose, topeMin, topeMax,
    altoPanelMax: alto * (movil ? AJUSTES.altoPanelMovil : AJUSTES.altoPanelEscritorio),
  };
}

function prepararCamara() {
  const raiz = document.documentElement;
  const recorrido = document.querySelector<HTMLElement>('[data-recorrido]');
  const ventana = document.querySelector<HTMLElement>('[data-camara]');
  const montana = document.querySelector<HTMLElement>('[data-montana]');
  const secciones = [...document.querySelectorAll<HTMLElement>('.parada[data-parada]')];
  const movimiento = matchMedia('(prefers-reduced-motion: reduce)');
  const escritorio = matchMedia('(min-width: 48rem)');
  if (!recorrido || !ventana || !montana || !secciones.length) return;
  const ancho = Number(montana.dataset.ancho), alto = Number(montana.dataset.alto);
  const tramos = [...montana.querySelectorAll<HTMLImageElement>('img[data-tramo]')].map(imagen => ({
    imagen, y: Number(imagen.dataset.y), alto: Number(imagen.dataset.alto), solicitado: imagen.loading === 'eager',
  }));
  if (!(ancho > 0 && alto > 0) || !tramos.length || tramos.some(t => !Number.isFinite(t.y) || !(t.alto > 0))) return;

  const datosSenda = Object.values(archivosSenda)[0] as { ancho?: number; alto?: number; puntos?: Punto[] } | undefined;
  const extraidos = datosSenda?.puntos?.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  const puntos = (extraidos?.length ? extraidos.map(p => ({
    x: p.x * ancho / (datosSenda?.ancho || ancho), y: p.y * alto / (datosSenda?.alto || alto),
  })) : datosMontana.claros.map(c => ({
    x: c.cajaSegura.x + c.cajaSegura.width / 2, y: c.cajaSegura.y + c.cajaSegura.height / 2,
  }))).sort((a, b) => a.y - b.y);
  const senda = puntos.map((p, i) => {
    let suma = 0, peso = 0;
    for (let j = -AJUSTES.suavizadoSenda; j <= AJUSTES.suavizadoSenda; j++) {
      const vecino = puntos[limitar(i + j, 0, puntos.length - 1)];
      const valor = AJUSTES.suavizadoSenda + 1 - Math.abs(j);
      suma += vecino.x * valor;
      peso += valor;
    }
    return { x: suma / peso, y: p.y };
  });
  const pendientesSenda = senda.map((p, i) => {
    const previo = senda[Math.max(0, i - 1)], siguiente = senda[Math.min(senda.length - 1, i + 1)];
    const h0 = Math.max(1, p.y - previo.y), h1 = Math.max(1, siguiente.y - p.y);
    const a = (p.x - previo.x) / h0, b = (siguiente.x - p.x) / h1;
    if (!i) return b;
    if (i === senda.length - 1) return a;
    if (a * b <= 0) return 0;
    const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / a + w1 / b);
  });

  let paradas: Parada[] = [];
  let activo = false, cuadro = 0, demora = 0;
  let anchoVista = 0, altoVista = 0, origen = 0, escala = 1, ultimaY = 0, paradaActual = 0;
  let lectura: HTMLElement | undefined, cajas: SVGSVGElement | undefined;
  let minimapa: Minimapa | undefined;
  let marcadores: Marcador[] = [];
  let reenfocando = false;
  let activacionInicialTerminada = false;
  let entradaDeScroll = false;
  let desplazamientoPrevio = false;
  let generacion = 0;
  let vistas: HTMLImageElement[] = [];
  let precarga: Promise<HTMLImageElement[]> | undefined;
  const originales = new Map<HTMLElement, Map<string, string | null>>();

  function guardar(elemento: HTMLElement) {
    if (!originales.has(elemento)) originales.set(elemento, new Map(
      ['style', 'tabindex', 'sizes', 'loading'].map(nombre => [nombre, elemento.getAttribute(nombre)]),
    ));
  }

  function prepararVistas() {
    // La versión pequeña evita huecos incluso al saltar al valle con red lenta.
    // Hasta decodificar las seis vistas, el contenido sigue en modo quieto.
    precarga ??= Promise.all(tramos.map(t => {
      const vista = new Image();
      vista.alt = '';
      vista.decoding = 'async';
      vista.src = t.imagen.srcset.split(',')[0]?.trim().split(/\s+/)[0] || t.imagen.src;
      return vista.decode().then(() => vista);
    }));
    return precarga;
  }

  // Hermite monótona: comparte tangentes entre muestras y no agrega desvíos.
  function xSenda(y: number) {
    let i = 0;
    while (i < senda.length - 2 && senda[i + 1].y < y) i++;
    const a = senda[i], b = senda[Math.min(i + 1, senda.length - 1)];
    const distancia = b.y - a.y;
    if (distancia <= 0) return a.x;
    const t = limitar((y - a.y) / distancia);
    const ma = pendientesSenda[i] * distancia;
    const mb = pendientesSenda[Math.min(i + 1, senda.length - 1)] * distancia;
    return (2 * t ** 3 - 3 * t ** 2 + 1) * a.x + (t ** 3 - 2 * t ** 2 + t) * ma
      + (-2 * t ** 3 + 3 * t ** 2) * b.x + (t ** 3 - t ** 2) * mb;
  }

  function encuadrar(pose: Pose): Pose {
    // El plano abierto nunca deja ver los bordes de la tira.
    const zoom = Math.max(pose.zoom, anchoVista / (escala * ancho), altoVista / (escala * alto));
    const factor = escala * zoom;
    return {
      x: limitar(pose.x, anchoVista / (2 * factor), ancho - anchoVista / (2 * factor)),
      y: limitar(pose.y, altoVista / (2 * factor), alto - altoVista / (2 * factor)),
      zoom,
    };
  }

  function coordenadaMinimapa(y: number) {
    let i = 0;
    while (i < puntos.length - 2 && puntos[i + 1].y < y) i++;
    const a = puntos[i], b = puntos[Math.min(i + 1, puntos.length - 1)];
    return { x: mezclar(a.x, b.x, limitar((y - a.y) / Math.max(1, b.y - a.y))), y: limitar(y, puntos[0].y, puntos[puntos.length - 1].y) };
  }

  function focoSenda(parada: Parada) {
    return parada === paradas[0] ? puntos[0].y : parada.encuentro.y;
  }

  function posicionSenda(y: number) {
    for (let i = 0; i < paradas.length; i++) {
      const parada = paradas[i];
      if (i && y < parada.llegada) return mezclar(focoSenda(paradas[i - 1]), focoSenda(parada), suavizar((y - parada.inicio) / parada.viaje));
      if (y <= parada.fin) return focoSenda(parada);
    }
    return focoSenda(paradas[paradas.length - 1]);
  }

  function prepararMinimapa() {
    const existente = document.querySelector<HTMLElement>('[data-minimapa]');
    const nav = existente || document.createElement('nav');
    const marca = document.createElement('span');
    minimapa = {
      nav, marca, enlaces: [], creado: !existente, oculto: nav.hidden, contenido: [...nav.childNodes],
      ancho: 0, alto: 0, minX: Math.min(...puntos.map(p => p.x)), maxX: Math.max(...puntos.map(p => p.x)),
      minY: puntos[0].y, maxY: puntos[puntos.length - 1].y, activo: -1,
    };
    if (!existente) {
      nav.className = 'minimapa';
      nav.setAttribute('data-minimapa', '');
      nav.setAttribute('aria-label', 'Recorrido de la senda');
      nav.hidden = true;
      document.body.append(nav);
    }
    nav.replaceChildren();
    const ns = 'http://www.w3.org/2000/svg';
    const dibujo = document.createElementNS(ns, 'svg');
    dibujo.classList.add('minimapa__dibujo');
    dibujo.setAttribute('viewBox', '0 0 100 100');
    dibujo.setAttribute('preserveAspectRatio', 'none');
    dibujo.setAttribute('aria-hidden', 'true');
    dibujo.setAttribute('focusable', 'false');
    const linea = document.createElementNS(ns, 'polyline');
    linea.setAttribute('points', puntos.map(p => {
      const n = normalizarMinimapa(p);
      return `${n.x * 100},${n.y * 100}`;
    }).join(' '));
    dibujo.append(linea);
    nav.append(dibujo);
    paradas.forEach(parada => {
      const enlace = document.createElement('a');
      enlace.className = 'minimapa__enlace';
      enlace.href = `#${parada.seccion.id}`;
      enlace.setAttribute('data-minimapa-parada', parada.claro.id);
      const titulo = parada.panel.querySelector('h1, h2')?.textContent?.replace(/\s+/g, ' ').trim() || `Parada ${parada.claro.id}`;
      enlace.setAttribute('aria-label', `Ir a: ${titulo}`);
      enlace.title = titulo;
      const posicion = normalizarMinimapa(coordenadaMinimapa(focoSenda(parada)));
      enlace.style.setProperty('--mapa-x', String(posicion.x));
      enlace.style.setProperty('--mapa-y', String(posicion.y));
      const punto = document.createElement('span');
      punto.className = 'minimapa__punto';
      enlace.append(punto);
      nav.append(enlace);
      minimapa!.enlaces.push(enlace);
    });
    marca.className = 'minimapa__posicion';
    marca.setAttribute('aria-hidden', 'true');
    nav.append(marca);
  }

  function normalizarMinimapa(punto: Punto) {
    const mapa = minimapa!;
    return {
      x: limitar((punto.x - mapa.minX) / Math.max(1, mapa.maxX - mapa.minX)),
      y: limitar((punto.y - mapa.minY) / Math.max(1, mapa.maxY - mapa.minY)),
    };
  }

  function pintarMinimapa(y: number) {
    if (!minimapa) return;
    const posicion = normalizarMinimapa(coordenadaMinimapa(posicionSenda(y)));
    minimapa.marca.style.transform = `translate3d(${posicion.x * minimapa.ancho}px, ${posicion.y * minimapa.alto}px, 0) translate(-50%, -50%)`;
    if (minimapa.activo !== paradaActual) {
      minimapa.enlaces.forEach((enlace, i) => enlace.style.setProperty('--activa', i === paradaActual ? '1' : '0'));
      minimapa.activo = paradaActual;
    }
  }

  function crearDepuracion() {
    if (!new URLSearchParams(location.search).has('depuracion')) return;
    const ns = 'http://www.w3.org/2000/svg';
    cajas = document.createElementNS(ns, 'svg');
    cajas.classList.add('camara__cajas');
    cajas.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
    cajas.setAttribute('aria-hidden', 'true');
    datosMontana.claros.forEach(claro => {
      (['caja', 'cajaSegura'] as const).forEach(tipo => {
        const rectangulo = document.createElementNS(ns, 'rect');
        Object.entries(claro[tipo]).forEach(([nombre, valor]) => rectangulo.setAttribute(nombre, String(valor)));
        rectangulo.setAttribute('class', `camara__caja${tipo === 'cajaSegura' ? ' camara__caja--segura' : ''}`);
        cajas!.append(rectangulo);
      });
    });
    const linea = document.createElementNS(ns, 'polyline');
    // La depuración muestra la extracción; la cámara interpola sin dibujar atajos.
    linea.setAttribute('points', puntos.map(p => `${p.x},${p.y}`).join(' '));
    linea.classList.add('camara__senda');
    cajas.append(linea);
    montana!.append(cajas);
    lectura = document.createElement('div');
    lectura.className = 'camara__lectura';
    lectura.setAttribute('aria-hidden', 'true');
    marcadores = ['scroll ', ' · parada ', ' · x ', ' · y ', ' · zoom /100 '].map((rotulo, i) => {
      lectura!.append(document.createTextNode(rotulo));
      const digitos = Array.from({ length: [6, 2, 4, 4, 3][i] }, () => {
        const casilla = document.createElement('span');
        casilla.className = 'camara__digito';
        const numeros = document.createElement('span');
        numeros.className = 'camara__numeros';
        for (let n = 0; n <= 9; n++) {
          const cifra = document.createElement('span');
          cifra.textContent = String(n);
          numeros.append(cifra);
        }
        casilla.append(numeros);
        lectura!.append(casilla);
        return numeros;
      });
      return { digitos, valor: -1 };
    });
    document.body.append(lectura);
  }

  function medir() {
    anchoVista = raiz.clientWidth;
    // svh evita saltos al plegarse la barra del navegador en celular.
    const regla = document.createElement('div');
    regla.style.cssText = 'position:absolute;height:100svh;pointer-events:none;visibility:hidden';
    document.body.append(regla);
    altoVista = regla.getBoundingClientRect().height || window.innerHeight;
    regla.remove();
    origen = recorrido!.getBoundingClientRect().top + window.scrollY;
    escala = anchoVista * (escritorio.matches ? AJUSTES.anchoEscritorio : AJUSTES.anchoMovil) / ancho;
    if (minimapa) {
      minimapa.ancho = Math.max(0, minimapa.nav.clientWidth - 24);
      minimapa.alto = Math.max(0, minimapa.nav.clientHeight - 24);
    }
    montana!.style.setProperty('--ancho-montana', `${ancho * escala}px`);
    montana!.style.setProperty('--alto-montana', `${alto * escala}px`);
    tramos.forEach(t => {
      guardar(t.imagen);
      t.imagen.style.setProperty('--alto-tramo', `${t.alto * escala}px`);
      const cuadro = t.imagen.closest('picture');
      if (cuadro) {
        guardar(cuadro);
        cuadro.style.setProperty('--alto-tramo', `${t.alto * escala}px`);
      }
      // sizes describe el ancho real y no la resolución nativa del archivo.
      const medida = `${Math.ceil(ancho * escala * AJUSTES.zoomCumbre)}px`;
      if (t.imagen.sizes !== medida) t.imagen.sizes = medida;
      t.imagen.closest('picture')?.querySelectorAll('source').forEach(fuente => {
        guardar(fuente);
        if (fuente.sizes !== medida) fuente.sizes = medida;
      });
    });
    // Medir dimensiones sin la escala proyectada del cuadro anterior.
    paradas.forEach(p => { p.panel.style.transform = 'none'; });
    let inicio = 0;
    const primera = paradas[0].claro.cajaSegura, ultima = paradas[paradas.length - 1].claro.cajaSegura;
    const distanciaMedia = Math.max(1, (ultima.y + ultima.height / 2 - primera.y - primera.height / 2) / Math.max(1, paradas.length - 1));
    paradas.forEach((parada, i) => {
      const margen = parseFloat(getComputedStyle(parada.panel).marginRight) || 16;
      const encuadre = calcularEncuadre(parada.claro, parada.encuentro, {
        ancho: anchoVista, alto: altoVista, anchoTira: ancho, altoTira: alto, movil: !escritorio.matches, margen,
      });
      parada.seccion.style.setProperty('--alto-panel-disponible', `${encuadre.altoPanelMax}px`);
      const alturaPanel = parada.panel.getBoundingClientRect().height;
      const tope = escritorio.matches ? limitar((altoVista - alturaPanel) / 2, encuadre.topeMin, encuadre.topeMax - alturaPanel) : Math.max(72, altoVista - alturaPanel - 16);
      const c = parada.claro.cajaSegura, previo = paradas[Math.max(0, i - 1)].claro.cajaSegura;
      const distancia = Math.max(0, c.y + c.height / 2 - previo.y - previo.height / 2);
      // La distancia solo modula un viaje breve, independiente del zoom de la foto.
      parada.viaje = i ? altoVista * limitar(AJUSTES.viajeBase * Math.sqrt(distancia / distanciaMedia), AJUSTES.viajeMinimo, AJUSTES.viajeMaximo) : 0;
      parada.pausa = i === paradas.length - 1 ? 0 : altoVista * AJUSTES.pausa;
      parada.inicio = inicio;
      parada.llegada = inicio + parada.viaje;
      parada.fin = parada.llegada + parada.pausa;
      parada.entrada = parada.viaje * AJUSTES.fundido;
      parada.pose = encuadre.pose;
      const factorPanel = escala * parada.pose.zoom;
      const anchoPanel = parada.panel.getBoundingClientRect().width;
      const izquierdaPanel = escritorio.matches
        ? parada.claro.lado === 'right' ? anchoVista - anchoPanel - 96
          : parada.claro.lado === 'left' ? 32 : (anchoVista - anchoPanel) / 2
        : (anchoVista - anchoPanel) / 2;
      parada.panelAncho = anchoPanel;
      parada.panelAlto = alturaPanel;
      parada.panelReferencia = factorPanel;
      parada.panelPunto = {
        x: parada.pose.x + (izquierdaPanel + anchoPanel / 2 - anchoVista / 2) / factorPanel,
        y: parada.pose.y + (tope + alturaPanel / 2 - altoVista / 2) / factorPanel,
      };
      parada.seccion.style.setProperty('--alto-parada', `${parada.viaje + parada.pausa + (i === paradas.length - 1 ? altoVista : 0)}px`);
      parada.seccion.style.setProperty('--inicio-panel', `${parada.viaje - parada.entrada + tope}px`);
      parada.seccion.style.setProperty('--tope-panel', `${tope}px`);
      parada.hitos.forEach(hito => {
        hito.ancho = hito.elemento.offsetWidth;
        hito.alto = hito.elemento.offsetHeight;
      });
      inicio = parada.fin;
    });
    // Medimos una sola vez el punto del terreno donde está cada cartel.
    // Al pintar solo proyectamos ese punto: nunca lo sujetamos a la ventana.
    paradas.forEach(parada => parada.hitos.forEach((hito, i) => {
      const t = i === 0 ? 0.34 : 0.66;
      const pose = poseEn(parada.inicio + parada.viaje * t);
      const factor = escala * pose.zoom;
      const camino = anchoVista / 2 + (xSenda(pose.y) - pose.x) * factor;
      const margen = escritorio.matches ? 48 : 20;
      const x = escritorio.matches
        ? i === 0
          ? limitar(camino - hito.ancho / 2 - 64, margen + hito.ancho / 2, anchoVista / 2 - hito.ancho / 2 - 24)
          : limitar(camino + hito.ancho / 2 + 64, anchoVista / 2 + hito.ancho / 2 + 24, anchoVista - hito.ancho / 2 - 96)
        : i === 0 ? margen + hito.ancho / 2 : anchoVista - margen - hito.ancho / 2;
      hito.punto = { x: pose.x + (x - anchoVista / 2) / factor, y: pose.y };
      hito.referencia = factor;
    }));
    // En celular hay un solo hito por travesía. Se coloca físicamente entre
    // las dos tarjetas para que nunca tape el contenido de las paradas.
    if (!escritorio.matches) paradas.forEach((parada, i) => {
      if (!i || !parada.hitos.length) return;
      const anterior = paradas[i - 1];
      const desde = anterior.panelPunto.y + anterior.panelAlto / (2 * anterior.panelReferencia);
      const hasta = parada.panelPunto.y - parada.panelAlto / (2 * parada.panelReferencia);
      const hito = parada.hitos[0];
      const espacio = Math.max(120, hasta - desde - 80);
      hito.referencia = Math.max(hito.referencia, hito.alto / espacio);
      hito.punto.y = (desde + hasta) / 2;
    });
    if (escritorio.matches) {
      const valle = paradas[paradas.length - 1];
      const factor = escala * valle.pose.zoom;
      valle.hitos.forEach((hito, i) => {
        const x = i === 0 ? 32 + hito.ancho / 2 : anchoVista - 32 - hito.ancho / 2;
        hito.punto.x = valle.pose.x + (x - anchoVista / 2) / factor;
      });
    }
    recorrido!.style.setProperty('--pantalla-final', `${altoVista}px`);
    paradas.forEach((parada, i) => {
      parada.salida = (paradas[i + 1]?.viaje ?? altoVista) * AJUSTES.fundido;
      parada.seccion.style.setProperty('--cola-panel', `${altoVista + parada.salida}px`);
    });
  }

  // La lectura también avanza por el terreno. No hay scroll consumido en una pose fija.
  function salidaDe(parada: Parada): Pose {
    const recorridoLectura = parada === paradas[paradas.length - 1] ? 0.22 : 0.65;
    return encuadrar({ ...parada.pose, y: parada.pose.y + altoVista * recorridoLectura / (escala * parada.pose.zoom) });
  }

  function poseEn(y: number): Pose {
    for (let i = 0; i < paradas.length; i++) {
      const parada = paradas[i];
      if (y <= parada.llegada && i > 0) {
        const anterior = paradas[i - 1];
        const t = limitar((y - parada.inicio) / parada.viaje);
        const avance = suavizar(t);
        const desde = salidaDe(anterior);
        const centroY = mezclar(desde.y, parada.pose.y, avance);
        const salida = 1 - suavizar(t / AJUSTES.enlaceConSenda);
        const entrada = suavizar((t - 1 + AJUSTES.enlaceConSenda) / AJUSTES.enlaceConSenda);
        // Plano abierto: a mitad del viaje se ve la senda y el próximo claro.
        const zoom = mezclar(anterior.pose.zoom, parada.pose.zoom, avance)
          * (1 - AJUSTES.respiracion * Math.sin(Math.PI * t) ** 2);
        const x = AJUSTES.tramosRectos.includes(parada.claro.id)
          ? mezclar(desde.x, parada.pose.x, avance)
          : xSenda(centroY)
            + (desde.x - xSenda(desde.y)) * salida
            + (parada.pose.x - xSenda(parada.pose.y)) * entrada;
        return encuadrar({ x, y: centroY, zoom });
      }
      if (y <= parada.fin) {
        const t = limitar((y - parada.llegada) / Math.max(1, parada.pausa));
        const hasta = salidaDe(parada);
        return encuadrar({ ...parada.pose, y: mezclar(parada.pose.y, hasta.y, t) });
      }
    }
    return salidaDe(paradas[paradas.length - 1]);
  }

  function solicitarTramos(pose: Pose) {
    const campo = altoVista / (escala * pose.zoom);
    tramos.forEach(t => {
      if (!t.solicitado && t.y < pose.y + 2 * campo && t.y + t.alto > pose.y - 2 * campo) {
        t.solicitado = true;
        t.imagen.loading = 'eager';
      }
    });
  }

  function pintar() {
    cuadro = 0;
    if (!activo) return;
    // Única lectura del scroll en el cuadro; no medimos el diseño acá.
    ultimaY = window.scrollY;
    const y = Math.max(0, ultimaY - origen), pose = poseEn(y), factor = escala * pose.zoom;
    montana!.style.transform = `translate3d(${anchoVista / 2 - pose.x * factor}px, ${altoVista / 2 - pose.y * factor}px, 0) scale(${pose.zoom})`;
    const tramoActual = paradas.findIndex(p => y <= p.fin);
    paradaActual = tramoActual < 0 ? paradas.length - 1 : tramoActual;
    if (paradaActual > 0) {
      const p = paradas[paradaActual];
      if (y < p.inicio + p.viaje / 2) paradaActual--;
    }
    // Todas las tarjetas tienen un lugar en la montaña: entran y salen del encuadre
    // por el desplazamiento de la cámara, sin fundidos por porcentaje de scroll.
    paradas.forEach(p => {
      const x = anchoVista / 2 + (p.panelPunto.x - pose.x) * factor;
      const arriba = altoVista / 2 + (p.panelPunto.y - pose.y) * factor;
      const tamano = factor / p.panelReferencia;
      const visible = x + p.panelAncho * tamano / 2 > -48 && x - p.panelAncho * tamano / 2 < anchoVista + 48 && arriba + p.panelAlto * tamano / 2 > -48 && arriba - p.panelAlto * tamano / 2 < altoVista + 48;
      p.panel.style.visibility = visible ? 'visible' : 'hidden';
      p.panel.style.transform = `translate3d(${x.toFixed(1)}px, ${arriba.toFixed(1)}px, 0) translate(-50%, -50%) scale(${tamano.toFixed(4)})`;
      p.seccion.classList.toggle('parada--enfocada', arriba + p.panelAlto * tamano / 2 > 0 && arriba - p.panelAlto * tamano / 2 < altoVista);
    });
    paradas.forEach(p => pintarHitos(p, y, pose));
    solicitarTramos(pose);
    pintarMinimapa(y);
    const valores = [y, Number(paradas[paradaActual].claro.id), pose.x, pose.y, pose.zoom * 100];
    marcadores.forEach((m, i) => {
      const valor = Math.round(valores[i]);
      if (valor === m.valor) return;
      m.valor = valor;
      const cifras = String(valor).padStart(m.digitos.length, '0').slice(-m.digitos.length);
      m.digitos.forEach((digito, j) => { digito.style.transform = `translate3d(0, ${-Number(cifras[j]) * 1.3}em, 0)`; });
    });
  }

  // Los mensajes se quedan a los lados de la senda; el centro sigue libre.
  function pintarHitos(parada: Parada, y: number, pose: Pose) {
    const t = (y - parada.inicio) / Math.max(1, parada.viaje);
    const opacidad = 1;
    const factor = escala * pose.zoom;
    parada.hitos.forEach(hito => {
      const x = anchoVista / 2 + (hito.punto.x - pose.x) * factor;
      const arriba = altoVista / 2 + (hito.punto.y - pose.y) * factor;
      hito.elemento.style.opacity = opacidad.toFixed(3);
      const tamano = factor / hito.referencia;
      const visible = x + hito.ancho * tamano / 2 > -48 && x - hito.ancho * tamano / 2 < anchoVista + 48 && arriba + hito.alto * tamano / 2 > -48 && arriba - hito.alto * tamano / 2 < altoVista + 48;
      hito.elemento.style.visibility = visible ? 'visible' : 'hidden';
      hito.elemento.style.transform = `translate3d(${x.toFixed(1)}px, ${arriba.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(factor / hito.referencia).toFixed(4)})`;
    });
  }

  function pedirCuadro() {
    if (activo && !cuadro) cuadro = requestAnimationFrame(pintar);
  }

  function registrarEntrada(evento: Event) {
    if (!activo && !activacionInicialTerminada && evento.isTrusted) entradaDeScroll = true;
  }

  function alScroll(evento: Event) {
    // Una posición restaurada por el navegador no autoriza a reposicionar.
    if (!activo && !activacionInicialTerminada && entradaDeScroll && evento.isTrusted) desplazamientoPrevio = true;
    pedirCuadro();
  }

  function irA(parada: Parada, enfocar: boolean) {
    const destino = origen + parada.llegada;
    solicitarTramos(parada.pose);
    window.scrollTo({ top: destino, behavior: 'instant' });
    // El foco queda visible aun si la pestaña no está ejecutando animaciones.
    cancelAnimationFrame(cuadro);
    pintar();
    if (enfocar) {
      reenfocando = true;
      parada.panel.focus({ preventScroll: true });
      reenfocando = false;
    }
  }

  function resolverAncla() {
    if (!activo) return;
    const parada = paradas.find(p => `#${p.seccion.id}` === location.hash);
    if (parada) irA(parada, true);
  }

  function alEnlace(evento: MouseEvent) {
    if (!activo || evento.defaultPrevented || evento.button || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const enlace = (evento.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!enlace || enlace.target || enlace.hasAttribute('download')) return;
    const url = new URL(enlace.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    const parada = paradas.find(p => `#${p.seccion.id}` === url.hash);
    if (!parada) return;
    // Solo resolvemos enlaces locales; rueda, tacto y teclas son nativos.
    evento.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    irA(parada, true);
  }

  function alFoco(evento: FocusEvent) {
    if (!activo || reenfocando) return;
    const parada = paradas.find(p => p.panel.contains(evento.target as Node));
    if (parada && (ultimaY < origen + parada.llegada || ultimaY > origen + parada.fin)) irA(parada, false);
  }

  function recalcular() {
    window.clearTimeout(demora);
    demora = window.setTimeout(() => {
      if (!activo) return;
      try {
        medir();
        pedirCuadro();
      } catch (error) { desactivar(); console.error('No se pudo recalcular la cámara.', error); }
    }, 120);
  }

  function desactivar() {
    let foco = document.activeElement as HTMLElement | null;
    if (foco && minimapa?.nav.contains(foco)) foco = paradas[paradaActual]?.panel || null;
    const conservarFoco = foco && paradas.some(p => p.panel.contains(foco));
    const focoEnPanel = paradas.some(p => p.panel === foco);
    activo = false;
    generacion++;
    cancelAnimationFrame(cuadro);
    cuadro = 0;
    window.clearTimeout(demora);
    raiz.classList.remove('con-camara');
    cajas?.remove();
    lectura?.remove();
    cajas = undefined;
    lectura = undefined;
    marcadores = [];
    if (minimapa) {
      if (minimapa.creado) minimapa.nav.remove();
      else {
        minimapa.nav.replaceChildren(...minimapa.contenido);
        minimapa.nav.hidden = minimapa.oculto;
      }
      minimapa = undefined;
    }
    vistas = [];
    paradas.forEach(p => {
      p.seccion.classList.remove('parada--enfocada');
      if (p.anclaje.isConnected) p.anclaje.replaceWith(p.panel);
    });
    originales.forEach((atributos, elemento) => {
      atributos.forEach((valor, nombre) => {
        if (valor === null) elemento.removeAttribute(nombre); else elemento.setAttribute(nombre, valor);
      });
    });
    originales.clear();
    paradas = [];
    tramos.forEach(t => { t.solicitado = t.imagen.loading === 'eager'; });
    if (conservarFoco) {
      const tabindex = foco.getAttribute('tabindex');
      if (focoEnPanel && tabindex === null) foco.setAttribute('tabindex', '-1');
      foco.focus({ preventScroll: true });
      if (focoEnPanel && tabindex === null) foco.removeAttribute('tabindex');
    }
  }

  async function activar() {
    if (activo || movimiento.matches) return;
    const turno = ++generacion;
    try {
      const preparadas = await prepararVistas();
      if (turno !== generacion || movimiento.matches) return;
      // Durante la precarga se puede seguir leyendo el modo quieto.
      const foco = document.activeElement as HTMLElement | null;
      const primeraActivacion = !activacionInicialTerminada;
      const paradaVista = primeraActivacion && desplazamientoPrevio ? secciones.find(seccion => {
        const caja = seccion.getBoundingClientRect();
        return caja.top <= window.innerHeight / 2 && caja.bottom > window.innerHeight / 2;
      }) || secciones[secciones.length - 1] : undefined;
      guardar(montana!);
      guardar(recorrido!);
      paradas = secciones.map(seccion => {
        const panel = seccion.querySelector<HTMLElement>('.parada__panel');
        const claro = datosMontana.claros.find(c => c.id === seccion.dataset.parada);
        if (!panel || !claro) throw new Error('Falta un panel o un claro de la montaña.');
        guardar(seccion);
        guardar(panel);
        const anclaje = document.createElement('div');
        anclaje.className = 'parada__anclaje';
        const hitos = [...seccion.querySelectorAll<HTMLElement>('[data-hito]')].map(elemento => { guardar(elemento); return { elemento, ancho: 0, alto: 0, punto: { x: 0, y: 0 }, referencia: 1 }; });
        return { seccion, panel, anclaje, claro, hitos, encuentro: buscarEncuentro(claro, puntos), inicio: 0, llegada: 0, fin: 0, viaje: 0, pausa: 0, entrada: 0, salida: 0, pose: { x: 0, y: 0, zoom: 1 }, panelPunto: { x: 0, y: 0 }, panelReferencia: 1, panelAncho: 0, panelAlto: 0, enfoque: -1 };
      });
      prepararMinimapa();
      medir();
      vistas = preparadas;
      vistas.forEach((vista, i) => {
        tramos[i].imagen.closest('picture')?.style.setProperty('--vista-previa', `url(${JSON.stringify(vista.src)})`);
      });
      paradas.forEach(p => {
        p.panel.before(p.anclaje);
        p.anclaje.append(p.panel);
        p.panel.setAttribute('tabindex', '-1');
      });
      crearDepuracion();
      activo = true;
      // Datos y geometría listos antes de publicar el modo mejorado.
      raiz.classList.add('con-camara');
      minimapa!.nav.hidden = false;
      medir();
      pintar();
      activacionInicialTerminada = true;
      if (primeraActivacion && paradas.some(p => `#${p.seccion.id}` === location.hash)) resolverAncla();
      else {
        const retomar = paradas.find(p => p.seccion === paradaVista);
        if (retomar) irA(retomar, false);
        if (foco && paradas.some(p => p.panel.contains(foco))) {
          reenfocando = true;
          foco.focus({ preventScroll: true });
          reenfocando = false;
        }
      }
    } catch (error) {
      if (turno !== generacion) return;
      precarga = undefined;
      desactivar();
      console.error('Se conserva el modo quieto: no se pudo iniciar la cámara.', error);
    }
  }

  window.addEventListener('scroll', alScroll, { passive: true });
  window.addEventListener('wheel', registrarEntrada, { passive: true });
  window.addEventListener('touchmove', registrarEntrada, { passive: true });
  window.addEventListener('keydown', evento => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(evento.key)) registrarEntrada(evento);
  }, { passive: true });
  window.addEventListener('resize', recalcular, { passive: true });
  window.addEventListener('orientationchange', recalcular, { passive: true });
  window.addEventListener('hashchange', resolverAncla);
  window.addEventListener('popstate', resolverAncla);
  window.addEventListener('pageshow', pedirCuadro);
  document.addEventListener('click', alEnlace);
  document.addEventListener('focusin', alFoco);
  tramos.forEach(t => t.imagen.addEventListener('load', recalcular));
  document.querySelectorAll('.parada__captura img').forEach(imagen => imagen.addEventListener('load', recalcular));
  document.fonts.ready.then(recalcular);
  movimiento.addEventListener('change', () => movimiento.matches ? desactivar() : activar());
  activar();
}

prepararCamara();
