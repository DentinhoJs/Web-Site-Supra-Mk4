/**
 * TOYOTA SUPRA MK4 — MAIN.JS
 *
 * 1. Progress Bar
 * 2. Header scroll
 * 3. Mobile Menu
 * 4. Hero: vídeo toca 1x · título aparece 4s depois · slide da esquerda
 *          Ao voltar ao topo: vídeo reinicia + título repete animação
 * 5. Scroll animations (entrada + saída reversa via IntersectionObserver)
 * 6. Carrossel 3D cilíndrico (corrigido)
 * 7. Lightbox / Modal com botão X
 * 8. Smooth scroll
 */

(function () {
  'use strict';

  /* ===========================================================
     UTIL
  =========================================================== */
  function isInViewport(el, margin) {
    margin = margin || 80;
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight - margin && r.bottom > margin;
  }

  /* ===========================================================
     1. PROGRESS BAR
  =========================================================== */
  var progressBar = document.getElementById('progress-bar');

  function updateProgressBar() {
    var st = window.scrollY;
    var dh = document.body.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
  }

  /* ===========================================================
     2. HEADER
  =========================================================== */
  var header = document.getElementById('header');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /* ===========================================================
     3. MOBILE MENU
  =========================================================== */
  var navToggle  = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('.mob-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ===========================================================
     4. HERO — VÍDEO 1x + TÍTULO COM DELAY 4s + SLIDE DA ESQUERDA
  =========================================================== */
  var mainVideo     = document.getElementById('mainVideo');
  var heroBlock     = document.getElementById('heroTitleBlock');
  var scrollHint    = document.querySelector('.scroll-hint');

  var videoEnded    = false;   // true depois que o vídeo terminar pela 1ª vez
  var titleShown    = false;   // true depois que o título já foi revelado
  var titleTimer    = null;    // referência ao setTimeout dos 4s
  var lastScrollY   = window.scrollY;

  /**
   * Oculta completamente o bloco de título (para reset).
   */
  function hideTitleBlock() {
    if (!heroBlock) return;
    heroBlock.classList.remove('hero-revealed');
    titleShown = false;
  }

  /**
   * Revela o bloco de título com animação slide da esquerda.
   * (O CSS cuida do keyframe — basta adicionar .hero-revealed)
   */
  function showTitleBlock() {
    if (!heroBlock) return;
    heroBlock.classList.add('hero-revealed');
    titleShown = true;
    // Mostra o scroll hint junto
    if (scrollHint) scrollHint.classList.add('visible');
  }

  /**
   * Cancela qualquer timer pendente e agenda a revelação para daqui 4s.
   */
  function scheduleTitleReveal() {
    if (titleTimer) clearTimeout(titleTimer);
    hideTitleBlock();
    titleTimer = setTimeout(function () {
      showTitleBlock();
    }, 3000); // ← 4 segundos
  }

  /* --- Setup do vídeo --- */
  if (mainVideo) {
    // Toca 1 vez ao carregar
    mainVideo.load();
    mainVideo.play().catch(function () {
      // Autoplay bloqueado — poster fica visível
    });

    // Marca quando o vídeo terminar (não tem loop)
    mainVideo.addEventListener('ended', function () {
      videoEnded = true;
    });
  }

  /**
   * Chamada no evento de scroll para detectar retorno ao topo.
   */
  function checkHeroReset() {
    var cy = window.scrollY;

    // Se rolou de volta ao topo (< 10px) vindo de mais abaixo
    if (cy < 10 && lastScrollY > 80) {
      // Reinicia o vídeo do início
      if (mainVideo) {
        mainVideo.currentTime = 0;
        videoEnded = false;
        mainVideo.play().catch(function () {});
      }
      // Oculta scroll hint e reagenda o título para 4s
      if (scrollHint) scrollHint.classList.remove('visible');
      scheduleTitleReveal();
    }

    lastScrollY = cy;
  }

  // Primeira revelação ao carregar a página
  scheduleTitleReveal();

  /* ===========================================================
     5. SCROLL ANIMATIONS — entrada + saída reversa
  =========================================================== */
  var animEls = [];

  document.querySelectorAll('.anim-left, .anim-right, .anim-up').forEach(function (el) {
    animEls.push({ el: el });
  });

  var scrollObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;

      if (entry.isIntersecting) {
        el.classList.remove('exit');
        el.classList.add('in-view');
      } else {
        el.classList.remove('in-view');
        // Só anima saída se saiu pelo TOPO (para criar reverse ao rolar para cima)
        if (entry.boundingClientRect.top < 0) {
          el.classList.add('exit');
        }
        // Se saiu pela parte de baixo (ainda não chegou lá): remove in-view silenciosamente
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  animEls.forEach(function (item) {
    scrollObserver.observe(item.el);
  });

  /* ===========================================================
   6. CARROSSEL SOCIAL (Scroll-driven)
=========================================================== */
(function () {
  var instaCarousel = document.getElementById('instaCarousel');
  if (!instaCarousel) return;

  var imgs       = instaCarousel.querySelectorAll('img');
  var pagination = document.getElementById('instaPagination');

  function createMarkers() {
    imgs.forEach(function (img) {
      var vName = '--' + img.id;
      img.style.viewTimelineName = vName;

      var marker = document.createElement('button');
      marker.type = 'button';
      marker.setAttribute('role', 'tab');
      marker.style.animationTimeline = vName;
      marker.addEventListener('click', function () { img.scrollIntoView(); });
      pagination.appendChild(marker);
    });

    document.body.style.timelineScope =
      Array.from(imgs).map(function (i) { return i.style.viewTimelineName; }).join(', ');
  }

  if (CSS.supports('view-timeline-axis', 'inline')) {
    createMarkers();
  }

  // Começa no segundo item
if (imgs[1]) instaCarousel.scrollLeft = imgs[1].offsetLeft;
})();

  /* ===========================================================
     7. LIGHTBOX / MODAL com botão X
  =========================================================== */
  var lightbox        = document.getElementById('lightbox');
  var lightboxContent = document.getElementById('lightboxContent');
  var lightboxImg     = document.getElementById('lightboxImg');
  var lightboxClose   = document.getElementById('lightboxClose');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxBackdrop= document.getElementById('lightboxBackdrop');

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (lightboxImg) lightboxImg.src = '';
    }, 500);
  }

  if (lightboxClose)   lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  /* ===========================================================
     8. SMOOTH SCROLL
  =========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var hh  = parseInt(getComputedStyle(document.documentElement)
                  .getPropertyValue('--header-h'), 10) || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - hh;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ===========================================================
     9. MASTER SCROLL HANDLER
  =========================================================== */
  var ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgressBar();
        updateHeader();
        checkHeroReset();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ===========================================================
     10. INIT
  =========================================================== */
  function init() {
    updateProgressBar();
    updateHeader();
    // Anima elementos já visíveis na viewport no load
    animEls.forEach(function (item) {
      if (isInViewport(item.el, 50)) {
        item.el.classList.add('in-view');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);

  window.addEventListener('resize', function () {
    animEls.forEach(function (item) {
      if (isInViewport(item.el, 50) && !item.el.classList.contains('in-view')) {
        item.el.classList.add('in-view');
      }
    });
  }, { passive: true });

})();
