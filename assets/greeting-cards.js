/**
 * Greeting Cards Platform — Prototype JS
 * Vanilla JS only, no external dependencies
 */

(function () {
  'use strict';

  /* ─── Utilities ─────────────────────────────────────────────── */

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function on(el, event, fn, opts) {
    if (el) el.addEventListener(event, fn, opts || false);
  }

  /* ─── 1. Card Slider — MP4 hover autoplay ───────────────────── */

  function initCardSlider() {
    var sliders = $$('.gc-card-slider__viewport');

    sliders.forEach(function (viewport) {
      var cards = $$('.gc-card-item', viewport);
      var prevBtn = $('.gc-card-slider__arrow--prev', viewport.closest('.gc-card-slider'));
      var nextBtn = $('.gc-card-slider__arrow--next', viewport.closest('.gc-card-slider'));

      // Hover autoplay
      cards.forEach(function (card) {
        var video = $('video', card);
        if (!video) return;

        on(card, 'mouseenter', function () {
          video.play().catch(function () {});
        });

        on(card, 'mouseleave', function () {
          video.pause();
          video.currentTime = 0;
        });

        // Touch: play on tap
        on(card, 'touchstart', function () {
          if (video.paused) {
            video.play().catch(function () {});
          }
        }, { passive: true });
      });

      // Arrow navigation
      var scrollAmount = function () {
        var card = cards[0];
        return card ? card.offsetWidth + 20 : 280;
      };

      on(prevBtn, 'click', function () {
        viewport.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      });

      on(nextBtn, 'click', function () {
        viewport.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      });

      // Show/hide arrows based on scroll position
      function updateArrows() {
        if (!prevBtn || !nextBtn) return;
        prevBtn.disabled = viewport.scrollLeft <= 4;
        nextBtn.disabled = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;
      }

      on(viewport, 'scroll', updateArrows, { passive: true });
      updateArrows();
    });
  }

  /* ─── 2. Pricing Toggle ─────────────────────────────────────── */

  function initPricingToggle() {
    var toggles = $$('.gc-pricing__toggle-input');

    toggles.forEach(function (toggle) {
      var section = toggle.closest('.gc-pricing');
      if (!section) return;

      var monthlyPrices = $$('[data-monthly]', section);
      var yearlyPrices = $$('[data-yearly]', section);
      var monthlyLabel = $('.gc-pricing__period--monthly', section);
      var yearlyLabel = $('.gc-pricing__period--yearly', section);

      function updatePrices(isYearly) {
        monthlyPrices.forEach(function (el) {
          el.style.display = isYearly ? 'none' : '';
        });
        yearlyPrices.forEach(function (el) {
          el.style.display = isYearly ? '' : 'none';
        });
        if (monthlyLabel) monthlyLabel.classList.toggle('is-active', !isYearly);
        if (yearlyLabel) yearlyLabel.classList.toggle('is-active', isYearly);
      }

      // Init
      updatePrices(toggle.checked);

      on(toggle, 'change', function () {
        updatePrices(toggle.checked);
      });
    });
  }

  /* ─── 3. FAQ Accordion ──────────────────────────────────────── */

  function initFaq() {
    var items = $$('.gc-faq__item');

    items.forEach(function (item) {
      var trigger = $('.gc-faq__question', item);
      var answer = $('.gc-faq__answer', item);

      if (!trigger || !answer) return;

      // Set initial ARIA
      var isOpen = item.classList.contains('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      answer.style.height = isOpen ? answer.scrollHeight + 'px' : '0';
      answer.style.overflow = 'hidden';
      answer.style.transition = 'height 0.3s ease';

      on(trigger, 'click', function () {
        var open = item.classList.contains('is-open');

        // Close all siblings
        var parent = item.closest('.gc-faq__list');
        if (parent) {
          $$('.gc-faq__item.is-open', parent).forEach(function (sibling) {
            if (sibling === item) return;
            sibling.classList.remove('is-open');
            var sibAnswer = $('.gc-faq__answer', sibling);
            var sibTrigger = $('.gc-faq__question', sibling);
            if (sibAnswer) sibAnswer.style.height = '0';
            if (sibTrigger) sibTrigger.setAttribute('aria-expanded', 'false');
          });
        }

        // Toggle current
        item.classList.toggle('is-open', !open);
        trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
        answer.style.height = open ? '0' : answer.scrollHeight + 'px';
      });
    });
  }

  /* ─── 4. Message Character Counter ─────────────────────────── */

  function initCharCounter() {
    $$('[data-char-counter]').forEach(function (textarea) {
      var max = parseInt(textarea.getAttribute('maxlength') || '200', 10);
      var counterId = textarea.getAttribute('data-char-counter');
      var counter = document.getElementById(counterId);

      if (!counter) return;

      function update() {
        var remaining = max - textarea.value.length;
        counter.textContent = remaining + ' characters remaining';
        counter.classList.toggle('is-low', remaining < 30);
      }

      on(textarea, 'input', update);
      update();
    });
  }

  /* ─── 5. Live Preview Update ────────────────────────────────── */

  function initLivePreview() {
    var forms = $$('.gc-customize__form');

    forms.forEach(function (form) {
      var recipientInput = $('[name="recipient_name"]', form);
      var senderInput = $('[name="sender_name"]', form);
      var messageInput = $('[name="message"]', form);
      var previewBtn = $('.gc-customize__preview-btn', form);

      // Find associated preview (in same section or by data attr)
      var section = form.closest('.gc-customize');
      var previewTo = $('.gc-preview__to-name', section);
      var previewFrom = $('.gc-preview__from-name', section);
      var previewMsg = $('.gc-preview__message-text', section);

      // Also update the global preview section if it exists
      var globalPreviewTo = $$('.gc-preview__to-name');
      var globalPreviewFrom = $$('.gc-preview__from-name');
      var globalPreviewMsg = $$('.gc-preview__message-text');

      function syncPreview() {
        var to = (recipientInput ? recipientInput.value : '') || 'Friend';
        var from = (senderInput ? senderInput.value : '') || 'You';
        var msg = (messageInput ? messageInput.value : '') || 'Your message will appear here...';

        // Update inline preview
        if (previewTo) previewTo.textContent = to;
        if (previewFrom) previewFrom.textContent = from;
        if (previewMsg) previewMsg.textContent = msg;

        // Update global preview section
        globalPreviewTo.forEach(function (el) { el.textContent = to; });
        globalPreviewFrom.forEach(function (el) { el.textContent = from; });
        globalPreviewMsg.forEach(function (el) { el.textContent = msg; });
      }

      if (recipientInput) on(recipientInput, 'input', syncPreview);
      if (senderInput) on(senderInput, 'input', syncPreview);
      if (messageInput) on(messageInput, 'input', syncPreview);

      // Preview button: smooth scroll to preview section
      on(previewBtn, 'click', function (e) {
        e.preventDefault();
        syncPreview();
        var previewSection = document.getElementById('gc-preview');
        if (previewSection) {
          previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ─── 6. Copy URL to Clipboard ─────────────────────────────── */

  function initCopyUrl() {
    $$('[data-copy-url]').forEach(function (btn) {
      on(btn, 'click', function () {
        var urlEl = document.getElementById(btn.getAttribute('data-copy-url'));
        var text = urlEl ? urlEl.textContent : window.location.href;

        navigator.clipboard.writeText(text).then(function () {
          var original = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('is-copied');
          }, 2000);
        }).catch(function () {
          // Fallback
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = 'Copy Link'; }, 2000);
        });
      });
    });
  }

  /* ─── 7. Card Selector (customize section) ──────────────────── */

  function initCardSelector() {
    $$('.gc-customize__card-option').forEach(function (option) {
      on(option, 'click', function () {
        var group = option.closest('.gc-customize__card-options');
        if (group) {
          $$('.gc-customize__card-option', group).forEach(function (o) {
            o.classList.remove('is-selected');
          });
        }
        option.classList.add('is-selected');

        // Update main video player
        var videoSrc = option.getAttribute('data-video');
        var section = option.closest('.gc-customize');
        var mainVideo = $('video.gc-customize__main-video', section);
        if (mainVideo && videoSrc) {
          var source = $('source', mainVideo) || mainVideo;
          if (source.tagName === 'SOURCE') {
            source.src = videoSrc;
            mainVideo.load();
            mainVideo.play().catch(function () {});
          }
        }

        // Update preview video too
        var previewVideos = $$('video.gc-preview__video');
        previewVideos.forEach(function (pv) {
          var pvSource = $('source', pv) || pv;
          if (pvSource.tagName === 'SOURCE' && videoSrc) {
            pvSource.src = videoSrc;
            pv.load();
            pv.play().catch(function () {});
          }
        });
      });
    });
  }

  /* ─── 8. Smooth Scroll for anchor links ─────────────────────── */

  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      on(link, 'click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ─── 9. Lazy load videos (IntersectionObserver) ────────────── */

  function initLazyVideos() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var video = entry.target;
        var source = $('source[data-src]', video);
        if (source) {
          source.src = source.getAttribute('data-src');
          source.removeAttribute('data-src');
          video.load();
        }
        observer.unobserve(video);
      });
    }, { rootMargin: '200px' });

    $$('video[data-lazy]').forEach(function (v) { observer.observe(v); });
  }

  /* ─── Init ──────────────────────────────────────────────────── */

  function init() {
    initCardSlider();
    initPricingToggle();
    initFaq();
    initCharCounter();
    initLivePreview();
    initCopyUrl();
    initCardSelector();
    initSmoothScroll();
    initLazyVideos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
