/**
 * VIZANTINO PIEL — WelcomePreloader
 * Controlador de la secuencia cinematográfica de bienvenida (~4.8 segundos)
 * Muestra dinámicamente fotografías variables y reales de los productos del catálogo
 * sincronizados desde Supabase / LocalStorage.
 */

(function initWelcomePreloader() {
  const PRELOADER_SESSION_KEY = 'vizantino_intro_shown';

  // 1. Obtener parámetros de URL de forma segura
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

  // 2. Control de visualización:
  const path = window.location.pathname;
  const isDirectHome = (path === '' || path === '/' || path.endsWith('index.html')) && (!window.location.hash || window.location.hash === '#inicio');
  const forceIntro = urlParams.get('intro') === '1' || urlParams.get('replay') === '1';

  // Solo se omite si NO está en el home y ya se mostró en esta sesión
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

  // Obtener una selección variable y aleatoria de productos reales con fotografía
  function pickDynamicCatalogProducts() {
    let pool = [];

    // Prioridad 1: Productos ya en memoria de la aplicación
    if (window.products && Array.isArray(window.products) && window.products.length > 0) {
      pool = window.products.filter(p => p && p.active !== false && p.image && !p.image.includes('Preloader'));
    }

    // Prioridad 2: Buscar en window.INITIAL_PRODUCTS
    if (pool.length < 5 && window.INITIAL_PRODUCTS && Array.isArray(window.INITIAL_PRODUCTS)) {
      const initPool = window.INITIAL_PRODUCTS.filter(p => p && p.active !== false && p.image);
      pool = pool.concat(initPool);
    }

    // Prioridad 3: Intentar desde localStorage si existe
    if (pool.length < 5) {
      try {
        const stored = localStorage.getItem('vizantino_products_v1') || localStorage.getItem('vizantino_products_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(p => p && p.image);
            pool = pool.concat(valid);
          }
        }
      } catch (e) {}
    }

    // Fallback de alta calidad con piezas emblemáticas
    const fallbacks = [
      { name: "Bolso Sienna", category: "Bolsos", price: 3000, image: "https://vizantino.com/products/elite/elite-1.jpg" },
      { name: "Bolsa Valentina + Strap", category: "Bolsos", price: 980, image: "https://vizantino.com/products/bolsa-valentina/valentina-1.jpg" },
      { name: "Mochila Dora Piel Genuina", category: "Mochilas", price: 3400, image: "https://vizantino.com/products/mochila-rains/mochila-rains-studio-img-18.jpg" },
      { name: "Porta Pasaporte Artesanal", category: "Accesorios", price: 480, image: "https://vizantino.com/products/tarjetero-vacuno/tarjetero-vacuno-studio-img-07.jpg" },
      { name: "Crossbody de Piel Vacuno", category: "Crossbody", price: 1500, image: "https://vizantino.com/products/crossbody-cesar/cesar-1.jpg" }
    ];

    if (pool.length === 0) {
      return fallbacks;
    }

    // Desordenar aleatoriamente (shuffle Fisher-Yates) para que sea VARIABLE en cada recarga
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Tomar 5 o 6 productos únicos y variados
    const unique = [];
    const seenNames = new Set();
    for (const prod of shuffled) {
      if (prod && prod.image && !seenNames.has(prod.name)) {
        seenNames.add(prod.name);
        unique.push(prod);
        if (unique.length >= 6) break;
      }
    }

    return unique.length >= 3 ? unique : fallbacks;
  }

  function startSequence() {
    const preloader = document.getElementById('welcomePreloader');
    if (!preloader) return;

    // Asegurar que el preloader sea visible
    preloader.style.display = 'flex';
    preloader.classList.remove('preloader-hidden');

    // Bloquear scroll durante la intro
    if (document.body) {
      document.body.classList.add('overflow-hidden');
    }

    const stage = preloader.querySelector('.vp-cinematic-stage');
    const progressBar = preloader.querySelector('.vp-preloader-progress-bar');
    const logo = preloader.querySelector('.vp-preloader-logo');
    const sub = preloader.querySelector('.vp-preloader-sub');
    const title = preloader.querySelector('.vp-preloader-title');
    const divider = preloader.querySelector('.vp-preloader-divider');
    const tagline = preloader.querySelector('.vp-preloader-tagline');
    const skipBtn = preloader.querySelector('.vp-preloader-skip');

    // Cargar productos variables del catálogo
    const dynamicProducts = pickDynamicCatalogProducts();

    // Reconstruir los slides dinámicamente con los productos seleccionados
    if (stage && dynamicProducts.length > 0) {
      stage.innerHTML = dynamicProducts.map((p, idx) => `
        <div class="vp-cinematic-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
          <img src="${p.image}" alt="${p.name}" loading="eager" fetchpriority="${idx === 0 ? 'high' : 'auto'}">
          <div class="vp-slide-product-badge ${idx === 0 ? 'badge-active' : ''}">
            <span class="vp-slide-badge-cat">${p.category || 'Piel Genuina'} · Hecho en México</span>
            <span class="vp-slide-badge-title">${p.name}</span>
            <span class="vp-slide-badge-price">$${typeof p.price === 'number' ? p.price.toLocaleString('es-MX') : p.price} MXN</span>
          </div>
        </div>
      `).join('');
    }

    const slides = preloader.querySelectorAll('.vp-cinematic-slide');
    const badges = preloader.querySelectorAll('.vp-slide-product-badge');
    const totalSlides = slides.length;

    let isDismissed = false;

    // Iniciar barra de progreso sincronizada
    requestAnimationFrame(() => {
      if (progressBar) {
        progressBar.style.transition = 'width 4.8s linear';
        progressBar.style.width = '100%';
      }
    });

    // Secuencia variable de cambio de fotografías (intervalo de ~900ms entre cada pieza)
    const slideTimers = [];
    const interval = Math.floor(3600 / Math.max(1, totalSlides));
    for (let i = 1; i < totalSlides; i++) {
      slideTimers.push(setTimeout(() => switchSlide(i), i * interval));
    }

    function switchSlide(idx) {
      if (isDismissed || idx >= totalSlides) return;
      slides.forEach((s, i) => {
        if (i === idx) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
      badges.forEach((b, i) => {
        if (i === idx) {
          b.classList.add('badge-active');
        } else {
          b.classList.remove('badge-active');
        }
      });
    }

    // Entrada del mensaje central de Bienvenida
    const textTimer1 = setTimeout(() => {
      if (isDismissed) return;
      if (logo) logo.classList.add('show');
      if (sub) sub.classList.add('show');
    }, 1500);

    const textTimer2 = setTimeout(() => {
      if (isDismissed) return;
      if (title) title.classList.add('show');
      if (divider) divider.classList.add('show');
      if (tagline) tagline.classList.add('show');
    }, 2000);

    // Finalización automática de la intro (~4.8 segundos)
    const exitTimer = setTimeout(() => {
      finishIntro();
    }, 4800);

    // Botón para entrar inmediatamente
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        finishIntro();
      });
    }

    // Atajo tecla Escape
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

      // Restaurar desplazamiento normal
      if (document.body) {
        document.body.classList.remove('overflow-hidden');
      }

      // Remover del DOM
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 750);
    }
  }
})();
