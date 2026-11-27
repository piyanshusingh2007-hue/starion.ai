/* Starion AI v5 — motion + nav. Everything degrades gracefully: no JS = static, readable site. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- Nav: scrolled state + mobile drawer ---- */
  function nav() {
    var n = $('.v5-nav'); if (!n) return;
    function s() { n.classList.toggle('scrolled', window.scrollY > 20); }
    window.addEventListener('scroll', s, { passive: true }); s();
    var b = $('#v5-toggle'), d = $('#v5-drawer');
    if (b && d) b.addEventListener('click', function () {
      var o = d.classList.toggle('open'); b.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  }

  /* ---- Smooth scroll (Lenis, lerp 0.05) loaded from CDN; falls back to native scroll if blocked ---- */
  function smooth() {
    if (reduce || coarse) return;               // keep native momentum on touch devices
    var sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js';
    sc.onload = function () {
      if (!window.Lenis) return;
      var l = new window.Lenis({ lerp: 0.05, duration: 1.2, smoothWheel: true });
      function raf(t) { l.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href'); if (id.length < 2) return;
          var t = $(id); if (t) { e.preventDefault(); l.scrollTo(t, { offset: -88 }); }
        });
      });
    };
    document.head.appendChild(sc);
  }

  /* ---- Hero mesh follows the pointer (one lerped loop, GPU transform only) ---- */
  function mesh() {
    var h = $('.v5-hero'); if (!h || reduce || coarse) return;
    var tx = 0, ty = 0, x = 0, y = 0, on = true;
    h.addEventListener('mousemove', function (e) {
      var r = h.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting; }).observe(h);
    (function loop() {
      if (on) { x += (tx - x) * .05; y += (ty - y) * .05; h.style.setProperty('--mx', x.toFixed(3)); h.style.setProperty('--my', y.toFixed(3)); }
      requestAnimationFrame(loop);
    })();
  }

  /* ---- Curved 3D carousel: cards bend away from the centre; tilt toward the pointer on hover ---- */
  function carousel() {
    $$('.v5-track').forEach(function (track) {
      var cards = $$('.v5-card', track), raf = 0;
      function update() {
        raf = 0;
        var c = track.getBoundingClientRect(), mid = c.left + c.width / 2;
        cards.forEach(function (k) {
          var r = k.getBoundingClientRect(), d = (r.left + r.width / 2 - mid) / (c.width / 2);   // -1 … 1 (and beyond)
          d = Math.max(-1.4, Math.min(1.4, d));
          if (reduce) return;
          k.style.setProperty('--ry', (-d * 16).toFixed(2) + 'deg');
          k.style.setProperty('--tz', (-Math.abs(d) * 90).toFixed(1) + 'px');
          k.style.setProperty('--sc', (1 - Math.abs(d) * .06).toFixed(3));
        });
      }
      function req() { if (!raf) raf = requestAnimationFrame(update); }
      track.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', req); update();
      if (!reduce && !coarse) cards.forEach(function (k) {
        k.addEventListener('mousemove', function (e) {
          var r = k.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
          k.style.transform = 'perspective(900px) rotateY(' + (px * 10).toFixed(2) + 'deg) rotateX(' + (-py * 8).toFixed(2) + 'deg) translateY(-6px)';
        });
        k.addEventListener('mouseleave', function () { k.style.transform = ''; });
      });
      var prev = $('[data-car-prev]'), next = $('[data-car-next]');
      function by(dir) { track.scrollBy({ left: dir * Math.min(420, track.clientWidth * .8), behavior: 'smooth' }); }
      if (prev) prev.addEventListener('click', function () { by(-1); });
      if (next) next.addEventListener('click', function () { by(1); });
    });
  }

  /* ---- Sample activity feed builds line by line when scrolled into view ---- */
  function feed() {
    $$('.v5-feed').forEach(function (f) {
      var items = $$('li', f);
      function run() { items.forEach(function (li, i) { setTimeout(function () { li.classList.add('on'); }, 500 + i * 900); }); }
      if (reduce || !('IntersectionObserver' in window)) { items.forEach(function (li) { li.classList.add('on'); }); return; }
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: .35 });
      io.observe(f);
    });
  }

  function init() { nav(); smooth(); mesh(); carousel(); feed(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
