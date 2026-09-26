/* Simulado anonimo do RIF (pesquisa). Gerado por _site/gerar_site_rif.py. */
(function () {
  var URL_EXEC = window.RIF_COLETA || '', S = window.RIF_SIMULADO, corrigido = false;
  function $(id) { return document.getElementById(id); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function forma() { return $('simMomento').value === 'final' ? S.forma_B_final : S.forma_A_inicial; }
  function desenhar() {
    corrigido = false; $('simEnviar').disabled = true; $('simResultado').textContent = '';
    $('simOpiniao').hidden = $('simMomento').value !== 'final';
    $('simLista').innerHTML = forma().map(function (id, i) {
      var alts = ['A', 'B', 'C', 'D', 'E'].map(function (l) {
        return '<label class="alt"><input type="radio" name="r-' + id + '" value="' + l + '"> ' + l + '</label>';
      }).join('');
      return '<article class="q" id="s-' + id + '"><div class="q-cab"><span>Questão ' + (i + 1) + ' de ' + forma().length + '</span></div>' +
        '<div class="q-fig"><img loading="lazy" src="../questoes/_figuras/' + id + '.png" alt="Questão ' + (i + 1) + '"></div>' +
        '<div class="q-acoes">' + alts + '</div><div class="q-res" id="c-' + id + '" hidden></div></article>';
    }).join('');
  }
  function marcada(id) { var r = document.querySelector('input[name="r-' + id + '"]:checked'); return r ? r.value : ''; }
  function corrigir() {
    var faltam = forma().filter(function (id) { return !marcada(id); }).length;
    if (faltam && !confirm('Faltam ' + faltam + ' questões sem resposta. Corrigir assim mesmo?')) { return; }
    var certas = 0;
    forma().forEach(function (id) {
      var m = marcada(id), ok = m === S.gabarito[id], c = $('c-' + id);
      if (ok) { certas++; }
      c.hidden = false;
      /* Mesmas opcoes do cartao de questao (rif-questao.js), sem o campo livre: ele nao sai do aparelho. */
      c.innerHTML = (ok ? '<p class="gab">Acertou (' + esc(m) + ').</p>'
        : '<p class="gab">Resposta certa: ' + esc(S.gabarito[id]) + (m ? ' · você marcou ' + esc(m) : ' · sem resposta') + '</p>')
        + rifRegHtml(id, null, ok, RIF_PASSOS_CURTO, false, false);
    });
    document.querySelectorAll('#simLista .q-acoes input[type=radio]').forEach(function (r) { r.disabled = true; });
    $('simResultado').textContent = 'Você acertou ' + certas + ' de ' + forma().length + '. Em cada questão, marque se acertou os 5 passos ou em que passo errou, e envie.';
    corrigido = true; $('simEnviar').disabled = false; $('simCorrigir').disabled = true; $('simMomento').disabled = true;
  }
  function enviar() {
    if (!corrigido) { return; }
    if (!URL_EXEC || location.protocol.indexOf('http') !== 0) { $('simErro').textContent = 'Para enviar, abra o site com internet.'; $('simErro').hidden = false; return; }
    var dados = { tipo: 'SIMULADO_RIF', momento: $('simMomento').value, escola: $('simEscola').value, respostas: {}, passos: {}, opiniao: {}, hp: $('simHp').value };
    forma().forEach(function (id) { var m = marcada(id); if (m) { dados.respostas[id] = m; } });
    document.querySelectorAll('#simLista .reg').forEach(function (el) {
      var v = rifRegValor(el); if (v) { dados.passos[el.getAttribute('data-reg')] = v; }
    });
    if (dados.momento === 'final') {
      document.querySelectorAll('.simOp').forEach(function (s) { if (s.value) { dados.opiniao[s.name] = s.value; } });
    }
    $('simEnviar').disabled = true; $('simEnviar').textContent = 'Enviando…';
    fetch(URL_EXEC, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(dados) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) { throw new Error(res.erro || 'Envio recusado.'); }
        $('simForm').hidden = true; $('simOk').hidden = false;
      })
      .catch(function (e) {
        $('simErro').textContent = (e && e.message) || 'Falha de conexão. Tente de novo.'; $('simErro').hidden = false;
        $('simEnviar').disabled = false; $('simEnviar').textContent = 'Enviar';
      });
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (!S) { return; }
    $('simMomento').addEventListener('change', desenhar);
    $('simCorrigir').addEventListener('click', corrigir);
    $('simEnviar').addEventListener('click', enviar);
    desenhar();
  });
})();
