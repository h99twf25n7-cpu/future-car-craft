(function () {
  'use strict';

  var STORAGE_KEY = 'fcc:theme';

  var THEMES = [
    { id: 'default',   label: 'ネオンシアン',       color: '#00d4ff' },
    { id: 'synthwave', label: 'シンセウェーブ',      color: '#ff5ecb' },
    { id: 'matrix',    label: 'デジタルグリーン',    color: '#39ff88' },
    { id: 'inferno',   label: 'インフェルノレッド',  color: '#ff4d4d' },
    { id: 'royal',     label: 'ロイヤルゴールド',    color: '#ffcf5c' },
    { id: 'arctic',    label: 'アークティックブルー', color: '#6fd8ff' }
  ];

  function getSavedTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    var isValid = THEMES.some(function (t) { return t.id === saved; });
    return isValid ? saved : THEMES[0].id;
  }

  function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', id);
  }

  function saveTheme(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {}
  }

  // Apply immediately (before first paint) to avoid a flash of the wrong theme.
  applyTheme(getSavedTheme());

  function buildSwitcher() {
    var current = getSavedTheme();

    var root = document.createElement('div');
    root.className = 'theme-switch';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-switch__toggle';
    toggle.setAttribute('aria-label', 'テーマを切り替える');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '◑'; // half-filled circle as a simple theme icon

    var panel = document.createElement('div');
    panel.className = 'theme-switch__panel';
    panel.setAttribute('role', 'menu');

    var options = THEMES.map(function (theme) {
      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'theme-switch__option';
      option.setAttribute('role', 'menuitemradio');
      option.dataset.themeId = theme.id;

      var swatch = document.createElement('span');
      swatch.className = 'theme-switch__swatch';
      swatch.style.background = theme.color;

      var label = document.createElement('span');
      label.className = 'theme-switch__label';
      label.textContent = theme.label;

      option.appendChild(swatch);
      option.appendChild(label);
      panel.appendChild(option);

      option.addEventListener('click', function () {
        current = theme.id;
        applyTheme(current);
        saveTheme(current);
        updateActive();
        closePanel();
      });

      return option;
    });

    function updateActive() {
      options.forEach(function (option) {
        var isActive = option.dataset.themeId === current;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-checked', String(isActive));
      });
    }

    function openPanel() {
      root.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closePanel() {
      root.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (root.classList.contains('is-open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) {
        closePanel();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    updateActive();

    root.appendChild(toggle);
    root.appendChild(panel);
    document.body.appendChild(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSwitcher);
  } else {
    buildSwitcher();
  }
})();
