/* rif-abas.js — abas da lateral esquerda (molde lme-oa). Gerado por _site/gerar_site_rif.py. */
(function () {
  var toggles = [].slice.call(document.querySelectorAll('.aba-toggle'));
  function painel(t) { return document.getElementById(t.id.replace(/T$/, '')); }
  function empilhar() {
    var y = 56;
    toggles.forEach(function (t) { t.style.top = y + 'px'; y += t.offsetHeight + 14; });
  }
  function fechar() {
    toggles.forEach(function (t) { t.classList.remove('ativa'); painel(t).classList.remove('open'); });
  }
  toggles.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var abrir = !painel(t).classList.contains('open');
      fechar();
      if (abrir) { painel(t).classList.add('open'); t.classList.add('ativa'); }
    });
  });
  /* Qualquer clique fora da lingueta fecha a aba aberta (regra da LME, 2026-09-14). */
  document.addEventListener('click', fechar);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fechar(); } });
  empilhar();
  window.addEventListener('resize', empilhar);
})();

/* Indice: #tNN (atalho, casinha de uma trilha, link direto) abre ESSA trilha e fecha as outras. */
(function () {
  var trilhas = [].slice.call(document.querySelectorAll('details.trilha'));
  if (!trilhas.length) { return; }
  function abrir() {
    var id = decodeURIComponent(location.hash.slice(1)), alvo = id && document.getElementById(id);
    if (!alvo || trilhas.indexOf(alvo) < 0) { return; }
    trilhas.forEach(function (d) { d.open = d === alvo; });
    alvo.scrollIntoView();
  }
  window.addEventListener('hashchange', abrir);
  abrir();
})();

/* A-/A+: 3 tamanhos (normal, g, gg) na base do html; a escolha vem do <head> e fica em rif-letra. */
(function () {
  var h = document.documentElement, menos = document.getElementById('letraMenos'),
      mais = document.getElementById('letraMais'), passos = ['', 'g', 'gg'];
  if (!menos || !mais) { return; }
  function atual() { return Math.max(0, passos.indexOf(h.getAttribute('data-letra') || '')); }
  function mostrar() { var i = atual(); menos.disabled = i === 0; mais.disabled = i === passos.length - 1; }
  function mudar(d, e) {
    e.stopPropagation();
    var i = Math.min(passos.length - 1, Math.max(0, atual() + d));
    if (passos[i]) { h.setAttribute('data-letra', passos[i]); } else { h.removeAttribute('data-letra'); }
    try { localStorage.setItem('rif-letra', passos[i]); } catch (err) { /* sem localStorage: vale ate fechar */ }
    mostrar();
  }
  menos.addEventListener('click', function (e) { mudar(-1, e); });
  mais.addEventListener('click', function (e) { mudar(1, e); });
  mostrar();
})();

/* Questao-imagem: um toque abre em tela cheia; um toque (ou Voltar) fecha. */
(function () {
  var aberta = null;
  function fechar(daHistoria) {
    if (!aberta) { return; }
    aberta.remove(); aberta = null; document.body.style.overflow = '';
    if (!daHistoria && history.state && history.state.rifZoom) { history.back(); }
  }
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.q-fig img, .q-base img, .q-ilus img');
    if (!img || aberta) { return; }
    aberta = document.createElement('div');
    aberta.className = 'zoom-fig';
    aberta.setAttribute('role', 'dialog');
    aberta.setAttribute('aria-label', 'Figura ampliada; toque para fechar');
    aberta.innerHTML = '<button class="zoom-x" type="button" aria-label="Fechar">&times;</button>';
    var c = img.cloneNode(); c.removeAttribute('loading'); aberta.appendChild(c);
    aberta.addEventListener('click', function () { fechar(false); });
    document.body.appendChild(aberta); document.body.style.overflow = 'hidden';
    try { history.pushState({rifZoom: 1}, ''); } catch (err) { /* sem historia: fecha so pelo toque */ }
  });
  window.addEventListener('popstate', function () { fechar(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fechar(false); } });
})();

/* Botao Tema (sol/lua): o tema inicial vem do <head> (escolha guardada ou o do aparelho). */
(function () {
  var b = document.getElementById('temaBtn'), h = document.documentElement;
  if (!b) { return; }
  function rotulo() {
    var r = h.getAttribute('data-tema') === 'claro' ? 'Mudar para o modo escuro' : 'Mudar para o modo claro';
    b.setAttribute('aria-label', r); b.title = r;
  }
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    var novo = h.getAttribute('data-tema') === 'claro' ? 'escuro' : 'claro';
    h.setAttribute('data-tema', novo);
    try { localStorage.setItem('rif-tema', novo); } catch (err) { /* sem localStorage: vale ate fechar a pagina */ }
    rotulo();
  });
  rotulo();
})();

/* Aquecimento gradativo (PRE-site-rif-aquecimento-gradativo-estudo-focado-2026-10-01): so nas trilhas.
   Grupos .grad-g 1-4 = etapas do aquecimento; 5 = Fase 2 (estudo focado). "Pronto, próxima etapa" revela o
   grupo seguinte; no grupo 4, os passos do exemplo abrem um por vez ("Próximo passo"). O cronometro so mede.
   Progresso no aparelho (rif-grad-tNN); sem JS, tudo aparece aberto. */
(function () {
  function iniciar() {
    var grupos = [].slice.call(document.querySelectorAll('.grad-g'));
    if (!grupos.length) { return; }
    var pasta = location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '').split('/').pop() || 'trilha';
    var chave = 'rif-grad-' + pasta, max = grupos.length, st = {};
    try { st = JSON.parse(localStorage.getItem(chave)) || {}; } catch (e) { st = {}; }
    var g = Math.min(Math.max(st.g || 1, 1), max);
    var g4 = document.querySelector('.grad-g[data-g="4"]');
    var lis = g4 ? [].slice.call(g4.querySelectorAll('.passo1-ex ol li')) : [];
    var p = Math.min(Math.max(st.p || 1, 1), lis.length || 1);
    var caixas = g4 ? [].slice.call(g4.querySelectorAll('.passo1-ex')).filter(function (cx) { return cx.querySelector('ol'); }) : [];
    var viz = document.querySelector('.trilha-viz');
    var alvo = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (alvo) {                                         /* link direto para algo da pagina: abre tudo */
      grupos.forEach(function (el, i) { if (el.contains(alvo)) { g = Math.max(g, i + 1 > 4 ? max : i + 1); } });
      if (g >= 4) { p = lis.length || 1; }
    }
    function botao(txt, cls) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'grad-btn' + (cls ? ' ' + cls : ''); b.textContent = txt;
      b.setAttribute('aria-expanded', 'false');
      return b;
    }
    var bEtapa = botao('Pronto, próxima etapa'), bPasso = botao('Próximo passo', 'passo-btn');
    function gravar() { try { localStorage.setItem(chave, JSON.stringify({ g: g, p: p })); } catch (e) { /* sem localStorage */ } }
    function mostrar() {
      grupos.forEach(function (el) { el.hidden = +el.getAttribute('data-g') > g; });
      lis.forEach(function (li, i) { li.hidden = g === 4 && i >= p; });
      caixas.forEach(function (cx) {           /* 2.o exemplo (T11): questao e passos so quando chegar a vez */
        var vazio = g === 4 && ![].some.call(cx.querySelectorAll('li'), function (li) { return !li.hidden; });
        cx.hidden = vazio;
        if (cx.previousElementSibling) { cx.previousElementSibling.hidden = vazio; }
      });
      if (viz) { viz.hidden = g < max; }       /* anterior/proxima so na Fase 2: ninguem pula a trilha */
      if (bPasso.parentNode) { bPasso.parentNode.removeChild(bPasso); }
      if (bEtapa.parentNode) { bEtapa.parentNode.removeChild(bEtapa); }
      if (g === 4 && p < lis.length) {
        var ol = lis[p].parentNode;
        ol.parentNode.insertBefore(bPasso, ol.nextSibling);
        return;
      }
      if (g < max) { grupos[g - 1].appendChild(bEtapa); }
    }
    bEtapa.addEventListener('click', function () {
      g += 1; if (g === 4) { p = 1; } gravar(); mostrar();
      var novo = grupos[g - 1];
      novo.scrollIntoView({ block: 'start', behavior: 'smooth' });
      var foco = novo.querySelector('.etapa, .fase-t'); if (foco) { foco.setAttribute('tabindex', '-1'); foco.focus({ preventScroll: true }); }
    });
    bPasso.addEventListener('click', function () {
      var li = lis[p]; p += 1; gravar(); mostrar();
      if (li) { li.setAttribute('tabindex', '-1'); li.focus({ preventScroll: true }); li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    });
    mostrar();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})();
