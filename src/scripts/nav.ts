/*
 * Marca la barra de navegación cuando la página ya no está arriba de todo,
 * para que se despegue del contenido que pasa por debajo.
 */

const nav = document.querySelector<HTMLElement>('[data-nav]');

function actualizar(): void {
  nav?.classList.toggle('nav--despegada', window.scrollY > 8);
}

if (nav) {
  actualizar();
  window.addEventListener('scroll', actualizar, { passive: true });
}
