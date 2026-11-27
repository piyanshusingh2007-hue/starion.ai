/* Starion AI - Glowing/shining service names. Loaded on every page. */
(function () {
  // ---------- 2) glowing / shining service names ----------
  var NAMES = /\b(StarBot|StarLead|StarBook|StarMail|StarFlow|StarAds)\b/g;
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|SELECT|TITLE|NOSCRIPT|CODE|PRE)$/;
  function glow() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || SKIP.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('.svc-name,#sbc-w,#sbc-b,#dw-bar,a[href^="mailto"]')) return NodeFilter.FILTER_REJECT;
        NAMES.lastIndex = 0;
        return NAMES.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment(), txt = node.nodeValue, last = 0, m;
      NAMES.lastIndex = 0;
      while ((m = NAMES.exec(txt))) {
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var sp = document.createElement('span');
        sp.className = 'svc-name'; sp.textContent = m[0];
        frag.appendChild(sp); last = m.index + m[0].length;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function init() { glow(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
