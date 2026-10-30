/**
 * VIZANTINO PIEL — WelcomePreloader
 * Controlador de la secuencia cinematográfica de bienvenida (~4 segundos)
 * Fotografías reales del catálogo: Bolsos, Mochilas, Carteras, Crossbody.
 */

(function initWelcomePreloader() {
  const PRELOADER_SESSION_KEY = 'vizantino_intro_shown';

  // 1. Validar condiciones de omisión rápida:
  // - Usuario con prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dismissImmediately();
    return;
  }

  // - Ya se visualizó en la misma sesión de navegación
  try {
    if (sessionStorage.getItem(PRELOADER_SESSION_KEY)) {
      dismissImmediately();
      return;
    }
  } catch (e) {
    // Si sessionStorage no está disponible, continuar con precaución
  }

  // - Parámetros de URL que indican flujo específico (ej. pago, admin directo, quick view)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') || urlParams.get('order') || urlParams.get('status') || urlParams.get('skip_intro')) {
    dismissImmediately();
    return;
  }

  // 2. Esperar que el DOM esté listo para interactuar con los elementos
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSequence);
  } else {
    startSequence();
  }

  function dismissImmediately() {
    const el = document.getElementById('welcomePreloader');
    if (el) {
      el.style.display = 'none';
      el.remove();
    }
    document.body && document.body.classList.remove('overflow-hidden');
  }

  function startSequence() {
    const preloader = document.getElementById('welcomePreloader');
    if (!preloader) return;

    // Evitar scroll de fondo durante la intro
    document.body.classList.add('overflow-hidden');

    const slides = preloader.querySelectorAll('.vp-cinematic-slide');
    const progressBar = preloader.querySelector('.vp-preloader-progress-bar');
    const logo = preloader.querySelector('.vp-preloader-logo');
    const sub = preloader.querySelector('.vp-preloader-sub');
    const title = preloader.querySelector('.vp-preloader-title');
    const divider = preloader.querySelector('.vp-preloader-divider');
    const tagline = preloader.querySelector('.vp-preloader-tagline');
    const skipBtn = preloader.querySelector('.vp-preloader-skip');

    let isDismissed = false;
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Iniciar barra de progreso
    requestAnimationFrame(() => {
      if (progressBar) progressBar.style.width = '100%';
    });

    // Activar primer slide inmediatamente (Escena 1: 0.0s - 0.8s)
    if (slides.length > 0) {
      slides[0].classList.add('active');
    }

    // Escena 2: Secuencia dinámica de productos (0.8s, 1.4s, 2.0s)
    const slideTimers = [
      setTimeout(() => switchSlide(1), 800),
      setTimeout(() => switchSlide(2), 1400),
      setTimeout(() => switchSlide(3), 2000),
      setTimeout(() => switchSlide(4), 2600)
    ];

    function switchSlide(idx) {
      if (isDismissed || idx >= totalSlides) return;
      slides.forEach((s, i) => {
        if (i === idx) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
      currentSlide = idx;
    }

    // Escena 3: Entrada elegante del mensaje de Bienvenida (a partir de 1.8s - 2.0s)
    const textTimer1 = setTimeout(() => {
      if (isDismissed) return;
      if (logo) logo.classList.add('show');
      if (sub) sub.classList.add('show');
    }, 1800);

    const textTimer2 = setTimeout(() => {
      if (isDismissed) return;
      if (title) title.classList.add('show');
      if (divider) divider.classList.add('show');
      if (tagline) tagline.classList.add('show');
    }, 2200);

    // Escena 4: Entrada a la tienda (3.4s - 4.0s)
    const exitTimer = setTimeout(() => {
      finishIntro();
    }, 3800);

    // Soporte para botón "Omitir"
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        finishIntro();
      });
    }

    // Atajo con tecla Escape
    const keyHandler = (e) => {
      if (e.key === 'Escape') finishIntro();
    };
    window.addEventListener('keydown', keyHandler);

    function finishIntro() {
      if (isDismissed) return;
      isDismissed = true;

      // Limpiar temporizadores
      slideTimers.forEach(clearTimeout);
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
      clearTimeout(exitTimer);
      window.removeEventListener('keydown', keyHandler);

      // Registrar que ya se mostró en esta sesión
      try {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
      } catch (err) {}

      // Desvanecer preloader suavemente
      preloader.classList.add('preloader-hidden');

      // Restaurar desplazamiento normal del navegador
      document.body.classList.remove('overflow-hidden');

      // Remover del DOM tras completar la animación CSS (700ms)
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 750);
    }
  }
})();
