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
