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
  altoPanelEscritorio: 0.6,
  altoPanelMovil: 0.45,
  margenSeguro: 16,
  arroyoValle: { x: 1430, y: 8150 }, // Referencia visible en la tira v3.
  respiracion: 0.12, // 0.88× a mitad del viaje: un plano 13.6% más abierto.
  pausa: 1.2, // Pantallas de lectura, además del viaje de cada sección.
  viajeMinimo: 0.8,
  fundido: 0.15,
  enlaceConSenda: 0.3,
  suavizadoSenda: 2, // Radio en muestras: reduce vibración sin borrar zigzags.
  bordeCumbre: 200, // Apertura con cielo y cumbre, en coordenadas de la tira.
};

type Punto = { x: number; y: number };
type Pose = Punto & { zoom: number };
type Claro = (typeof datosMontana.claros)[number];
type Parada = {
  seccion: HTMLElement; panel: HTMLElement; anclaje: HTMLElement; claro: Claro;
  inicio: number; llegada: number; fin: number; viaje: number; pausa: number;
  entrada: number; salida: number; pose: Pose; enfoque: number; encuentro: Punto;
};
type Vista = { ancho: number; alto: number; anchoTira: number; altoTira: number; movil: boolean; margen: number };
type Marcador = { digitos: HTMLElement[]; valor: number };
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
  // El panel se centra cuando cabe; si no, baja dentro del claro visible.
  const topeMin = movil ? 0 : Math.max(72, alto / 2 + (segura.y - pose.y) * factor + AJUSTES.margenSeguro);
  const topeMax = movil ? alto : Math.min(alto - AJUSTES.margenSeguro, alto / 2 + (segura.y + segura.height - pose.y) * factor - AJUSTES.margenSeguro);
  return {
    pose, topeMin, topeMax,
    altoPanelMax: movil ? alto * AJUSTES.altoPanelMovil : Math.max(1, Math.min(alto * AJUSTES.altoPanelEscritorio, topeMax - topeMin)),
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
    const factor = escala * pose.zoom;
    return {
      x: limitar(pose.x, anchoVista / (2 * factor), ancho - anchoVista / (2 * factor)),
      y: limitar(pose.y, altoVista / (2 * factor), alto - altoVista / (2 * factor)),
      zoom: pose.zoom,
    };
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
    linea.setAttribute('points', senda.map(p => `${p.x},${p.y}`).join(' '));
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
    let inicio = 0;
    paradas.forEach((parada, i) => {
      const margen = parseFloat(getComputedStyle(parada.panel).marginRight) || 16;
      const encuadre = calcularEncuadre(parada.claro, parada.encuentro, {
        ancho: anchoVista, alto: altoVista, anchoTira: ancho, altoTira: alto, movil: !escritorio.matches, margen,
      });
      parada.seccion.style.setProperty('--alto-panel-disponible', `${encuadre.altoPanelMax}px`);
      const alturaPanel = parada.panel.getBoundingClientRect().height;
      const tope = escritorio.matches ? limitar((altoVista - alturaPanel) / 2, encuadre.topeMin, encuadre.topeMax - alturaPanel) : Math.max(72, altoVista - alturaPanel - 16);
      const c = parada.claro.cajaSegura, previo = paradas[Math.max(0, i - 1)].claro.cajaSegura;
      parada.viaje = i ? Math.max(altoVista * AJUSTES.viajeMinimo, (c.y + c.height / 2 - previo.y - previo.height / 2) * escala) : 0;
      parada.pausa = altoVista * AJUSTES.pausa;
      parada.inicio = inicio;
      parada.llegada = inicio + parada.viaje;
      parada.fin = parada.llegada + parada.pausa;
      parada.entrada = parada.viaje * AJUSTES.fundido;
      parada.pose = encuadre.pose;
      parada.seccion.style.setProperty('--alto-parada', `${parada.viaje + parada.pausa}px`);
      parada.seccion.style.setProperty('--inicio-panel', `${parada.viaje - parada.entrada + tope}px`);
      parada.seccion.style.setProperty('--tope-panel', `${tope}px`);
      inicio = parada.fin;
    });
    paradas.forEach((parada, i) => {
      parada.salida = (paradas[i + 1]?.viaje ?? altoVista) * AJUSTES.fundido;
      parada.seccion.style.setProperty('--cola-panel', `${altoVista + parada.salida}px`);
    });
  }

  function poseEn(y: number): Pose {
    for (let i = 0; i < paradas.length; i++) {
      const parada = paradas[i];
      if (y <= parada.llegada && i > 0) {
        const anterior = paradas[i - 1];
        const t = limitar((y - parada.inicio) / parada.viaje);
        const centroY = mezclar(anterior.pose.y, parada.pose.y, suavizar(t));
        const salida = 1 - suavizar(t / AJUSTES.enlaceConSenda);
        const entrada = suavizar((t - 1 + AJUSTES.enlaceConSenda) / AJUSTES.enlaceConSenda);
        const zoom = 1 - AJUSTES.respiracion * Math.sin(Math.PI * t) ** 2
          + (anterior.pose.zoom - 1) * salida + (parada.pose.zoom - 1) * entrada;
        const x = xSenda(centroY)
          + (anterior.pose.x - xSenda(anterior.pose.y)) * salida
          + (parada.pose.x - xSenda(parada.pose.y)) * entrada;
        return encuadrar({ x, y: centroY, zoom });
      }
      if (y <= parada.fin) return parada.pose;
    }
    return paradas[paradas.length - 1].pose;
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
    paradas.forEach(p => {
      const enfoque = y < p.llegada ? suavizar((y - p.llegada + p.entrada) / (p.entrada || 1))
        : y <= p.fin ? 1 : 1 - suavizar((y - p.fin) / (p.salida || 1));
      if (enfoque !== p.enfoque) {
        p.enfoque = enfoque;
        p.seccion.style.setProperty('--enfoque', enfoque.toFixed(4));
        p.seccion.classList.toggle('parada--enfocada', enfoque > 0.5);
      }
    });
    solicitarTramos(pose);
    const valores = [y, Number(paradas[paradaActual].claro.id), pose.x, pose.y, pose.zoom * 100];
    marcadores.forEach((m, i) => {
      const valor = Math.round(valores[i]);
      if (valor === m.valor) return;
      m.valor = valor;
      const cifras = String(valor).padStart(m.digitos.length, '0').slice(-m.digitos.length);
      m.digitos.forEach((digito, j) => { digito.style.transform = `translate3d(0, ${-Number(cifras[j]) * 1.3}em, 0)`; });
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
    const destino = origen + parada.llegada + (parada === paradas[0] ? 0 : parada.pausa * 0.35);
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
    const foco = document.activeElement as HTMLElement | null;
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
      paradas = secciones.map(seccion => {
        const panel = seccion.querySelector<HTMLElement>('.parada__panel');
        const claro = datosMontana.claros.find(c => c.id === seccion.dataset.parada);
        if (!panel || !claro) throw new Error('Falta un panel o un claro de la montaña.');
        guardar(seccion);
        guardar(panel);
        const anclaje = document.createElement('div');
        anclaje.className = 'parada__anclaje';
        return { seccion, panel, anclaje, claro, encuentro: buscarEncuentro(claro, puntos), inicio: 0, llegada: 0, fin: 0, viaje: 0, pausa: 0, entrada: 0, salida: 0, pose: { x: 0, y: 0, zoom: 1 }, enfoque: -1 };
      });
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
  document.fonts.ready.then(recalcular);
  movimiento.addEventListener('change', () => movimiento.matches ? desactivar() : activar());
  activar();
}

prepararCamara();
