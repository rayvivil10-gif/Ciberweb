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
  initChatbot();
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

  // URL de ton formulaire Formspree (CiberNav)
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgyzrre';

  const rules = {
    name: value => value.trim().length >= 2 || 'Merci d\'indiquer votre nom complet.',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Adresse e-mail invalide.',
    subject: value => value !== '' || 'Merci de choisir un sujet.',
    message: value => value.trim().length >= 10 || 'Votre message doit contenir au moins 10 caractères.'
  };

  form.addEventListener('submit', async (event) => {
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

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (response.ok) {
        status.textContent = 'Message envoyé avec succès. Nous revenons vers vous sous 24h ouvrées.';
        status.className = 'form__status is-success';
        form.reset();
      } else {
        status.textContent = 'Une erreur est survenue. Merci de réessayer ou de nous écrire directement par e-mail.';
        status.className = 'form__status is-error';
      }
    } catch (error) {
      status.textContent = 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
      status.className = 'form__status is-error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer le message';
    }
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

/* ---------- 7. Assistant CiberNav (chatbot basé sur des règles) ---------- */
function initChatbot() {
  const toggle = document.getElementById('chatbotToggle');
  const win = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const messagesEl = document.getElementById('chatbotMessages');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  if (!toggle || !win || !form || !input || !messagesEl) return;

  // Base de connaissances : mots-clés -> réponse.
  // Aucune donnée n'est envoyée à un serveur externe ; tout tourne dans le navigateur.
  const knowledge = [
    { keys: ['phishing', 'hameçonnage'], answer: 'Le phishing est un message frauduleux qui imite une source fiable pour voler vos identifiants. Ne cliquez jamais sur un lien suspect et vérifiez toujours l\'expéditeur.' },
    { keys: ['ransomware', 'rançongiciel', 'rançon'], answer: 'Un ransomware chiffre vos fichiers et exige une rançon. La meilleure protection : des sauvegardes régulières et hors ligne, et des systèmes à jour.' },
    { keys: ['malware', 'virus', 'logiciel malveillant'], answer: 'Un malware est un logiciel conçu pour nuire à un appareil. Évitez les pièces jointes inconnues et gardez un antivirus à jour.' },
    { keys: ['ddos', 'déni de service'], answer: 'Une attaque DDoS sature un service avec un trafic massif pour le rendre inaccessible. Un pare-feu applicatif et un service anti-DDoS limitent ce risque.' },
    { keys: ['ingénierie sociale', 'social engineering', 'manipulation'], answer: 'L\'ingénierie sociale manipule une personne plutôt qu\'un système. Méfiez-vous des demandes urgentes ou inhabituelles, même venant d\'un contact connu.' },
    { keys: ['force brute', 'mot de passe', 'password'], answer: 'Une attaque par force brute teste des milliers de mots de passe automatiquement. Utilisez un mot de passe long, unique, et activez la double authentification (MFA).' },
    { keys: ['mfa', 'double authentification', '2fa'], answer: 'La double authentification (MFA) ajoute un second facteur de vérification : même si votre mot de passe est volé, votre compte reste protégé.' },
    { keys: ['audit'], answer: 'Un audit de sécurité analyse votre infrastructure pour repérer les failles avant qu\'un attaquant ne les exploite. Voulez-vous qu\'on vous en propose un ? Contactez-nous via le formulaire ou WhatsApp.' },
    { keys: ['pentest', 'test d\'intrusion', 'intrusion'], answer: 'Un test d\'intrusion (pentest) simule une vraie attaque pour révéler vos vulnérabilités réelles, en conditions contrôlées.' },
    { keys: ['prix', 'tarif', 'coût', 'combien'], answer: 'Les tarifs dépendent de la taille de votre infrastructure et du service choisi. Le plus simple : décrivez votre besoin via le formulaire de contact ou sur WhatsApp, et vous recevrez un devis personnalisé.' },
    { keys: ['contact', 'joindre', 'appeler', 'whatsapp', 'téléphone'], answer: 'Vous pouvez nous écrire directement sur WhatsApp au +509 43 41 54 19, par e-mail à woodrayvivil@gmail.com, ou via le formulaire de la section Contact.' },
    { keys: ['bonjour', 'salut', 'bonsoir', 'hello'], answer: 'Bonjour ! Je suis l\'assistant CiberNav. Posez-moi une question sur le phishing, les ransomwares, la protection de vos comptes, ou nos services.' },
    { keys: ['merci'], answer: 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions.' }
  ];

  const fallback = 'Je n\'ai pas de réponse précise pour ça. Pour une aide personnalisée, contactez l\'équipe CiberNav sur WhatsApp (+509 43 41 54 19) ou par e-mail (woodrayvivil@gmail.com).';
  const welcome = 'Bonjour 👋 Je suis l\'assistant CiberNav. Demandez-moi ce qu\'est un phishing, un ransomware, ou comment protéger vos comptes.';

  function addMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chatbot__msg chatbot__msg--${sender}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function findAnswer(userText) {
    const normalized = userText.toLowerCase();
    const match = knowledge.find(entry => entry.keys.some(key => normalized.includes(key)));
    return match ? match.answer : fallback;
  }

  function openChat() {
    win.classList.add('is-open');
    win.setAttribute('aria-hidden', 'false');
    if (!messagesEl.children.length) addMessage(welcome, 'bot');
    input.focus();
  }

  function closeChat() {
    win.classList.remove('is-open');
    win.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', () => {
    win.classList.contains('is-open') ? closeChat() : openChat();
  });

  closeBtn.addEventListener('click', closeChat);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    // Petit délai pour un effet plus naturel de "réflexion"
    setTimeout(() => addMessage(findAnswer(text), 'bot'), 400);
  });
}

/* ---------- 8. Connexion Google (Google Identity Services) ---------- */
// Cette fonction est appelée automatiquement une fois le script Google chargé
// (voir l'attribut onload="initGoogleSignIn()" dans index.html).
function initGoogleSignIn() {
  if (!window.google || !google.accounts || !google.accounts.id) return;

  google.accounts.id.initialize({
    client_id: '265182935103-8k99458dhdlil5ot39rrlgev7j6mv9ag.apps.googleusercontent.com',
    callback: handleGoogleCredential,
    auto_select: false
  });

  const btnContainer = document.getElementById('googleSignInContainer');
  if (btnContainer) {
    google.accounts.id.renderButton(btnContainer, {
      type: 'standard',
      theme: 'filled_black',
      size: 'medium',
      shape: 'pill',
      text: 'signin_with'
    });
  }

  // Restaure une session déjà ouverte dans ce navigateur (stockage local uniquement)
  const saved = localStorage.getItem('cibernav_user');
  if (saved) {
    try { showUserProfile(JSON.parse(saved)); } catch (e) { /* donnée corrompue, ignorée */ }
  }
}

// Appelée par Google après une connexion réussie, avec un jeton signé (JWT)
function handleGoogleCredential(response) {
  const payload = parseJwt(response.credential);
  if (!payload) return;

  const user = {
    name: payload.name,
    email: payload.email,
    picture: payload.picture
  };

  localStorage.setItem('cibernav_user', JSON.stringify(user));
  showUserProfile(user);
}

// Décode la partie "payload" d'un jeton JWT (aucune librairie externe nécessaire)
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// Affiche la photo, le nom et un bouton de déconnexion à la place du bouton Google
function showUserProfile(user) {
  const container = document.getElementById('googleSignInContainer');
  const profile = document.getElementById('userProfile');
  if (!profile) return;

  profile.innerHTML = `
    <img src="${user.picture}" alt="${user.name}" class="user-profile__avatar">
    <span class="user-profile__name">${user.name}</span>
    <button type="button" class="user-profile__logout" id="googleLogoutBtn">Déconnexion</button>
  `;
  profile.style.display = 'flex';
  if (container) container.style.display = 'none';

  document.getElementById('googleLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('cibernav_user');
    profile.style.display = 'none';
    profile.innerHTML = '';
    if (container) container.style.display = 'flex';
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  });
           }
                                      
