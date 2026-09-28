/* rif-crono.js — cronometro da sessao de 30 min de cada trilha. Gerado por _site/gerar_site_rif.py.
   Um por trilha, so neste aparelho (localStorage 'rif-crono-tNN'); sem ele, vale ate fechar a pagina.
   O tempo sai sempre de Date.now() - inicio (o setInterval dorme com a tela bloqueada).
   Estado: { fase: 'foco' | 'pausa', ini: ms, dur: ms, parado: ms | null }. Teste: ?crono=teste (6 s / 4 s). */
(function () {
  var b = document.getElementById('cronoBtn');
  if (!b) { return; }
  var pag = document.body.getAttribute('data-pagina') || 'trilha';
  var CHAVE = 'rif-crono-' + pag, teste = /[?&]crono=teste\b/.test(location.search);
  var FOCO = (teste ? 6 : 30 * 60) * 1000, PAUSA = (teste ? 4 : 10 * 60) * 1000, VELHO = 12 * 3600 * 1000;
  var ICONE = b.innerHTML, est = null, timer = null, dlg = null;
  var MSG = 'Caso não conclua esta trilha em 30 minutos, faça uma pausa de 10 minutos para o seu cérebro ' +
            'recompor os neurotransmissores e manter você focado na trilha. Atenção: não use as redes sociais, ' +
            'para não perder o foco.';

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

  function fechar() {
    var d = dlg; dlg = null;
    if (!d) { return; }
    if (d.close && d.open) { d.close(); }
    d.remove();
  }
  function janela(titulo, texto, botoes) {
    fechar();
    var d = document.createElement('dialog');
    d.className = 'crono-dlg';
    d.setAttribute('aria-labelledby', 'cronoTit');
    d.innerHTML = '<h2 id="cronoTit"></h2><p></p><div class="acoes"></div>';
    d.querySelector('h2').textContent = titulo;
    d.querySelector('p').textContent = texto;
    var acoes = d.querySelector('.acoes'), foco = null;
    botoes.forEach(function (x) {
      var k = document.createElement('button');
      k.type = 'button'; k.textContent = x[0];
      if (x[2]) { k.className = 'principal'; foco = k; }
      k.addEventListener('click', function () { fechar(); if (x[1]) { x[1](); } });
      acoes.appendChild(k);
    });
    d.addEventListener('close', function () { if (dlg === d) { dlg = null; } d.remove(); });
    document.body.appendChild(d);
    dlg = d;
    if (d.showModal) { d.showModal(); } else { d.setAttribute('open', ''); }
    (foco || acoes.firstChild).focus();
  }

  function iniciar(fase) {
    est = { fase: fase, ini: Date.now(), dur: fase === 'foco' ? FOCO : PAUSA, parado: null };
    gravar(); pintar();
  }
  function zerar() { est = null; gravar(); pintar(); }
  function acabou() {
    var fase = est.fase;
    est = null; gravar(); pintar();
    if (fase === 'foco') {
      janela('Tempo!', 'Os 30 minutos acabaram. Faça agora a pausa de 10 minutos, longe das redes sociais.',
             [['Fechar', null], ['Começar a pausa', function () { iniciar('pausa'); }, true]]);
    } else {
      janela('Pausa encerrada', 'Pausa encerrada. De volta à trilha.', [['OK', null, true]]);
    }
  }

  function pintar() {
    clearInterval(timer); timer = null;
    b.classList.remove('rodando', 'pausa', 'congelado');
    if (!est) {
      b.innerHTML = ICONE;
      rotulo('Cronômetro da sessão de 30 minutos');
      return;
    }
    var r = resta();
    if (r <= 0 && !est.parado) { acabou(); return; }
    b.textContent = mmss(r);
    b.classList.add(est.fase === 'foco' ? 'rodando' : 'pausa');
    if (est.parado) { b.classList.add('congelado'); }
    rotulo((est.fase === 'foco' ? 'Sessão' : 'Pausa') + (est.parado ? ' parada' : '') + ': faltam ' + mmss(r));
    if (!est.parado) { timer = setInterval(pintar, 1000); }
  }

  b.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!est) {
      janela('Sessão de 30 minutos', MSG,
             [['Agora não', null], ['Começar os 30 min', function () { iniciar('foco'); }, true]]);
      return;
    }
    var nome = est.fase === 'foco' ? 'Sessão' : 'Pausa';
    var alternar = est.parado
      ? ['Continuar', function () { est.ini += Date.now() - est.parado; est.parado = null; gravar(); pintar(); }, true]
      : ['Pausar', function () { est.parado = Date.now(); gravar(); pintar(); }, true];
    janela(nome + ': faltam ' + mmss(resta()),
           est.parado ? 'O cronômetro está parado.' : 'O cronômetro está contando.',
           [['Zerar', zerar], alternar]);
  });

  est = ler();
  if (est && !est.parado && Date.now() - (est.ini + est.dur) > VELHO) { est = null; gravar(); }
  pintar();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !dlg) { pintar(); } });
})();
