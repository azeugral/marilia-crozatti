/* Fios de tinta do topo: linhas finíssimas (isolinhas de um ruído torcido) em verde sobre papel creme,
   como traço de fineline. Um segundo ruído decide onde a tinta "pega", então os fios aparecem e somem
   devagar. Tudo depende só de cos/sin da fase, logo o quadro de 2π é igual ao de 0 e o vídeo fecha
   sem emenda. Pinta o fundo inteiro (papel + linhas): no toque o MP4 entra no lugar do canvas.
   fiosGL(canvas, {modo}) -> {tamanho(w,h,dpr), desenhar(fase)}
   modo 0 = topo deitado (fios mais fortes à direita, em volta da foto, e apagados atrás do texto);
   modo 1 = topo em pé (fortes no alto e no pé, centro limpo para o nome e os botões).
   O mesmo arquivo gera os MP4 em tools/gerar_fios.py. */
(function (g) {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes; uniform float uFase; uniform float uModo; uniform float uDpr;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*ruido(p);p=rot(.6)*p*2.02+vec2(3.1,7.7);a*=.5;}return s;}

void main(){
  vec2 fc=gl_FragCoord.xy, c01=fc/uRes;
  float esc=min(uRes.x,uRes.y);
  vec2 p=fc/esc*1.15;
  vec2 c=vec2(cos(uFase),sin(uFase));

  /* campo torcido que respira em círculo (sem emenda) */
  vec2 w=vec2(fbm(p*.55+c*.32),fbm(p*.55+vec2(4.1,2.3)-c.yx*.32));
  float f=fbm(p*.62+w*1.25+c*.12);
  /* fios longos e quase paralelos, em diagonal, ondulados pelo ruído (seda, não mapa) */
  float N=24.;
  float v=(dot(p,vec2(-.34,.94))+(f-.5)*1.5)*N;
  float fr=fract(v);
  float d=min(fr,1.-fr);
  float px=fwidth(v);
  /* espessura em pixels de tela: ~0.9 px, uma linha em cada cinco um pouco mais cheia */
  float forte=step(.8,fract(floor(v+.5)/5.));
  float larg=(.55+forte*.45)*max(uDpr,1.);
  float linha=1.-smoothstep(px*larg*.5,px*(larg*.5+1.),d);

  /* onde a tinta pega: manchas largas que passeiam e deixam os fios aparecer e sumir */
  float pega=smoothstep(.38,.66,fbm(p*.9-c*.45+vec2(9.,3.)));

  float zona;
  if(uModo<.5){
    /* atrás do nome (esquerda, meio) quase nada; forte à direita e no pé */
    float dir=smoothstep(.3,.8,c01.x);
    float pe=1.-smoothstep(.0,.28,c01.y);
    zona=clamp(.06+dir*.94+pe*.3,0.,1.);
  }else{
    float alto=smoothstep(.55,.95,c01.y), pe=1.-smoothstep(.0,.18,c01.y);
    zona=clamp(.1+alto*.9+pe*.5,0.,1.);
  }

  float a=linha*pega*zona*.55;
  vec3 papel=vec3(.945,.925,.886), tinta=vec3(.17,.26,.21);
  /* papel com uma leve mancha quente, como folha de linho */
  papel-=vec3(.018,.02,.026)*smoothstep(.3,.8,fbm(p*.35+vec2(2.,5.)));
  vec3 col=mix(papel,tinta,a);
  col+=(fract(52.9829189*fract(dot(fc,vec2(.06711056,.00583715))))-.5)*.004;
  gl_FragColor=vec4(col,1.);
}`;

  g.fiosGL = function (cv, op = {}) {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.preserveDrawingBuffer, powerPreference: 'low-power' });
    if (!gl || !gl.getExtension('OES_standard_derivatives')) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const u = n => gl.getUniformLocation(pr, n);
    const uR = u('uRes'), uF = u('uFase'), uD = u('uDpr');
    gl.uniform1f(u('uModo'), op.modo || 0);
    let dpr = 1;
    return {
      tamanho(w, h, d) { cv.width = w; cv.height = h; dpr = d || 1; },
      desenhar(fase) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uF, fase); gl.uniform1f(uD, dpr);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  };
})(window);
