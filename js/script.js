/* ====================================================
   ASSOCIAÇÃO JUNTOS PELO CÉU — Interactions
   ==================================================== */

(function () {
  'use strict';

  const body = document.body;
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = nav ? Array.from(nav.querySelectorAll('.nav__link')) : [];
  const headerLogo = document.querySelector('.header__logo .logo-img');
  const backToTop = document.getElementById('back-to-top');
  const isGalleryPage = body && body.dataset.page === 'gallery';
  const assetPrefix = body?.dataset.assetsPrefix || '';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resolveAsset(fileName) {
    // ensure spaces and special chars are encoded for the URL
    return encodeURI(assetPrefix + 'assets/images/' + fileName);
  }

  function updateActiveNav() {
    if (!navLinks.length || !header) {
      return;
    }

    if (isGalleryPage) {
      navLinks.forEach(function (link) {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href.indexOf('galeria') !== -1);
      });
      return;
    }

    const scrollPosition = window.scrollY + header.offsetHeight + 120;
    let activeSectionId = 'home';

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < bottom) {
        activeSectionId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === '#' + activeSectionId);
    });
  }

  function updateHeaderState() {
    if (header) {
      const scrolled = window.scrollY > 24;
      header.classList.toggle('scrolled', scrolled);

      if (headerLogo) {
        const defaultSrc = headerLogo.getAttribute('data-logo-default');
        const scrolledSrc = headerLogo.getAttribute('data-logo-scrolled');
        const nextSrc = scrolled ? scrolledSrc : defaultSrc;
        if (nextSrc && headerLogo.getAttribute('src') !== nextSrc) {
          headerLogo.setAttribute('src', nextSrc);
        }
      }
    }
    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 520);
    }
    updateActiveNav();
  }

  function updateHeroParallax() {
    const heroImage = document.querySelector('.hero__img');
    if (!heroImage || prefersReducedMotion) {
      return;
    }

    heroImage.style.transform = 'translateY(' + (window.scrollY * 0.18) + 'px)';
  }

  window.addEventListener('scroll', function () {
    updateHeaderState();
    updateHeroParallax();
  }, { passive: true });

  window.addEventListener('resize', function () {
    updateHeaderState();
    if (testimonialTrack && testimonialCards.length) {
      slideTo(currentTestimonialIndex, false);
    }
  });

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        if ((this.getAttribute('href') || '').charAt(0) === '#') {
          nav.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          body.style.overflow = '';
        }
      });
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  const countUpEls = Array.from(document.querySelectorAll('.count-up'));
  if (countUpEls.length) {
    function animateCountUp(element) {
      if (element.dataset.countAnimated === 'true') {
        return;
      }

      element.dataset.countAnimated = 'true';
      const target = parseInt(element.getAttribute('data-target') || '0', 10);
      const suffix = element.getAttribute('data-suffix') || '';

      if (prefersReducedMotion) {
        element.textContent = String(target) + suffix;
        return;
      }

      const duration = 1300;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(target * progress);
        element.textContent = String(value) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }

    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.86 && rect.bottom > 0;
    }

    function checkCountUps() {
      countUpEls.forEach(function (element) {
        if (isInViewport(element)) {
          animateCountUp(element);
        }
      });
    }

    checkCountUps();
    window.addEventListener('scroll', checkCountUps, { passive: true });
    window.addEventListener('resize', checkCountUps);

    const countUpWatcher = window.setInterval(function () {
      checkCountUps();
      if (countUpEls.every(function (element) {
        return element.dataset.countAnimated === 'true';
      })) {
        clearInterval(countUpWatcher);
      }
    }, 250);
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const nameInput = document.getElementById('newsletter-name');
      const emailInput = document.getElementById('newsletter-email');
      const nameValue = nameInput ? nameInput.value.trim() : '';
      const emailValue = emailInput ? emailInput.value.trim() : '';
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

      if (!emailValue || !isValidEmail || (nameInput && !nameValue)) {
        if (emailInput) {
          emailInput.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.3)';
        }
        if (nameInput && !nameValue) {
          nameInput.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.3)';
        }
        return;
      }

      if (emailInput) {
        emailInput.style.boxShadow = '';
      }
      if (nameInput) {
        nameInput.style.boxShadow = '';
      }

      const submitButton = newsletterForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Obrigado!';
        submitButton.disabled = true;
      }

      newsletterForm.reset();

      window.setTimeout(function () {
        if (submitButton) {
          submitButton.textContent = 'Quero receber';
          submitButton.disabled = false;
        }
      }, 3000);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const targetSelector = this.getAttribute('href');
      if (!targetSelector || targetSelector === '#') {
        return;
      }

      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        return;
      }

      event.preventDefault();
      const offset = header ? header.offsetHeight + 16 : 16;
      const top = targetElement.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  const testimonialTrack = document.getElementById('testimonials-track');
  const testimonialSlider = document.getElementById('testimonials-slider');
  const testimonialDots = Array.from(document.querySelectorAll('.testimonials__dot'));
  const testimonialCards = testimonialTrack ? Array.from(testimonialTrack.querySelectorAll('.testimonial-card')) : [];
  let currentTestimonialIndex = 0;
  let testimonialTimer = null;

  function slideTo(index, shouldResetTimer) {
    if (!testimonialTrack || !testimonialCards.length) {
      return;
    }

    currentTestimonialIndex = (index + testimonialCards.length) % testimonialCards.length;
    // calculate actual card width including current margin-right (works across breakpoints)
    const firstCard = testimonialCards[0];
    const cardStyle = window.getComputedStyle(firstCard);
    let spacing = parseFloat(cardStyle.marginRight) || 0;
    if (!spacing) {
      // if layout uses CSS gap on the track, read that instead
      const trackStyle = window.getComputedStyle(testimonialTrack);
      const gapVal = trackStyle.getPropertyValue('gap') || trackStyle.getPropertyValue('column-gap') || trackStyle.getPropertyValue('grid-column-gap');
      spacing = parseFloat(gapVal) || 0;
    }
    const cardWidth = firstCard.offsetWidth + spacing;
    testimonialTrack.style.transform = 'translateX(-' + (currentTestimonialIndex * cardWidth) + 'px)';

    testimonialDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentTestimonialIndex);
    });

    if (shouldResetTimer) {
      restartTestimonialTimer();
    }
  }

  function restartTestimonialTimer() {
    if (testimonialTimer) {
      clearInterval(testimonialTimer);
    }

    testimonialTimer = window.setInterval(function () {
      slideTo(currentTestimonialIndex + 1, false);
    }, 5000);
  }

  testimonialDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      slideTo(parseInt(this.getAttribute('data-index') || '0', 10), true);
    });
  });

  if (testimonialSlider && testimonialCards.length) {
    slideTo(0, false);
    restartTestimonialTimer();

    let touchStartX = 0;
    testimonialSlider.addEventListener('touchstart', function (event) {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    testimonialSlider.addEventListener('touchend', function (event) {
      const deltaX = touchStartX - event.changedTouches[0].clientX;
      if (Math.abs(deltaX) > 40) {
        slideTo(currentTestimonialIndex + (deltaX > 0 ? 1 : -1), true);
      }
    }, { passive: true });
  }

  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const galleryToolbar = document.getElementById('gallery-toolbar');
    const galleryLightbox = document.getElementById('gallery-lightbox');
    const galleryLightboxImage = galleryLightbox ? galleryLightbox.querySelector('.lightbox__img') : null;
    const galleryLightboxCaption = galleryLightbox ? galleryLightbox.querySelector('.lightbox__caption') : null;
    const galleryLightboxClose = galleryLightbox ? galleryLightbox.querySelector('.lightbox__close') : null;
    const galleryLightboxPrev = galleryLightbox ? galleryLightbox.querySelector('.lightbox__prev') : null;
    const galleryLightboxNext = galleryLightbox ? galleryLightbox.querySelector('.lightbox__next') : null;
    const galleryLoadMore = document.getElementById('gallery-load-more');
    const galleryStatus = document.getElementById('gallery-status');

    // fallback static items (used if gallery-map.json isn't available)
    const fallbackItems = [
      { file: 'WhatsApp Image 2026-05-24 at 21.55.15.jpeg', category: 'Eventos', title: 'Retiro Jovem', description: 'Momento de oração e encontro.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.15 (1).jpeg', category: 'Eventos', title: 'Retiro Jovem', description: 'Participação em comunidade.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.16.jpeg', category: 'Encontros', title: 'Acolhida', description: 'Recepção e partilha.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.16 (1).jpeg', category: 'Encontros', title: 'Acolhida', description: 'Momentos de comunhão.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.19.jpeg', category: 'Missões', title: 'Missão', description: 'Serviço e evangelização.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.19 (1).jpeg', category: 'Missões', title: 'Missão', description: 'Equipe em ação.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.20.jpeg', category: 'Projetos', title: 'Projeto Social', description: 'Ações que transformam.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.20 (1).jpeg', category: 'Projetos', title: 'Projeto Social', description: 'Cuidado com as famílias.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.21.jpeg', category: 'Eventos', title: 'DNJ', description: 'Jovens em festa e oração.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.22.jpeg', category: 'Eventos', title: 'DNJ', description: 'Muitos corações reunidos.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.23.jpeg', category: 'Formação', title: 'Formação', description: 'Crescimento e discipulado.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.24.jpeg', category: 'Formação', title: 'Formação', description: 'Serviço e liderança.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.25.jpeg', category: 'Missões', title: 'Missão', description: 'Evangelização e encontro.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.26.jpeg', category: 'Missões', title: 'Missão', description: 'Partilha e amizade.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.27.jpeg', category: 'Formação', title: 'Formação', description: 'Liderança com propósito.' },
      { file: 'WhatsApp Image 2026-05-24 at 21.55.28.jpeg', category: 'Projetos', title: 'Projeto', description: 'Vidas sendo tocadas.' },
      { file: 'WhatsApp Image 2026-01-22 at 12.05.09.jpg.jpeg', category: 'Projetos', title: 'Planet Park', description: 'Parcerias que fortalecem.' },
      { file: 'WhatsApp Image 2026-01-22 at 12.05.10.jpg.jpeg', category: 'Projetos', title: 'Planet Park', description: 'Parcerias que fortalecem.' },
      { file: 'WhatsApp Image 2026-01-22 at 12.09.34.jpg.jpeg', category: 'Projetos', title: 'Planet Park', description: 'Parcerias que fortalecem.' },
      { file: 'WhatsApp Image 2026-01-22 at 11.06.57.jpg.jpeg', category: 'Formação', title: 'Diretoria', description: 'Equipe e governança.' },
      { file: 'WhatsApp Image 2026-01-22 at 11.14.42.jpg.jpeg', category: 'Formação', title: 'Diretoria', description: 'Equipe e governança.' },
      { file: 'WhatsApp Image 2026-01-22 at 11.19.22.jpg.jpeg', category: 'Formação', title: 'Diretoria', description: 'Equipe e governança.' }
    ];

    // dynamic gallery data (will be populated from gallery-map.json when available)
    let galleryItems = [];
    let categories = ['Todos'];
    let activeCategory = 'Todos';
    let visibleCount = 9;
    let activeItems = [];
    let lightboxIndex = 0;

    // attempt to load gallery-map.json which maps folders/categories to filenames
    (function loadGalleryMap() {
      const mapUrl = assetPrefix + 'assets/images/gallery-map.json';
      fetch(mapUrl).then(function (res) {
        if (!res.ok) {
          throw new Error('Mapa não encontrado');
        }
        return res.json();
      }).then(function (map) {
        galleryItems = [];
        categories = ['Todos'];
        Object.keys(map).forEach(function (category) {
          categories.push(category);
          const files = map[category] || [];
          files.forEach(function (fileName) {
            galleryItems.push({
              // try to load image from folder named as category first
              file: category + '/' + fileName,
              category: category,
              title: category,
              description: ''
            });
          });
        });
        buildToolbar();
        renderGallery();
      }).catch(function (err) {
        // fallback to the embedded static set if the map cannot be loaded
        console.error('Erro ao carregar gallery-map.json:', err);
        galleryItems = fallbackItems.slice();
        categories = ['Todos', 'Eventos', 'Projetos', 'Missões', 'Encontros', 'Formação'];
        buildToolbar();
        renderGallery();
      });
    }());

    function buildToolbar() {
      if (!galleryToolbar) {
        return;
      }

      galleryToolbar.innerHTML = categories.map(function (category) {
        return '<button class="gallery-filter' + (category === activeCategory ? ' active' : '') + '" data-category="' + category + '">' + category + '</button>';
      }).join('');

      galleryToolbar.querySelectorAll('.gallery-filter').forEach(function (button) {
        button.addEventListener('click', function () {
          activeCategory = this.getAttribute('data-category') || 'Todos';
          visibleCount = 9;
          buildToolbar();
          renderGallery();
        });
      });
    }

    function renderGallery() {
      activeItems = activeCategory === 'Todos' ? galleryItems : galleryItems.filter(function (item) {
        return item.category === activeCategory;
      });

      const itemsToRender = activeItems.slice(0, visibleCount);

      galleryGrid.innerHTML = itemsToRender.map(function (item, index) {
        // attempt to load image from category folder; on error fallback to root assets/images
        const fallbackRoot = resolveAsset((item.file || '').split('/').pop());
        return [
          '<button class="gallery-card reveal visible" data-index="' + index + '" type="button">',
          '<img class="gallery-card__img" src="' + resolveAsset(item.file) + '" alt="' + item.title + '" loading="lazy" decoding="async" onerror="if(!this.dataset.fallback){this.dataset.fallback=1;this.src=\'' + fallbackRoot + '\';}" />',
          '<div class="gallery-card__meta">',
          '<span class="gallery-card__category">' + item.category + '</span>',
          '<strong class="gallery-card__title">' + item.title + '</strong>',
          '<p class="gallery-card__text">' + item.description + '</p>',
          '</div>',
          '</button>'
        ].join('');
      }).join('');

      galleryGrid.querySelectorAll('.gallery-card').forEach(function (button) {
        button.addEventListener('click', function () {
          lightboxIndex = parseInt(this.getAttribute('data-index') || '0', 10);
          openLightbox();
        });
      });

      if (galleryStatus) {
        galleryStatus.textContent = itemsToRender.length + ' de ' + activeItems.length + ' fotos exibidas';
      }

      if (galleryLoadMore) {
        galleryLoadMore.style.display = visibleCount < activeItems.length ? 'inline-flex' : 'none';
      }

      const newlyRendered = galleryGrid.querySelectorAll('.reveal:not(.visible)');
      newlyRendered.forEach(function (element) {
        element.classList.add('visible');
      });
    }

    function openLightbox() {
      if (!galleryLightbox || !galleryLightboxImage || !activeItems.length) {
        return;
      }

      const item = activeItems[(lightboxIndex + activeItems.length) % activeItems.length];
      if (galleryLightboxImage) {
        galleryLightboxImage.onerror = function () {
          this.onerror = null;
          this.src = resolveAsset((item.file || '').split('/').pop());
        };
        galleryLightboxImage.src = resolveAsset(item.file);
        galleryLightboxImage.alt = item.title;
      }
      if (galleryLightboxCaption) {
        galleryLightboxCaption.textContent = item.category + ' · ' + item.title + ' · ' + item.description;
      }
      galleryLightbox.classList.add('open');
      galleryLightbox.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!galleryLightbox) {
        return;
      }

      galleryLightbox.classList.remove('open');
      galleryLightbox.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
      if (galleryLightboxImage) {
        galleryLightboxImage.src = '';
      }
      if (galleryLightboxCaption) {
        galleryLightboxCaption.textContent = '';
      }
    }

    function showPrevious() {
      lightboxIndex = (lightboxIndex - 1 + activeItems.length) % activeItems.length;
      openLightbox();
    }

    function showNext() {
      lightboxIndex = (lightboxIndex + 1) % activeItems.length;
      openLightbox();
    }

    if (galleryLoadMore) {
      galleryLoadMore.addEventListener('click', function () {
        visibleCount += 9;
        renderGallery();
      });
    }

    if (galleryLightboxClose) {
      galleryLightboxClose.addEventListener('click', closeLightbox);
    }
    if (galleryLightboxPrev) {
      galleryLightboxPrev.addEventListener('click', showPrevious);
    }
    if (galleryLightboxNext) {
      galleryLightboxNext.addEventListener('click', showNext);
    }
    if (galleryLightbox) {
      galleryLightbox.addEventListener('click', function (event) {
        if (event.target === galleryLightbox) {
          closeLightbox();
        }
      });
    }

    document.addEventListener('keydown', function (event) {
      if (!galleryLightbox || !galleryLightbox.classList.contains('open')) {
        return;
      }

      if (event.key === 'Escape') {
        closeLightbox();
      }
      if (event.key === 'ArrowLeft') {
        showPrevious();
      }
      if (event.key === 'ArrowRight') {
        showNext();
      }
    });

    buildToolbar();
    renderGallery();
  }

  updateHeaderState();
})();
