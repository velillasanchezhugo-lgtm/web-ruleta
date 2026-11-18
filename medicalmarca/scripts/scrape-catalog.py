"""Extrae un escaparate de productos reales de medicalmarca.com (PrestaShop).
3 páginas (12 productos) por categoría, en paralelo. Salida: shop/products.json"""
import concurrent.futures as cf
import html
import json
import re
import ssl
import sys
import time
import urllib.request

OUT = sys.argv[1]
CATS = [
    (4, 'fresas', 'Fresas'), (35, 'pulidores', 'Pulidores'), (41, 'insertos', 'Insertos'),
    (46, 'profilaxis', 'Profilaxis'), (50, 'implantologia', 'Implantología'), (60, 'sutura', 'Sutura'),
    (68, 'micro-cirugia', 'Microcirugía'), (72, 'aparatologia-y-instrumental-rotatorio', 'Aparatología e instrumental rotatorio'),
    (79, 'material-proteccion', 'Material de protección'), (87, 'gel-hidroalcoholico', 'Gel hidroalcohólico'),
    (88, 'desinfeccion', 'Desinfección'), (89, 'instrumental', 'Instrumental'),
]
PAGES = 1
CTX = ssl.create_default_context()


def fetch(url, tries=2):
    for t in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (concept-preview)'})
            with urllib.request.urlopen(req, timeout=240, context=CTX) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception as e:  # noqa: BLE001
            print('retry', url, e, flush=True)
            time.sleep(3)
    return ''


def money(s):
    s = re.sub(r'[^\d,]', '', s or '')
    return float(s.replace(',', '.')) if s else None


def parse(h, cat):
    total = re.search(r'Hay (\d+) productos?', h)
    items = []
    for block in re.split(r'<article class="[^"]*product-miniature', h)[1:]:
        pid = re.search(r'data-id-product="(\d+)"', block)
        url = re.search(r'class="tit-prod product-title"><a href="([^"]+)"', block)
        name = re.search(r'class="tit-prod product-title"><a [^>]*>([^<]+)</a>', block)
        img = re.search(r'data-full-size-image-url="([^"]+)"', block) or re.search(r'<img\s+src="([^"]+)"', block)
        price = re.search(r'<span class="price"[^>]*>\s*([^<]+?)\s*</span>', block)
        reg = re.search(r'<span class="regular-price"[^>]*>\s*([^<]+?)\s*</span>', block)
        if not (pid and url and name):
            continue
        now, was = money(price.group(1) if price else ''), money(reg.group(1) if reg else '')
        items.append({
            'id': int(pid.group(1)), 'name': html.unescape(name.group(1)).strip(), 'url': url.group(1),
            'img': img.group(1).replace('large_default', 'home_default') if img else '',
            'now': now, 'was': was if was and now and was > now else None, 'cat': cat,
        })
    return (int(total.group(1)) if total else None), items


def job(c, page):
    cid, slug, _ = c
    url = f'https://medicalmarca.com/es/{cid}-{slug}' + (f'?page={page}' if page > 1 else '')
    t = time.time()
    h = fetch(url)
    total, items = parse(h, slug)
    print(f'{slug} p{page}: {len(items)} productos (total {total}) {time.time() - t:.0f}s', flush=True)
    return slug, total, items


results, totals = {}, {}


def save():
    data = {
        'scraped': time.strftime('%Y-%m-%d'),
        'categories': [{'slug': s, 'name': n, 'id': i, 'total': totals.get(s)} for i, s, n in CATS],
        'products': sorted(results.values(), key=lambda x: (x['cat'], x['name'])),
    }
    json.dump(data, open(OUT, 'w'), ensure_ascii=False, indent=1)


# Servidor lento: solo 2 peticiones a la vez para no saturar la tienda; se guarda tras cada página.
with cf.ThreadPoolExecutor(max_workers=1) as ex:
    futs = [ex.submit(job, c, p) for p in range(1, PAGES + 1) for c in CATS]
    for f in cf.as_completed(futs):
        slug, total, items = f.result()
        if total:
            totals[slug] = total
        for it in items:
            results.setdefault(it['id'], it)
        save()
print('TOTAL', len(results), 'productos', flush=True)
