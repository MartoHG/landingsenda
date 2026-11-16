# Montaña continua — reparación y continuaciones orgánicas (v3)

Entregable final: **1536 × 8450 px**, seis segmentos de **1536 × 2048 px**, PNG RGB y preview JPEG de **400 px**. Generación/edición con `image_gen.imagegen` (herramienta incorporada); prompts exactos al final y en `proceso/prompts-v3.json`.

## Referencias congeladas y alcance

Antes de editar se COPIARON los 64 archivos de la entrega v2 a `v2/`, incluido `proceso/`. Se comprobaron sus SHA-256 con `proceso/v2-sha256.json`: cero diferencias. `v1/` permanece intacto (38 hashes verificados). No se ejecutaron comandos git. Archivos de trabajo, scripts y entregables se escribieron exclusivamente dentro de `diseno/montana/`; la herramienta de imagen conserva además sus salidas automáticas de servicio, de las que se copiaron los originales aquí.

## Método y preservación

1. Reparación 1–2: recorte de ancho completo `(0,1850)-(1536,2300)`. Se pidió editar solo x=0–700, y=1900–2200 global. La herramienta no expone un parámetro de máscara; se restringió por prompt y se impuso la máscara exacta al pegar. Su salida panorámica incluyó márgenes blancos: se recortaron las filas 42–679 del original 2172 × 724 y se normalizó el contenido a 1536 × 450 con Lanczos. Máscara de coseno con **70 px de feather hacia dentro**, sin extender ninguna modificación fuera de la zona autorizada. Se conservó la senda píxel por píxel. Los afloramientos se prolongan en dedos desiguales, con lenguas de hierba y piedras dispersas. La reparación también se refleja únicamente en la zona correspondiente de los archivos 01 y 02.

2. 05 y 06: se copiaron las últimas **768 filas** del segmento anterior al comienzo de un lienzo 1536 × 2048; el resto gris era área de relleno. Se usó la misma referencia fija de hierba de v2 para limitar deriva cromática. Un intento para cada continuación; ambos elegidos tras revisión. Se pidió explícitamente el **tamaño más grande y la calidad más alta**. La herramienta no ofrece controles `size`/`quality`: devolvió ambos a **1086 × 1448 px**. Se ampliaron con Lanczos; no se añadió enfoque, textura ni ajuste de color.

3. Montaje con posiciones fijas de v2: píxeles propios del segmento anterior conservados en el solapamiento, salvo sus últimas **160 filas**, mezcladas con rampa de coseno. El resto del solapamiento generado se descarta. No se desplazan los claros. Los archivos 03 y 04 son idénticos byte a byte a v2; toda la tira anterior a y=5730 es idéntica salvo la máscara de reparación. **Cero píxeles cambiados fuera de las regiones autorizadas.**

4. Las nuevas praderas tienen bordes diagonales y sinuosos, árboles y arbustos aislados de tamaños/espaciados variables; no hay setos transversales ni campos rectangulares. La ladera conserva ondulaciones y luz superior izquierda. 06 se suaviza hacia el fondo del valle y lleva un arroyo pequeño irregular por la derecha. La senda toca el claro derecho en un giro, continúa por su margen izquierdo y se desvanece en el prado inferior.

## Uniones y revisión de costuras

Se miraron las cinco franjas de unión de ancho completo y los recortes de senda a resolución de archivo (100%), además de la tira y las costuras reducidas. También se revisó la reparación a ambas escalas. No se observan cortes, bandas, dobles sendas ni saltos de color/brillo. La revisión independiente de las dos nuevas uniones coincidió. Las métricas son diagnósticas, no sustituyen la inspección visual.

| Unión | Inicio solapamiento | Feather global | Centro y | MAD fila adyacente | MAD40 |
|---|---:|---|---:|---:|---:|
| 1–2 | 1281 | 1888–2047 | 1968 | 8.124 | 25.513 |
| 2–3 | 2561 | 3169–3328 | 3249 | 5.258 | 20.765 |
| 3–4 | 3842 | 4449–4608 | 4529 | 4.733 | 15.893 |
| 4–5 | 5122 | 5730–5889 | 5810 | 4.044 | 15.186 |
| 5–6 | 6402 | 7010–7169 | 7090 | 2.617 | 11.706 |

`MAD40 = mean(abs(RGB[y-40:y] - RGB[y:y+40]))`, escala 0–255. Recortes finales en `costuras/` y `detalles/senda-union-*.png`.

## Comprobación de líneas rectas

Se ejecutó Canny + HoughLinesP multiescala y un escaneo horizontal/vertical de diferencias de luminancia y textura local. Umbral de longitud **>250 px**, soporte mínimo 75%, promedio longitudinal 51 px; se consolidan respuestas vecinas. El cielo se excluye del escaneo horizontal (y<650); no contiene límites de terreno. Parámetros completos y todas las detecciones sin consolidar en `proceso/auditoria-v3.json`.

Calibración sobre v2: detectó el corte rocoso `(34,2046)–(502,2046)` (468 px), y las bandas inferiores `(674,7182)–(1192,7182)` (518 px) y `(154,7210)–(570,7210)` (416 px). Ninguno de esos tres límites persiste como detección en la final.

La final produjo **19 candidatos**; se inspeccionó cada uno en un recorte sin redimensionar. **Cero límites rectos reales de terreno confirmados**: las respuestas corresponden a curvas de senda o relieves/copas discontinuos. Se reportan todos los candidatos consolidados, incluso los falsos positivos:

| Nº | Eje | Desde (x,y) | Hasta (x,y) | Longitud px | Clasificación visual |
|---|---|---|---|---:|---|
| 1 | H | (851,650) | (1232,650) | 382 | Transición entre afloramientos de cumbre y hierba; las rocas forman entrantes y salientes a distintas alturas, sin borde horizontal continuo. |
| 2 | H | (1265,698) | (1535,698) | 271 | Roca y prado sobre ladera oblicua. El detector cruza varios salientes de roca; el límite real desciende hacia la derecha. |
| 3 | V | (946,1401) | (946,1657) | 257 | Fracturas y pequeñas placas de roca distribuidas en diagonal; no aparece un borde vertical que siga x=946 durante toda la longitud. |
| 4 | V | (130,1490) | (130,1869) | 380 | Grandes placas inclinadas con grietas naturales, orientadas diagonalmente. El contraste forma parte de la pared rocosa, sin corte vertical. |
| 5 | H | (698,1510) | (958,1510) | 261 | La senda atraviesa el recorte de izquierda a derecha y gira hacia abajo. La respuesta horizontal corresponde al tramo de la curva y a rocas próximas. |
| 6 | H | (1249,1686) | (1535,1686) | 287 | Mosaico de roca fracturada, sombra y lenguas de hierba. No hay una discontinuidad horizontal recta a y=1686. |
| 7 | V | (1102,2637) | (1102,2987) | 351 | Cambio de dirección suave en S de la senda. Los dos bordes se desplazan lateralmente; no forman un límite vertical fijo. |
| 8 | H | (142,3322) | (575,3322) | 434 | Grupo de afloramientos a distintas alturas y separación irregular. El borde inferior de roca y hierba ondula, sin una línea recta continua de 434 px. |
| 9 | V | (190,3993) | (190,4263) | 271 | Borde de sendero en una S alargada; la senda cambia de x claramente entre el principio y el final del recorte. |
| 10 | V | (146,3999) | (146,4279) | 281 | Segundo lado de la misma S; respuesta duplicada al contraste de tierra con hierba. No es una división rectilínea del terreno. |
| 11 | H | (18,4546) | (311,4546) | 294 | Matorral bajo y pequeñas rocas en cresta suave; el gradiente atraviesa objetos separados y relieve irregular. |
| 12 | V | (1298,5025) | (1298,5282) | 258 | La senda gira junto al bosque. La curvatura y la variación de ancho visibles descartan una frontera vertical recta. |
| 13 | V | (1254,5038) | (1254,5289) | 252 | Otro flanco del mismo sendero curvo en el bosque; árboles y arbustos interrumpen cualquier alineación aparente. |
| 14 | V | (1098,5832) | (1098,6091) | 260 | La continuidad 04–05 sigue una curva amplia hacia la izquierda. Los bordes cambian de x; sin salto ni banda vertical. |
| 15 | H | (776,5934) | (1029,5934) | 254 | Dosel de árboles de tamaños variados y suelo con matorral. El contorno del bosque entra y sale, sin borde horizontal que coincida con el candidato. |
| 16 | H | (56,6882) | (308,6882) | 253 | Copas y arbustos dispersos a distintas alturas junto a la senda; la sombra produce el gradiente medio. No hay seto ni fila recta. |
| 17 | H | (511,7018) | (824,7018) | 314 | Islas de árboles separadas y de tamaños distintos sobre la pendiente. El gradiente atraviesa sombras y huecos; no constituye banda forestal horizontal. |
| 18 | V | (142,7265) | (142,7566) | 302 | Senda en S continua descendiendo hacia el valle; cambia de x de manera visible. No corresponde a límite recto de prado. |
| 19 | H | (164,8274) | (456,8274) | 293 | Árboles aislados, matorral y sombra sobre hierba ondulada. El borde real es discontinuo y orgánico, sin corte horizontal de 293 px. |

Revisión individual íntegra: `proceso/auditoria-v3-clasificacion.json`. Lámina de detecciones: `proceso/auditoria-v3.jpg`. Las coordenadas del escáner indican respuestas de gradiente, no segmentos vectoriales de una frontera real. No se ocultaron candidatos ajustando umbrales después de ver la final.

## Senda cada 250 px

Anclas visuales cada 250 px, ayudadas por tono tierra en ventana local y corregidas visualmente. Coordenadas aproximadas, no segmentacion semantica. El tramo de roca de cumbre tiene mayor incertidumbre.

Posiciones revisadas con la lámina `proceso/v3-senda-verificacion.jpg`. Se mantiene una sola senda continua entre muestras y en cada unión. Su extremo inferior se disuelve aproximadamente en `(650,8310)`. El cielo anterior al comienzo de la senda se indica con —.

| y global | x aproximada |
|---:|---:|
| 0 | — |
| 250 | — |
| 500 | 700 |
| 750 | 647 |
| 1000 | 500 |
| 1250 | 722 |
| 1500 | 674 |
| 1750 | 615 |
| 2000 | 686 |
| 2250 | 1073 |
| 2500 | 1208 |
| 2750 | 1067 |
| 3000 | 1057 |
| 3250 | 932 |
| 3500 | 585 |
| 3750 | 92 |
| 4000 | 150 |
| 4250 | 171 |
| 4500 | 452 |
| 4750 | 857 |
| 5000 | 1237 |
| 5250 | 1279 |
| 5500 | 1076 |
| 5750 | 1011 |
| 6000 | 1094 |
| 6250 | 740 |
| 6500 | 366 |
| 6750 | 357 |
| 7000 | 322 |
| 7250 | 189 |
| 7500 | 160 |
| 7750 | 255 |
| 8000 | 342 |
| 8250 | 601 |

## Claros y paneles

`claros.json` conserva el mismo esquema, con `bbox`, `panel_safe_bbox`, `detail_crop_bbox` y medidas HSV. Las cajas exteriores aproximan formas orgánicas; no son máscaras rectangulares del paisaje. Los claros 01–04 conservan sus cajas. Se redujo la caja segura de 06 para evitar la curva final de la senda y el arroyo.

| Claro | bbox (x,y,w,h) | panel_safe_bbox (x,y,w,h) |
|---|---|---|
| 01 | (780,720,730,1060) | (880,840,600,740) |
| 02 | (0,2081,760,1080) | (40,2241,620,800) |
| 03 | (780,3361,756,1080) | (840,3521,640,800) |
| 04 | (20,4642,750,1080) | (100,4842,620,720) |
| 05 | (800,5922,710,1100) | (850,6242,610,650) |
| 06 | (300,7202,1070,1230) | (700,7432,650,900) |

## Textura, comprobaciones y dudas restantes

- No se observan patrones repetidos de motas blancas, clones evidentes ni grandes arrastres pictóricos en 05/06. El detector de componentes claros (V>200 y S<40 en HSV OpenCV, área 2–80 px) encuentra **0** candidatos en las regiones nuevas. No se usa esta cuenta como demostración semántica por sí sola.
- Comparación de teselas nuevas de 64 px: **0 duplicados exactos** y **0 candidatos aproximados** (correlación >0,995 y RMS centrado <2). Es una rejilla y no descarta toda clonación arbitraria; se complementó con revisión visual.
- **Limitación real de resolución:** las continuaciones siguen teniendo origen 1086 × 1448. Su grano de hierba es algo suave a 100%; el escalado a 1536 no crea detalle óptico nativo. No se observan smears pictóricos amplios, pero no se afirma resolución fotográfica nativa de 1536 px.
- Las x de la senda son aproximadas (±15 px, hasta ±25 en roca de cumbre); la continuidad se revisó visualmente y no es una prueba de segmentación automática.
- No queda un defecto geométrico observado que requiera otra regeneración. Las pruebas de bordes y repetición son finitas y se documentan sus límites.

## Reproducción

Con los originales generados guardados en `proceso/`: ejecutar `python diseno/montana/proceso/montar_v3.py`, luego `OPENBLAS_NUM_THREADS=1 python diseno/montana/proceso/verificar_v3.py` y `python diseno/montana/proceso/documentar_v3.py`. La clasificación visual es una revisión humana/asistida guardada, no se recalcula automáticamente. Los scripts sin sufijo `_v3` corresponden al método anterior.

## Prompts exactos

### 05-intento-1

```text
Use case: photographic downward outpaint / precise compositing. Image 1 is EDIT TARGET 1536x2048 portrait, upper 768 rows (37.5%) the exact bottom of approved mountain segment04, remaining region flat gray to REPLACE. Image 2 is ONLY master muted grass color / fine photographic texture reference. Output the full SAME 3:4 canvas at your LARGEST available resolution and HIGHEST quality. Preserve upper photo geometry exactly. Keep scale, oblique drone camera tilt (NOT pure top-down), light upper left, muted natural sage/olive greens, same exposure.
Below gray boundary continue the SAME descending mountainside with soft relief shading and rolling slope; no new horizon. There is ONE narrow tan footpath at x about1050 at gray boundary y768, descending nearly vertically with slight left lean. Continue from EXACT endpoint and tangent: curve right gradually to a smooth switchback touching LEFT margin of the immense RIGHT sloping meadow, then sweep down-left, leaving bottom near x350. One path only, no forks, doubled track or interrupted path.
NEW lower slope is rugged organic WILDERNESS, never agricultural. A huge calm RIGHT hillside meadow occupies approximately x800..1510,y800..1900 of1536x2048 frame, fine irregular natural mountain grass, quiet low contrast panel interior x880..1430,y1100..1750. Its edge must MEANDER markedly, irregular asymmetric lobes and grass tongues, scattered trees of different size, shrubs varying in spacing OUTSIDE calm interior. The left forest follows irregular diagonal fingers of slope, never a rectangle. Visible gentle convex/concave relief and grass tonal shading consistent with upper-left light. Do NOT put any crosswise tree belt at bottom; meadow continues toward bottom right, forest fingers fade into isolated shrubs at differing heights. NO straight forest edges, horizontal bands, horizontal hedgerows across frame, right-angle corners, planted rows, rectangular fields, level farmland, mown lawn, uniform artificial oval.
Actual unretouched aerial PHOTO. Fine real tree crowns and grass grain, not illustration or CGI. No repeated white dots, white flowers, regularly spaced pebbles, cloned texture, paint strokes or smears. No text, people, animals, buildings, roads, fences, signs, frames, watermarks. Seamless continuation at y768 is essential. Do not brighten or saturate new area.
```

### reparacion-intento-1

```text
Use case precise-object-edit / photographic inpainting. Input is full-width 1536x450 crop from a tall continuous photorealistic mountain. Return EXACT same panoramic crop composition and aspect (1536:450), largest available size and highest photographic quality.
ONLY EDIT LEFT zone x0..700,y50..350 of this crop. There is an unnaturally straight almost horizontal cutoff at y150..230 where rocky mountainside meets grass on left. Break up just that straight boundary: irregular fractured gray rock outcrop fingers descend at varying heights, grass tongues climb between rocks, a few scattered natural gray stones and small grass tufts, following existing oblique slope. Keep existing rock face above, match surroundings color, scale, texture and light upper-left. Make transition organically irregular, no straight cutoff, no new horizontal edge at bottom or right of edit. Gradually fade stone frequency into grass. The intended repaired line must be unmistakably organic.
KEEP SINGLE TAN TRAIL AND ENTIRE RIGHT SIDE AND ALL PIXELS OUTSIDE x0..700,y50..350 UNCHANGED. Do not move camera, shift, crop, zoom, relight, or recolor. Grass below stays natural muted green and photographic fine texture. No white-dot repetitions, cloned texture, painted smears. No new objects, trees, text, people, animals, structures, fences, watermark. This is localized repair, never full-scene remake.
```

### 06-intento-1

```text
Use case photographic downward outpaint / precise compositing. Image1 EDIT TARGET: full1536x2048 portrait3:4, upper768rows (37.5%) actual bottom of preceding mountainside photo, remaining flat gray blank to replace. Image2 ONLY master grass muted color and fine photo texture reference. LARGEST available output size, HIGHEST quality. Output SAME full3:4 frame. Keep existing top photograph pixel geometry and camera tilt, illumination upper-left, muted greens and exposure.
Continue DOWN slope naturally to gentler valley floor, never reset to vertical top-down camera. There is exactly ONE tan hiking trail at x230,y768 at gray boundary, tangent down-left. Continue precisely from that endpoint and tangent. It descends along LEFT edge of the broad valley meadow, bending subtly left then curving gently toward x650 near bottom, terminating naturally in meadow around y1970, without continuing out of frame. Keep it narrow, visible, organic, no forks, no second path.
The huge meadow occupies x300..1370,y800..2030, irregular asymmetric organic boundaries. Low-contrast natural fine unmown grass, calm interior x470..1250,y1080..1940 for later panel. Soft undulating relief shading: this is gentlest valley of descending mountain, never a flat farm field. Forest left edge and right edge meander in depth, made of individual differently sized irregularly spaced trees and shrubs, long tongues of meadow and diagonal fingers of forest. NO continuous tree row across width at any height. NO horizontal forest band, hedgerow, right angles, rectangular field, farm, planted tree row, uniform oval or mown lawn. Keep entire top of new meadow open, connected to above meadow by irregular grass tongues; do not enclose it with crosswise trees. Several isolated shrubs only OUTSIDE panel.
A small NATURAL winding stream hugs far RIGHT side x1440..1530, with irregular rocky banks, subtle muted water glints, flowing down and exiting bottom right. Stream narrow, no broad river, no straight ditch. Camera maintains oblique aerial view and changing ground relief.
Actual unretouched aerial photograph: authentic grass grain, detailed trees and earth, no white dots or flowers, repeated pebbles, cloned texture, painterly swirls, smears, CGI or illustration. Match top photo light and subdued color, no brighter or more saturated green. No text, people, animals, buildings, roads, fences, signs, frames, watermarks.
```

