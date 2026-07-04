/* ============================================================
   SENTRA — script.js
   Sommaire :
   1. Menu de navigation responsive
   2. Effet "machine à écrire" dans le terminal du hero
   3. Animations au scroll (reveal + compteurs de stats)
   4. Bouton retour en haut
   5. Validation et simulation d'envoi du formulaire de contact
   6. Année automatique dans le footer
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initTerminalTypewriter();
  initScrollReveal();
  initScrollTopButton();
  initContactForm();
  initFooterYear();
});

/* ---------- 1. Menu de navigation responsive ---------- */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  });

  // Ferme le menu automatiquement après un clic sur un lien (mobile)
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- 2. Effet machine à écrire dans le terminal ---------- */
function initTerminalTypewriter() {
  const el = document.getElementById('terminalLine');
  if (!el) return;

  const lines = [
    'Scan du réseau en cours…',
    '0 vulnérabilité critique détectée.',
    'Analyse des accès : 128 sessions actives.',
    'Surveillance des points de terminaison : OK.',
    'Aucune activité suspecte pour le moment.'
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = lines[lineIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1600); // pause avant d'effacer
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }

    setTimeout(tick, deleting ? 22 : 38);
  }

  tick();
}

/* ---------- 3. Animations au scroll ---------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const statNumbers = document.querySelectorAll('.stats__number');

  if (!('IntersectionObserver' in window)) {
    // Repli simple si IntersectionObserver n'est pas supporté
    revealEls.forEach(el => el.classList.add('is-visible'));
    statNumbers.forEach(animateCounter);
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));
}

// Anime un compteur numérique de 0 jusqu'à la valeur data-count
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10) || 0;
  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ---------- 4. Bouton retour en haut ---------- */
function initScrollTopButton() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- 5. Formulaire de contact ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  const rules = {
    name: value => value.trim().length >= 2 || 'Merci d\'indiquer votre nom complet.',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Adresse e-mail invalide.',
    subject: value => value !== '' || 'Merci de choisir un sujet.',
    message: value => value.trim().length >= 10 || 'Votre message doit contenir au moins 10 caractères.'
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const field = form.elements[fieldName];
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      const result = rules[fieldName](field.value);

      if (result !== true) {
        field.classList.add('is-invalid');
        if (errorEl) errorEl.textContent = result;
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    });

    if (!isValid) {
      status.textContent = 'Merci de corriger les champs indiqués ci-dessus.';
      status.className = 'form__status is-error';
      return;
    }

    // Aucune API backend n'est configurée : on simule l'envoi.
    // Pour un envoi réel, connectez ce formulaire à un service gratuit
    // compatible avec un hébergement statique (ex. Formspree, EmailJS).
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    setTimeout(() => {
      status.textContent = 'Message envoyé avec succès. Nous revenons vers vous sous 24h ouvrées.';
      status.className = 'form__status is-success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer le message';
    }, 900);
  });

  // Efface l'erreur dès que l'utilisateur corrige le champ
  Object.keys(rules).forEach(fieldName => {
    const field = form.elements[fieldName];
    field.addEventListener('input', () => {
      field.classList.remove('is-invalid');
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      if (errorEl) errorEl.textContent = '';
    });
  });
}

/* ---------- 6. Année automatique dans le footer ---------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
