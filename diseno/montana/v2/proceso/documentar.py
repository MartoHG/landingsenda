from pathlib import Path
from PIL import Image, ImageDraw
import json,hashlib,numpy as np
P=Path(__file__).resolve().parents[1]
m=json.loads((P/'proceso/mediciones.json').read_text())
names=[x['nombre'] for x in m['segmentos']]
starts=[x['y_inicio'] for x in m['segmentos']]
image=Image.open(P/'montana-completa.png');a=np.asarray(image)
# Cajas visuales del contorno irregular y rectangulos interiores conservadores.
boxes=[(780,720,730,1060),(0,800,760,1080),(780,800,756,1080),(20,800,750,1080),(800,800,710,1100),(300,800,1070,1230)]
safes=[(880,840,600,740),(40,960,620,800),(840,960,640,800),(100,1000,620,720),(840,1120,620,650),(420,1030,880,920)]
crops=[(880,920),(60,1100),(850,1150),(110,1150),(850,1200),(600,1300)]
clearings=[]
for i,(n,start,b,s,c) in enumerate(zip(names,starts,boxes,safes,crops)):
 def box(v):return dict(zip(['x','y','width','height'],[v[0],v[1]+start,v[2],v[3]]))
 crop=image.crop((c[0],c[1]+start,c[0]+600,c[1]+start+400));crop.save(P/'detalles'/f'claro-{i+1:02d}.png')
 hsv=np.asarray(crop.convert('HSV'))
 clearings.append({'id':f'{i+1:02d}','segment':n,'side':['right','left','right','left','right','bottom'][i],'bbox':box(b),'panel_safe_bbox':box(s),'detail_crop_bbox':box((*c,600,400)),'detail_mean_hsv_saturation':float(hsv[:,:,1].mean()),'detail_mean_hsv_brightness':float(hsv[:,:,2].mean())})
cj={'image':'montana-completa.png','width':image.width,'height':image.height,'coordinate_origin':'top-left','units':'pixels','bbox_note':'Cajas aproximadas del contorno natural irregular. Usar panel_safe_bbox para evitar el sendero y los bordes. Las cajas exteriores no son mascaras ni rectangulos enteramente libres de textura.','clearings':clearings}
(P/'claros.json').write_text(json.dumps(cj,ensure_ascii=False,indent=2))
# Colores sin ninguna correccion; muestras de todo el segmento y su parte nueva.
stats=[]
accepted=[3,4,3,2,3,3]
for i,(n,attempt) in enumerate(zip(names,accepted)):
 im=Image.open(P/'segmentos'/f'{n}.png');hsv=np.asarray(im.convert('HSV'))
 raw=Image.open(P/'proceso'/f'{n}-intento-{attempt}.png')
 stats.append({'segmento':n,'intento_aceptado':attempt,'resolucion_nativa':list(raw.size),'resolucion_entregada':list(im.size),'saturacion_media':float(hsv[:,:,1].mean()),'brillo_medio':float(hsv[:,:,2].mean()),'saturacion_parte_nueva':float(hsv[768:,:,1].mean()),'brillo_parte_nueva':float(hsv[768:,:,2].mean()),'saturacion_claro':clearings[i]['detail_mean_hsv_saturation'],'brillo_claro':clearings[i]['detail_mean_hsv_brightness']})
m['colores_segmentos']=stats
# Se verifica v1 sin cambiar ninguno de sus archivos.
hashes=json.loads((P/'proceso/v1-sha256.json').read_text())
bad=[name for name,h in hashes.items() if hashlib.sha256((P/'v1'/name).read_bytes()).hexdigest()!=h]
assert not bad,bad
m['v1_archivos_intactos']=len(hashes)
# Pertenencia: regiones nuevas de cada original fuera del feather quedan exactas.
checks=[]
for i,(n,start) in enumerate(zip(names,starts)):
 src=np.asarray(Image.open(P/'segmentos'/f'{n}.png'))
 lo=0 if i==0 else m['uniones'][i-1]['fin_solapamiento_y']-start
 hi=2048 if i==5 else 2048-160
 ok=np.array_equal(a[start+lo:start+hi],src[lo:hi])
 assert ok,(n,lo,hi)
 checks.append({'segmento':n,'filas_locales_comprobadas':[lo,hi],'identico':ok})
m['conservacion_pixels_propios']=checks
(P/'proceso/mediciones.json').write_text(json.dumps(m,ensure_ascii=False,indent=2))
# Lamina de composicion unicamente para revision.
sheet=image.resize((400,round(image.height*400/image.width)),Image.Resampling.LANCZOS)
draw=ImageDraw.Draw(sheet)
for c in clearings:
 for key,color in [('bbox','#ffffff'),('panel_safe_bbox','#ffae00')]:
  b=c[key];r=400/image.width;draw.rectangle((round(b['x']*r),round(b['y']*r),round((b['x']+b['width'])*r),round((b['y']+b['height'])*r)),outline=color,width=1)
sheet.save(P/'proceso/claros-revision.jpg',quality=95)
prompts=json.loads((P/'proceso/prompts.json').read_text())
fmt=lambda b:f"({b['x']}, {b['y']}, {b['width']}, {b['height']})"
lines=['# Montaña continua — segunda pasada','',f'Tira final: **{image.width} × {image.height} px**. Seis segmentos de **1536 × 2048 px**. PNG RGB sin pérdida. Preview de 400 px de ancho. Generación con `image_gen.imagegen`, sin herramientas externas de generación.','', '## Archivo de v1 y alcance','',f'Se movieron los {len(hashes)} archivos previos a `v1/` antes de producir nuevos entregables. Todos sus SHA-256 coinciden con el inventario anterior al movimiento (`proceso/v1-sha256.json`). No se modificó ningún archivo de v1. Las escrituras propias se limitaron a `diseno/montana/`; no se ejecutó ningún comando git. El generador conserva sus salidas en su directorio automático de servicio y se copiaron aquí los originales exactos.','', '## Método','', '1. La cumbre tuvo tres intentos: se descartaron dos derivados de v1 por textura y motas; el tercero se generó de nuevo conservando la composición descrita.','2. Para cada continuación se copiaron las últimas 768 filas (37,5%) del segmento previo a la parte superior de un lienzo nuevo. Se usó inicialmente transparencia; al no respetar las proporciones se pasó a un área vacía gris uniforme. Es un marcador de área a completar, no forma parte del paisaje.','3. Cada entrada se abrió y se envió a EDICIÓN, pidiendo conservar la región superior píxel por píxel. No existe parámetro de máscara en la herramienta disponible. Cada continuación final usó además el mismo recorte de hierba de la cumbre como referencia fija de textura/color. Los intentos anteriores con referencia encadenada acumulaban saturación.','4. Se pidió en los prompts el tamaño MÁS GRANDE y la calidad MÁS ALTA. La herramienta solo expone `prompt`, referencias y transparencia; no tiene parámetros explícitos `size`/`quality`. Los seis originales elegidos son 1086 × 1448 px; están intactos en `proceso/*-intento-*.png`. Se ampliaron proporcionalmente a 1536 × 2048 con **Lanczos exclusivamente**. No hubo enfoque, reducción de ruido, textura añadida, corrección RGB, ajuste HSV ni gradación de color.','5. Se buscó el desplazamiento vertical mínimo de error absoluto RGB en ±64 px dentro del solapamiento. El montaje conserva los píxeles del segmento ANTERIOR en todo el solapamiento salvo sus últimos **160 px**, donde se usa una rampa de coseno. La versión regenerada superior solo sirve para alinear y participar en ese feather. No se vuelve a generar una región de salida que ya pertenezca a un tramo anterior.','6. Los scripts `preparar.py`, `montar.py` y `documentar.py` reproducen preparación, montaje, recortes, cajas y mediciones. Ejecutar montaje y luego documentación. Las llamadas generativas y sus referencias quedan registradas por los prompts y archivos de entrada.','7. Se revisaron los seis resultados, recortes de los claros a 100%, las cinco uniones a 1536 × 400 y recortes de senda a 600 × 400. La unión 4–5 se rechazó por un sendero fantasma; se regeneró 05 con geometría de entrada explícita y luego 06 a partir del nuevo 05.','', '## Uniones','', 'La y de unión es el centro de la mezcla. También se controla el comienzo y final de la transición. Origen arriba, cero.','', '| Unión | Inicio solapamiento | Feather | Unión y | Filas nuevas desde | Offset |','|---|---:|---|---:|---:|---:|']
for j in m['uniones']:lines.append(f"| {j['union']} | {j['inicio_solapamiento_y']} | {j['feather_inicio_y']}–{j['feather_fin_y']-1} | {j['y']} | {j['fin_solapamiento_y']} | {j['offset_vertical_px']} |")
lines+=['','## Claros','', 'Cajas estimadas del contorno irregular. Sus lados y tamaños mínimos mantienen la distribución de v1; ninguna cruza una unión. El interior recomendado es menor que la caja exterior y evita sendero y árboles. Los bordes naturales no forman rectángulos.','', '| Claro | Lado | x, y, ancho, alto | Interior para panel |','|---|---|---|---|']
for c in clearings:lines.append(f"| {c['id']} | {c['side']} | {fmt(c['bbox'])} | {fmt(c['panel_safe_bbox'])} |")
lines+=['','## Comprobación numérica','', '`MAD40(y) = mean(abs(RGB[y-40:y] - RGB[y:y+40]))`, en escala 0–255. Bandas sin desenfoque de 40 filas, ancho completo, canales RGB. Muestra global de 120 filas aleatorias fuera de las uniones, semilla 20261115. Se reporta también el mismo terreno del segmento previo sin ninguna costura y una muestra aleatoria local; esto distingue textura rocosa de una discontinuidad añadida.','']
b=m['referencia_no_costuras']
lines+=[f"Referencia global: media **{b['media']:.3f}**, mediana **{b['mediana']:.3f}**, P95 **{b['p95']:.3f}**, P99 **{b['p99']:.3f}**, rango **{b['min']:.3f}–{b['max']:.3f}**.",'','| Unión | MAD40 final | Mismo terreno sin unión | Diferencia | Mediana local | P95 local | Final solapamiento |','|---|---:|---:|---:|---:|---:|---:|']
for j in m['uniones']:
 q=j['referencia_cercana_aleatoria'];lines.append(f"| {j['union']} | {j['MAD40']:.3f} | {j['MAD40_mismo_terreno_sin_costura']:.3f} | {j['diferencia_con_control']:+.3f} | {q['mediana']:.3f} | {q['p95']:.3f} | {j['MAD40_fin_solapamiento']:.3f} |")
lines+=['', 'La unión 1–2 supera el P95 global, pero está por debajo de su P95 local y del control del mismo terreno original. Las otras están por debajo del P95 global. Algunas superan el P95 local porque las muestras cercanas incluyen claros tranquilos. Ninguna añade más de 1 punto RGB al mismo terreno sin costura. No se atribuye un aprobado fotográfico a una cifra: la revisión visual de senda y franjas es independiente. Todas las filas aleatorias y medidas de extremos están en `proceso/mediciones.json`.','', '## Saturación y brillo','', 'Medias HSV de PIL en escala 0–255; V es el máximo RGB, no luminancia perceptual. La medida completa incluye cielo y roca en 01, y proporciones crecientes de bosque en 04–06. Se añaden recortes interiores comparables para no ocultar esa diferencia de contenido. No se aplicó ninguna corrección de color.','', '| Segmento | S completa | V completa | S interior claro | V interior claro |','|---|---:|---:|---:|---:|']
for s in stats:lines.append(f"| {s['segmento']} | {s['saturacion_media']:.2f} | {s['brillo_medio']:.2f} | {s['saturacion_claro']:.2f} | {s['brillo_claro']:.2f} |")
lines+=['', '## Intentos y regeneraciones','', '| Segmento | Intentos | Regeneraciones | Elegido | Motivos |','|---|---:|---:|---:|---|']
reasons=['Textura y motas en dos primeros intentos. Se eligió generación nueva.','Tres pruebas de formato; cuarto con referencia fija.','Formato y deriva de saturación; tercero con referencia fija.','Primero encadenado demasiado saturado; segundo con referencia fija.','Deriva cromática, adaptación de 04, y senda doble en montaje del segundo.','Deriva cromática, adaptación de 05 y nueva salida de senda del 05 definitivo.']
for n,attempt,why in zip(names,accepted,reasons):
 count=sum(x['segmento']==n for x in prompts);lines.append(f'| {n} | {count} | {count-1} | {attempt} | {why} |')
lines+=['', '## Revisión visual y dudas restantes','', '- Se conservaron una sola senda y la continuidad del relieve. No observé bandas duras, repeticiones de áreas, bifurcaciones, texto, marcas, personas, animales, construcciones ni objetos añadidos en los resultados finales. La senda termina en el prado inferior.','- Los recortes de los seis claros y las cinco uniones se miraron a 100%. **No observé el patrón repetido de motas blancas de v1 en los interiores de hierba** ni una textura claramente embaldosada. Quedan piedras grises/pálidas irregulares en la zona alpina y algunas junto al sendero; no se afirma que no haya ningún punto claro natural.','- El montaje evita la pérdida generativa repetida: las regiones propias de cada segmento fuera de las mezclas se comprobaron idénticas píxel por píxel. Solo se combinan las últimas 160 filas del solapamiento.','- **Límite de resolución:** los originales son 1086 px de ancho. La ampliación a 1536 no proporciona detalle óptico nativo adicional. A 100% algunas texturas de hierba continúan siendo blandas y onduladas; no puedo garantizar que toda la tira sea indistinguible de una foto real ni dar por completamente resuelto el aspecto sintético señalado en v1.','- **Color:** la referencia fija redujo la deriva inicial, pero las medias de los claros aún aumentan hacia abajo. No se logró igualdad cromática estricta entre los seis; el bosque es más oscuro y la hierba inferior algo más saturada. Se entrega sin gradación para la intervención humana solicitada.','- La distribución y los tamaños de claros mantienen la intención de v1; las cajas son aproximaciones visuales, no máscaras. Los paneles deberían usar las cajas interiores. El horizonte y la silueta de cumbre cambiaron al generar de nuevo para evitar heredar textura pintada. El cielo estrictamente por encima del punto más alto ocupa aproximadamente 18%, menos que el 25% pedido, aunque el área superior izquierda sigue abierta.','- Por esos límites de textura, color y cielo, esta entrega NO se presenta como cumplimiento perfecto de todos los criterios estrictos. Se conservan todos los intentos y controles para revisión.','', '## Prompts exactos','', 'Se transcriben todos los intentos, incluidos los descartados. `proceso/prompts.json` contiene las mismas cadenas. Referencias: 01 intento1 usa v1/segmentos/01; intento2 usa el intento1; intento3 no tiene referencia. Las continuaciones usan sus lienzos de entrada; a partir de 02 intento4, 03 intento3, 04 intento2, 05 intento2 y 06 intento2 se añade `referencia-hierba.png` como segunda referencia. Las entradas anteriores de 03–06 se guardaron con sufijo `-entrada-anterior`; 06 intento2 usa `-entrada-intento-2.png`. 02 intentos1–2 usaron el lienzo con transparencia y el intento3 el lienzo gris; el intento4 usa `02-alto-entrada-v2.png`.']
for e in prompts:lines += ['',f"### {e['segmento']} — intento {e['intento']}",'','```text',e['prompt'],'```']
(P/'NOTAS.md').write_text('\n'.join(lines)+'\n')
print('V1:',len(hashes),'hashes intactos; pixels propios conservados:',len(checks))
for s in stats:print(s['segmento'],'S,V',round(s['saturacion_media'],2),round(s['brillo_medio'],2),'claro',round(s['saturacion_claro'],2),round(s['brillo_claro'],2))
