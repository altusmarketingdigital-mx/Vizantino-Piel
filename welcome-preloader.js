/**
 * VIZANTINO PIEL — WelcomePreloader
 * Controlador de la secuencia cinematográfica de bienvenida (~4.8 segundos)
 * Muestra dinámicamente fotografías variables y reales de los productos DESTACADOS del catálogo.
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

  // Catálogo estático optimizado de productos destacados (garantía 0 ms de retraso)
  const LOCAL_FEATURED_PRODUCTS = [
    {
      id: 8,
      name: "Bolsa Cincelada Minerva",
      category: "Bolsos",
      price: 2600,
      image: "products/featured/bolsa-cincelada-minerva.webp",
      barcode: "FEATURED"
    },
    {
      id: 1,
      name: "Bolsa Sienna",
      category: "Bolsos",
      price: 3000,
      image: "products/featured/bolsa-sienna.webp",
      barcode: "FEATURED"
    },
    {
      id: 3,
      name: "Bolsa Sultana",
      category: "Bolsos",
      price: 1900,
      image: "products/featured/bolsa-sultana.webp",
      barcode: "FEATURED"
    },
    {
      id: 2,
      name: "Maletín/Bolsa Chelsea Pelo de Vaca",
      category: "Bolsos",
      price: 3000,
      image: "products/featured/malet-n-bolsa-chelsea-pelo-de-vaca.webp",
      barcode: "FEATURED"
    },
    {
      id: 4,
      name: "Porta Pasaporte en Piel",
      category: "Accesorios",
      price: 480,
      image: "products/featured/porta-pasaporte.webp",
      barcode: "FEATURED"
    },
    {
      id: 24,
      name: "Bolsa Mel + Strap",
      category: "Bolsos",
      price: 980,
      image: "products/featured/bolsa-mel-strap.webp",
      barcode: "FEATURED"
    },
    {
      id: 5,
      name: "Bolsa Combo Dior 2 en 1",
      category: "Bolsos",
      price: 2100,
      image: "products/featured/bolsa-combo-dior-2-en-1-strap.webp",
      barcode: "FEATURED"
    },
    {
      id: 42,
      name: "Crossbody Pull-Up Mantarraya",
      category: "Crossbody",
      price: 3500,
      image: "products/featured/crossbody-pull-up-mantarraya.webp",
      barcode: "FEATURED"
    },
    {
      id: 61,
      name: "Pechera en Piel Corte Vacuno",
      category: "Accesorios",
      price: 850,
      image: "products/featured/pechera-en-piel-corte-vacuno.webp",
      barcode: "FEATURED"
    },
    {
      id: 64,
      name: "Mandil Completo en Piel Vacuno",
      category: "Accesorios",
      price: 1390,
      image: "products/featured/mandil-completo-en-piel-vacuno.webp",
      barcode: "FEATURED"
    }
  ];

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

  // Obtener una selección variable y aleatoria exclusivamente de los PRODUCTOS DESTACADOS
  function pickDynamicCatalogProducts() {
    let allProducts = [];

    // Prioridad 1: Productos en memoria global de la tienda
    if (window.products && Array.isArray(window.products) && window.products.length > 0) {
      allProducts = window.products;
    }

    // Prioridad 2: Buscar en window.INITIAL_PRODUCTS
    if (allProducts.length === 0 && window.INITIAL_PRODUCTS && Array.isArray(window.INITIAL_PRODUCTS)) {
      allProducts = window.INITIAL_PRODUCTS;
    }

    // Prioridad 3: Intentar desde localStorage si existe
    if (allProducts.length === 0) {
      try {
        const stored = localStorage.getItem('vizantino_products_v1') || localStorage.getItem('vizantino_products_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) allProducts = parsed;
        }
      } catch (e) {}
    }

    // Filtrar estrictamente productos DESTACADOS (barcode === 'FEATURED' o featured === true) con fotografía y activos
    let featuredPool = allProducts.filter(p => {
      if (!p || p.active === false || !p.image) return false;
      const isFeatured = p.barcode === 'FEATURED' || p.featured === true || p.is_featured === true;
      return isFeatured;
    });

    // Si aún no están cargados en memoria o BD, usar el catálogo estático optimizado
    if (featuredPool.length === 0) {
      featuredPool = LOCAL_FEATURED_PRODUCTS;
    }

    // Desordenar aleatoriamente (shuffle Fisher-Yates) entre los productos DESTACADOS para que varíen en cada visita
    const shuffled = [...featuredPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Tomar hasta 6 piezas destacadas únicas
    const unique = [];
    const seenNames = new Set();
    for (const prod of shuffled) {
      if (prod && prod.image && !seenNames.has(prod.name.toLowerCase().trim())) {
        seenNames.add(prod.name.toLowerCase().trim());
        unique.push(prod);
        if (unique.length >= 6) break;
      }
    }

    return unique.length >= 2 ? unique : LOCAL_FEATURED_PRODUCTS.slice(0, 5);
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
          <img src="${p.image}" alt="${p.name}" loading="eager" fetchpriority="${idx === 0 ? 'high' : 'auto'}" onerror="this.onerror=null;this.src='products/featured/bolsa-sienna.webp';">
          <div class="vp-slide-product-badge ${idx === 0 ? 'badge-active' : ''}">
            <span class="vp-slide-badge-cat">${p.category || 'Piel Genuina'} · Destacado</span>
            <span class="vp-slide-badge-title">${p.name}</span>
            <span class="vp-slide-badge-price">$${typeof p.price === 'number' ? p.price.toLocaleString('es-MX') : p.price} MXN</span>
          </div>
        </div>
      `).join('');
    }

    // Pre-cargar imágenes en segundo plano para fluidez instantánea
    dynamicProducts.forEach(p => {
      if (p && p.image) {
        const img = new Image();
        img.src = p.image;
      }
    });

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

    // Secuencia variable de cambio de fotografías (intervalo equilibrado entre cada pieza)
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
    }, 1200);

    const textTimer2 = setTimeout(() => {
      if (isDismissed) return;
      if (title) title.classList.add('show');
      if (divider) divider.classList.add('show');
      if (tagline) tagline.classList.add('show');
    }, 1800);

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
