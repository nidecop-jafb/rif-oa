/* rif-questao.js — gerado por _site/gerar_site_rif.py. Nao editar a mao. */
var RIF_BASE = window.RIF_BASE || '';
function rifEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
  });
}
function rifRamo(it) { return /Quant/.test(it.protocolo) ? 'quant' : 'qual'; }
function rifCard(it, extra) {
  var r = rifRamo(it), id = rifEsc(it.id);
  var passos = RIF_PASSOS[r], det = (it.resolucao && it.resolucao.detalhada) || [];
  var lis = det.map(function (t, i) {
    return '<li><b>' + rifEsc(passos[i] ? passos[i][0] : 'Passo ' + (i + 1)) + '</b>' + rifEsc(t) + '</li>';
  }).join('');
  var alt = (it.enunciado || '') + ' ' + Object.keys(it.alternativas || {}).map(function (k) {
    return k + ') ' + it.alternativas[k];
  }).join(' ');
  return '<article class="q ' + r + '" id="q-' + id + '">'
    + '<div class="q-cab"><span>IFMG ' + rifEsc(it.fonte.edicao) + ' · questão ' + rifEsc(it.fonte.numero)
    + ' · ' + rifEsc(it.classificacao.area) + '</span>'
    + '<span class="selo ' + r + '">' + (r === 'quant' ? 'Quantitativo' : 'Qualitativo') + '</span>'
    + (extra || '') + '</div>'
    + '<div class="q-fig"><img loading="lazy" src="' + RIF_BASE + '_figuras/' + id + '.png" alt="' + rifEsc(alt) + '"></div>'
    + '<div class="q-acoes">'
    + '<button type="button" aria-expanded="false" onclick="rifAbrir(this, \'gab-' + id + '\')">Ver a resposta</button>'
    + '<button type="button" aria-expanded="false" onclick="rifAbrir(this, \'det-' + id + '\')">Resolução em 5 passos</button>'
    + '<button type="button" aria-expanded="false" onclick="rifAbrir(this, \'con-' + id + '\')">Resolução condensada</button>'
    + '<a class="so-web" href="' + rifEsc(it.fonte.url_prova) + '" target="_blank" rel="noopener">Abrir o PDF da prova (' + rifEsc(it.fonte.paginas) + ' páginas)</a>'
    + '</div>'
    + '<div class="q-res" id="gab-' + id + '" hidden><p class="gab">Resposta: alternativa ' + rifEsc(it.gabarito) + '</p></div>'
    + '<div class="q-res" id="det-' + id + '" hidden><ol>' + lis + '</ol></div>'
    + '<div class="q-res" id="con-' + id + '" hidden><p class="cond">' + rifEsc(it.resolucao.condensada || '') + '</p></div>'
    + '</article>';
}
function rifAbrir(bt, alvo) {
  var el = document.getElementById(alvo), abrir = el.hidden;
  el.hidden = !abrir;
  bt.setAttribute('aria-expanded', abrir ? 'true' : 'false');
}
function rifPorId(id) {
  for (var i = 0; i < BANCO_ITENS.length; i++) { if (BANCO_ITENS[i].id === id) { return BANCO_ITENS[i]; } }
  return null;
}
