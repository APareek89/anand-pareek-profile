(function () {
  'use strict';
  var tabs = Array.from(document.querySelectorAll('[role="tab"][data-panel]'));
  var panels = Array.from(document.querySelectorAll('section.panel'));
  var resumeAnchors = Array.from(document.querySelectorAll('.resume-section[id]'));
  var anchorIds = new Set(resumeAnchors.map(function (section) { return section.id; }));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var railLinks = Array.from(document.querySelectorAll('.rail-link'));

  function setActiveRail(id) {
    railLinks.forEach(function (link) {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function activate(panelId) {
    panels.forEach(function (panel) {
      var selected = panel.id === panelId;
      panel.hidden = !selected;
      panel.classList.toggle('active', selected);
    });
    tabs.forEach(function (tab) {
      var selected = tab.dataset.panel === panelId;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.body.dataset.panel = panelId;
    document.title = 'Anand Pareek — ' + (panelId === 'projects' ? 'AI Products & Applied Work' : 'AI Product & Growth Leader');
  }

  function route(hash, options) {
    options = options || {};
    var id = hash.replace(/^#/, '');
    var panelId = id === 'projects' ? 'projects' : 'resume';
    activate(panelId);
    if (options.push && location.hash !== '#' + id) {
      history.pushState(null, '', '#' + id);
    }
    if (!options.scroll) return;
    requestAnimationFrame(function () {
      if (anchorIds.has(id)) {
        var target = document.getElementById(id);
        target.scrollIntoView({ block: 'start', behavior: options.instant || reduceMotion.matches ? 'auto' : 'smooth' });
        setActiveRail(id);
      } else {
        window.scrollTo({ top: 0, behavior: options.instant || reduceMotion.matches ? 'auto' : 'smooth' });
        setActiveRail('overview');
      }
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      route('#' + tab.dataset.panel, { push: true, scroll: true });
    });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next].focus();
      route('#' + tabs[next].dataset.panel, { push: true, scroll: true });
    });
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var id = link.hash.slice(1);
    if (id === 'main-content') {
      event.preventDefault();
      var main = document.getElementById('main-content');
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      return;
    }
    if (id !== 'resume' && id !== 'projects' && !anchorIds.has(id)) return;
    event.preventDefault();
    var wasPanel = document.body.dataset.panel;
    route(link.hash, { push: true, scroll: true });
    if (wasPanel !== document.body.dataset.panel) {
      document.getElementById(document.body.dataset.panel).focus({ preventScroll: true });
    }
  });

  window.addEventListener('popstate', function () { route(location.hash || '#resume', { scroll: true, instant: true }); });
  window.addEventListener('hashchange', function () { route(location.hash || '#resume', { scroll: true, instant: true }); });
  route(location.hash || '#resume', { scroll: Boolean(location.hash), instant: true });

  var railUpdatePending = false;
  function scheduleRailUpdate() {
    if (railUpdatePending) return;
    railUpdatePending = true;
    requestAnimationFrame(function () {
      railUpdatePending = false;
      if (document.body.dataset.panel !== 'resume') return;
      var headerOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 110;
      var active = resumeAnchors[0];
      resumeAnchors.forEach(function (section) {
        if (section.getBoundingClientRect().top <= headerOffset + 30) active = section;
      });
      if (active) setActiveRail(active.id);
    });
  }
  window.addEventListener('scroll', scheduleRailUpdate, { passive: true });
  window.addEventListener('resize', scheduleRailUpdate, { passive: true });
  scheduleRailUpdate();
})();
