"""Fotos de producto a máxima calidad para el escaparate.

Descarga la versión grande (large_default, 800 px) de cada producto de medicalmarca.com, recorta el margen blanco,
centra el producto con un margen uniforme y la guarda como WebP de 800×800 en public/products/<id>.webp.
Actualiza src/shop-data.json para que use la copia local (más nítida, encuadre homogéneo y sin depender de su servidor).

Uso:  python3 -I scripts/optimize-product-images.py   (desde la carpeta medicalmarca/)
"""
import io
import json
import os
import ssl
import sys
import urllib.request

from PIL import Image, ImageChops, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'src', 'shop-data.json')
OUT = os.path.join(ROOT, 'public', 'products')
SIZE, MARGIN = 800, 0.08  # lado final y margen alrededor del producto
CA = '/root/.ccr/ca-bundle.crt'
CTX = ssl.create_default_context(cafile=CA) if os.path.exists(CA) else ssl.create_default_context()


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (image-optimizer)'})
    with urllib.request.urlopen(req, timeout=90, context=CTX) as r:
        return r.read()


def trim_and_square(im):
    im = im.convert('RGB')
    gray = im.convert('L')
    # píxeles "no blancos" (umbral tolerante a compresión JPEG); se suaviza para ignorar motas sueltas
    mask = ImageChops.difference(gray, Image.new('L', im.size, 255)).point(lambda x: 255 if x > 14 else 0).filter(ImageFilter.MaxFilter(5))
    box = mask.getbbox() or (0, 0, *im.size)
    crop = im.crop(box)
    side = int(max(crop.size) * (1 + 2 * MARGIN))
    canvas = Image.new('RGB', (side, side), (255, 255, 255))
    canvas.paste(crop, ((side - crop.width) // 2, (side - crop.height) // 2))
    return canvas.resize((SIZE, SIZE), Image.LANCZOS), crop.size


def main():
    os.makedirs(OUT, exist_ok=True)
    data = json.load(open(DATA, encoding='utf-8'))
    done = 0
    for p in data['products']:
        remote = p.get('remote_img') or p['img']
        if not remote.startswith('https://medicalmarca.com/'):
            continue
        large = remote.replace('-home_default/', '-large_default/')
        try:
            raw = fetch(large)
        except Exception as e:  # noqa: BLE001
            print('sin large, uso home:', p['id'], e, file=sys.stderr)
            raw = fetch(remote)
        img, src = trim_and_square(Image.open(io.BytesIO(raw)))
        img.save(os.path.join(OUT, f"{p['id']}.webp"), 'WEBP', quality=88, method=6)
        p['remote_img'] = remote
        p['img'] = f"/products/{p['id']}.webp"
        done += 1
        print(f"{p['id']}: producto {src[0]}×{src[1]} px → {SIZE}×{SIZE}")
    json.dump(data, open(DATA, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('Listo:', done, 'imágenes')


if __name__ == '__main__':
    main()
