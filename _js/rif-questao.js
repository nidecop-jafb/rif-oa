/* rif-questao.js — gerado por _site/gerar_site_rif.py. Nao editar a mao. */
var RIF_BASE = window.RIF_BASE || '';
function rifEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
  });
}
function rifRamo(it) { return /Quant/.test(it.protocolo) ? 'quant' : 'qual'; }
/* Registro da resolucao (briefing PRE-site-rif-registro-resolucao-questao-2026-09-26): so neste
   aparelho, em localStorage; sem ele, vale ate fechar a pagina. Por questao:
   { alt, ver, res: 'cinco' | 'passo' | 'errou' | '', passos: [1..5], naosei, nota }. */
var RIF_REG_CHAVE = 'rif-registro-v1', RIF_REG = null, RIF_REG_OK = true;
var RIF_PASSOS_CURTO = ['O que a questão quer?', 'O que eu tenho?', 'O desenho ou separar as afirmações',
                        'Minha solução ou julgar uma por uma', 'Confiro e respondo'];
function rifReg() {
  if (RIF_REG) { return RIF_REG; }
  try { var t = localStorage.getItem(RIF_REG_CHAVE); RIF_REG = t ? JSON.parse(t) : {}; }
  catch (e) { RIF_REG_OK = false; RIF_REG = {}; }
  return RIF_REG;
}
function rifRegSalvar() {
  try { localStorage.setItem(RIF_REG_CHAVE, JSON.stringify(RIF_REG)); RIF_REG_OK = true; } catch (e) { RIF_REG_OK = false; }
  rifFaixa();
}
/* Passo mais errado em todas as questoes registradas: [n, vezes] ou null. Empate: o passo mais cedo. */
function rifPassoDificil() {
  var reg = rifReg(), cont = [0, 0, 0, 0, 0, 0], top = 0;
  Object.keys(reg).forEach(function (k) { (reg[k].passos || []).forEach(function (p) { cont[p]++; }); });
  for (var p = 1; p <= 5; p++) { if (cont[p] > cont[top]) { top = p; } }
  return top ? [top, cont[top]] : null;
}
/* Opcoes do registro (cartao e simulado). rotulos = 5 nomes de passo; salvar = grava no aparelho. */
function rifRegHtml(id, r, acertou, rotulos, comNota, salvar) {
  r = r || {}; var ps = r.passos || [], abre = !acertou || r.res === 'passo';
  var h = '<div class="reg" data-reg="' + rifEsc(id) + '"' + (salvar ? ' data-salvar="1"' : '') + '>';
  if (acertou) {
    h += '<label class="chk"><input type="radio" name="res-' + rifEsc(id) + '" value="cinco" data-reg-c="res"'
      + (r.res === 'cinco' ? ' checked' : '') + '> Acertei os 5 passos</label>'
      + '<label class="chk"><input type="radio" name="res-' + rifEsc(id) + '" value="passo" data-reg-c="res"'
      + (r.res === 'passo' ? ' checked' : '') + '> Acertei a resposta, mas errei passo</label>';
  }
  h += '<div class="reg-passos"' + (abre ? '' : ' hidden') + '><p>Em que passo eu errei? Pode marcar mais de um.</p>';
  for (var i = 1; i <= 5; i++) {
    h += '<label class="chk"><input type="checkbox" value="' + i + '" data-reg-c="p"' + (ps.indexOf(i) >= 0 ? ' checked' : '')
      + '> ' + i + ' · ' + rifEsc(rotulos[i - 1]) + '</label>';
  }
  h += '<label class="chk"><input type="checkbox" data-reg-c="naosei"' + (r.naosei ? ' checked' : '')
    + '> Não sei em que passo errei</label>';
  if (comNota) {
    h += '<input type="text" maxlength="120" data-reg-c="nota" placeholder="o que eu errei (só fica neste aparelho)" value="'
      + rifEsc(r.nota) + '">';
  }
  return h + '</div></div>';
}
/* Le as opcoes marcadas de um .reg (o simulado envia isto): 'ok5' | '2,4' | 'nao-sei' | ''. */
function rifRegValor(el) {
  var res = el.querySelector('[data-reg-c="res"]:checked');
  if (res && res.value === 'cinco') { return 'ok5'; }
  var ps = [].slice.call(el.querySelectorAll('[data-reg-c="p"]:checked')).map(function (c) { return c.value; });
  if (ps.length) { return ps.join(','); }
  return el.querySelector('[data-reg-c="naosei"]:checked') ? 'nao-sei' : '';
}
function rifRegMudou(e) {
  var t = e.target, c = t.getAttribute('data-reg-c'), el = t.closest ? t.closest('.reg') : null;
  if (!c || !el) { return; }
  var box = el.querySelector('.reg-passos');
  if (c === 'res') {
    box.hidden = t.value !== 'passo';
    if (t.value === 'cinco') {
      [].forEach.call(box.querySelectorAll('input[type=checkbox]'), function (x) { x.checked = false; });
      var n = box.querySelector('[data-reg-c="nota"]'); if (n) { n.value = ''; }
    }
  } else if (c === 'p' && t.checked) { box.querySelector('[data-reg-c="naosei"]').checked = false; }
  else if (c === 'naosei' && t.checked) {
    [].forEach.call(box.querySelectorAll('[data-reg-c="p"]'), function (x) { x.checked = false; });
  }
  if (!el.getAttribute('data-salvar')) { return; }
  var reg = rifReg(), r = reg[el.getAttribute('data-reg')];
  if (!r) { return; }
  var res = el.querySelector('[data-reg-c="res"]:checked');
  if (res) { r.res = res.value; }
  r.passos = [].slice.call(el.querySelectorAll('[data-reg-c="p"]:checked')).map(function (x) { return +x.value; });
  r.naosei = !!el.querySelector('[data-reg-c="naosei"]:checked');
  var nota = el.querySelector('[data-reg-c="nota"]'); r.nota = nota ? nota.value : '';
  rifRegSalvar();
}
document.addEventListener('change', rifRegMudou);
document.addEventListener('input', function (e) { if (e.target.getAttribute('data-reg-c') === 'nota') { rifRegMudou(e); } });

function rifCard(it, extra) {
  var r = rifRamo(it), id = rifEsc(it.id), g = rifReg()[it.id], ver = !!(g && g.ver);
  var passos = RIF_PASSOS[r], det = (it.resolucao && it.resolucao.detalhada) || [];
  var lis = det.map(function (t, i) {
    return '<li><b>' + rifEsc(passos[i] ? passos[i][0] : 'Passo ' + (i + 1)) + '</b>' + rifEsc(t) + '</li>';
  }).join('');
  var alt = (it.enunciado || '') + ' ' + Object.keys(it.alternativas || {}).map(function (k) {
    return k + ') ' + it.alternativas[k];
  }).join(' ');
  var alts = ['A', 'B', 'C', 'D', 'E'].map(function (l) {
    return '<label class="alt"><input type="radio" name="alt-' + id + '" value="' + l + '"'
      + (ver && g.alt === l ? ' checked' : '') + (ver ? ' disabled' : '') + '> ' + l + '</label>';
  }).join('');
  var gab = '';
  if (ver) {
    var ok = g.alt === it.gabarito;
    gab = (ok ? '<p class="gab">Acertei! Alternativa ' + rifEsc(it.gabarito) + '.</p>'
              : '<p class="gab">Resposta certa: alternativa ' + rifEsc(it.gabarito) + ' · eu marquei ' + rifEsc(g.alt) + '.</p>')
      + rifRegHtml(it.id, g, ok, passos.map(function (p) { return p[0]; }), true, true)
      + '<p class="reg-nota">Isto fica guardado só neste aparelho. <button type="button" class="reg-apagar" onclick="rifRefazer(\''
      + id + '\')">Apagar e refazer esta questão</button></p>';
  }
  return '<article class="q ' + r + '" id="q-' + id + '">'
    + '<div class="q-cab"><span>IFMG ' + rifEsc(it.fonte.edicao) + ' · questão ' + rifEsc(it.fonte.numero)
    + ' · ' + rifEsc(it.classificacao.area) + '</span>'
    + '<span class="selo ' + r + '">' + (r === 'quant' ? 'Quantitativo' : 'Qualitativo') + '</span>'
    + (extra || '') + '</div>'
    + '<div class="q-fig"><img loading="lazy" src="' + RIF_BASE + '_figuras/' + id + '.png" alt="' + rifEsc(alt) + '"></div>'
    + '<div class="q-alts"><span>Minha resposta:</span>' + alts + '</div>'
    + '<div class="q-acoes">'
    + '<button type="button"' + (ver ? ' aria-expanded="true" disabled' : '') + ' onclick="rifConferir(\'' + id + '\')">'
    + (ver ? 'Resposta conferida' : 'Ver a resposta') + '</button>'
    + '<button type="button" aria-expanded="false" onclick="rifAbrir(this, \'det-' + id + '\')">Resolução em 5 passos</button>'
    + '<button type="button" aria-expanded="false" onclick="rifAbrir(this, \'con-' + id + '\')">Resolução condensada</button>'
    + '<a class="so-web" href="' + rifEsc(it.fonte.url_prova) + '" target="_blank" rel="noopener">Abrir o PDF da prova (' + rifEsc(it.fonte.paginas) + ' páginas)</a>'
    + '</div>'
    + '<p class="msg-erro" id="falta-' + id + '" hidden>Marque uma alternativa antes de ver a resposta.</p>'
    + '<div class="q-res" id="gab-' + id + '"' + (ver ? '' : ' hidden') + '>' + gab + '</div>'
    + '<div class="q-res" id="det-' + id + '" hidden><ol>' + lis + '</ol></div>'
    + '<div class="q-res" id="con-' + id + '" hidden><p class="cond">' + rifEsc(it.resolucao.condensada || '') + '</p></div>'
    + '</article>';
}
function rifRedesenhar(id) {
  var art = document.getElementById('q-' + id), it = rifPorId(id);
  if (art && it) { art.outerHTML = rifCard(it); }
  rifFaixa();
}
function rifConferir(id) {
  var m = document.querySelector('input[name="alt-' + id + '"]:checked'), it = rifPorId(id);
  if (!m) { document.getElementById('falta-' + id).hidden = false; return; }
  rifReg()[id] = { alt: m.value, ver: 1, res: m.value === it.gabarito ? '' : 'errou', passos: [], naosei: false, nota: '' };
  rifRegSalvar();
  rifRedesenhar(id);
}
function rifRefazer(id) {
  if (!confirm('Apagar o que eu marquei nesta questão e fazer de novo?')) { return; }
  delete rifReg()[id];
  rifRegSalvar();
  rifRedesenhar(id);
}
/* Faixa do topo: <p id="regFaixa" data-ids='[...]'> (sem data-ids = todas as questoes da aba). */
function rifFaixa() {
  var el = document.getElementById('regFaixa');
  if (!el) { return; }
  var reg = rifReg(), lista = el.getAttribute('data-ids');
  var ids = lista ? JSON.parse(lista) : BANCO_ITENS.map(function (it) { return it.id; });
  var feitas = ids.filter(function (k) { return reg[k] && reg[k].ver; }).length, d = rifPassoDificil();
  var h = '<b>' + feitas + ' de ' + ids.length + '</b> questões feitas ' + (lista ? 'nesta trilha' : 'nesta página') + '. ';
  h += d ? 'Meu passo mais difícil até agora: <b>Passo ' + d[0] + ' · ' + rifEsc(RIF_PASSOS_CURTO[d[0] - 1]) + '</b> ('
      + d[1] + (d[1] === 1 ? ' vez' : ' vezes') + '). <a href="' + (window.RIF_RAIZ || '../') + 't0a/index.html#passos">Rever os 5 passos</a>'
    : 'Quando eu errar, marco o passo: aqui aparece o meu passo mais difícil.';
  if (!RIF_REG_OK) { h += '<br>Este navegador não está deixando guardar: o que eu marcar some quando fechar a página.'; }
  el.innerHTML = h;
}
document.addEventListener('DOMContentLoaded', rifFaixa);
function rifAbrir(bt, alvo) {
  var el = document.getElementById(alvo), abrir = el.hidden;
  el.hidden = !abrir;
  bt.setAttribute('aria-expanded', abrir ? 'true' : 'false');
}
function rifPorId(id) {
  for (var i = 0; i < BANCO_ITENS.length; i++) { if (BANCO_ITENS[i].id === id) { return BANCO_ITENS[i]; } }
  return null;
}
