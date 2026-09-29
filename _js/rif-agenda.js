/* rif-agenda.js — aba Agenda. Gerado por _site/gerar_site_rif.py. Nao editar a mao.
   Tudo fica so neste aparelho (localStorage); sem ele, a agenda funciona ate fechar a pagina.
   Cada marcacao = 1 trilha de 40 min (10 de aquecimento + 30 de estudo); meta de 3 trilhas por semana
   (PRE-metodo-rif-aquecimento-estudo-cronometro-2026-09-29). Marcacao antiga sem 'trilha' usa est.trilha. */
(function () {
  var CHAVE = 'rif-agenda-v1', MINIMO = 3;
  var DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  var TRILHAS = ['T0A', 'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11'];
  var PASSOS = ['não errei', '1 · O que a questão quer?', '2 · O que eu tenho?',
                '3 · O desenho ou separar as afirmações', '4 · Minha solução ou julgar uma por uma',
                '5 · Confiro e respondo'];
  var gravou = true, est;

  function ler() {
    try { var t = localStorage.getItem(CHAVE); if (t) { return JSON.parse(t); } } catch (e) { gravou = false; }
    return { trilha: 'T0A', sessoes: [], historico: [] };
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(est)); gravou = true; } catch (e) { gravou = false; }
    document.getElementById('agErro').hidden = gravou;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
    });
  }
  function fim(h) {
    var p = h.split(':'), m = +p[0] * 60 + (+p[1]) + 40;
    return ('0' + Math.floor(m / 60) % 24).slice(-2) + ':' + ('0' + m % 60).slice(-2);
  }
  function opcoes(lista, atual) {
    return lista.map(function (v, i) {
      var val = typeof atual === 'number' ? i : v;
      return '<option value="' + val + '"' + (val === atual ? ' selected' : '') + '>' + esc(v) + '</option>';
    }).join('');
  }

  function trilhaDe(s) { return s.trilha || est.trilha; }
  function proxima(t) { var k = TRILHAS.indexOf(t); return TRILHAS[Math.min(k + 1, TRILHAS.length - 1)]; }

  function desenhar() {
    est.sessoes.sort(function (a, b) { return a.dia - b.dia || (a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : 0); });
    var n = est.sessoes.length, feitas = est.sessoes.filter(function (s) { return s.feita; }).length;
    document.getElementById('agTrilha').innerHTML = opcoes(TRILHAS, est.trilha);
    document.getElementById('agConta').textContent = feitas + ' de ' + n + (n === 1 ? ' trilha feita' : ' trilhas feitas')
      + ' nesta semana';
    var av = document.getElementById('agAviso'), falta = MINIMO - n;
    av.hidden = falta <= 0;
    av.textContent = n === 0 ? 'Marque pelo menos ' + MINIMO + ' trilhas nesta semana (40 minutos cada: 10 de '
        + 'aquecimento e 30 de estudo).'
      : 'Falta' + (falta === 1 ? ' 1 trilha' : 'm ' + falta + ' trilhas') + ' para a meta de ' + MINIMO
        + ' na semana. Tempos curtos e frequentes rendem mais.';
    document.getElementById('agSemana').innerHTML = DIAS.map(function (nome, d) {
      var ses = est.sessoes.filter(function (s) { return s.dia === d; });
      if (!ses.length) { return '<div class="ag-dia vazio"><p>' + nome + ' · sem trilha</p></div>'; }
      return '<div class="ag-dia"><p>' + nome + '</p>' + ses.map(function (s) {
        var i = est.sessoes.indexOf(s);
        return '<div class="ag-ses' + (s.feita ? ' feita' : '') + '">'
          + '<span class="hora">' + esc(trilhaDe(s)) + ' · ' + esc(s.hora) + ' às ' + fim(s.hora) + '</span>'
          + '<label class="chk"><input type="checkbox" data-i="' + i + '" data-c="feita"' + (s.feita ? ' checked' : '')
          + '> Fiz esta trilha</label>'
          + '<span class="erro-passo">Errei no passo<select data-i="' + i + '" data-c="passo">' + opcoes(PASSOS, s.passo || 0)
          + '</select><input type="text" maxlength="120" data-i="' + i + '" data-c="nota" placeholder="o que eu errei"'
          + ' value="' + esc(s.nota) + '"></span>'
          + '<button type="button" data-i="' + i + '" data-c="tirar">Tirar</button>'
          + '</div>';
      }).join('') + '</div>';
    }).join('');
    document.getElementById('agHist').innerHTML = est.historico.slice(-12).reverse().map(function (h) {
      return '<li>' + esc(h.trilha) + ' · ' + h.feitas + ' de ' + h.total + (h.v === 2 ? ' trilhas feitas' : ' sessões feitas')
        + (h.erros ? ' · passo com mais erros: ' + esc(h.erros) : '') + '</li>';
    }).join('') || '<li>Ainda nenhuma semana fechada.</li>';
    document.getElementById('agIcs').disabled = !n;
    /* Passo a treinar: o mais errado nas questoes registradas (rif-questao.js, mesmo aparelho). */
    var d = window.rifPassoDificil ? rifPassoDificil() : null;
    document.getElementById('agTreino').innerHTML = d
      ? 'Passo a treinar nesta semana: <b>Passo ' + d[0] + ' · ' + esc(RIF_PASSOS_CURTO[d[0] - 1]) + '</b> (errei em '
        + d[1] + (d[1] === 1 ? ' questão' : ' questões') + '). <a href="../t0a/index.html#passos">Rever os 5 passos</a>'
      : 'Quando você marcar, nas questões, o passo em que errou, aqui aparece o passo a treinar nesta semana.';
  }

  function mudou(e) {
    var el = e.target, i = el.getAttribute('data-i'), c = el.getAttribute('data-c');
    if (i === null) { return; }
    var s = est.sessoes[+i];
    if (c === 'feita') { s.feita = el.checked; }
    else if (c === 'passo') { s.passo = +el.value; }
    else if (c === 'nota') { s.nota = el.value; salvar(); return; }
    salvar(); desenhar();
  }

  function incluir() {
    var d = +document.getElementById('agDia').value, h = document.getElementById('agHora').value || '19:00';
    est.sessoes.push({ dia: d, hora: h, trilha: est.trilha, feita: false, passo: 0, nota: '' });
    est.trilha = proxima(est.trilha);
    salvar(); desenhar();
  }

  function novaSemana() {
    if (!confirm('Fechar esta semana? Os horários ficam; as marcações de feito e de erro zeram.')) { return; }
    var cont = {};
    est.sessoes.forEach(function (s) { if (s.passo) { cont[s.passo] = (cont[s.passo] || 0) + 1; } });
    var top = Object.keys(cont).sort(function (a, b) { return cont[b] - cont[a]; })[0];
    var feitas = est.sessoes.filter(function (s) { return s.feita; });
    est.historico.push({ v: 2, total: est.sessoes.length, feitas: feitas.length, erros: top ? PASSOS[top] : '',
      trilha: feitas.map(trilhaDe).filter(function (t, i, a) { return a.indexOf(t) === i; }).join(', ') || 'nenhuma' });
    /* os horarios ficam; cada um recebe a trilha seguinte, na ordem da semana */
    var ult = est.sessoes.reduce(function (m, s) { return Math.max(m, TRILHAS.indexOf(trilhaDe(s))); }, -1);
    var t = ult >= 0 ? proxima(TRILHAS[ult]) : est.trilha;
    est.sessoes.forEach(function (s) { s.feita = false; s.passo = 0; s.nota = ''; s.trilha = t; t = proxima(t); });
    est.trilha = t;
    salvar(); desenhar();
  }

  /* Lembrete: um .ics com cada trilha (40 min) repetindo toda semana e aviso 10 min antes (hora local, sem fuso). */
  function ics() {
    var hoje = new Date(), dow = (hoje.getDay() + 6) % 7, p2 = function (n) { return ('0' + n).slice(-2); };
    var BY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    var carimbo = hoje.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var ev = est.sessoes.map(function (s, i) {
      var d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + ((s.dia - dow + 7) % 7));
      var f = fim(s.hora), d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (f < s.hora ? 1 : 0));
      var dia = d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate());
      var dia2 = d2.getFullYear() + p2(d2.getMonth() + 1) + p2(d2.getDate());
      return ['BEGIN:VEVENT', 'UID:rif-' + carimbo + '-' + i + '@rif-oa', 'DTSTAMP:' + carimbo,
              'DTSTART:' + dia + 'T' + s.hora.replace(':', '') + '00',
              'DTEND:' + dia2 + 'T' + f.replace(':', '') + '00',
              'RRULE:FREQ=WEEKLY;BYDAY=' + BY[s.dia],
              'SUMMARY:Rumo ao IFMG · trilha de estudo (40 min)',
              'DESCRIPTION:Aquecimento (até 10 min): título\\, primeiro parágrafo\\, Resumo em Áudio e exemplo '
                + 'resolvido. Estudo (até 30 min): as sessões da trilha pelos 5 passos\\; anote em que passo errou.',
              'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Trilha do Rumo ao IFMG', 'TRIGGER:-PT10M', 'END:VALARM',
              'END:VEVENT'].join('\r\n');
    });
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IFMG Ouro Preto//Rumo ao IFMG//PT', 'CALSCALE:GREGORIAN']
      .concat(ev, ['END:VCALENDAR']).join('\r\n') + '\r\n';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'rumo-ao-ifmg-trilhas.ics';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    est = ler();
    /* agenda antiga (sessoes de 30 min da mesma trilha): cada marcacao fica com a trilha da semana */
    var antigas = est.sessoes.filter(function (s) { return !s.trilha; });
    antigas.forEach(function (s) { s.trilha = est.trilha; });
    if (antigas.length) { est.trilha = proxima(est.trilha); salvar(); }
    document.getElementById('agErro').hidden = gravou;
    document.getElementById('agDia').innerHTML = opcoes(DIAS, 0);
    document.getElementById('agTrilha').addEventListener('change', function (e) { est.trilha = e.target.value; salvar(); desenhar(); });
    document.getElementById('agIncluir').addEventListener('click', incluir);
    document.getElementById('agNova').addEventListener('click', novaSemana);
    document.getElementById('agIcs').addEventListener('click', ics);
    var sem = document.getElementById('agSemana');
    sem.addEventListener('change', mudou);
    sem.addEventListener('input', function (e) { if (e.target.getAttribute('data-c') === 'nota') { mudou(e); } });
    sem.addEventListener('click', function (e) {
      if (e.target.getAttribute('data-c') === 'tirar') {
        est.sessoes.splice(+e.target.getAttribute('data-i'), 1); salvar(); desenhar();
      }
    });
    desenhar();
  });
})();
