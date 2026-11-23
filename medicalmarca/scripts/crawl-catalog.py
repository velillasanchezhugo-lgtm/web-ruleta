"""Catálogo COMPLETO de medicalmarca.com (PrestaShop): árbol de categorías + todos los productos.

- Fase 1: árbol. La columna izquierda de cada categoría raíz contiene su subárbol completo (li data-depth).
- Fase 2: recorre todas las páginas (12 productos cada una) de cada categoría y subcategoría.
- Respetuoso con su servidor: 1 petición a la vez, pausa entre peticiones, reintentos con espera creciente.
- Reanudable: guarda el progreso tras cada página en el JSON de salida (vuelve a ejecutarlo y continúa).

Uso (desde medicalmarca/):  python3 -I scripts/crawl-catalog.py /ruta/catalogo.json
Después:                    node scripts/merge-catalog.mjs --replace /ruta/catalogo.json
"""
import html
import json
import math
import os
import re
import ssl
import sys
import time
import urllib.request

OUT = sys.argv[1]
BASE = 'https://medicalmarca.com/es/'
PAUSE = 1.5
ROOTS = [(4, 'fresas'), (35, 'pulidores'), (41, 'insertos'), (46, 'profilaxis'), (50, 'implantologia'), (60, 'sutura'),
         (68, 'micro-cirugia'), (72, 'aparatologia-y-instrumental-rotatorio'), (79, 'material-proteccion'),
         (87, 'gel-hidroalcoholico'), (88, 'desinfeccion'), (89, 'instrumental')]
CA = '/root/.ccr/ca-bundle.crt'
CTX = ssl.create_default_context(cafile=CA) if os.path.exists(CA) else ssl.create_default_context()


def fetch(url):
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (catalog-preview; 1 req/1.5s)'})
            with urllib.request.urlopen(req, timeout=180, context=CTX) as r:
                body = r.read().decode('utf-8', 'replace')
            time.sleep(PAUSE)
            return body
        except Exception as e:  # noqa: BLE001
            wait = 10 * (attempt + 1)
            print(f'  reintento {attempt + 1} en {wait}s: {url} ({e})', flush=True)
            time.sleep(wait)
    return ''


def clean(t):
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()


def money(s):
    s = re.sub(r'[^\d,]', '', s or '')
    return float(s.replace(',', '.')) if s else None


def parse_tree(h, root_id):
    """Devuelve [(id, slug, name, parent_id, depth)] del subárbol de la raíz."""
    m = re.search(r'<div class="block-categories">(.*?)</div>\s*</div>\s*(?:<div|</div)', h, re.S)
    block = m.group(1) if m else h
    nodes, stack = [], {-1: root_id}
    for depth, cid, slug, name in re.findall(r'<li data-depth="(\d+)">\s*<a[^>]*href="https://medicalmarca\.com/es/(\d+)-([a-z0-9-]+)"[^>]*>([^<]+)</a>', block):
        depth, cid = int(depth), int(cid)
        parent = stack.get(depth - 1, root_id)
        nodes.append((cid, slug, clean(name), parent, depth + 1))
        stack[depth] = cid
        for d in [k for k in stack if k > depth]:
            del stack[d]
    return nodes


def parse_products(h):
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
        items.append({'id': int(pid.group(1)), 'name': clean(name.group(1)), 'url': url.group(1),
                      'img': img.group(1).replace('large_default', 'home_default') if img else '',
                      'now': now, 'was': was if was and now and was > now else None})
    return (int(total.group(1)) if total else 0), items


state = json.load(open(OUT)) if os.path.exists(OUT) else {'tree': {}, 'done_pages': [], 'products': {}}


def save():
    state['scraped'] = time.strftime('%Y-%m-%d')
    tmp = OUT + '.tmp'
    json.dump(state, open(tmp, 'w'), ensure_ascii=False, indent=1)
    os.replace(tmp, OUT)


# ---------- Fase 1: árbol ----------
for rid, rslug in ROOTS:
    if str(rid) in state['tree'] and state['tree'][str(rid)].get('scanned'):
        continue
    h = fetch(f'{BASE}{rid}-{rslug}')
    rname = re.search(r'<li><a class="text-uppercase h6" href="[^"]+">([^<]+)</a>', h)
    state['tree'][str(rid)] = {'id': rid, 'slug': rslug, 'name': clean(rname.group(1)) if rname else rslug, 'parent': None, 'depth': 0, 'scanned': True}
    for cid, slug, name, parent, depth in parse_tree(h, rid):
        state['tree'].setdefault(str(cid), {'id': cid, 'slug': slug, 'name': name, 'parent': parent, 'depth': depth})
    total, _ = parse_products(h)
    state['tree'][str(rid)]['total'] = total
    print(f'árbol {rslug}: {sum(1 for c in state["tree"].values() if c.get("parent") is not None)} subcategorías acumuladas', flush=True)
    save()

# ---------- Fase 2: productos de todas las categorías ----------
# Primero las subcategorías más profundas; una categoría padre solo se recorre si tiene productos propios
# que no aparecen en ninguna de sus subcategorías (su listado repite los de las hijas).
children = {}
for c in state['tree'].values():
    if c.get('parent') is not None:
        children.setdefault(c['parent'], []).append(c['id'])


def descendants(cid):
    out = []
    for k in children.get(cid, []):
        out += [k] + descendants(k)
    return out


cats = sorted(state['tree'].values(), key=lambda c: (-c['depth'], c['id']))
for c in cats:
    if children.get(c['id']) and c.get('total') is not None:
        desc = set(descendants(c['id']))
        found = sum(1 for p in state['products'].values() if desc & set(p['cats']))
        if found >= c['total']:
            print(f"{c['slug']}: sus {c['total']} productos ya están en las subcategorías", flush=True)
            continue
    page, pages = 1, None
    while True:
        key = f"{c['id']}:{page}"
        if key in state['done_pages']:
            page += 1
            if pages is not None and page > pages:
                break
            if pages is None and 'pages' in c:
                pages = c['pages']
                if page > pages:
                    break
            continue
        url = f"{BASE}{c['id']}-{c['slug']}" + (f'?page={page}' if page > 1 else '')
        h = fetch(url)
        if not h:
            print('  sin respuesta, se reintentará en la próxima ejecución:', url, flush=True)
            break
        total, items = parse_products(h)
        if page == 1:
            c['total'] = total
            c['pages'] = pages = max(1, math.ceil(total / 12))
            state['tree'][str(c['id'])].update(total=total, pages=pages)
        for it in items:
            p = state['products'].setdefault(str(it['id']), {**it, 'cats': []})
            p.update({k: v for k, v in it.items() if v is not None})
            if c['id'] not in p['cats']:
                p['cats'].append(c['id'])
        state['done_pages'].append(key)
        save()
        # categoría padre: con la primera página ya sabemos su total; si sus subcategorías lo cubren, no hace falta seguir
        if page == 1 and children.get(c['id']):
            desc = set(descendants(c['id']))
            found = sum(1 for p in state['products'].values() if desc & set(p['cats']))
            if found >= total:
                print(f"{c['slug']}: sus {total} productos ya están en las subcategorías", flush=True)
                break
        print(f"{c['slug']} (d{c['depth']}) página {page}/{pages}: {len(items)} · total productos únicos {len(state['products'])}", flush=True)
        page += 1
        if page > pages:
            break

print('TERMINADO', len(state['products']), 'productos en', len(state['tree']), 'categorías', flush=True)
