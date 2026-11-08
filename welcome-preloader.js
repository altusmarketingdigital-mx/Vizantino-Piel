/**
 * VIZANTINO PIEL — WelcomePreloader
 * Controlador de la secuencia cinematográfica de bienvenida (~4.8 segundos)
 * Muestra dinámicamente fotografías variables y reales de los productos DESTACADOS del catálogo
 * sincronizados directamente desde Supabase en tiempo real.
 */

(function initWelcomePreloader() {
  const PRELOADER_SESSION_KEY = 'vizantino_intro_shown';
  const SUPABASE_URL = 'https://zujfslxqgllzmxdoioie.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wtDtY_vgZboOjEsob9Y4QQ_GpvMr3D8';

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

  // Catálogo base de respaldo de productos destacados
  const FALLBACK_FEATURED = [
    {
      id: 11,
      name: "Bolsa Madisson Ch con Pelo de Vaca",
      category: "Bolsos",
      price: 1500,
      image: "products/featured/bolsa-madisson-ch-con-pelo-de-vaca.webp",
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
      id: 63,
      name: "Medio Mandil en Piel Vacuno",
      category: "Accesorios",
      price: 950,
      image: "products/featured/medio-mandil-en-piel-vacuno.webp",
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

  // Filtrar productos destacados en memoria
  function extractFeaturedFromPool(list) {
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.filter(p => {
      if (!p || p.active === false || !p.image) return false;
      const bc = String(p.barcode || '').toUpperCase().trim();
      const isFeatured = bc === 'FEATURED' || p.featured === true || p.is_featured === true;
      return isFeatured;
    });
  }

  // Obtener productos destacados en vivo
  async function fetchLiveFeaturedProducts() {
    // 1. Si window.products ya está cargado con destacados, usarlo de inmediato
    if (window.products && Array.isArray(window.products)) {
      const memFeatured = extractFeaturedFromPool(window.products);
      if (memFeatured.length > 0) return memFeatured;
    }

    // 2. Intentar consulta directa y ultrarrápida a Supabase
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800); // 1.8 segundos límite

      const url = `${SUPABASE_URL}/rest/v1/products?barcode=eq.FEATURED&active=neq.false&select=id,name,category,price,image,barcode`;
      const res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      // Si falla o excede el tiempo, continúa con el pool disponible
    }

    // 3. Respaldo desde LocalStorage
    try {
      const stored = localStorage.getItem('vizantino_products_v1') || localStorage.getItem('vizantino_products_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedFeatured = extractFeaturedFromPool(parsed);
        if (storedFeatured.length > 0) return storedFeatured;
      }
    } catch (e) {}

    return FALLBACK_FEATURED;
  }

  function renderSlides(stage, productsToDisplay) {
    if (!stage || !Array.isArray(productsToDisplay) || productsToDisplay.length === 0) return;

    stage.innerHTML = productsToDisplay.map((p, idx) => `
      <div class="vp-cinematic-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <img src="${p.image}" alt="${p.name}" loading="eager" fetchpriority="${idx === 0 ? 'high' : 'auto'}" onerror="this.onerror=null;this.src='products/featured/bolsa-sienna.webp';">
        <div class="vp-slide-product-badge ${idx === 0 ? 'badge-active' : ''}">
          <span class="vp-slide-badge-cat">${p.category || 'Piel Genuina'} · Destacado</span>
          <span class="vp-slide-badge-title">${p.name}</span>
          <span class="vp-slide-badge-price">$${typeof p.price === 'number' ? p.price.toLocaleString('es-MX') : parseFloat(p.price || 0).toLocaleString('es-MX')} MXN</span>
        </div>
      </div>
    `).join('');
  }

  async function startSequence() {
    const preloader = document.getElementById('welcomePreloader');
    if (!preloader) return;

    preloader.style.display = 'flex';
    preloader.classList.remove('preloader-hidden');

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

    let currentProducts = FALLBACK_FEATURED;

    // Buscar en vivo los productos actualmente marcados como destacados en Supabase
    try {
      const liveFeatured = await fetchLiveFeaturedProducts();
      if (liveFeatured && liveFeatured.length > 0) {
        currentProducts = liveFeatured;
      }
    } catch (err) {}

    // Aleatorizar el orden para dar variedad
    const shuffled = [...currentProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Renderizar diapositivas con los productos destacados reales
    renderSlides(stage, shuffled);

    // Si la app principal carga productos después, actualizar con los más recientes
    window.addEventListener('vizantino:products-loaded', (e) => {
      const loaded = e.detail;
      const feat = extractFeaturedFromPool(loaded);
      if (feat.length > 0) {
        renderSlides(stage, feat);
      }
    }, { once: true });

    let slides = preloader.querySelectorAll('.vp-cinematic-slide');
    let badges = preloader.querySelectorAll('.vp-slide-product-badge');
    let totalSlides = slides.length;
    let isDismissed = false;

    // Barra de progreso sincronizada
    requestAnimationFrame(() => {
      if (progressBar) {
        progressBar.style.transition = 'width 4.8s linear';
        progressBar.style.width = '100%';
      }
    });

    // Secuencia de rotación entre los productos destacados
    const slideTimers = [];
    const interval = Math.floor(3600 / Math.max(1, totalSlides));
    for (let i = 1; i < totalSlides; i++) {
      slideTimers.push(setTimeout(() => switchSlide(i), i * interval));
    }

    function switchSlide(idx) {
      if (isDismissed) return;
      slides = preloader.querySelectorAll('.vp-cinematic-slide');
      badges = preloader.querySelectorAll('.vp-slide-product-badge');
      if (idx >= slides.length) return;

      slides.forEach((s, i) => {
        if (i === idx) s.classList.add('active');
        else s.classList.remove('active');
      });
      badges.forEach((b, i) => {
        if (i === idx) b.classList.add('badge-active');
        else b.classList.remove('badge-active');
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

    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        finishIntro();
      });
    }

    const keyHandler = (e) => {
      if (e.key === 'Escape') finishIntro();
    };
    window.addEventListener('keydown', keyHandler);

    function finishIntro() {
      if (isDismissed) return;
      isDismissed = true;

      slideTimers.forEach(clearTimeout);
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
      clearTimeout(exitTimer);
      window.removeEventListener('keydown', keyHandler);

      try {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
      } catch (err) {}

      preloader.classList.add('preloader-hidden');

      if (document.body) {
        document.body.classList.remove('overflow-hidden');
      }

      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 750);
    }
  }
})();
