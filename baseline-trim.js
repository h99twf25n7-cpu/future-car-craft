(function () {
  'use strict';

  // Centers the hero title's *visual* glyph height (cap-top to
  // baseline ink, not the font's full ascent/descent box) on the
  // 38.2% golden-ratio line, using a detached, unanimated clone of
  // .title to measure the real on-page baseline:
  //   - .title is a flex container, so vertical-align has no effect
  //     on a marker appended directly to it (flex items ignore it —
  //     they align via align-items, not inline baseline rules); the
  //     marker instead goes inside a word span's own inline
  //     formatting context, where vertical-align works normally.
  //   - each word span carries a fade-in animation (opacity 0 →1,
  //     translateY(40px) → 0) that's typically still mid-flight at
  //     load time, and getBoundingClientRect reflects that
  //     in-progress transform — which would corrupt the reading if
  //     measured on the live element. A clone with the animation and
  //     .title's own transform neutralized avoids that, and also
  //     avoids the title visibly jumping once the animation ends.
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

  function run() {
    var heroEl = document.querySelector('.hero');
    var titleEl = document.querySelector('.title');
    if (!heroEl || !titleEl) return;

    var fontSizePx = parseFloat(getComputedStyle(titleEl).fontSize);
    var glyphCenterFromBaselinePx = measureGlyphCenterFromBaselinePx(titleEl, fontSizePx);
    if (glyphCenterFromBaselinePx === null) return; // unsupported browser — CSS keeps the -0.49em fallback

    // The clone keeps .title's class, so it keeps .title's own
    // `top: 38.2%` positioning — its box top *is* the 38.2% line, as
    // the browser itself computes it — but its transform is
    // overridden to none, dropping the translateY this whole
    // function exists to solve for.
    var clone = titleEl.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.visibility = 'hidden';
    clone.style.pointerEvents = 'none';

    var cloneWords = clone.querySelectorAll('.title__word');
    for (var i = 0; i < cloneWords.length; i++) {
      cloneWords[i].style.animation = 'none';
      cloneWords[i].style.opacity = '1';
      cloneWords[i].style.transform = 'none';
    }

    var lastCloneWord = cloneWords[cloneWords.length - 1] || clone;
    var marker = document.createElement('span');
    marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
    lastCloneWord.appendChild(marker);

    heroEl.appendChild(clone);
    var lineY = clone.getBoundingClientRect().top;
    var baselineY = marker.getBoundingClientRect().top;
    heroEl.removeChild(clone);

    var requiredTranslateYPx = lineY - baselineY + glyphCenterFromBaselinePx;
    titleEl.style.setProperty('--title-center-offset', (requiredTranslateYPx / fontSizePx) + 'em');
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
