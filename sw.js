/* sw.js — service worker do rif-oa. Gerado por _site/gerar_site_rif.py — nao editar a mao.
 * Rede primeiro, cache so para o aparelho sem internet (molde lme-oa).
 * O nome do cache muda a cada geracao: o activate apaga os anteriores. TUDO e o cache que o botao
 * "Baixar tudo" da aba Instalar enche; ele fica entre as geracoes, e cada pagina aberta com rede
 * regrava a sua copia la (assim o que foi baixado nao envelhece). */
var CACHE = 'rif-oa-20260927-174608';
var TUDO = 'rif-oa-tudo';

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(['./', './index.html', './manifest.webmanifest', './_css/rif.css', './_js/rif-abas.js',
                     './_icones/app-site-192.png', './_icones/app-site-512.png']);
  }).catch(function () { /* sem rede na instalacao: segue sem cache */ }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== CACHE && n !== TUDO; })
                            .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') { return; }
  if (e.request.url.indexOf('_sw=') >= 0) { return; }      /* o botao Baixar tudo guarda ele mesmo */
  /* O GitHub Pages manda max-age=600 no HTML: sem furar o cache do navegador, o fetch
     "de rede" devolveria a copia velha (LESSONS 2026-09-16). */
  var furar = e.request.url + (e.request.url.indexOf('?') < 0 ? '?' : '&') + '_sw=' + Date.now();
  e.respondWith(
    fetch(furar, { cache: 'no-store' }).then(function (resp) {
      if (resp && resp.ok && resp.type === 'basic') {
        var copia = resp.clone();
        caches.open(TUDO).then(function (c) { c.put(e.request, copia); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./'); });
    })
  );
});
