from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import json

ROOT=Path(__file__).resolve().parents[1]
W,H,O,F=1536,2048,768,160
names=['01-cumbre','02-alto','03-medio','04-bosque','05-bajo','06-valle']
paths=[ROOT/'segmentos'/f'{n}.png' for n in names]
strip=np.array(Image.open(paths[0]).convert('RGB'))
starts=[0]; joins=[]
for i,p in enumerate(paths[1:],1):
    b=np.array(Image.open(p).convert('RGB'),dtype=np.float32)
    oldh=strip.shape[0]
    # Buscar el desplazamiento vertical que minimiza el error absoluto RGB.
    scores=[]
    for d in range(-64,65):
        a=strip[oldh-O+64+d:oldh-64+d:4,::4].astype(np.float32)
        scores.append((float(np.abs(a-b[64:O-64:4,::4]).mean()),d))
    score,dy=min(scores)
    start=oldh-O+dy; overlap=oldh-start
    # Sin correccion de color: conservar pixels originales anteriores.
    delta=np.zeros(3,dtype=np.float32)
    out=np.empty((start+H,W,3),dtype=np.uint8)
    out[:oldh]=strip
    out[oldh:]=np.rint(b[overlap:]).astype(np.uint8)
    t=np.linspace(0,1,F,dtype=np.float32)
    alpha=((1-np.cos(np.pi*t))/2)[:,None,None]
    out[oldh-F:oldh]=np.rint(strip[oldh-F:].astype(np.float32)*(1-alpha)+b[overlap-F:overlap]*alpha).astype(np.uint8)
    seam=oldh-F//2
    joins.append({'union':f'{i}-{i+1}','y':seam,'fin_solapamiento_y':oldh,'inicio_solapamiento_y':start,'feather_inicio_y':oldh-F,'feather_fin_y':oldh,'offset_vertical_px':dy,'MAD_alineacion_antes_color':score,'correccion_RGB':delta.tolist()})
    starts.append(start); strip=out

im=Image.fromarray(strip)
im.save(ROOT/'montana-completa.png')
im.resize((400,round(im.height*400/W)),Image.Resampling.LANCZOS).save(ROOT/'montana-preview.jpg',quality=94,subsampling=0)
for j in joins:
    im.crop((0,j['y']-200,W,j['y']+200)).save(ROOT/'costuras'/f"costura-{j['union']}.png")

def metric(y):
    return float(np.abs(strip[y-40:y].astype(np.float32)-strip[y:y+40].astype(np.float32)).mean())
def rowstep(y):
    return float(np.abs(strip[y-1].astype(np.float32)-strip[y].astype(np.float32)).mean())
rng=np.random.default_rng(20261115)
eligible=np.array([y for y in range(650,im.height-40) if all(abs(y-j['y'])>250 for j in joins)])
ys=sorted(rng.choice(eligible,120,replace=False).tolist())
normal=[metric(y) for y in ys]
q1,q3=np.percentile(normal,[25,75])
baseline={'semilla':20261115,'n':len(ys),'media':float(np.mean(normal)),'mediana':float(np.median(normal)),'p95':float(np.percentile(normal,95)),'p99':float(np.percentile(normal,99)),'limite_atipico_Tukey':float(q3+1.5*(q3-q1)),'min':min(normal),'max':max(normal),'muestras':[{'y':y,'MAD40':v} for y,v in zip(ys,normal)]}
for i,j in enumerate(joins):
    y=j['y'];j['MAD40']=metric(y);j['MAD_fila_adyacente']=rowstep(y)
    j['MAD40_fin_solapamiento']=metric(j['fin_solapamiento_y'])
    j['MAD40_inicio_feather']=metric(j['feather_inicio_y'])
    candidates=[k for k in range(max(650,y-650),min(im.height-40,y+650)) if abs(k-y)>250]
    localys=sorted(rng.choice(candidates,40,replace=False).tolist())
    local=[metric(k) for k in localys]
    j['referencia_local_mediana']=float(np.median(local));j['referencia_local_p95']=float(np.percentile(local,95))
    j['alerta_exploratoria_P95']=j['MAD40']>max(baseline['p95'],j['referencia_local_p95'])
    # Control de textura: el mismo terreno ANTES de mezclar no contiene costura.
    source=np.asarray(Image.open(paths[i]),dtype=np.float32)
    sy=H-F//2
    control=float(np.abs(source[sy-40:sy]-source[sy:sy+40]).mean())
    j['MAD40_mismo_terreno_sin_costura']=control
    j['diferencia_con_control']=j['MAD40']-control
    near=[k for k in range(y-350,y+351) if abs(k-y)>180]
    nearrows=sorted(rng.choice(near,80,replace=False).tolist())
    nearvals=[metric(k) for k in nearrows]
    j['referencia_cercana_aleatoria']={'n':80,'mediana':float(np.median(nearvals)),'p95':float(np.percentile(nearvals,95)),'muestras':[{'y':k,'MAD40':v} for k,v in zip(nearrows,nearvals)]}
    j['textura_equivalente_al_control_sin_costura']=abs(j['diferencia_con_control'])<2
report={'tamano':[im.width,im.height],'segmentos':[{'nombre':n,'y_inicio':s,'tamano':[W,H]} for n,s in zip(names,starts)],'solapamiento_entrada':O,'feather_coseno_px':F,'formula_MAD40':'mean(abs(RGB[y-40:y] - RGB[y:y+40])) en escala 0..255','referencia_no_costuras':baseline,'uniones':joins}
(ROOT/'proceso'/'mediciones.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
sheet=Image.new('RGB',(768,5*220),(255,255,255));draw=ImageDraw.Draw(sheet)
for i,j in enumerate(joins):
    crop=im.crop((0,j['y']-200,W,j['y']+200)).resize((768,200),Image.Resampling.LANCZOS)
    sheet.paste(crop,(0,i*220+20));draw.text((8,i*220+3),f"Union {j['union']} y={j['y']} MAD40={j['MAD40']:.2f}",fill=(0,0,0))
sheet.save(ROOT/'proceso'/'costuras-contacto.jpg',quality=95)
print('Tamano:',report['tamano'])
for j in joins:
    print(j['union'],'y=',j['y'],'offset=',j['offset_vertical_px'],'MAD40=',round(j['MAD40'],3),'control=',round(j['MAD40_mismo_terreno_sin_costura'],3),'textura_equivalente=',j['textura_equivalente_al_control_sin_costura'])
print('Referencia:',{k:v for k,v in baseline.items() if k!='muestras'})
