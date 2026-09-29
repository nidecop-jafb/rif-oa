/* rif-crono.js — cronometro de cada trilha: aquecimento (10 min) e estudo das sessoes (30 min), pausa de 10.
   Gerado por _site/gerar_site_rif.py. Um por trilha, so neste aparelho (localStorage 'rif-crono-tNN'); sem ele,
   vale ate fechar a pagina. O tempo sai sempre de Date.now() - inicio (o setInterval dorme com a tela bloqueada).
   Estado: { fase: 'aquec' | 'foco' | 'pausa', ini: ms, dur: ms, parado: ms | null, avisado: bool }.
   Nada muda sozinho: o fim do aquecimento so avisa. Teste: ?crono=teste (5 s / 6 s / 4 s). */
(function () {
  var b = document.getElementById('cronoBtn');
  if (!b) { return; }
  var AUDIOS = [];
  var base = (document.currentScript && document.currentScript.src) || location.href;
  var pag = document.body.getAttribute('data-pagina') || 'trilha';
  var CHAVE = 'rif-crono-' + pag, teste = /[?&]crono=teste\b/.test(location.search);
  var DUR = { aquec: (teste ? 5 : 10 * 60) * 1000, foco: (teste ? 6 : 30 * 60) * 1000,
              pausa: (teste ? 4 : 10 * 60) * 1000 };
  var NOME = { aquec: 'Aquecimento', foco: 'Estudo', pausa: 'Pausa' };
  var LETRA = { aquec: 'A', foco: 'E', pausa: 'P' };
  var VELHO = 12 * 3600 * 1000, ICONE = b.innerHTML, est = null, timer = null, dlg = null;
  var n = document.querySelectorAll('.sessao-t').length;
  var META = 'Aquecimento: até 10 minutos. ' + (n ? 'Estudo das ' + n + ' sessões' : 'Estudo das questões') +
             ': até 30 minutos.';
  var MSG = 'Se não concluir o estudo desta trilha em 30 minutos, faça uma pausa de 10 minutos para o seu ' +
            'cérebro recompor os neurotransmissores e manter você focado. Atenção: desligue as notificações do ' +
            'celular e não use as redes sociais, para não perder o foco.';

  function ler() { try { var t = localStorage.getItem(CHAVE); return t ? JSON.parse(t) : null; } catch (e) { return est; } }
  function gravar() {
    try { if (est) { localStorage.setItem(CHAVE, JSON.stringify(est)); } else { localStorage.removeItem(CHAVE); } }
    catch (e) { /* sem localStorage: vale ate fechar a pagina */ }
  }
  function resta() { return est ? est.dur - ((est.parado || Date.now()) - est.ini) : 0; }
  function mmss(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(s / 60); s = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function rotulo(r) { b.setAttribute('aria-label', r); b.title = r; }
  function calar(d) { [].forEach.call(d.querySelectorAll('audio'), function (a) { a.pause(); }); }

  function fechar() {
    var d = dlg; dlg = null;
    if (!d) { return; }
    calar(d);
    if (d.close && d.open) { d.close(); }
    d.remove();
  }
  /* textos: string ou lista de paragrafos; extra.forte = 1.o paragrafo em destaque; extra.audio = players */
  function janela(titulo, textos, botoes, extra) {
    fechar();
    extra = extra || {};
    var d = document.createElement('dialog');
    d.className = 'crono-dlg';
    d.setAttribute('aria-labelledby', 'cronoTit');
    d.innerHTML = '<h2 id="cronoTit"></h2><div class="texto"></div><div class="acoes"></div>';
    d.querySelector('h2').textContent = titulo;
    var caixa = d.querySelector('.texto');
    [].concat(textos).forEach(function (t, i) {
      var p = document.createElement('p'); p.textContent = t;
      if (i === 0 && extra.forte) { p.className = 'meta'; }
      caixa.appendChild(p);
    });
    if (extra.audio && AUDIOS.length) {
      var au = document.createElement('div'); au.className = 'crono-audio';
      AUDIOS.forEach(function (x) {
        var f = document.createElement('div'), r = document.createElement('p'), a = document.createElement('audio');
        r.textContent = x[0]; a.controls = true; a.preload = 'none'; a.src = new URL(x[1], base).href;
        a.addEventListener('play', function () {
          [].forEach.call(au.querySelectorAll('audio'), function (o) { if (o !== a) { o.pause(); } });
        });
        f.appendChild(r); f.appendChild(a); au.appendChild(f);
      });
      caixa.appendChild(au);
    }
    var acoes = d.querySelector('.acoes'), foco = null;
    botoes.forEach(function (x) {
      var k = document.createElement('button');
      k.type = 'button'; k.textContent = x[0];
      if (x[2]) { k.className = 'principal'; foco = k; }
      k.addEventListener('click', function () { fechar(); if (x[1]) { x[1](); } });
      acoes.appendChild(k);
    });
    d.addEventListener('close', function () { calar(d); if (dlg === d) { dlg = null; } d.remove(); });
    document.body.appendChild(d);
    dlg = d;
    if (d.showModal) { d.showModal(); } else { d.setAttribute('open', ''); }
    (foco || acoes.firstChild).focus();
  }

  function iniciar(fase) {
    est = { fase: fase, ini: Date.now(), dur: DUR[fase], parado: null };
    gravar(); pintar();
  }
  function zerar() { est = null; gravar(); pintar(); }
  function estudar() { return ['Começar o estudo (30 min)', function () { iniciar('foco'); }, true]; }
  function avisoAquec() {
    janela('Aquecimento concluído', 'Os 10 minutos de aquecimento acabaram. Agora, o estudo das sessões: até ' +
           '30 minutos.', [['Agora não', null], estudar()]);
  }
  function acabou() {
    var fase = est.fase;
    if (fase === 'aquec') {            /* nada muda sozinho: o icone fica em A 00:00 ate o estudante escolher */
      if (!est.avisado) { est.avisado = true; gravar(); if (!dlg) { avisoAquec(); } }
      return;
    }
    est = null; gravar(); pintar();
    if (fase === 'foco') {
      janela('Tempo!', 'Os 30 minutos de estudo acabaram. Se não concluiu a trilha, faça agora a pausa de ' +
             '10 minutos, longe das redes sociais.',
             [['Fechar', null], ['Começar a pausa', function () { iniciar('pausa'); }, true]]);
    } else {
      janela('Pausa encerrada', 'Pausa encerrada. De volta à trilha.', [['OK', null, true]]);
    }
  }

  function pintar() {
    clearInterval(timer); timer = null;
    b.classList.remove('rodando', 'aquec', 'pausa', 'congelado');
    if (!est) {
      b.innerHTML = ICONE;
      rotulo('Cronômetro da trilha: aquecimento de 10 minutos e estudo de 30 minutos');
      return;
    }
    var r = resta();
    b.textContent = LETRA[est.fase] + ' ' + mmss(r);
    b.classList.add(est.fase === 'foco' ? 'rodando' : est.fase);
    if (est.parado) { b.classList.add('congelado'); }
    rotulo(NOME[est.fase] + (est.parado ? ' parado' : '') + ': faltam ' + mmss(r));
    if (r <= 0 && !est.parado) { acabou(); return; }
    if (!est.parado) { timer = setInterval(pintar, 1000); }
  }

  b.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!est) {
      janela('Metas desta trilha', [META, MSG],
             [['Agora não', null], ['Começar o aquecimento', function () { iniciar('aquec'); }, true]],
             { forte: true, audio: true });
      return;
    }
    if (est.fase === 'aquec' && resta() <= 0) { avisoAquec(); return; }
    var aquec = est.fase === 'aquec';
    var alternar = est.parado
      ? ['Continuar', function () { est.ini += Date.now() - est.parado; est.parado = null; gravar(); pintar(); }, !aquec]
      : ['Pausar', function () { est.parado = Date.now(); gravar(); pintar(); }, !aquec];
    janela(NOME[est.fase] + ': faltam ' + mmss(resta()),
           est.parado ? 'O cronômetro está parado.' : 'O cronômetro está contando.',
           aquec ? [['Zerar', zerar], alternar, estudar()] : [['Zerar', zerar], alternar]);
  });

  est = ler();
  if (est && !est.parado && Date.now() - (est.ini + est.dur) > VELHO) { est = null; gravar(); }
  pintar();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !dlg) { pintar(); } });
})();
