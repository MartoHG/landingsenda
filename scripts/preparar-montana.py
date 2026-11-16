"""Prepara la montaña para la web.

Lee diseno/montana/montana-completa.png y diseno/montana/claros.json y genera:
- src/assets/montana/tramo-N.jpg: la tira cortada en tramos de igual alto, en
  orden, sin solapamiento (apilados reconstruyen la tira exacta).
- src/assets/montana/parada-NN.jpg: un recorte por claro, a todo el ancho,
  para la versión quieta de cada parada.
- src/data/montana.json: medidas de la tira, tramos y claros.

Uso: python3 scripts/preparar-montana.py
"""

import json
import math
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # la tira ampliada supera el límite por defecto

RAIZ = Path(__file__).resolve().parents[1]
ORIGEN = RAIZ / "diseno" / "montana"
DESTINO_IMG = RAIZ / "src" / "assets" / "montana"
DESTINO_DATOS = RAIZ / "src" / "data" / "montana.json"
CANTIDAD_TRAMOS = 6
CALIDAD_JPG = 90


def main() -> None:
    tira = Image.open(ORIGEN / "montana-completa.png").convert("RGB")
    claros = json.loads((ORIGEN / "claros.json").read_text())
    ancho, alto = tira.size
    DESTINO_IMG.mkdir(parents=True, exist_ok=True)

    # Si existe la versión ampliada con IA, los tramos salen de ahí.
    # Las coordenadas de montana.json siguen en la escala de la tira original.
    ampliada = ORIGEN / "montana-completa-x2.png"
    fuente = Image.open(ampliada).convert("RGB") if ampliada.exists() else tira
    f = fuente.width / ancho

    alto_tramo = math.ceil(alto / CANTIDAD_TRAMOS)
    tramos = []
    for i in range(CANTIDAD_TRAMOS):
        y0 = i * alto_tramo
        y1 = min(alto, y0 + alto_tramo)
        archivo = f"tramo-{i + 1}.jpg"
        fuente.crop((0, round(y0 * f), fuente.width, round(y1 * f))).save(
            DESTINO_IMG / archivo, quality=CALIDAD_JPG, optimize=True, progressive=True
        )
        tramos.append({"archivo": archivo, "y": y0, "alto": y1 - y0})

    paradas = []
    for claro in claros["clearings"]:
        caja = claro["bbox"]
        centro_y = caja["y"] + caja["height"] / 2
        alto_recorte = max(960, round(caja["height"] * 1.3))
        # La cumbre es la portada: el recorte arranca arriba para mostrar cielo y cima.
        y0 = 0 if claro["id"] == "01" else max(0, round(centro_y - alto_recorte / 2))
        y1 = min(alto, y0 + alto_recorte)
        y0 = max(0, y1 - alto_recorte)
        archivo = f"parada-{claro['id']}.jpg"
        fuente.crop((0, round(y0 * f), fuente.width, round(y1 * f))).save(
            DESTINO_IMG / archivo, quality=CALIDAD_JPG, optimize=True, progressive=True
        )
        paradas.append(
            {
                "id": claro["id"],
                "lado": claro["side"],
                "caja": caja,
                "cajaSegura": claro.get("panel_safe_bbox", caja),
                "recorte": {"archivo": archivo, "y": y0, "alto": y1 - y0},
            }
        )

    DESTINO_DATOS.write_text(
        json.dumps(
            {
                "ancho": ancho,
                "alto": alto,
                "escalaFuente": f,
                "tramos": tramos,
                "claros": paradas,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    print(
        f"tira {ancho}x{alto} (fuente {fuente.width}x{fuente.height}): "
        f"{len(tramos)} tramos y {len(paradas)} recortes"
    )


if __name__ == "__main__":
    main()
