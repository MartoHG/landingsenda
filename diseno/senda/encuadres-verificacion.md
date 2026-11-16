# Verificación calculada de los encuadres

Estos datos salen de calcularEncuadre() en src/scripts/camara.ts. No son capturas de navegador. Los paneles de las láminas muestran su altura máxima; el contenido real puede ocupar menos.

Amarillo: caja del claro. Cian: cajaSegura. Rojo: encuentro con la senda (06: final). Azul: referencia del arroyo. Blanco: límite máximo del panel.

La escala es el ancho final de la tira respecto del viewport; CSS/px es el tamaño de un píxel de coordenadas de la tira. La caja segura se considera dentro solo si entra completa; el porcentaje es su área visible. Claro/viewport mide la intersección de caja con el viewport, no una segmentación del pasto.

## 1440x900

| Parada | Tira | CSS/px | Rectángulo fuente (x,y,w,h) | Senda dentro | Segura completa / visible | Claro/viewport |
|---|---:|---:|---|---|---|---:|
| 01 | 273.6vw | 2.565 | 487,200,561,351 | No | No / 0.0% | 0.0% |
| 02 | 147.9vw | 1.386 | 28,1920,1039,649 | Sí | No / 41.1% | 53.0% |
| 03 | 144.8vw | 1.358 | 431,3276,1060,663 | Sí | No / 52.3% | 58.6% |
| 04 | 146.9vw | 1.377 | 88,4559,1045,653 | Sí | No / 51.5% | 56.9% |
| 05 | 165.6vw | 1.552 | 543,6060,928,580 | Sí | No / 61.2% | 72.3% |
| 06 | 140.0vw | 1.312 | 439,7760,1097,686 | Sí | No / 63.6% | 83.2% |

## 390x844

| Parada | Tira | CSS/px | Rectángulo fuente (x,y,w,h) | Senda dentro | Segura completa / visible | Claro/viewport |
|---|---:|---:|---|---|---|---:|
| 01 | 376.2vw | 0.955 | 564,200,408,884 | Sí (tras el panel máximo) | No / 5.1% | 19.4% |
| 02 | 278.4vw | 0.707 | 375,1785,552,1194 | Sí | No / 42.3% | 52.4% |
| 03 | 275.5vw | 0.699 | 576,3142,558,1207 | Sí | No / 45.9% | 51.9% |
| 04 | 275.1vw | 0.699 | 435,4421,558,1208 | Sí | No / 45.9% | 49.0% |
| 05 | 330.0vw | 0.838 | 672,5955,465,1007 | Sí | No / 47.1% | 72.5% |
| 06 | 220.0vw | 0.559 | 91,6939,698,1511 | Sí (tras el panel máximo) | No / 13.7% | 57.0% |

## Resultados y límites

- Hero 01: conserva cielo y cumbre, sin trasladarse al claro.
- 02–05: la curva queda visible y fuera del panel en ambos tamaños. El panel de escritorio permanece dentro de la parte visible de cajaSegura.
- 06 escritorio: final de senda (621.48,8274) y arroyo aproximado (1430,8150) dentro del encuadre.
- 06 móvil: mantiene el mínimo 220vw y prioriza la senda que entra al valle. El punto final entra en el viewport pero queda tras el panel; el arroyo queda fuera. A 220vw solo entran 698 px de la tira, frente a los 809 px entre las referencias. Mostrar ambas requiere abrir más el plano y resolver la composición del panel inferior.
- Las pruebas con DOM simulado cubren continuidad, foco, anclas, restauración y scroll: no reposiciona en resize, fonts.ready, carga de tiles ni cambios de movimiento reducido. El ajuste de activación exige una entrada real seguida de scroll antes de la primera activación y se consume una sola vez. Las anclas y la navegación por foco conservan su comportamiento explícito.
- El navegador integrado y el arranque local de Chromium no estuvieron disponibles en esta sesión. Las láminas son recortes geométricos de la referencia, sin renderizar HTML/CSS.
