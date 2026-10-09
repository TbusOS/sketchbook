/* sketchbook page script: filter, search and sort the project list, show
 * "3 days ago" from the commit date, and make the books on the shelf clickable.
 * The page is complete without it — every project is a plain link in the HTML. */
(function () {
  'use strict';
  var root = document.documentElement;
  function lang() { return root.getAttribute('data-lang') === 'zh' ? 'zh' : 'en'; }

  // ── relative time: the README says "2026-09"; here we know today's date ──
  function ago(iso) {
    var days = Math.floor((Date.now() - new Date(iso + 'T00:00:00Z').getTime()) / 864e5);
    var zh = lang() === 'zh';
    if (days < 1) return zh ? '今天' : 'today';
    if (days < 2) return zh ? '昨天' : 'yesterday';
    if (days < 45) return zh ? days + ' 天前' : days + ' days ago';
    var m = Math.round(days / 30.4);
    if (m < 12) return zh ? m + ' 个月前' : m + ' months ago';
    var y = Math.round(days / 365);
    return zh ? y + ' 年前' : y + (y === 1 ? ' year ago' : ' years ago');
  }
  function times() {
    document.querySelectorAll('time[data-ago]').forEach(function (t) { t.textContent = ago(t.getAttribute('datetime')); });
  }

  // ── filter / search / sort ──
  var grid = document.getElementById('pgrid');
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.pcard')) : [];
  var state = { group: 'all', q: '', demo: false, sort: 'group' };
  function apply() {
    var q = state.q.trim().toLowerCase(), shown = 0;
    cards.forEach(function (c) {
      var ok = (state.group === 'all' || c.getAttribute('data-group') === state.group) &&
        (!state.demo || c.hasAttribute('data-demo')) &&
        (!q || c.getAttribute('data-text').indexOf(q) >= 0);
      c.hidden = !ok;
      if (ok) shown++;
    });
    var sorted = cards.slice().sort(function (a, b) {
      if (state.sort === 'commits') return +b.getAttribute('data-commits') - +a.getAttribute('data-commits');
      if (state.sort === 'recent') return b.getAttribute('data-updated').localeCompare(a.getAttribute('data-updated'));
      return +a.getAttribute('data-order') - +b.getAttribute('data-order');
    });
    sorted.forEach(function (c) { grid.appendChild(c); });
    var count = document.getElementById('count');
    if (count) count.textContent = lang() === 'zh' ? '显示 ' + shown + ' 个' : shown + ' shown';
    var empty = document.getElementById('empty');
    if (empty) empty.hidden = shown > 0;
    document.querySelectorAll('.shelf .bk').forEach(function (b) {
      var c = document.getElementById('p-' + b.getAttribute('data-repo'));
      b.classList.toggle('dim', !!c && c.hidden);
    });
  }
  document.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.group = b.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      apply();
    });
  });
  var search = document.getElementById('search');
  if (search) search.addEventListener('input', function () { state.q = search.value; apply(); });
  var demo = document.getElementById('only-demo');
  if (demo) demo.addEventListener('change', function () { state.demo = demo.checked; apply(); });
  var sort = document.querySelector('select.sort');
  if (sort) sort.addEventListener('change', function () { state.sort = sort.value; apply(); });

  // ── shelf: a book opens its card below (and the card's own link opens GitHub) ──
  document.querySelectorAll('.shelf .bk').forEach(function (b) {
    b.setAttribute('tabindex', '0');
    b.setAttribute('role', 'link');
    b.setAttribute('aria-label', b.getAttribute('data-repo'));
    function go() { location.hash = 'p-' + b.getAttribute('data-repo'); }
    b.addEventListener('click', go);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  // words the script writes itself follow the language switch too
  function langBits() {
    if (search) search.placeholder = search.getAttribute('data-ph-' + lang()) || '';
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-toggle') === lang())); });
    times(); apply();
  }
  new MutationObserver(langBits).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  langBits();
})();
