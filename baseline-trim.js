(function () {
  'use strict';

  // Centers the hero title's *visual* glyph height (cap-top to
  // baseline ink, not the font's full ascent/descent box) on the
  // 38.2% golden-ratio line. Rather than deriving the baseline's
  // position from font metrics (canvas fontBoundingBoxAscent/Descent
  // — support for that pair is spottier across engines than the rest
  // of this file assumed), this measures the real on-page baseline
  // with a zero-size, vertical-align:baseline marker, then corrects
  // the title's translateY by exactly the measured gap. That makes
  // the result correct regardless of how a given engine lays out the
  // line box internally.

  function measureGlyphCenterFromBaselinePx(titleEl, fontSizePx) {
    var cs = getComputedStyle(titleEl);
    var probeSize = 200;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.font = [cs.fontStyle, cs.fontWeight, probeSize + 'px', cs.fontFamily].join(' ');
    var text = (titleEl.textContent || '').replace(/\s+/g, ' ').trim();
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
    var heroEl = document.querySelector('.hero');
    var titleEl = document.querySelector('.title');
    if (!heroEl || !titleEl) return;

    var fontSizePx = parseFloat(getComputedStyle(titleEl).fontSize);
    var glyphCenterFromBaselinePx = measureGlyphCenterFromBaselinePx(titleEl, fontSizePx);
    if (glyphCenterFromBaselinePx === null) return; // unsupported browser — CSS keeps the -0.49em fallback

    var marker = document.createElement('span');
    marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
    titleEl.appendChild(marker);

    var heroRect = heroEl.getBoundingClientRect();
    var baselineY = marker.getBoundingClientRect().top;
    var currentTranslateYPx = parseTranslateYPx(getComputedStyle(titleEl).transform);

    titleEl.removeChild(marker);

    var currentGlyphCenterY = baselineY - glyphCenterFromBaselinePx;
    var targetY = heroRect.top + heroRect.height * 0.382;
    var deltaPx = targetY - currentGlyphCenterY;

    var newTranslateYPx = currentTranslateYPx + deltaPx;
    titleEl.style.setProperty('--title-center-offset', (newTranslateYPx / fontSizePx) + 'em');
  }

  // Centers the START button (and its already flex-centered label)
  // on the 61.8% golden-ratio line, instead of just its top edge.
  // .cta stays at top:61.8% and .btn-start stays its first in-flow
  // child (so .hint below is unaffected), and .cta itself is nudged
  // up by half of the button's real rendered height — that height
  // depends on responsive font-size/padding/the min-height floor, so
  // it's measured live rather than assumed, and re-measured on
  // resize since it isn't a simple proportional (em) relationship.
  function runCtaCenter() {
    var ctaEl = document.querySelector('.cta');
    var btnEl = document.querySelector('.btn-start');
    if (!ctaEl || !btnEl) return;

    var height = btnEl.getBoundingClientRect().height;
    if (!height) return;

    ctaEl.style.setProperty('--cta-center-offset', (-height / 2) + 'px');
  }

  var ctaResizeTimer = null;
  function scheduleCtaCenter() {
    if (ctaResizeTimer) clearTimeout(ctaResizeTimer);
    ctaResizeTimer = setTimeout(runCtaCenter, 100);
  }

  function start() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
      document.fonts.ready.then(runCtaCenter);
    } else {
      run();
      runCtaCenter();
    }
    window.addEventListener('resize', scheduleCtaCenter);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
