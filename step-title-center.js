(function () {
  'use strict';

  // Centers .step-title's *visual* glyph height on the 38.2%
  // golden-ratio line (matching the hero title's treatment on
  // index.html), rather than anchoring the whole .step-header
  // block's bottom edge to it. .step-header's fadeIn animation is
  // opacity-only (no transform), so — unlike the hero title's
  // per-word fade-up — there's no in-flight transform to
  // contaminate a live measurement; no detached clone is needed
  // here.

  function measureGlyphCenterFromBaselinePx(el, fontSizePx) {
    var cs = getComputedStyle(el);
    var probeSize = 200;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.font = [cs.fontStyle, cs.fontWeight, probeSize + 'px', cs.fontFamily].join(' ');
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    var metrics = ctx.measureText(text);
    var ascent = metrics.actualBoundingBoxAscent;
    var descent = metrics.actualBoundingBoxDescent;
    if (typeof ascent !== 'number' || typeof descent !== 'number') return null;

    // Ink center relative to the baseline (positive = above it), in
    // px at the *actual* rendered font-size — the canvas probe is a
    // large fixed size for precision, then scaled back down.
    return ((ascent - descent) / 2) * (fontSizePx / probeSize);
  }

  function parseTranslateYPx(transformValue) {
    if (!transformValue || transformValue === 'none') return 0;
    var match = /matrix\(([^)]+)\)/.exec(transformValue);
    if (!match) return 0;
    var parts = match[1].split(',');
    return parts.length === 6 ? parseFloat(parts[5]) : 0;
  }

  function run() {
    var stageEl = document.querySelector('.step-stage');
    var headerEl = document.querySelector('.step-header');
    var titleEl = document.querySelector('.step-title');
    if (!stageEl || !headerEl || !titleEl) return;

    var fontSizePx = parseFloat(getComputedStyle(titleEl).fontSize);
    var glyphCenterFromBaselinePx = measureGlyphCenterFromBaselinePx(titleEl, fontSizePx);
    if (glyphCenterFromBaselinePx === null) return; // unsupported browser — CSS keeps the 40px fallback

    var marker = document.createElement('span');
    marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
    titleEl.appendChild(marker);

    var stageRect = stageEl.getBoundingClientRect();
    var baselineY = marker.getBoundingClientRect().top;
    var currentTranslateYPx = parseTranslateYPx(getComputedStyle(headerEl).transform);
    var headerHeightPx = headerEl.getBoundingClientRect().height;

    titleEl.removeChild(marker);

    var currentGlyphCenterY = baselineY - glyphCenterFromBaselinePx;
    var targetY = stageRect.top + stageRect.height * 0.382;
    var deltaPx = targetY - currentGlyphCenterY;

    var newTotalTranslateYPx = currentTranslateYPx + deltaPx;
    var newOffsetPx = newTotalTranslateYPx + headerHeightPx;
    headerEl.style.setProperty('--step-title-center-offset', newOffsetPx + 'px');
  }

  var resizeTimer = null;
  function scheduleRun() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(run, 100);
  }

  function start() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }
    window.addEventListener('resize', scheduleRun);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
