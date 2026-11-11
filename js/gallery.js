document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const carousel = gallery.querySelector('.swiper');
  const controls = gallery.querySelector('.geeker-gallery__controls');
  const toggle = gallery.querySelector('[data-gallery-autoplay]');
  let autoPaused = reducedMotion.matches;
  let visible = false;
  let overlayOpen = false;
  let swiper;

  function updateAutoplay() {
    if (!swiper) return;
    const shouldPlay = visible && !autoPaused && !overlayOpen;
    if (shouldPlay && !swiper.autoplay.running) swiper.autoplay.start();
    if (!shouldPlay && swiper.autoplay.running) swiper.autoplay.stop();
    toggle.textContent = autoPaused ? 'Увімкнути автопрокрутку' : 'Призупинити автопрокрутку';
  }

  function carouselOptions(section, labels) {
    return {
      slidesPerView: 1,
      spaceBetween: 16,
      rewind: true,
      speed: reducedMotion.matches ? 0 : 420,
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 18 },
        1024: { slidesPerView: 3, spaceBetween: 22 }
      },
      navigation: {
        prevEl: section.querySelector('[data-gallery-prev]'),
        nextEl: section.querySelector('[data-gallery-next]')
      },
      pagination: {
        el: section.querySelector('.geeker-gallery__pagination'),
        clickable: true
      },
      a11y: {
        containerRoleDescriptionMessage: 'Карусель',
        itemRoleDescriptionMessage: 'Слайд',
        firstSlideMessage: 'Перший слайд',
        lastSlideMessage: 'Останній слайд',
        paginationBulletMessage: 'Перейти до слайда {{index}}',
        ...labels
      }
    };
  }

  if (typeof Swiper === 'function' && document.getElementById('swiper-css')?.sheet) {
    swiper = new Swiper(carousel, {
      ...carouselOptions(gallery, {
        prevSlideMessage: 'Попередній слайд',
        nextSlideMessage: 'Наступний слайд'
      }),
      autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }
    });

    const media = document.querySelector('[data-video-carousel]');
    const videos = new Swiper(media.querySelector('.swiper'), carouselOptions(media, {
      itemRoleDescriptionMessage: 'Відео',
      prevSlideMessage: 'Попереднє відео',
      nextSlideMessage: 'Наступне відео',
      paginationBulletMessage: 'Перейти до відео {{index}}'
    }));
    media.querySelector('.geeker-gallery__controls').hidden = false;
    controls.hidden = false;
    updateAutoplay();

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateAutoplay();
    }, { threshold: .35 }).observe(carousel);

    toggle.addEventListener('click', () => {
      autoPaused = !autoPaused;
      updateAutoplay();
    });
    gallery.addEventListener('focusin', (event) => {
      if (event.target !== toggle) {
        autoPaused = true;
        updateAutoplay();
      }
    });
    reducedMotion.addEventListener('change', () => {
      swiper.params.speed = videos.params.speed = reducedMotion.matches ? 0 : 420;
      if (reducedMotion.matches) autoPaused = true;
      updateAutoplay();
    });
  }

  if (typeof Fancybox !== 'undefined' && document.getElementById('fancybox-css').sheet) {
    Fancybox.bind(gallery, '[data-fancybox="geeker-covers"]', {
      Carousel: { transition: reducedMotion.matches ? false : 'slide' },
      Images: { zoom: !reducedMotion.matches },
      showClass: reducedMotion.matches ? false : 'f-fadeIn',
      hideClass: reducedMotion.matches ? false : 'f-fadeOut',
      contentClick: 'toggleZoom',
      l10n: {
        MODAL: 'Обкладинки настільних ігор', CLOSE: 'Закрити',
        NEXT: 'Наступна', PREV: 'Попередня', TOGGLE_ZOOM: 'Змінити масштаб',
        ZOOM_IN: 'Збільшити', ZOOM_OUT: 'Зменшити', TOGGLE_THUMBS: 'Мініатюри',
        ITERATE_ZOOM: 'Змінити масштаб', TOGGLE_SLIDESHOW: 'Автопоказ'
      },
      on: {
        init: () => { overlayOpen = true; updateAutoplay(); },
        destroy: () => { overlayOpen = false; updateAutoplay(); }
      }
    });
  }

  const typedLine = document.querySelector('[data-hero-typed]');
  if (!reducedMotion.matches && typeof Typed === 'function') {
    const text = typedLine.textContent;
    typedLine.textContent = '';
    new Typed(typedLine, { strings: [text], typeSpeed: 34, startDelay: 300, loop: false, showCursor: false });
  }
});
