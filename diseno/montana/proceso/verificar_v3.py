#!/usr/bin/env python3
"""Auditoría reproducible; las detecciones son candidatos, requieren revisión visual."""
from pathlib import Path
import argparse,hashlib,json
import cv2
import numpy as np
from PIL import Image,ImageDraw
cv2.setNumThreads(1)
ROOT=Path(__file__).resolve().parents[1]

def runs(mask):
    ends=np.flatnonzero(np.diff(np.r_[0,np.asarray(mask,dtype=np.int8),0]))
    return ends.reshape(-1,2)

def scan_axis(field,axis,kind,delta,threshold):
    # Comparar bandas separadas, promediar 51 px a lo largo del borde.
    z=field if axis=='horizontal' else field.T
    z=cv2.blur(z,(51,1));d=np.zeros_like(z)
    d[delta:-delta]=z[2*delta:]-z[:-2*delta]
    result=[]
    for row in range(max(50,delta),len(z)-max(50,delta),4):
        # Se omite el cielo, no el terreno, para horizontales.
        if axis=='horizontal' and row<650:continue
        for sign in (1,-1):
            original=(d[row]*sign>=threshold)
            closed=cv2.morphologyEx(original.astype(np.uint8)[None],cv2.MORPH_CLOSE,np.ones((1,25),np.uint8))[0]
            for lo,hi in runs(closed):
                if hi-lo<=250:continue
                support=float(original[lo:hi].mean())
                if support<.75:continue
                coords=[int(lo),row,int(hi-1),row] if axis=='horizontal' else [row,int(lo),row,int(hi-1)]
                result.append(dict(method='gradient_scan',feature=kind,axis=axis,coords=coords,length_px=int(hi-lo),support_fraction=support,mean_band_difference=float(np.mean(d[row,lo:hi]*sign)),sign=sign))
    return result

def merge_candidates(lines):
    # Colapsar respuestas paralelas del mismo borde a menos de 36 px.
    kept=[]
    for item in sorted(lines,key=lambda x:(-x['length_px'],-x.get('support_fraction',1))):
        a=item['coords']; horizontal=item['axis']=='horizontal'
        along=(a[0],a[2]) if horizontal else (a[1],a[3]);across=a[1] if horizontal else a[0]
        duplicate=False
        for k in kept:
            if k['axis']!=item['axis']:continue
            b=k['coords'];balong=(b[0],b[2]) if horizontal else (b[1],b[3]);bacross=b[1] if horizontal else b[0]
            overlap=max(0,min(along[1],balong[1])-max(along[0],balong[0]))
            if abs(across-bacross)<=36 and overlap>.6*min(along[1]-along[0],balong[1]-balong[0]):duplicate=True;break
        if not duplicate:kept.append(item)
    return sorted(kept,key=lambda x:(x['coords'][1],x['coords'][0]))

def boundaries(rgb):
    gray=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY).astype(np.float32)
    smooth=cv2.GaussianBlur(gray,(0,0),6)
    std=np.sqrt(np.maximum(0,cv2.GaussianBlur(gray*gray,(0,0),6)-smooth*smooth))
    raw=[]
    for axis in ('horizontal','vertical'):
        raw+=scan_axis(smooth,axis,'luminance',10,7)
        raw+=scan_axis(std,axis,'local_texture_std',20,8)
    # Canny multiescala + Hough. Teselas de 1100 px y solapamiento de 300.
    # Las líneas requieren >250 px y huecos <=5 px, para no unir textura disjunta.
    hough=[]
    for sigma,low,high in ((1,30,70),(2,12,30),(4,5,15)):
        z=cv2.GaussianBlur(gray.astype(np.uint8),(0,0),sigma)
        for top in range(600,len(gray),800):
            e=cv2.Canny(z[top:top+1100],low,high)
            found=cv2.HoughLinesP(e,1,np.pi/180,120,minLineLength=251,maxLineGap=5)
            if found is None:continue
            for x1,y1,x2,y2 in found.reshape(-1,4):
                x1,y1,x2,y2=map(int,(x1,y1+top,x2,y2+top))
                dx,dy=abs(x2-x1),abs(y2-y1)
                if min(dx,dy)>5 or max(dx,dy)<=250:continue
                axis='horizontal' if dx>dy else 'vertical'
                if (axis=='horizontal' and x2<x1) or (axis=='vertical' and y2<y1):x1,x2,y1,y2=x2,x1,y2,y1
                hough.append(dict(method='Canny_HoughLinesP',feature='luminance',axis=axis,coords=[x1,y1,x2,y2],length_px=float(np.hypot(dx,dy)),sigma=sigma))
    return merge_candidates(raw+hough),raw,hough

def preservation(rgb):
    ref=np.asarray(Image.open(ROOT/'v2/montana-completa.png').convert('RGB'))
    result={'same_size_as_v2':rgb.shape==ref.shape}
    if rgb.shape!=ref.shape:return result
    changed=np.any(rgb!=ref,axis=2);allowed=np.zeros(changed.shape,dtype=bool)
    allowed[1900:2200,0:700]=True;allowed[5730:]=True
    bad=changed&~allowed
    result.update(changed_pixels=int(changed.sum()),changed_outside_authorized_regions=int(bad.sum()),unchanged_outside_authorized_regions=not bool(bad.any()))
    if bad.any():
        ys,xs=np.where(bad);result['unauthorized_change_bbox_xyxy']=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]
    manifest_path=ROOT/'proceso/v2-sha256.json'
    if manifest_path.exists():
        manifest=json.loads(manifest_path.read_text());badfiles=[]
        for name,digest in manifest.items():
            f=ROOT/'v2'/name
            if not f.exists() or hashlib.sha256(f.read_bytes()).hexdigest()!=digest:badfiles.append(name)
        result['frozen_v2_files_checked']=len(manifest);result['frozen_v2_mismatches']=badfiles
    for name in ('01-cumbre','02-alto','03-medio','04-bosque'):
        a=ROOT/'segmentos'/f'{name}.png';b=ROOT/'v2/segmentos'/f'{name}.png'
        if a.exists():result[f'segment_{name}_byte_identical']=a.read_bytes()==b.read_bytes()
    return result

def repeated_patches(rgb):
    # Búsqueda de clones exactos en teselas de 64 px; duplicados aproximados con
    # correlación >.995 y RMS <2 tras centrar luminancia, solo candidatos.
    seen={};exact=[];patches=[];coords=[]
    gray=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY)
    for y in range(5890,len(rgb)-63,64):
        for x in range(0,rgb.shape[1]-63,64):
            p=rgb[y:y+64,x:x+64];h=hashlib.sha256(p.tobytes()).hexdigest()
            if h in seen:exact.append({'a':seen[h],'b':[x,y]})
            seen[h]=[x,y]
            q=cv2.resize(gray[y:y+64,x:x+64],(16,16),interpolation=cv2.INTER_AREA).astype(np.float32).ravel()
            q-=q.mean()
            if np.std(q)>1:patches.append(q);coords.append([x,y])
    approximate=[];best=None
    if patches:
        a=np.stack(patches);norm=np.linalg.norm(a,axis=1);u=a/norm[:,None]
        corr=u@u.T;np.fill_diagonal(corr,-1)
        for i in range(len(coords)):
            for j in range(i):
                if abs(coords[i][0]-coords[j][0])<128 and abs(coords[i][1]-coords[j][1])<128:corr[i,j]=corr[j,i]=-1
        i,j=np.unravel_index(np.argmax(corr),corr.shape)
        best={'a':coords[i],'b':coords[j],'correlation':float(corr[i,j]),'centered_rms':float(np.sqrt(np.mean((a[i]-a[j])**2)))}
        for i,j in zip(*np.where(np.triu(corr,1)>.995)):
            rms=float(np.sqrt(np.mean((a[i]-a[j])**2)))
            if rms<2:approximate.append({'a':coords[i],'b':coords[j],'correlation':float(corr[i,j]),'centered_rms':rms})
    return dict(patch_size=64,exact_duplicates=exact,approximate_candidates=approximate,highest_distant_correlation=best,note='Solo rejilla sin desplazamiento; no demuestra ausencia de clones arbitrarios ni sustituye inspección.')

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--input',type=Path,default=ROOT/'montana-completa.png');ap.add_argument('--prefix',default='auditoria-v3');args=ap.parse_args()
    if Path(args.prefix).name!=args.prefix or not args.prefix.startswith('auditoria-v3'):raise ValueError('Prefix must be a filename beginning auditoria-v3')
    im=Image.open(args.input).convert('RGB');rgb=np.asarray(im);candidates,raw,hough=boundaries(rgb)
    report={'input':str(args.input),'size':list(im.size),'expected_size':[1536,8450],'size_ok':im.size==(1536,8450),'preservation':preservation(rgb),'straight_line_check':{'coordinate_origin':'top-left','minimum_length_exclusive_px':250,'method':'Canny/Hough multiescala y escaneo de diferencia de luminancia y desviación local de textura; ambos ejes. Relleno de huecos <=24 px, soporte >=75%. Consolidación de respuestas separadas <=36 px.','thresholds':{'luminance_band_delta_px':10,'luminance_difference':7,'texture_band_delta_px':20,'texture_std_difference':8,'along_edge_average_px':51},'candidates':candidates,'raw_gradient_candidates':raw,'raw_hough_candidates':hough,'status':'REQUIERE_REVISION_VISUAL' if candidates else 'NINGUN_CANDIDATO_CON_ESTOS_UMBRALES','limitation':'No existe garantía matemática de detectar todo borde perceptual. Bordes curvos, sendero y relieve pueden dar falsos positivos; clasificar visualmente cada candidato.'},'junctions':[],'patches':repeated_patches(rgb)}
    f=rgb.astype(np.float32)
    for y in (1968,3249,4529,5810,7090):
        report['junctions'].append(dict(y=y,adjacent_row_MAD=float(np.abs(f[y]-f[y-1]).mean()),MAD40=float(np.abs(f[y-40:y]-f[y:y+40]).mean()),mean_RGB_above40=f[y-40:y].mean(axis=(0,1)).tolist(),mean_RGB_below40=f[y:y+40].mean(axis=(0,1)).tolist()))
    hsv=cv2.cvtColor(rgb[5890:],cv2.COLOR_RGB2HSV);white=((hsv[:,:,2]>200)&(hsv[:,:,1]<40)).astype(np.uint8)
    n,labels,stats,centers=cv2.connectedComponentsWithStats(white,8)
    components=[{'center':[round(float(c[0]),1),round(float(c[1]+5890),1)],'area':int(s[4])} for s,c in zip(stats[1:],centers[1:]) if 2<=s[4]<=80]
    report['white_specks']={'definition':'V>200,S<40 en HSV OpenCV, componentes de 2..80 px; solo candidato, no diagnóstico de repetición','count':len(components),'components':components}
    out=ROOT/'proceso'/args.prefix;(out.with_suffix('.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    preview=im.resize((768,round(im.height/2)),Image.Resampling.LANCZOS);draw=ImageDraw.Draw(preview)
    for i,c in enumerate(candidates,1):
        p=[round(v/2) for v in c['coords']];draw.line(p,fill='#ff3030',width=3);draw.text((p[0]+3,p[1]+3),str(i),fill='#fff000')
    preview.save(out.with_suffix('.jpg'),quality=95)
    print(json.dumps({'input':str(args.input),'size':im.size,'candidates':len(candidates),'lines':[c['coords'] for c in candidates],'preservation':report['preservation'],'exact_patch_duplicates':len(report['patches']['exact_duplicates']),'approximate_patch_candidates':len(report['patches']['approximate_candidates'])},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
