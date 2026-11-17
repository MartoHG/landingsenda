// Disuasión de copia directa solicitada por el equipo. El contenido público
// sigue disponible para el navegador; esto no es un control de seguridad.
// Lo marcado con [data-copiable] queda libre: el visitante tiene que poder
// copiar el canal de contacto y abrir sus enlaces con el clic derecho.
const esCopiable = (nodo: Node | null | undefined): boolean => {
  const elemento = nodo instanceof Element ? nodo : nodo?.parentElement;
  return Boolean(elemento?.closest('[data-copiable]'));
};

const seleccionCopiable = (): boolean => {
  const seleccion = window.getSelection();
  return Boolean(seleccion && seleccion.rangeCount > 0 && esCopiable(seleccion.anchorNode) && esCopiable(seleccion.focusNode));
};

const impedirAccion = (evento: Event) => {
  const permitido = evento.type === 'copy' || evento.type === 'cut'
    ? seleccionCopiable()
    : esCopiable(evento.target as Node | null);
  if (!permitido) {
    evento.preventDefault();
  }
};

for (const tipo of ['copy', 'cut', 'selectstart', 'dragstart', 'contextmenu']) {
  document.addEventListener(tipo, impedirAccion);
}

document.addEventListener('keydown', (evento: KeyboardEvent) => {
  if ((evento.ctrlKey || evento.metaKey) && !evento.altKey &&
      ['a', 'c', 'x'].includes(evento.key.toLowerCase()) && !seleccionCopiable()) {
    evento.preventDefault();
  }
});

// Borra cualquier selección restaurada por el navegador antes de cargar JS.
window.getSelection()?.removeAllRanges();
