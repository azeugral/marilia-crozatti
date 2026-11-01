"""og.jpg (1200x630) e ícones: foto da energética em arco à direita, monograma MC e nome no meio-esquerda
(o WhatsApp recorta o centro em quadrado, então nome e monograma ficam perto do meio)."""
import os
from playwright.sync_api import sync_playwright
AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
url = 'file:///' + SITE.replace(os.sep, '/') + '/'
HTML = f"""<html><head><style>
@font-face{{font-family:A;src:url('{url}assets/fontes/antonio-latin.woff2');font-weight:100 400}}
@font-face{{font-family:J;src:url('{url}assets/fontes/jost-latin.woff2');font-weight:300 600}}
body{{margin:0;width:1200px;height:630px;background:#f1ece3;position:relative;overflow:hidden;font-family:J;color:#1c1f1b}}
.f{{position:absolute;right:90px;top:70px;width:330px;height:528px;border-radius:165px 165px 0 0;background:url('{url}assets/img/hero/papoula-1170.webp') 50% 30%/cover}}
.m{{position:absolute;right:76px;top:56px;width:330px;height:528px;border-radius:165px 165px 0 0;border:1.5px solid #2c4235;opacity:.5}}
.l{{position:absolute;left:250px;top:120px;height:390px}}
.t{{position:absolute;left:390px;top:170px}}
h1{{font:200 110px/.9 A;text-transform:uppercase;margin:0}} h1 span{{color:#2c4235}}
p{{margin:28px 0 0;font-size:21px;letter-spacing:.2em;text-transform:uppercase;color:#3e5a47}}
</style></head><body><div class=m></div><div class=f></div><img class=l src="{url}assets/img/mc-verde.svg"><div class=t><h1>Marília<br><span>Crozatti</span></h1><p>Fineline · Campinas</p></div></body></html>"""
ICO = f"""<html><body style="margin:0;width:180px;height:180px;background:#2c4235;display:grid;place-items:center"><img src="{url}assets/img/mc-creme.svg" style="height:150px"></body></html>"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge'); pg = b.new_page(viewport={'width': 1200, 'height': 630})
    tmp = os.path.join(SITE, '_og.html')
    def abrir(html):
        open(tmp, 'w', encoding='utf-8').write(html); pg.goto(url + '_og.html'); pg.wait_for_timeout(800)
    abrir(HTML); pg.screenshot(path=os.path.join(SITE, 'og.jpg'), type='jpeg', quality=86)
    pg.set_viewport_size({'width': 180, 'height': 180}); abrir(ICO); os.remove(tmp)
    pg.screenshot(path=os.path.join(SITE, 'apple-touch-icon.png'))
    b.close()
from PIL import Image
Image.open(os.path.join(SITE, 'apple-touch-icon.png')).resize((32, 32), Image.LANCZOS).save(os.path.join(SITE, 'favicon-32.png'))
print('ok')
