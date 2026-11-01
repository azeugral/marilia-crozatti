"""Gera as imagens do site a partir do Instagram extraído (_ref/ig) e o assets/js/obras.js.
Recorte centrado na proporção pedida (foco ajustável), WebP em duas larguras.
Comparador de reformas: as fotos "depois | antes" do Instagram vêm lado a lado; cada metade vira uma imagem.
Uso: python tools/processar.py"""
import os, json, subprocess
from PIL import Image
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
REF = os.path.join(os.path.dirname(SITE), '_ref')
IG = os.path.join(REF, 'ig')
IMG = os.path.join(SITE, 'assets', 'img')

def abrir(n):
    return Image.open(os.path.join(IG, n + '.jpg')).convert('RGB')

def recorte(im, prop=1.25, fy=.5, fx=.5):
    w, h = im.size
    if h / w > prop: cw, ch = w, round(w * prop)
    else: cw, ch = round(h / prop), h
    x = round((w - cw) * fx); y = round((h - ch) * fy)
    return im.crop((x, y, x + cw, y + ch))

def salvar(im, pasta, nome, larguras=(640, 1080), q=80):
    os.makedirs(os.path.join(IMG, pasta), exist_ok=True)
    feitos = []
    for L in larguras:
        L2 = min(L, im.width)
        if feitos and L2 == feitos[-1]: continue
        r = im.resize((L2, round(im.height * L2 / im.width)), Image.LANCZOS) if L2 < im.width else im
        r.save(os.path.join(IMG, pasta, f'{nome}-{L}.webp'), 'WEBP', quality=q, method=6)
        feitos.append(L2)
    return feitos

# portfólio: id, categoria, legenda (só o estilo), foco vertical
OBRAS = [
    ('298_0', 'energ', 'Energética: mandala com papoula', .45),
    ('329_0', 'fine', 'Floral fineline no braço', .4),
    ('004_0', 'pets', 'Retrato pet em traço fino', .55),
    ('460_0', 'fine', 'Fechamento floral com fases da lua', .4),
    ('139_0', 'energ', 'Energética: mandala nas costas', .5),
    ('425_0', 'foto', 'Foto minimalista de família', .45),
    ('323_0', 'fine', 'Lírios e fênix em linha fina', .45),
    ('209_0', 'pets', 'Retrato pet com nome', .45),
    ('255_0', 'energ', 'Energética: mandala no antebraço', .45),
    ('057_0', 'fine', 'Ramos de lavanda', .5),
    ('002_0', 'foto', 'Escrita em círculo', .5),
    ('317_0', 'energ', 'Energética em filigrana', .5),
    ('190_0', 'fine', 'Borboleta e ramos no tornozelo', .5),
    ('164_0', 'pets', 'Contornos pet', .5),
    ('133_0', 'energ', 'Releitura do Louco, tarot', .45),
    ('155_0', 'fine', 'Rosto e flores em linha contínua', .45),
    ('166_0', 'foto', 'Foto minimalista de irmãos', .55),
    ('304_0', 'fine', 'Floral delicado com cor', .45),
    ('479_0', 'pets', 'Pet com ornamento', .45),
    ('070_0', 'energ', 'Energética: mandala na escápula', .5),
    ('410_0', 'fine', 'Floral sobre tatuagem antiga', .4),
    ('135_0', 'foto', 'Mãe e filha em linha fina', .5),
    ('180_0', 'fine', 'Vênus em traço fino', .45),
    ('120_0', 'energ', 'Cybersigilism nas costas', .45),
    ('062_0', 'fine', 'Lótus na coluna', .5),
    ('388_0', 'pets', 'Retrato pet minimalista', .45),
    ('327_0', 'foto', 'Frase em lettering fino', .5),
    ('269_0', 'energ', 'Energética no antebraço', .45),
    ('173_0', 'fine', 'Ramo de folhas na panturrilha', .45),
    ('207_0', 'fine', 'Atena em traço fino', .45),
    ('338_0', 'pets', 'Pet com moldura geométrica', .5),
    ('376_0', 'energ', 'Segunda energética com bracelete', .45),
    ('099_0', 'fine', 'Gatos e flores no braço', .45),
    ('352_0', 'fine', 'Lírio no ombro', .5),
    ('067_0', 'foto', 'Frase na costela', .5),
    ('049_0', 'energ', 'Homenagem com toque de vermelho', .5),
]

# energéticas em destaque, com a tríade do mapa (sol, ascendente, lua) das legendas dela
ENERG = [
    ('298_1', 'Thaísa', 'Touro', 'Câncer', 'Leão', .45),
    ('139_0', 'Fabi', 'Aquário', 'Sagitário', 'Escorpião', .5),
    ('070_0', 'Andriza', 'Gêmeos', 'Libra', 'Touro', .5),
    ('317_0', 'Lilian', 'Capricórnio', 'Aquário', 'Gêmeos', .5),
    ('269_0', 'Talita', 'Escorpião', 'Câncer', 'Capricórnio', .45),
    ('192_0', 'Amanda', 'Sagitário', 'Sagitário', 'Câncer', .45),
]

# comparador: (id, lado do "depois", corte de cima, corte de baixo em fração, legenda)
PARES = [
    ('208_0', 'esq', .12, .02, 'Cobertura', 'Onça e flores sobre uma tatuagem escura e antiga'),
    ('203_0', 'dir', .0, .05, 'Reforma', 'Flores reavivadas, com contraste e definição'),
    ('211_0', 'esq', .12, .02, 'Cobertura', 'Borboleta e flores no lugar de um desenho apagado'),
    ('244_0', 'esq', .0, .14, 'Reforma', 'Coração com nomes, redesenhado e legível'),
    ('093_0', 'dir', .05, .05, 'Reforma', 'Trevo com traço refeito e preenchimento novo'),
]

# cartões de estilo (os 7 do carrossel "Estilos que eu trabalho")
ESTILOS = [('329_0', .4), ('053_1', .45), ('425_0', .45), ('209_0', .45), ('297_0', .35), ('316_1', .45)]

def metade(n, lado, cima, baixo):
    im = abrir(n); w, h = im.size
    esq = im.crop((0, 0, w // 2, h)); dir_ = im.crop((w - w // 2, 0, w, h))
    dep, ant = (esq, dir_) if lado == 'esq' else (dir_, esq)
    c = lambda x: x.crop((0, round(h * cima), x.width, round(h * (1 - baixo))))
    return c(dep), c(ant)

def video(nome, w=720, crf=27, inicio=0, dur=None, som=True):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    src = os.path.join(REF, 'videos', nome + '.mp4'); dst = os.path.join(SITE, 'assets', 'video', nome + '.mp4')
    cmd = [ff, '-y', '-loglevel', 'error', '-ss', str(inicio), '-i', src]
    if dur: cmd += ['-t', str(dur)]
    cmd += ['-vf', f'scale={w}:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    cmd += ['-c:a', 'aac', '-b:a', '96k'] if som else ['-an']
    subprocess.run(cmd + [dst], check=True)
    pos = os.path.join(IMG, 'poster-' + nome + '.webp')
    subprocess.run([ff, '-y', '-loglevel', 'error', '-ss', '0.4', '-i', dst, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '75', pos], check=True)

def main():
    obras = []
    for n, cat, leg, fy in OBRAS:
        ws = salvar(recorte(abrir(n), 1.25, fy), 'obras', n)
        obras.append({'id': n, 'c': cat, 'a': leg, 'w': ws[-1]})
    with open(os.path.join(SITE, 'assets', 'js', 'obras.js'), 'w', encoding='utf-8') as f:
        f.write('/* gerado por tools/processar.py */\nwindow.OBRAS = ' + json.dumps(obras, ensure_ascii=False) + ';\n')

    for n, *_, fy in ENERG: salvar(recorte(abrir(n), 1.25, fy), 'energ', n, (480, 800, 1080), 84)
    for i, (n, lado, cima, baixo, *_) in enumerate(PARES):
        d, a = metade(n, lado, cima, baixo)
        salvar(recorte(d, 1.4, .5), 'reformas', f'{n}-depois', (540,))
        salvar(recorte(a, 1.4, .5), 'reformas', f'{n}-antes', (540,))
    for n, fy in ESTILOS: salvar(recorte(abrir(n), 1.25, fy), 'estilos', n, (480, 720))
    salvar(recorte(metade('208_0', 'esq', .12, .02)[0], 1.25, .5), 'estilos', '208_0', (480,))

    # topo: a energética com papoula, inteira em pé
    salvar(recorte(abrir('297_0'), 1.6, .35), 'hero', 'papoula', (720, 1170), 82)
    # estúdio
    # fotos enviadas pela cliente: o retrato da varanda no topo (inteiro, o CSS recorta) e a selfie no "Sobre"
    salvar(Image.open(os.path.join(REF, 'marilia-retrato.jpg')).convert('RGB'), 'hero', 'retrato', (720, 1024), 84)
    selfie = Image.open(os.path.join(REF, 'marilia-selfie.png')).convert('RGB')
    salvar(recorte(selfie, 1.25, .3), 'artista', 'marilia', (720, 1080), 84)
    salvar(recorte(abrir('176_0'), 1.25, .35), 'artista', 'marilia-estudio', (640,), 82)
    salvar(recorte(abrir('360_0'), 1.25, .55), 'estudio', 'sala', (720,), 82)
    salvar(recorte(abrir('016_0'), 1.0, 1.0), 'estudio', 'atendimento', (720, 1080), 82)

    if '--videos' in os.sys.argv:
        video('089', som=True); video('666', som=True)

    print(len(obras), 'obras')

if __name__ == '__main__':
    main()
