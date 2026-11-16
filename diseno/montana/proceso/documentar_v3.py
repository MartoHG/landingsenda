from pathlib import Path
from PIL import Image, ImageDraw
import json, hashlib
import numpy as np

P=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((P/p).read_text())
im=Image.open(P/'montana-completa.png')
a=load('proceso/auditoria-v3.json')
c=load('proceso/auditoria-v3-clasificacion.json')
m=load('proceso/montaje-v3.json')
s=load('proceso/senda-v3.json')
# Correcciones visuales de dos anclas donde roca/arbustos confundieron el tono.
for pt in s['puntos']:
    if pt['y']==500:pt['x']=700
    if pt['y']==6250:pt['x']=740
    if pt['x'] is not None:pt['observacion']='centro aproximado revisado visualmente; tolerancia 15 px (25 px en roca de cumbre)'
s['metodo']='Anclas visuales cada 250 px, ayudadas por tono tierra en ventana local y corregidas visualmente. Coordenadas aproximadas, no segmentacion semantica. El tramo de roca de cumbre tiene mayor incertidumbre.'
(P/'proceso/senda-v3.json').write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
preview=im.resize((768,4225),Image.Resampling.LANCZOS);d=ImageDraw.Draw(preview)
for pt in s['puntos']:
    if pt['x'] is None:continue
    x,y=pt['x']/2,pt['y']/2
    d.ellipse((x-4,y-4,x+4,y+4),outline='#ff6060',width=2)
    d.text((x+7,y-4),f"{pt['y']}: {pt['x']}",fill='white',stroke_width=1,stroke_fill='black')
preview.save(P/'proceso/v3-senda-verificacion.jpg',quality=95)
# Recortes al 100% centrados en la senda de cada union.
for i,(y,cx) in enumerate(zip(m['uniones'],[675,930,475,1030,270]),1):
    left=max(0,min(936,cx-300));im.crop((left,y-200,left+600,y+200)).save(P/f'detalles/senda-union-{i}.png')
sheet=Image.new('RGB',(768,1100),'white');d=ImageDraw.Draw(sheet)
for i,y in enumerate(m['uniones']):
    sheet.paste(im.crop((0,y-200,1536,y+200)).resize((768,200),Image.Resampling.LANCZOS),(0,i*220+20))
    d.text((8,i*220+3),f'Union {i+1}-{i+2}: y={y}',fill='black')
sheet.save(P/'proceso/costuras-contacto.jpg',quality=95)
clearings=load('claros.json')['clearings']
sheet=im.resize((400,2201),Image.Resampling.LANCZOS);d=ImageDraw.Draw(sheet)
for cl in clearings:
    for key,col in [('bbox','white'),('panel_safe_bbox','#ffae00')]:
        b=cl[key];r=400/1536;d.rectangle((b['x']*r,b['y']*r,(b['x']+b['width'])*r,(b['y']+b['height'])*r),outline=col,width=1)
sheet.save(P/'proceso/claros-revision.jpg',quality=95)
old=load('proceso/v1-sha256.json')
bad=[name for name,h in old.items() if hashlib.sha256((P/'v1'/name).read_bytes()).hexdigest()!=h]
assert not bad,bad
assert a['preservation']['unchanged_outside_authorized_regions']
assert not a['preservation']['frozen_v2_mismatches']
metrics={'tamano':list(im.size),'montaje':m,'uniones':a['junctions'],'conservacion':a['preservation'],'v1_archivos_intactos':len(old),'rectas':a['straight_line_check'],'clasificacion_visual':c,'texturas':a['patches'],'motas':a['white_specks'],'senda':s}
(P/'proceso/mediciones.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n')
lines=['# Montaña continua — reparación y continuaciones orgánicas (v3)','',
'Entregable final: **1536 × 8450 px**, seis segmentos de **1536 × 2048 px**, PNG RGB y preview JPEG de **400 px**. Generación/edición con `image_gen.imagegen` (herramienta incorporada); prompts exactos al final y en `proceso/prompts-v3.json`.','',
'## Referencias congeladas y alcance','',
f'Antes de editar se COPIARON los 64 archivos de la entrega v2 a `v2/`, incluido `proceso/`. Se comprobaron sus SHA-256 con `proceso/v2-sha256.json`: cero diferencias. `v1/` permanece intacto ({len(old)} hashes verificados). No se ejecutaron comandos git. Archivos de trabajo, scripts y entregables se escribieron exclusivamente dentro de `diseno/montana/`; la herramienta de imagen conserva además sus salidas automáticas de servicio, de las que se copiaron los originales aquí.','',
'## Método y preservación','',
'1. Reparación 1–2: recorte de ancho completo `(0,1850)-(1536,2300)`. Se pidió editar solo x=0–700, y=1900–2200 global. La herramienta no expone un parámetro de máscara; se restringió por prompt y se impuso la máscara exacta al pegar. Su salida panorámica incluyó márgenes blancos: se recortaron las filas 42–679 del original 2172 × 724 y se normalizó el contenido a 1536 × 450 con Lanczos. Máscara de coseno con **70 px de feather hacia dentro**, sin extender ninguna modificación fuera de la zona autorizada. Se conservó la senda píxel por píxel. Los afloramientos se prolongan en dedos desiguales, con lenguas de hierba y piedras dispersas. La reparación también se refleja únicamente en la zona correspondiente de los archivos 01 y 02.','',
'2. 05 y 06: se copiaron las últimas **768 filas** del segmento anterior al comienzo de un lienzo 1536 × 2048; el resto gris era área de relleno. Se usó la misma referencia fija de hierba de v2 para limitar deriva cromática. Un intento para cada continuación; ambos elegidos tras revisión. Se pidió explícitamente el **tamaño más grande y la calidad más alta**. La herramienta no ofrece controles `size`/`quality`: devolvió ambos a **1086 × 1448 px**. Se ampliaron con Lanczos; no se añadió enfoque, textura ni ajuste de color.','',
'3. Montaje con posiciones fijas de v2: píxeles propios del segmento anterior conservados en el solapamiento, salvo sus últimas **160 filas**, mezcladas con rampa de coseno. El resto del solapamiento generado se descarta. No se desplazan los claros. Los archivos 03 y 04 son idénticos byte a byte a v2; toda la tira anterior a y=5730 es idéntica salvo la máscara de reparación. **Cero píxeles cambiados fuera de las regiones autorizadas.**','',
'4. Las nuevas praderas tienen bordes diagonales y sinuosos, árboles y arbustos aislados de tamaños/espaciados variables; no hay setos transversales ni campos rectangulares. La ladera conserva ondulaciones y luz superior izquierda. 06 se suaviza hacia el fondo del valle y lleva un arroyo pequeño irregular por la derecha. La senda toca el claro derecho en un giro, continúa por su margen izquierdo y se desvanece en el prado inferior.','',
'## Uniones y revisión de costuras','',
'Se miraron las cinco franjas de unión de ancho completo y los recortes de senda a resolución de archivo (100%), además de la tira y las costuras reducidas. También se revisó la reparación a ambas escalas. No se observan cortes, bandas, dobles sendas ni saltos de color/brillo. La revisión independiente de las dos nuevas uniones coincidió. Las métricas son diagnósticas, no sustituyen la inspección visual.','',
'| Unión | Inicio solapamiento | Feather global | Centro y | MAD fila adyacente | MAD40 |',
'|---|---:|---|---:|---:|---:|']
for i,(y,start,end) in enumerate(zip(m['uniones'],[1281,2561,3842,5122,6402],[2048,3329,4609,5890,7170])):
    j=a['junctions'][i];lines.append(f"| {i+1}–{i+2} | {start} | {end-160}–{end-1} | {y} | {j['adjacent_row_MAD']:.3f} | {j['MAD40']:.3f} |")
lines+=['','`MAD40 = mean(abs(RGB[y-40:y] - RGB[y:y+40]))`, escala 0–255. Recortes finales en `costuras/` y `detalles/senda-union-*.png`.','',
'## Comprobación de líneas rectas','',
'Se ejecutó Canny + HoughLinesP multiescala y un escaneo horizontal/vertical de diferencias de luminancia y textura local. Umbral de longitud **>250 px**, soporte mínimo 75%, promedio longitudinal 51 px; se consolidan respuestas vecinas. El cielo se excluye del escaneo horizontal (y<650); no contiene límites de terreno. Parámetros completos y todas las detecciones sin consolidar en `proceso/auditoria-v3.json`.','',
'Calibración sobre v2: detectó el corte rocoso `(34,2046)–(502,2046)` (468 px), y las bandas inferiores `(674,7182)–(1192,7182)` (518 px) y `(154,7210)–(570,7210)` (416 px). Ninguno de esos tres límites persiste como detección en la final.','',
'La final produjo **19 candidatos**; se inspeccionó cada uno en un recorte sin redimensionar. **Cero límites rectos reales de terreno confirmados**: las respuestas corresponden a curvas de senda o relieves/copas discontinuos. Se reportan todos los candidatos consolidados, incluso los falsos positivos:','',
'| Nº | Eje | Desde (x,y) | Hasta (x,y) | Longitud px | Clasificación visual |',
'|---|---|---|---|---:|---|']
classitems=c['candidatos']
# La clasificación independiente puede usar claves españolas; siempre guardar
# también el JSON íntegro enlazado, sin perder ninguna observación.
observations=[
'Roca/hierba irregular de cumbre; sin borde continuo',
'Roca y relieve discontinuos de cumbre',
'Textura y relieve del prado; sin límite real',
'Fracturas y salientes rocosos discontinuos',
'Curva de senda alpina',
'Roca/hierba irregular en ladera',
'Afloramientos rocosos discontinuos',
'Relieve y roca/hierba irregular; región aprobada',
'Senda curva en S',
'Senda curva en S',
'Rocas y arbustos discontinuos',
'Senda curva al margen del bosque',
'Senda curva al margen del bosque',
'Senda curva junto al claro 05',
'Copas individuales y sombra irregular',
'Bosque y relieve discontinuos',
'Islas separadas de árboles y arbustos',
'Curva en S de la senda inferior',
'Arbustos aislados; sin límite transversal']
for i,(r,item) in enumerate(zip(a['straight_line_check']['candidates'],classitems),1):
    assert r['coords']==item['coords']
    obs=item['observacion']
    x1,y1,x2,y2=r['coords'];lines.append(f"| {i} | {'H' if r['axis']=='horizontal' else 'V'} | ({x1},{y1}) | ({x2},{y2}) | {r['length_px']:.0f} | {obs} |")
lines+=['','Revisión individual íntegra: `proceso/auditoria-v3-clasificacion.json`. Lámina de detecciones: `proceso/auditoria-v3.jpg`. Las coordenadas del escáner indican respuestas de gradiente, no segmentos vectoriales de una frontera real. No se ocultaron candidatos ajustando umbrales después de ver la final.','',
'## Senda cada 250 px','',s['metodo'],'',
'Posiciones revisadas con la lámina `proceso/v3-senda-verificacion.jpg`. Se mantiene una sola senda continua entre muestras y en cada unión. Su extremo inferior se disuelve aproximadamente en `(650,8310)`. El cielo anterior al comienzo de la senda se indica con —.','',
'| y global | x aproximada |','|---:|---:|']
for pt in s['puntos']:lines.append(f"| {pt['y']} | {pt['x'] if pt['x'] is not None else '—'} |")
lines+=['','## Claros y paneles','',
'`claros.json` conserva el mismo esquema, con `bbox`, `panel_safe_bbox`, `detail_crop_bbox` y medidas HSV. Las cajas exteriores aproximan formas orgánicas; no son máscaras rectangulares del paisaje. Los claros 01–04 conservan sus cajas. Se redujo la caja segura de 06 para evitar la curva final de la senda y el arroyo.','',
'| Claro | bbox (x,y,w,h) | panel_safe_bbox (x,y,w,h) |','|---|---|---|']
for cl in clearings:
    fmt=lambda b:','.join(str(b[k]) for k in ('x','y','width','height'))
    lines.append(f"| {cl['id']} | ({fmt(cl['bbox'])}) | ({fmt(cl['panel_safe_bbox'])}) |")
lines+=['','## Textura, comprobaciones y dudas restantes','',
f"- No se observan patrones repetidos de motas blancas, clones evidentes ni grandes arrastres pictóricos en 05/06. El detector de componentes claros (V>200 y S<40 en HSV OpenCV, área 2–80 px) encuentra **{a['white_specks']['count']}** candidatos en las regiones nuevas. No se usa esta cuenta como demostración semántica por sí sola.",
f"- Comparación de teselas nuevas de 64 px: **{len(a['patches']['exact_duplicates'])} duplicados exactos** y **{len(a['patches']['approximate_candidates'])} candidatos aproximados** (correlación >0,995 y RMS centrado <2). Es una rejilla y no descarta toda clonación arbitraria; se complementó con revisión visual.",
'- **Limitación real de resolución:** las continuaciones siguen teniendo origen 1086 × 1448. Su grano de hierba es algo suave a 100%; el escalado a 1536 no crea detalle óptico nativo. No se observan smears pictóricos amplios, pero no se afirma resolución fotográfica nativa de 1536 px.',
'- Las x de la senda son aproximadas (±15 px, hasta ±25 en roca de cumbre); la continuidad se revisó visualmente y no es una prueba de segmentación automática.',
'- No queda un defecto geométrico observado que requiera otra regeneración. Las pruebas de bordes y repetición son finitas y se documentan sus límites.','',
'## Reproducción','',
'Con los originales generados guardados en `proceso/`: ejecutar `python diseno/montana/proceso/montar_v3.py`, luego `OPENBLAS_NUM_THREADS=1 python diseno/montana/proceso/verificar_v3.py` y `python diseno/montana/proceso/documentar_v3.py`. La clasificación visual es una revisión humana/asistida guardada, no se recalcula automáticamente. Los scripts sin sufijo `_v3` corresponden al método anterior.','',
'## Prompts exactos','']
for pr in load('proceso/prompts-v3.json'):lines += [f"### {pr['id']}",'','```text',pr['prompt'],'```','']
(P/'NOTAS.md').write_text('\n'.join(lines)+'\n')
files=[P/'NOTAS.md',P/'claros.json',P/'montana-completa.png',P/'montana-preview.jpg']
for sub in ['segmentos','costuras','detalles']:files+=sorted((P/sub).glob('*'))
(P/'proceso/entrega-v3-sha256.json').write_text(json.dumps({str(f.relative_to(P)):hashlib.sha256(f.read_bytes()).hexdigest() for f in files if f.is_file()},indent=2)+'\n')
print('Documentado:',len(files),'entregables; v1/v2 intactos; restricciones verificadas.')
