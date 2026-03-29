const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelectorAll('.nav-link');
const revealElements = document.querySelectorAll('.reveal');
const tiltElements = document.querySelectorAll('[data-tilt]');
const heroMedia = document.querySelector('.hero-media');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

if (prefersReducedMotion) {
  document.body.classList.add('reduced-motion');
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.classList.toggle('hidden');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

// Reveals sections softly as they enter viewport.
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

revealElements.forEach((el) => observer.observe(el));

// Slight stagger to make section reveals feel more polished without heavy animation.
revealElements.forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
});

const sections = [...document.querySelectorAll('section[id]')];
const header = document.querySelector('header');
const cinematicSections = document.querySelectorAll('.section-cinematic');
const splitTitles = document.querySelectorAll('.split-title');

function splitTextToWords() {
  splitTitles.forEach((title) => {
    if (title.dataset.splitReady === 'true') return;

    const text = title.textContent.trim();
    if (!text) return;

    const words = text.split(/\s+/);
    const fragment = document.createDocumentFragment();

    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.style.setProperty('--word-index', index);
      span.textContent = word;
      fragment.appendChild(span);

      if (index < words.length - 1) {
        fragment.appendChild(document.createTextNode(' '));
      }
    });

    title.textContent = '';
    title.appendChild(fragment);
    title.dataset.splitReady = 'true';
  });
}

splitTextToWords();

if (!prefersReducedMotion) {
  const splitObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
        }
      });
    },
    { threshold: 0.32 }
  );

  splitTitles.forEach((title) => splitObserver.observe(title));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-active', entry.isIntersecting);
      });
    },
    { threshold: 0.26 }
  );

  cinematicSections.forEach((section) => sectionObserver.observe(section));
} else {
  splitTitles.forEach((title) => title.classList.add('is-in'));
  cinematicSections.forEach((section) => section.classList.add('is-active'));
}

function updateActiveLink() {
  const scrollPosition = window.scrollY + 140;

  sections.forEach((section) => {
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;

    if (
      scrollPosition >= section.offsetTop &&
      scrollPosition < section.offsetTop + section.offsetHeight
    ) {
      link.classList.add('text-white');
      link.classList.remove('text-smoke');
    } else {
      link.classList.remove('text-white');
      link.classList.add('text-smoke');
    }
  });
}

let isTicking = false;

function onScrollFrame() {
  updateActiveLink();

  if (header) {
    if (window.scrollY > 24) {
      header.classList.add('border-white/20');
    } else {
      header.classList.remove('border-white/20');
    }
  }

  // Subtle parallax in hero image for depth while keeping it lightweight.
  if (heroMedia && !prefersReducedMotion) {
    const offset = Math.min(window.scrollY * 0.05, 24);
    heroMedia.style.transform = `scale(1.05) translateY(${offset}px)`;
  }

  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  root.style.setProperty('--scroll-progress', progress.toFixed(4));

  isTicking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (!isTicking) {
      window.requestAnimationFrame(onScrollFrame);
      isTicking = true;
    }
  },
  { passive: true }
);

updateActiveLink();
onScrollFrame();

// Mouse glow follows pointer with requestAnimationFrame to stay smooth.
if (!prefersReducedMotion && canHover) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight * 0.18;
  let rafMouseId = 0;

  const updateMouseGlow = () => {
    root.style.setProperty('--mouse-x', `${(mouseX / window.innerWidth) * 100}%`);
    root.style.setProperty('--mouse-y', `${(mouseY / window.innerHeight) * 100}%`);
    rafMouseId = 0;
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!rafMouseId) {
        rafMouseId = window.requestAnimationFrame(updateMouseGlow);
      }
    },
    { passive: true }
  );
}

// Small pointer-based tilt gives cards a premium microinteraction.
if (!prefersReducedMotion && canHover) {
  tiltElements.forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * -5;
      const rotateY = ((x / rect.width) - 0.5) * 6;

      element.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    element.addEventListener('pointerleave', () => {
      element.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}
