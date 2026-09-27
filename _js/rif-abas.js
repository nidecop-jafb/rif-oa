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
  [].slice.call(document.querySelectorAll('.trilha-nav a')).forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.getAttribute('href') === location.hash) { setTimeout(abrir, 0); }   /* mesmo hash: sem hashchange */
    });
  });
  window.addEventListener('hashchange', abrir);
  abrir();
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
