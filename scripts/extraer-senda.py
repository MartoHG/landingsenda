#!/usr/bin/env python3
"""Extrae la senda continua y guarda sus puntos y una comprobación visual.

Uso: python3 scripts/extraer-senda.py [ruta-de-la-tira]
Requiere numpy y OpenCV (cv2), ya disponibles en el entorno de diseño.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np

RAIZ = Path(__file__).resolve().parents[1]
REFERENCIA = RAIZ / "diseno/senda/montana-referencia.png"
SALIDA = RAIZ / "src/data/senda.json"
VERIFICACION = RAIZ / "diseno/senda/senda-verificacion.jpg"
PASO_MUESTRA = 40  # Píxeles de la tira original.
ANCHO_ANALISIS = 768


def extraer(imagen: np.ndarray) -> tuple[list[dict[str, float]], list[tuple[int, int]]]:
    alto, ancho = imagen.shape[:2]
    escala = min(1.0, ANCHO_ANALISIS / ancho)
    reducida = cv2.resize(imagen, (round(ancho * escala), round(alto * escala)))
    alto_r, ancho_r = reducida.shape[:2]
    hsv = cv2.cvtColor(reducida, cv2.COLOR_BGR2HSV).astype(np.float32)
    lab = cv2.cvtColor(reducida, cv2.COLOR_BGR2LAB).astype(np.float32)
    tono, saturacion, _ = cv2.split(hsv)
    luz, rojo, _ = cv2.split(lab)

    # La tierra es más rojiza y clara que el pasto; las rocas son más grises.
    mascara = (
        (tono > 8) & (tono < 29) & (saturacion > 25)
        & (saturacion < 150) & (rojo > 124) & (luz > 75)
    )
    entorno = cv2.GaussianBlur(luz, (0, 0), 15)
    afinidad = (
        0.6 * (rojo - 125) + 0.1 * (luz - entorno) + 0.03 * (luz - 100)
        - 0.7 * np.maximum(tono - 27, 0)
        - 0.2 * np.maximum(30 - saturacion, 0) + mascara * 0.5
    )
    afinidad = np.clip(cv2.GaussianBlur(afinidad, (0, 0), 0.7), -15, 15)

    # Se excluye el cielo. La senda nace alrededor de la cumbre central.
    filas = np.arange(round(alto_r * 0.05), round(alto_r * 0.995), 2)
    coste = np.full(ancho_r, 1e6, dtype=np.float32)
    coste[round(ancho_r * 0.38):round(ancho_r * 0.55)] = 0
    posiciones = np.arange(ancho_r)
    saltos = np.arange(-14, 15)
    anteriores: list[np.ndarray] = []

    # Continuidad global: favorece el candidato cercano y rechaza saltos.
    # Mirar también las filas siguientes evita confundir una roca con un desvío.
    for y in filas:
        opciones = np.stack([np.roll(coste, salto) + 0.035 * salto**2 for salto in saltos])
        for indice, salto in enumerate(saltos):
            if salto > 0:
                opciones[indice, :salto] = 1e6
            elif salto < 0:
                opciones[indice, salto:] = 1e6
        elegidos = np.argmin(opciones, axis=0)
        coste = opciones[elegidos, posiciones] - afinidad[y]
        anteriores.append(saltos[elegidos].astype(np.int8))

    x = int(np.argmin(coste))
    camino = []
    for y, anterior in zip(filas[::-1], anteriores[::-1]):
        camino.append((x, int(y)))
        x -= int(anterior[x])
    camino.reverse()
    coordenadas = np.asarray(camino, dtype=np.float32)
    # El camino puede desvanecerse antes del borde: no prolongarlo sobre pasto.
    evidencia = np.array([
        rojo[int(y), int(x)] > 121 and tono[int(y), int(x)] < 30
        and luz[int(y), int(x)] - entorno[int(y), int(x)] > 8
        for x, y in coordenadas
    ])
    continuidad = np.convolve(evidencia, np.ones(15) / 15, mode="same")
    validos = np.flatnonzero(continuidad >= 0.6)
    if validos.size and validos[-1] > len(coordenadas) * 0.85:
        coordenadas = coordenadas[:validos[-1] + 1]
        filas = filas[:len(coordenadas)]
    # Suavizado corto: conserva las curvas cerradas de la zona rocosa.
    xs = cv2.GaussianBlur(coordenadas[:, 0:1], (1, 0), 2).ravel() / escala
    ys = coordenadas[:, 1] / escala
    muestras = np.append(np.arange(ys[0], ys[-1], PASO_MUESTRA), ys[-1])
    puntos = [
        {"y": round(float(y), 2), "x": round(float(np.interp(y, ys, xs)), 2)}
        for y in muestras
    ]

    # Informa los tramos con poca evidencia cromática, sin inventar certeza.
    confianza = np.array([
        mascara[round(y), max(0, min(ancho_r - 1, round(x)))]
        for x, y in coordenadas
    ])
    dudosos = []
    for inicio in range(0, len(filas), 125):
        fin = min(inicio + 125, len(filas))
        if confianza[inicio:fin].mean() < 0.5:
            dudosos.append((round(filas[inicio] / escala), round(filas[fin - 1] / escala)))
    return puntos, dudosos


def main() -> None:
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument("tira", nargs="?", type=Path, default=REFERENCIA)
    ruta = argumentos.parse_args().tira
    imagen = cv2.imread(str(ruta))
    if imagen is None:
        argumentos.error(f"No se pudo leer la tira: {ruta}")
    alto, ancho = imagen.shape[:2]
    if ancho < 64 or alto < 400:
        argumentos.error("La tira debe tener al menos 64 × 400 píxeles.")
    puntos, dudosos = extraer(imagen)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(
        json.dumps({"ancho": ancho, "alto": alto, "puntos": puntos}, indent=2) + "\n",
        encoding="utf-8",
    )
    escala = 500 / ancho
    miniatura = cv2.resize(imagen, (500, round(alto * escala)), interpolation=cv2.INTER_AREA)
    linea = np.asarray([(round(p["x"] * escala), round(p["y"] * escala)) for p in puntos], np.int32)
    cv2.polylines(miniatura, [linea], False, (0, 0, 255), 1, cv2.LINE_AA)
    VERIFICACION.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(VERIFICACION), miniatura, [cv2.IMWRITE_JPEG_QUALITY, 94]):
        raise RuntimeError(f"No se pudo guardar {VERIFICACION}")
    print(f"Senda: {len(puntos)} puntos; tira {ancho} × {alto}; y={puntos[0]['y']}–{puntos[-1]['y']}.")
    print(f"Datos: {SALIDA.relative_to(RAIZ)}")
    print(f"Verificación: {VERIFICACION.relative_to(RAIZ)}")
    if puntos[-1]["y"] < alto * 0.99:
        print("El final se recortó donde la senda pierde continuidad cromática en el pasto.")
    if dudosos:
        print("Revisar evidencia cromática débil (y original): " + ", ".join(f"{a}–{b}" for a, b in dudosos))


if __name__ == "__main__":
    main()
