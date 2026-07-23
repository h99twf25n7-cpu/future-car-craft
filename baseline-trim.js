(function () {
  'use strict';

  // Measures the *actual* rendered font's ascent/descent (canvas
  // TextMetrics.fontBoundingBox*) and turns that into an exact em
  // ratio for --title-baseline-offset in style.css, replacing the
  // hardcoded 0.145em guess. Necessary because .title's font-family
  // is a fallback stack (Helvetica Neue / Arial / Hiragino Sans /
  // Noto Sans JP) and each has a different descender depth, so no
  // single constant lines the baseline up with the 38.2% guide on
  // every OS. Measured at a large probe size for precision; the
  // resulting ratio is font-size independent, so it's applied as an
  // em value and needs no recomputation on resize.
  function computeOffsetEm(titleEl) {
    var cs = getComputedStyle(titleEl);
    var probeSize = 200;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.font = [cs.fontStyle, cs.fontWeight, probeSize + 'px', cs.fontFamily].join(' ');
    var metrics = ctx.measureText('');
    var ascent = metrics.fontBoundingBoxAscent;
    var descent = metrics.fontBoundingBoxDescent;
    if (typeof ascent !== 'number' || typeof descent !== 'number') return null;

    return (probeSize - ascent + descent) / (2 * probeSize);
  }

  function run() {
    var titleEl = document.querySelector('.title');
    if (!titleEl) return;

    var ratio = computeOffsetEm(titleEl);
    if (ratio === null) return; // unsupported browser — CSS keeps the 0.145em fallback

    titleEl.style.setProperty('--title-baseline-offset', ratio + 'em');
  }

  function start() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
