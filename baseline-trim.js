(function () {
  'use strict';

  // Measures the *actual* rendered font's metrics (canvas
  // TextMetrics) and turns them into an exact em offset for
  // --title-center-offset in style.css, replacing the hardcoded
  // fallback guess. Necessary because .title's font-family is a
  // fallback stack (Helvetica Neue / Arial / Hiragino Sans / Noto
  // Sans JP) and each has different ascent/descent/cap-height, so no
  // single constant centers the glyphs on the 38.2% guide on every
  // OS. Measured at a large probe size for precision; the resulting
  // offset is font-size independent, so it's applied as an em value
  // and needs no recomputation on resize.
  function computeCenterOffsetEm(titleEl) {
    var cs = getComputedStyle(titleEl);
    var probeSize = 200;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.font = [cs.fontStyle, cs.fontWeight, probeSize + 'px', cs.fontFamily].join(' ');

    // Font-wide ascent/descent locate the baseline within the line
    // box (mirrors the browser's own line-box layout: half the
    // leading, plus the font's ascent).
    var boxMetrics = ctx.measureText('');
    var ascent = boxMetrics.fontBoundingBoxAscent;
    var descent = boxMetrics.fontBoundingBoxDescent;
    if (typeof ascent !== 'number' || typeof descent !== 'number') return null;

    // The *rendered text's* own glyph bounds (tight to the caps,
    // ignoring the font's full ascent/descent reserved for
    // accents/descenders the all-caps title never uses) give the
    // true visual top/bottom to center between.
    var text = titleEl.textContent || '';
    var glyphMetrics = ctx.measureText(text);
    var glyphAscent = glyphMetrics.actualBoundingBoxAscent;
    var glyphDescent = glyphMetrics.actualBoundingBoxDescent;
    if (typeof glyphAscent !== 'number' || typeof glyphDescent !== 'number') return null;

    var baselineFromTop = (probeSize + ascent - descent) / 2;
    var glyphCenterFromBaseline = (glyphAscent - glyphDescent) / 2;
    var centerFromTop = baselineFromTop - glyphCenterFromBaseline;

    return -centerFromTop / probeSize;
  }

  function run() {
    var titleEl = document.querySelector('.title');
    if (!titleEl) return;

    var offset = computeCenterOffsetEm(titleEl);
    if (offset === null) return; // unsupported browser — CSS keeps the -0.49em fallback

    titleEl.style.setProperty('--title-center-offset', offset + 'em');
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
