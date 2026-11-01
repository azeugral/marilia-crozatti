/* Marília Crozatti: topo, menu, entradas, vídeos com fala, portfólio, comparador, ficha do WhatsApp. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ZAP = '5519992644487';
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zapLink = msg => `https://wa.me/${ZAP}?text=${encodeURIComponent(msg)}`;

  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  /* links de WhatsApp com mensagem pronta */
  $$('[data-zap]').forEach(a => { a.href = zapLink(a.dataset.zap); a.target = '_blank'; a.rel = 'noopener'; });

  /* entrada do hero depois das fontes (ou 1,2 s, o que vier antes) */
  const hero = $('.hero');
  if (hero) {
    let foi = false;
    const entrar = () => { if (foi) return; foi = true; requestAnimationFrame(() => hero.classList.add('entrou')); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(entrar);
    setTimeout(entrar, 1200);
  }

  /* topo: sólido depois do hero, some ao descer e volta ao subir; WhatsApp flutuante */
  const topo = $('#topo'), zap = $('.zap-flut'), gaveta = $('#gaveta'), menuBtn = $('.menu-btn');
  let yAnt = 0;
  function rolar() {
    const y = scrollY, lim = hero ? hero.offsetHeight * .6 : 80;
    topo.classList.toggle('solido', y > 40);
    const aberta = gaveta && gaveta.classList.contains('aberta');
    topo.classList.toggle('some', !aberta && y > lim && y > yAnt + 2);
    if (y < yAnt - 2 || y < lim) topo.classList.remove('some');
    zap && zap.classList.toggle('ve', y > lim && !aberta);
    yAnt = y;
  }
  addEventListener('scroll', rolar, { passive: true }); rolar();

  /* link ativo no menu */
  const links = $$('.topo nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(ents => ents.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const s = $(a.getAttribute('href')); s && io.observe(s); });
  }

  /* menu do celular */
  function gavetaAbrir(abrir) {
    if (!gaveta) return;
    menuBtn.setAttribute('aria-expanded', abrir);
    menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) {
      gaveta.hidden = false; document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => gaveta.classList.add('aberta')));
      topo.classList.add('solido'); topo.classList.remove('some');
    } else {
      gaveta.classList.remove('aberta'); document.documentElement.style.overflow = '';
      setTimeout(() => { if (!gaveta.classList.contains('aberta')) gaveta.hidden = true; }, 380);
      rolar();
    }
  }
  menuBtn && menuBtn.addEventListener('click', () => gavetaAbrir(menuBtn.getAttribute('aria-expanded') !== 'true'));
  gaveta && $$('a', gaveta).forEach(a => a.addEventListener('click', () => gavetaAbrir(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && gaveta && !gaveta.hidden) gavetaAbrir(false); });
  addEventListener('resize', () => { if (innerWidth > 1100 && gaveta && !gaveta.hidden) gavetaAbrir(false); });

  /* entradas ao rolar */
  const io = 'IntersectionObserver' in window && !reduz
    ? new IntersectionObserver(ents => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 })
    : null;
  const observar = el => io ? io.observe(el) : el.classList.add('visto');
  $$('.revela').forEach(observar);

  /* contadores */
  $$('[data-conta]').forEach(el => {
    const fim = +el.dataset.conta; if (reduz || fim < 3) return;
    el.textContent = '0';
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now(), dur = 1400;
      const passo = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(fim * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); };
      requestAnimationFrame(passo);
    }, { threshold: .6 }).observe(el);
  });

  /* manifesto: as palavras acendem conforme a frase sobe na tela */
  const man = $('[data-palavras]');
  if (man) {
    const destaque = ['traço', 'intenção'];
    man.innerHTML = man.textContent.trim().split(/\s+/).map(w => `<span class="p${destaque.some(d => w.startsWith(d)) ? ' v' : ''}">${w}</span>`).join(' ');
    const ps = $$('.p', man);
    if (reduz) ps.forEach(p => p.classList.add('on'));
    else {
      const pinta = () => {
        const r = man.getBoundingClientRect(), vh = innerHeight;
        const k = Math.min(1, Math.max(0, (vh * .86 - r.top) / (r.height + vh * .38)));
        const n = Math.round(k * ps.length);
        ps.forEach((p, i) => p.classList.toggle('on', i < n));
      };
      addEventListener('scroll', pinta, { passive: true }); addEventListener('resize', pinta); pinta();
    }
  }


  /* vídeos com fala: tocam mudos quando estão na tela; o botão liga o som do início,
     e só um fica com som por vez */
  const comFala = [];
  $$('.tela-video').forEach(tela => {
    const v = $('video', tela), btn = $('.som', tela);
    if (!v) return;
    const item = { v, comSom: false };
    const tocar = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    item.mudo = () => { item.comSom = false; v.muted = true; v.loop = true; btn && btn.setAttribute('aria-pressed', 'false'); };
    comFala.push(item);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; if (!reduz || item.comSom) tocar(); }
        else { v.pause(); if (item.comSom) item.mudo(); }
      }, { threshold: .35 }).observe(v);
    }
    btn && btn.addEventListener('click', () => {
      if (item.comSom) { item.mudo(); return; }
      comFala.forEach(o => { if (o !== item && o.comSom) o.mudo(); });
      item.comSom = true; v.muted = false; v.currentTime = 0; v.loop = false; tocar();
      btn.setAttribute('aria-pressed', 'true');
    });
    v.addEventListener('ended', () => { item.mudo(); tocar(); });
  });

  /* portfólio: grade 4:5 com filtros e "ver mais" */
  const CATS = { todos: 'Todos', fine: 'Fineline', energ: 'Energéticas', pets: 'Pets', foto: 'Fotos e escritas' };
  const galeria = $('#galeria'), obras = window.OBRAS || [], mais = $('#ver-mais');
  let filtroAtual = 'todos', limite = galeria ? +galeria.dataset.limite : 12, visiveis = [];
  if (galeria && obras.length) {
    galeria.innerHTML = obras.map((o, i) => `<figure class="obra" data-c="${o.c}" data-i="${i}">
      <button type="button" aria-label="Ampliar: ${o.a}"><img src="assets/img/obras/${o.id}-640.webp" srcset="assets/img/obras/${o.id}-640.webp 640w, assets/img/obras/${o.id}-1080.webp ${o.w}w" sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 300px" alt="${o.a}" loading="lazy" width="640" height="800"></button>
      <figcaption>${o.a}</figcaption></figure>`).join('');
    const filtros = $('.filtros');
    filtros.innerHTML = Object.entries(CATS).map(([k, v]) => `<button type="button" data-f="${k}" aria-pressed="${k === 'todos'}">${v}</button>`).join('');
    const itens = $$('.obra', galeria);
    function filtrar(cat) {
      filtroAtual = cat; visiveis = [];
      let n = 0, total = 0;
      itens.forEach(el => {
        const ok = cat === 'todos' || el.dataset.c === cat;
        if (ok) total++;
        const mostra = ok && n < limite;
        el.hidden = !mostra;
        if (mostra) { n++; visiveis.push(+el.dataset.i); el.classList.remove('visto'); observar(el); }
      });
      $$('button', filtros).forEach(b => b.setAttribute('aria-pressed', b.dataset.f === cat));
      if (mais) mais.parentNode.hidden = total <= n;
    }
    filtros.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; limite = +galeria.dataset.limite; filtrar(b.dataset.f); });
    mais && mais.addEventListener('click', () => { limite += 12; filtrar(filtroAtual); });
    filtrar('todos');
    /* os cartões de estilo filtram o portfólio */
    $$('[data-filtro]').forEach(a => a.addEventListener('click', () => { if (a.getAttribute('href') === '#trabalhos') { limite = +galeria.dataset.limite; filtrar(a.dataset.filtro); } }));
    galeria.addEventListener('click', e => { const f = e.target.closest('.obra'); if (f) abrirLuz(visiveis.indexOf(+f.dataset.i)); });
  }

  /* tela cheia do portfólio */
  const luz = $('#luz'), luzImg = $('#luz-img'), luzLeg = $('#luz-leg'), luzZap = $('#luz-zap');
  let li = 0, foco = null;
  function pintarLuz() {
    const o = obras[visiveis[li]]; if (!o) return;
    luzImg.style.opacity = 0;
    const src = `assets/img/obras/${o.id}-1080.webp`, tmp = new Image();
    tmp.onload = () => { luzImg.src = src; luzImg.alt = o.a; luzImg.style.opacity = 1; };
    tmp.src = src;
    luzLeg.textContent = o.a;
    luzZap.href = zapLink(`Oi, Marília! Vi no site o trabalho "${o.a}" e queria fazer algo nessa linha.`); luzZap.target = '_blank'; luzZap.rel = 'noopener';
  }
  function abrirLuz(i) {
    if (!luz || i < 0) return;
    li = i; foco = document.activeElement; pintarLuz();
    luz.hidden = false; document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => luz.classList.add('aberta'));
    $('.luz-fechar', luz).focus();
  }
  function fecharLuz() {
    luz.classList.remove('aberta'); document.documentElement.style.overflow = '';
    setTimeout(() => { luz.hidden = true; }, 300);
    foco && foco.focus();
  }
  const passa = d => { li = (li + d + visiveis.length) % visiveis.length; pintarLuz(); };
  if (luz) {
    $('.luz-fechar', luz).addEventListener('click', fecharLuz);
    $('.luz-ant', luz).addEventListener('click', () => passa(-1));
    $('.luz-prox', luz).addEventListener('click', () => passa(1));
    luz.addEventListener('click', e => { if (e.target === luz) fecharLuz(); });
    addEventListener('keydown', e => {
      if (luz.hidden) return;
      if (e.key === 'Escape') fecharLuz(); else if (e.key === 'ArrowRight') passa(1); else if (e.key === 'ArrowLeft') passa(-1);
    });
    let x0 = null;
    luz.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    luz.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) passa(dx < 0 ? 1 : -1); x0 = null; });
  }

  /* comparador de reformas: a linha acompanha o dedo/mouse; as miniaturas trocam o par */
  const comp = $('#comp');
  if (comp) {
    const rng = $('input', comp), dep = $('.comp-depois', comp), ant = $('.comp-antes img', comp);
    const pos = v => comp.style.setProperty('--x', v + '%');
    rng.addEventListener('input', () => pos(rng.value));
    $$('.comp-tabs button').forEach(b => b.addEventListener('click', () => {
      if (b.getAttribute('aria-selected') === 'true') return;
      $$('.comp-tabs button').forEach(o => o.setAttribute('aria-selected', o === b));
      $('#comp-tipo').textContent = b.dataset.tipo; $('#comp-leg').textContent = b.dataset.leg;
      comp.classList.add('trocando');
      const id = b.dataset.par, a = new Image(), d = new Image();
      let prontas = 0;
      const pronto = () => { if (++prontas < 2) return; dep.src = d.src; ant.src = a.src; rng.value = 50; pos(50); requestAnimationFrame(() => comp.classList.remove('trocando')); };
      setTimeout(() => { d.onload = a.onload = pronto; d.src = `assets/img/reformas/${id}-depois-540.webp`; a.src = `assets/img/reformas/${id}-antes-540.webp`; }, 200);
    }));
    /* uma passada da linha quando o comparador aparece, para mostrar que dá para arrastar */
    if (!reduz && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting) return; o.disconnect();
        const t0 = performance.now();
        const anda = t => { const k = Math.min(1, (t - t0) / 1800); const v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k); pos(v); rng.value = v; if (k < 1) requestAnimationFrame(anda); };
        setTimeout(() => requestAnimationFrame(anda), 500);
      }, { threshold: .6 }).observe(comp);
    }
  }

  /* ficha: monta a mensagem e abre o WhatsApp */
  const ficha = $('#ficha');
  ficha && ficha.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(ficha));
    const nome = ficha.elements.nome;
    if (!d.nome.trim()) { nome.classList.add('erro'); nome.focus(); return; }
    nome.classList.remove('erro');
    const linhas = [`Oi, Marília! Meu nome é ${d.nome.trim()} e vim pelo site.`, `Estilo: ${d.estilo}`];
    if (d.ideia.trim()) linhas.push(`Ideia: ${d.ideia.trim()}`);
    if (d.local.trim()) linhas.push(`Local do corpo: ${d.local.trim()}`);
    if (d.tamanho.trim()) linhas.push(`Tamanho aproximado: ${d.tamanho.trim()} cm`);
    linhas.push('Vou mandar as referências e a foto do local em seguida.');
    window.open(zapLink(linhas.join('\n')), '_blank', 'noopener');
  });
})();
