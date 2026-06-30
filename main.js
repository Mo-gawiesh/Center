/**
 * Appliances Center — Main JavaScript
 * الهندسية للتوكيلات | صيانة الأجهزة المنزلية
 */

/* ================================================
   1. SCROLL REVEAL
   ================================================ */
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
})();


/* ================================================
   2. COUNTER ANIMATION
   ================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOutQuad = t => t * (2 - t);

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = Math.floor(easeOutQuad(progress) * target);
      el.textContent = value.toLocaleString('ar-EG') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


/* ================================================
   3. TYPING EFFECT (HERO) - Removed for mobile performance optimization
   ================================================ */


/* ================================================
   4. STICKY NAVBAR
   ================================================ */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 40);
    lastScroll = scrollY;
  }, { passive: true });
})();


/* ================================================
   5. MOBILE HAMBURGER MENU
   ================================================ */
(function initMobileMenu() {
  const btn   = document.getElementById('nav-hamburger');
  const menu  = document.getElementById('nav-mobile');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    btn.querySelectorAll('span').forEach((span, i) => {
      if (isOpen) {
        if (i === 0) span.style.transform = 'rotate(45deg) translateY(7px)';
        if (i === 1) span.style.opacity = '0';
        if (i === 2) span.style.transform = 'rotate(-45deg) translateY(-7px)';
      } else {
        span.style.transform = '';
        span.style.opacity = '';
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    }
  });
})();


/* ================================================
   6. TESTIMONIALS SLIDER
   ================================================ */
(function initSlider() {
  const slider = document.querySelector('.testimonials-slider');
  const dots   = document.querySelectorAll('.slider-dot');
  if (!slider || !dots.length) return;

  let current = 0;
  const total = dots.length;

  function goTo(index) {
    current = index;
    slider.style.transform = `translateX(${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  // Auto-play
  let interval = setInterval(() => goTo((current + 1) % total), 5000);

  slider.addEventListener('mouseenter', () => clearInterval(interval));
  slider.addEventListener('mouseleave', () => {
    interval = setInterval(() => goTo((current + 1) % total), 5000);
  });

  // Touch/swipe
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? (current + 1) % total : (current - 1 + total) % total);
    }
  });

  goTo(0);
})();


/* ================================================
   7. FAQ ACCORDION (Brand Pages)
   ================================================ */
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));

      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
})();


/* ================================================
   8. SMOOTH SECTION LINKS
   ================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ================================================
   9. BACK TO TOP BUTTON
   ================================================ */
(function initBackToTop() {
  let btn = document.getElementById('back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'back-to-top-btn';
    btn.setAttribute('aria-label', 'الرجوع لأعلى الصفحة');
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    `;
    document.body.appendChild(btn);
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });
})();

/* ================================================
   10. INQUIRY FORM WHATSAPP REDIRECT
   ================================================ */
(function initInquiryForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  form.onsubmit = function(e) {
    e.preventDefault();

    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const loc = document.getElementById('form-loc').value;
    const appliance = document.getElementById('form-appliance').value;

    const whatsappNumber = '201062842903';
    
    // Create the message
    const message = `طلب صيانة جديد 🛠️
- الاسم: ${name}
- رقم الهاتف: ${phone}
- المحافظة/المدينة: ${loc}
- الجهاز المراد صيانته: ${appliance}`;

    // Encode URL
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp using a temporary link to bypass pop-up blockers
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset the form
    form.reset();
  };
})();
