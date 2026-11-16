from pathlib import Path
from PIL import Image
import json, sys, shutil

ROOT=Path(__file__).resolve().parents[1]
NAMES=['01-cumbre','02-alto','03-medio','04-bosque','05-bajo','06-valle']
W,H,O=1536,2048,768
mode=sys.argv[1]
if mode=='aceptar':
    i=int(sys.argv[2]); source=Path(sys.argv[3]); attempt=int(sys.argv[4])
    raw=ROOT/'proceso'/f'{NAMES[i-1]}-intento-{attempt}.png'
    if source.resolve()!=raw.resolve(): shutil.copy2(source,raw)
    im=Image.open(raw).convert('RGB')
    print(json.dumps({'segmento':i,'original':im.size,'normalizado':[W,H]}))
    im.resize((W,H),Image.Resampling.LANCZOS).save(ROOT/'segmentos'/f'{NAMES[i-1]}.png')
elif mode=='canvas':
    i=int(sys.argv[2])
    im=Image.open(ROOT/'segmentos'/f'{NAMES[i-2]}.png').convert('RGBA')
    canvas=Image.new('RGBA',(W,H),(0,0,0,0))
    canvas.paste(im.crop((0,H-O,W,H)),(0,0))
    canvas.save(ROOT/'proceso'/f'{NAMES[i-1]}-entrada.png')
elif mode=='prompt':
    i=int(sys.argv[2]); attempt=int(sys.argv[3]); prompt=sys.stdin.read()
    p=ROOT/'proceso'/'prompts.json'; entries=json.loads(p.read_text())
    entries.append({'segmento':NAMES[i-1],'intento':attempt,'prompt':prompt})
    p.write_text(json.dumps(entries,ensure_ascii=False,indent=2))
