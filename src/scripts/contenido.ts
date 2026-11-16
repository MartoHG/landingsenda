// Disuasión de copia directa solicitada por el equipo. El contenido público
// sigue disponible para el navegador; esto no es un control de seguridad.
const impedirAccion = (evento: Event) => evento.preventDefault();

for (const tipo of ['copy', 'cut', 'selectstart', 'dragstart', 'contextmenu']) {
  document.addEventListener(tipo, impedirAccion);
}

document.addEventListener('keydown', (evento: KeyboardEvent) => {
  if ((evento.ctrlKey || evento.metaKey) && !evento.altKey &&
      ['a', 'c', 'x'].includes(evento.key.toLowerCase())) {
    evento.preventDefault();
  }
});

// Borra cualquier selección restaurada por el navegador antes de cargar JS.
window.getSelection()?.removeAllRanges();
