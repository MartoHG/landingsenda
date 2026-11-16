from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw

P = Path(__file__).resolve().parents[1]
W, H, F = 1536, 2048, 160
base = np.array(Image.open(P/'v2/montana-completa.png').convert('RGB'))
# La herramienta devolvio el panorama con margenes blancos; quitarlos antes
# de restaurar la geometria original. El contenido es 2172x636.
raw = Image.open(P/'proceso/v3-reparacion-intento-1.png').convert('RGB')
ar = np.asarray(raw)
content = np.where(np.mean(np.min(ar, axis=2) > 248, axis=1) < .95)[0]
rect = (0, int(content[0]), raw.width, int(content[-1]+1))
repair = np.array(raw.crop(rect).resize((W,450),Image.Resampling.LANCZOS))
Image.fromarray(repair).save(P/'proceso/v3-reparacion-escalada.png')
# Feather de coseno de 70 px hacia DENTRO de la mascara autorizada.
# El margen x=0 coincide con el borde de la foto, no con un borde de pegado.
y,x = np.mgrid[0:450,0:W]
dist = np.minimum.reduce([y-50,349-y,699-x]).astype(float)
t = np.clip(dist/70,0,1)
alpha = .5-.5*np.cos(np.pi*t)
alpha[(x>=700)|(y<50)|(y>=350)] = 0
# Excluir explicitamente la senda: conservar todo a su derecha y un corredor
# de 45 px a su izquierda. Otros 70 px de feather evitan borde de exclusion.
trail_y=np.array([1900,1925,1950,1975,2000,2025,2050,2075,2100])
trail_x=np.array([597,640,663,679,685,687,695,724,762])
center=np.interp(y+1850,trail_y,trail_x)
safe_t=np.clip((center-x-45)/70,0,1)
alpha*=.5-.5*np.cos(np.pi*safe_t)
Image.fromarray(np.rint(alpha*255).astype('uint8')).save(P/'proceso/v3-reparacion-feather.png')
crop = base[1850:2300].copy()
fixed = np.rint(crop*(1-alpha[:,:,None])+repair*alpha[:,:,None]).astype('uint8')
base[1850:2300] = fixed
# Mantener archivos 01/02 coherentes con su reparacion local; 03/04 intactos.
for name,start in [('01-cumbre',0),('02-alto',1281)]:
    src=np.array(Image.open(P/f'v2/segmentos/{name}.png'))
    lo,hi=max(1900,start),min(2200,start+H)
    ma=alpha[lo-1850:hi-1850,:,None]
    rr=repair[lo-1850:hi-1850]
    src[lo-start:hi-start]=np.rint(src[lo-start:hi-start]*(1-ma)+rr*ma).astype('uint8')
    Image.fromarray(src).save(P/f'segmentos/{name}.png')
# Coordenadas de v2 fijas: no arrastrar los claros ni alargar la tira.
transitions=[]
for n,start,end in [('05-bajo',5122,5890),('06-valle',6402,7170)]:
    raw=Image.open(P/f'proceso/v3-{n[:2]}-intento-1.png').convert('RGB')
    seg=np.array(raw.resize((W,H),Image.Resampling.LANCZOS))
    Image.fromarray(seg).save(P/f'segmentos/{n}.png')
    a=(.5-.5*np.cos(np.pi*np.linspace(0,1,F)))[:,None,None]
    old=base[end-F:end].copy()
    base[end-F:end]=np.rint(old*(1-a)+seg[end-F-start:end-start]*a).astype('uint8')
    base[end:start+H]=seg[end-start:]
    transitions.append({'segmento':n,'inicio':start,'feather':[end-F,end],'union':end-F//2,'nativo':list(raw.size),'desplazamiento':0})
im=Image.fromarray(base);im.save(P/'montana-completa.png')
im.resize((400,round(im.height*400/W)),Image.Resampling.LANCZOS).save(P/'montana-preview.jpg',quality=94,subsampling=0)
joins=[1968,3249,4529,5810,7090]
for i,j in enumerate(joins,1):
    im.crop((0,j-200,W,j+200)).save(P/f'costuras/costura-{i}-{i+1}.png')
im.crop((0,1850,W,2300)).save(P/'detalles/reparacion-1-2.png')
cj=json.loads((P/'v2/claros.json').read_text())
# Los contornos exteriores mantienen posicion y tamano aproximados; zonas
# interiores finales evitan arboles, senda y arroyo.
cj['clearings'][4]['panel_safe_bbox']={'x':850,'y':6242,'width':610,'height':650}
cj['clearings'][5]['panel_safe_bbox']={'x':700,'y':7432,'width':650,'height':900}
for c in cj['clearings']:
    b=c['detail_crop_bbox']; cr=im.crop((b['x'],b['y'],b['x']+b['width'],b['y']+b['height']))
    cr.save(P/f"detalles/claro-{c['id']}.png")
    hsv=np.array(cr.convert('HSV'));c['detail_mean_hsv_saturation']=float(hsv[:,:,1].mean());c['detail_mean_hsv_brightness']=float(hsv[:,:,2].mean())
(P/'claros.json').write_text(json.dumps(cj,ensure_ascii=False,indent=2)+'\n')
(P/'proceso/montaje-v3.json').write_text(json.dumps({'tamano':list(im.size),'feather_reparacion_px':70,'recorte_margenes_generador':rect,'uniones':joins,'continuaciones':transitions},indent=2)+'\n')
# Revision reducida con coordenadas cada 250 px.
sheet=im.resize((768,4225),Image.Resampling.LANCZOS);d=ImageDraw.Draw(sheet)
for y in range(0,8450,250):
    yy=y//2;d.line((0,yy,767,yy),fill='#e06060',width=1);d.text((4,yy+2),str(y),fill='white',stroke_width=1,stroke_fill='black')
sheet.save(P/'proceso/v3-cuadricula.jpg',quality=95)
print('Montaje',im.size,'reparacion',rect,'transiciones',transitions)
