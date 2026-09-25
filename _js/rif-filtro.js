/* rif-filtro.js — aba Questoes. Gerado por _site/gerar_site_rif.py. */
function rifSemAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function rifFiltrar() {
  var ano = document.getElementById('fAno').value, area = document.getElementById('fArea').value;
  var pen = document.getElementById('fPen').value, busca = rifSemAcento(document.getElementById('fBusca').value).trim();
  var lista = BANCO_ITENS.filter(function (it) {
    if (ano && String(it.fonte.edicao) !== ano) { return false; }
    if (area && it.classificacao.area !== area) { return false; }
    if (pen && rifRamo(it) !== pen) { return false; }
    if (busca) {
      var alvo = rifSemAcento(it.enunciado + ' ' + JSON.stringify(it.alternativas) + ' ' + it.fonte.numero);
      if (alvo.indexOf(busca) < 0) { return false; }
    }
    return true;
  });
  document.getElementById('qResumo').innerHTML = '<b>' + lista.length + '</b> de <b>' + BANCO_ITENS.length + '</b> questões';
  document.getElementById('qLista').innerHTML = lista.map(function (it) { return rifCard(it); }).join('')
    || '<p>Nenhuma questão com esse filtro. Tente limpar a busca.</p>';
}
function rifLimpar() {
  ['fAno', 'fArea', 'fPen', 'fBusca'].forEach(function (id) { document.getElementById(id).value = ''; });
  rifFiltrar();
}
document.addEventListener('DOMContentLoaded', rifFiltrar);
