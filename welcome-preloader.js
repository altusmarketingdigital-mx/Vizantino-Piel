/**
 * VIZANTINO PIEL — WelcomePreloader
 * Controlador de la secuencia cinematográfica de bienvenida (~4 segundos)
 * Fotografías reales del catálogo: Bolsos, Mochilas, Carteras, Crossbody.
 */

(function initWelcomePreloader() {
  const PRELOADER_SESSION_KEY = 'vizantino_intro_shown';

  // 1. Obtener parámetros de URL de forma segura una sola vez
  let urlParams = null;
  try {
    urlParams = new URLSearchParams(window.location.search);
  } catch (e) {
    urlParams = { get: () => null };
  }

  // - Usuario con prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && !urlParams.get('intro')) {
    dismissImmediately();
    return;
  }

  // - Si el usuario pide omitir explícitamente (?skip_intro=1, ?admin=1, etc.)
  if (urlParams.get('admin') || urlParams.get('order') || urlParams.get('status') || urlParams.get('skip_intro')) {
    dismissImmediately();
    return;
  }

  // 2. Control de visualización por sesión:
  // Si visita la raíz (https://vizantino.vercel.app/ o index.html) directamente, permitimos que se disfrute.
  // Solo se omite si el usuario está activamente navegando dentro del sitio navegando entre pestañas internas.
  const isDirectHome = (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) && !window.location.hash;
  const forceIntro = urlParams.get('intro') === '1' || urlParams.get('replay') === '1';

  try {
    if (!forceIntro && !isDirectHome && sessionStorage.getItem(PRELOADER_SESSION_KEY)) {
      dismissImmediately();
      return;
    }
  } catch (e) {}

  // 3. Ejecutar la secuencia
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSequence);
  } else {
    startSequence();
  }

  function dismissImmediately() {
    const el = document.getElementById('welcomePreloader');
    if (el) {
      el.style.display = 'none';
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    if (document.body) {
      document.body.classList.remove('overflow-hidden');
    }
  }

  function startSequence() {
    const preloader = document.getElementById('welcomePreloader');
    if (!preloader) return;

    // Asegurar que el preloader sea visible
    preloader.style.display = 'flex';
    preloader.classList.remove('preloader-hidden');

    // Bloquear scroll temporalmente durante la intro
    if (document.body) {
      document.body.classList.add('overflow-hidden');
    }

    const slides = preloader.querySelectorAll('.vp-cinematic-slide');
    const progressBar = preloader.querySelector('.vp-preloader-progress-bar');
    const logo = preloader.querySelector('.vp-preloader-logo');
    const sub = preloader.querySelector('.vp-preloader-sub');
    const title = preloader.querySelector('.vp-preloader-title');
    const divider = preloader.querySelector('.vp-preloader-divider');
    const tagline = preloader.querySelector('.vp-preloader-tagline');
    const skipBtn = preloader.querySelector('.vp-preloader-skip');

    let isDismissed = false;
    const totalSlides = slides.length;

    // Iniciar barra de progreso
    requestAnimationFrame(() => {
      if (progressBar) progressBar.style.width = '100%';
    });

    // Activar primer slide inmediatamente (Escena 1: 0.0s - 0.8s)
    if (slides.length > 0) {
      slides[0].classList.add('active');
    }

    // Escena 2: Secuencia dinámica de productos (0.8s, 1.4s, 2.0s, 2.6s)
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
    }

    // Escena 3: Entrada elegante del mensaje de Bienvenida (a partir de 1.8s - 2.2s)
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

    // Escena 4: Entrada a la tienda (3.8s - 4.2s)
    const exitTimer = setTimeout(() => {
      finishIntro();
    }, 4000);

    // Soporte para botón "Entrar a la tienda"
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

      // Registrar sesión
      try {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
      } catch (err) {}

      // Desvanecer preloader suavemente
      preloader.classList.add('preloader-hidden');

      // Restaurar desplazamiento normal del navegador
      if (document.body) {
        document.body.classList.remove('overflow-hidden');
      }

      // Remover del DOM tras completar la animación CSS
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 750);
    }
  }
})();
