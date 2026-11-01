"""Renderiza os fios do topo (assets/js/fios.js) quadro a quadro num Edge headless e gera os MP4 das
telas de toque: fios-pe (celular em pé, modo 1) e fios-deitado (tablet/celular deitado, modo 0).
O loop fecha sem emenda (fase 0 -> 2π). uDpr = 1.6 para o traço não sumir quando o vídeo é ampliado.
Uso: python tools/gerar_fios.py [nome ...]"""
import os, sys, subprocess, base64
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
VID = os.path.join(SITE, 'assets', 'video')
FPS = 24
# nome, largura, altura, modo, ciclo em segundos
VERSOES = [
    ('fios-pe', 720, 1560, 1, 30),
    ('fios-deitado', 1280, 720, 0, 30),
]

def renderizar(pg, nome, w, h, modo, ciclo):
    q = FPS * ciclo
    mp4 = os.path.join(VID, nome + '.mp4')
    enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', mp4], stdin=subprocess.PIPE)
    pg.set_viewport_size({'width': w, 'height': h})
    pg.evaluate(f"""(() => {{ document.body.innerHTML = '<canvas id="c"></canvas>';
        window.T = fiosGL(document.getElementById('c'), {{preserveDrawingBuffer: true, modo: {modo}}}); T.tamanho({w}, {h}, 1.6); }})()""")
    for i in range(q):
        png = base64.b64decode(pg.evaluate(f"(T.desenhar({i / q * 6.283185307179586}), document.getElementById('c').toDataURL('image/png'))").split(',', 1)[1])
        enc.stdin.write(png)
    enc.stdin.close(); enc.wait()
    print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB', flush=True)

if __name__ == '__main__':
    so = set(sys.argv[1:])
    os.makedirs(VID, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = b.new_page()
        pg.set_content('<body style="margin:0;background:#000"></body>')
        pg.add_script_tag(content=open(os.path.join(SITE, 'assets', 'js', 'fios.js'), encoding='utf-8').read())
        for v in VERSOES:
            if not so or v[0] in so: renderizar(pg, *v)
        b.close()
