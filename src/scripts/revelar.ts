/*
 * Hace aparecer cada tarjeta cuando entra en pantalla.
 * Donde el navegador soporta animaciones guiadas por el scroll, base.css las
 * resuelve solo con CSS y este script no hace nada. Sin JS las tarjetas se
 * ven siempre: la clase de la raíz activa el efecto recién cuando corre.
 */

const elementos = document.querySelectorAll<HTMLElement>('[data-revelar]');
const scrollNativo = CSS.supports('animation-timeline: view()');

if (!scrollNativo && elementos.length > 0 && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('con-revelado');

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('revelado');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );

  elementos.forEach((elemento) => observador.observe(elemento));
}
