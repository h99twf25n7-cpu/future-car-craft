(function () {
  'use strict';

  var STORAGE_KEY = 'fcc:phi-grid';

  function isEnabled() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    return saved === '1';
  }

  function saveEnabled(enabled) {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch (e) {}
  }

  function applyState(enabled) {
    document.documentElement.classList.toggle('phi-grid-visible', enabled);
  }

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'phi-grid';
    overlay.setAttribute('aria-hidden', 'true');

    ['v-38', 'v-62', 'h-38', 'h-62'].forEach(function (pos) {
      var line = document.createElement('div');
      line.className = 'phi-grid__line phi-grid__line--' + pos;
      overlay.appendChild(line);
    });

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'phi-grid__diagonals');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    [[0, 0, 100, 100], [100, 0, 0, 100]].forEach(function (coords) {
      var line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', coords[0]);
      line.setAttribute('y1', coords[1]);
      line.setAttribute('x2', coords[2]);
      line.setAttribute('y2', coords[3]);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);
    });

    overlay.appendChild(svg);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'phi-grid-toggle';
    toggle.setAttribute('aria-label', '黄金比ガイドを切り替える');
    toggle.textContent = 'φ';

    var enabled = isEnabled();
    applyState(enabled);
    toggle.classList.toggle('is-active', enabled);
    toggle.setAttribute('aria-pressed', String(enabled));

    toggle.addEventListener('click', function () {
      enabled = !enabled;
      applyState(enabled);
      saveEnabled(enabled);
      toggle.classList.toggle('is-active', enabled);
      toggle.setAttribute('aria-pressed', String(enabled));
    });

    document.body.appendChild(overlay);
    document.body.appendChild(toggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildOverlay);
  } else {
    buildOverlay();
  }
})();
