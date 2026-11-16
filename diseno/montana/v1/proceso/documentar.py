from pathlib import Path
from PIL import Image, ImageDraw
import json

R=Path(__file__).resolve().parents[1]
m=json.loads((R/'proceso/mediciones.json').read_text())
p=json.loads((R/'proceso/prompts.json').read_text())
boxes=[(780,720,730,960),(0,850,760,960),(780,830,756,980),(30,800,740,1080),(800,800,700,1080),(300,850,1060,1180)]
safe=[(900,850,550,650),(60,960,610,650),(940,990,540,660),(80,950,650,820),(850,1050,610,740),(400,1100,920,900)]
sides=['right','left','right','left','right','bottom']
clearings=[]
sheet=Image.new('RGB',(3*384,2*540),'white');draw=ImageDraw.Draw(sheet)
for i,(s,b,q,side) in enumerate(zip(m['segmentos'],boxes,safe,sides)):
    x,y,w,h=b; sx,sy,sw,sh=q; start=s['y_inicio']
    clearings.append({'id':f'{i+1:02d}','segment':s['nombre'],'side':side,'bbox':{'x':x,'y':start+y,'width':w,'height':h},'panel_safe_bbox':{'x':sx,'y':start+sy,'width':sw,'height':sh},'segment_height_fraction':round(h/2048,4)})
    im=Image.open(R/'segmentos'/f"{s['nombre']}.png").resize((384,512),Image.Resampling.LANCZOS)
    d=ImageDraw.Draw(im)
    d.rectangle((x/4,y/4,(x+w)/4,(y+h)/4),outline='red',width=2)
    d.rectangle((sx/4,sy/4,(sx+sw)/4,(sy+sh)/4),outline='cyan',width=2)
    ox=(i%3)*384;oy=(i//3)*540
    sheet.paste(im,(ox,oy+28));draw.text((ox+8,oy+8),s['nombre'],fill='black')
sheet.save(R/'proceso/claros-revision.jpg',quality=95)
data={'image':'montana-completa.png','width':1536,'height':m['tamano'][1],'coordinate_origin':'top-left','units':'pixels','bbox_note':'Limites aproximados del claro natural, con borde irregular. panel_safe_bbox es el rectangulo interior mas conservador para el contenido.','clearings':clearings}
(R/'claros.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

lines=['# Montaña continua: notas de producción','',
'## Archivos y resultado','',
'Tira final: **1536 × 8449 px**, RGB, PNG sin pérdida. Vista rápida: **400 × 2200 px**. Seis segmentos de 1536 × 2048 px. Cinco recortes de costuras de 1536 × 400 px. No se añadieron paneles, texto ni objetos a las imágenes finales.','',
'Se utilizó la herramienta integrada `image_gen.imagegen`. Los originales exactos de cada llamada están en `proceso/*-intento-*.png`; las entradas de continuación están en `proceso/*-entrada.png`.','',
'## Método reproducible','',
'1. Se generó la cumbre y se hizo una segunda edición para ampliar su claro.','2. Para cada continuación se copiaron las últimas **768 filas**, el **37,5 %**, del segmento anterior a la parte superior de un lienzo RGBA de 1536 × 2048. Las restantes 1280 filas quedaron transparentes.','3. Se abrió cada entrada y se envió como imagen de edición a la herramienta, con instrucciones explícitas de conservar el solapamiento píxel por píxel y extender solamente hacia abajo. No hay parámetro de máscara disponible en esta herramienta.','4. La herramienta devolvió 1086 × 1448 px en las seis versiones seleccionadas. Se normalizaron proporcionalmente a 1536 × 2048 mediante Lanczos. No es resolución nativa de 1536 px; los originales sin reescalar se conservan. El primer intento descartado de la cumbre tenía 887 × 1774 px.','5. Como el generador volvió a dibujar parcialmente el solapamiento, se buscó el desplazamiento vertical óptimo en ±64 px, minimizando el error absoluto RGB con muestreo cada 4 píxeles. Los desplazamientos elegidos fueron 1, 0, 0, 1 y -1 px.','6. Se igualó el color mediante un desplazamiento RGB constante obtenido como mediana de las diferencias del solapamiento. Se aplicó a la continuación completa, sin filtros de desenfoque ni alteración del sendero.','7. Cada imagen nueva se superpuso a la anterior y se mezclaron las últimas **256 filas** del solapamiento mediante una rampa de coseno. El solapamiento se incluye una sola vez en la tira.','8. Se inspeccionaron las imágenes generadas, la vista completa reducida y las cinco costuras a su anchura completa. Se verificaron visualmente sendero, árboles, roca, luz, claros y ausencia de elementos prohibidos.','',
'Los scripts `proceso/preparar.py`, `proceso/montar.py` y `proceso/documentar.py` reproducen preparación, montaje, mediciones y documentación a partir de los originales conservados. No realizan llamadas de generación.','',
'## Coordenadas de las uniones','',
'La coordenada de unión corresponde al centro de la transición de 256 px. También se indica el final del solapamiento, donde empiezan las filas completamente nuevas. Todas las coordenadas son desde arriba, con origen 0.','',
'| Unión | Inicio solapamiento | Transición | Unión y | Filas nuevas desde y | Offset | Ajuste RGB |','|---|---:|---|---:|---:|---:|---|']
for j in m['uniones']:
    lines.append(f"| {j['union']} | {j['inicio_solapamiento_y']} | {j['feather_inicio_y']}–{j['feather_fin_y']-1} | {j['y']} | {j['fin_solapamiento_y']} | {j['offset_vertical_px']} | {j['correccion_RGB']} |")
lines+=['','## Claros y zonas para paneles','',
'Las cajas describen el claro natural de contorno irregular. Se incluye además `panel_safe_bbox`, un rectángulo interior más pequeño y conservador, para reducir la posibilidad de colocar contenido sobre el sendero, árboles o bordes rocosos. Ninguna caja del claro cruza el centro de una unión. Las cajas son estimaciones visuales, no máscaras de segmentación.','',
'| Claro | Lado | Caja x, y, ancho, alto | Área interior recomendada | Alto del claro / segmento |','|---|---|---|---|---:|']
for c in clearings:
    b=c['bbox'];q=c['panel_safe_bbox']
    lines.append(f"| {c['id']} | {c['side']} | {tuple(b.values())} | {tuple(q.values())} | {100*c['segment_height_fraction']:.1f}% |")
lines+=['','## Comprobación numérica de costuras','',
'Métrica solicitada: `MAD40(y) = mean(abs(RGB[y-40:y] - RGB[y:y+40]))`, comparando dos bandas de 40 filas y todos sus canales, con valores RGB de 0 a 255. Una textura rocosa puede dar valores altos aunque no haya ninguna costura. No se suavizó la imagen para reducir esta medida.','',
f"Referencia global: 120 filas aleatorias sin costuras, semilla 20261115, media {m['referencia_no_costuras']['media']:.3f}, mediana {m['referencia_no_costuras']['mediana']:.3f}, P95 {m['referencia_no_costuras']['p95']:.3f}, P99 {m['referencia_no_costuras']['p99']:.3f}, rango {m['referencia_no_costuras']['min']:.3f}–{m['referencia_no_costuras']['max']:.3f}.",'',
'En el control exploratorio las tres primeras uniones superaron el P95 global y el de una muestra local amplia. Esa alerta se investigó: al medir exactamente el mismo terreno en el segmento original antes de unirlo, los resultados fueron prácticamente iguales. También se tomaron 80 filas aleatorias cercanas a cada unión, fuera de la transición y de la banda de medida.','',
'La referencia global mezcla prados tranquilos con roca y bosque, por lo que no basta su P95 para determinar si existe una discontinuidad. Se informa la alerta sin descartarla y se compara también el mismo terreno antes del montaje: las cinco uniones se apartan menos de 1 punto RGB de ese control sin costura. La textura de la propia ladera explica los valores elevados. No se declara que todas estén bajo el P95 global. Los datos y las alertas se conservan en `proceso/mediciones.json`.','',
'| Unión | y | MAD40 final | Mismo terreno sin unión | Diferencia | Mediana aleatoria cercana | P95 cercano | Fila adyacente |','|---|---:|---:|---:|---:|---:|---:|---:|']
for j in m['uniones']:
    n=j['referencia_cercana_aleatoria']
    lines.append(f"| {j['union']} | {j['y']} | {j['MAD40']:.3f} | {j['MAD40_mismo_terreno_sin_costura']:.3f} | {j['diferencia_con_control']:+.3f} | {n['mediana']:.3f} | {n['p95']:.3f} | {j['MAD_fila_adyacente']:.3f} |")
lines+=['','`proceso/mediciones.json` contiene todas las filas aleatorias, valores exactos, valores en los extremos del feather, offsets y ajustes RGB. La lámina `proceso/costuras-contacto.jpg` es solo de revisión; sus rótulos no aparecen en los entregables visuales.','',
'## Iteraciones y límites que permanecen','',
'| Segmento | Llamadas | Regeneraciones / ediciones adicionales | Motivo |','|---|---:|---:|---|','| 01-cumbre | 2 | 1 | Ampliar el claro derecho y ajustar la proporción |','| 02-alto | 1 | 0 | Continuación descendente |','| 03-medio | 1 | 0 | Continuación descendente |','| 04-bosque | 2 | 1 | Se amplió el claro izquierdo |','| 05-bajo | 3 | 2 | Se amplió el claro derecho, se adaptó a 04 y se despejó la salida del sendero |','| 06-valle | 2 | 1 | Se adaptó al nuevo tramo 05 |','',
'No observé cortes, bifurcaciones, nuevas vistas de horizonte, bandas de color ni objetos prohibidos en la revisión final. El sendero llega a los seis espacios y termina gradualmente en el prado inferior.','',
'Quedan estas limitaciones respecto del encargo estricto:','',
'- **Resolución:** la herramienta no respetó los 1536 px nativos pedidos. Los archivos entregados tienen esa anchura mediante ampliación; no se inventa detalle nativo adicional.','- **Conservación exacta:** pedir que el solapamiento permanezca intacto no lo garantiza. Hubo deriva de textura y color; se corrigió al montar, pero las continuaciones originales no conservan todos los píxeles de entrada.','- **Tamaño y forma de los claros:** sus alturas estimadas están entre el 47 % y el 58 % del segmento. Los claros 04 y 05 se ampliaron después de revisar sus cajas. Por tanto, no todos alcanzan literalmente el 50–60 % solicitado. Los rectángulos interiores recomendados para contenido son todavía menores. Los bordes son naturales e irregulares, por lo que no toda la caja grande es superficie uniforme.','- **Aspecto fotográfico:** el conjunto es una imagen sintética; las copas y algunas superficies de hierba siguen siendo bastante uniformes al ampliar. No afirmo que sea indistinguible de una fotografía real en todos los niveles de zoom.','',
'## Prompts exactos','',
'Se transcriben completos, incluidos los intentos descartados. El archivo `proceso/prompts.json` contiene las mismas cadenas para su reutilización.','']
for e in p:
    lines += [f"### {e['segmento']} — intento {e['intento']}",'','```text',e['prompt'].rstrip(),'```','']
(R/'NOTAS.md').write_text('\n'.join(lines))
print('Escritos claros.json, NOTAS.md y proceso/claros-revision.jpg')
