/* site.js — one section at a time, by the address bar's hash (#about, #work,
 * #work-airline-pricing…), so every section and project has a link and Back works.
 * Quietly, for those who look for it: keys 1–6 open a section, ← → move between
 * projects, esc goes back to the list. Without JavaScript, CSS shows the section the
 * hash names. */

const panes = [...document.querySelectorAll('.pane')];
const links = [...document.querySelectorAll('.nav a')];
const sections = links.map(a => a.getAttribute('href').slice(1));
const cases = panes.filter(p => p.classList.contains('case'));
const main = document.getElementById('main');
const narrow = window.matchMedia('(max-width: 899px)');
const titleOf = (pane) => pane.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim();

/* the words the script adds, in the page's language (index.html in English, es/ in Spanish) */
const T = {
  en: {
    home: 'Cognitiva Labs · Boutique AI consultancy, Madrid', more: 'More projects', all: 'All projects',
    badEmail: 'That email address doesn’t look right.', empty: 'Please fill in every field.',
    subject: 'Free consultation', opened: (email) => `Your email app should open with the message. If it doesn’t, write to ${email}.`,
  },
  es: {
    home: 'Cognitiva Labs · Consultora boutique de IA, Madrid', more: 'Más proyectos', all: 'Todos los proyectos',
    badEmail: 'Ese email no parece correcto.', empty: 'Rellena todos los campos.',
    subject: 'Consulta gratuita', opened: (email) => `Tu aplicación de correo debería abrirse con el mensaje. Si no, escribe a ${email}.`,
  },
}[document.documentElement.lang === 'es' ? 'es' : 'en'];

/* each project links to the one before and after it */
cases.forEach((pane, i) => {
  const prev = cases[i - 1];
  const next = cases[i + 1];
  const nav = document.createElement('nav');
  nav.className = 'case-nav';
  nav.setAttribute('aria-label', T.more);
  nav.innerHTML = `${prev ? `<a class="prev" href="#${prev.id}">← ${titleOf(prev)}</a>` : `<a class="prev" href="#work">← ${T.all}</a>`}
    ${next ? `<a class="next" href="#${next.id}">${titleOf(next)} →</a>` : `<a class="next" href="#work">${T.all} →</a>`}`;
  pane.appendChild(nav);
});

/* the EN/ES link keeps the visitor on the same section, and remembers the choice */
const other = document.querySelector('.lang a');
const otherBase = other?.getAttribute('href');
other?.addEventListener('click', () => { try { localStorage.setItem('lang', other.hreflang); } catch { /* no storage */ } });

let current = null;
function show(hash, { focus = true } = {}) {
  const id = decodeURIComponent((hash || '').replace(/^#/, ''));
  if (id === 'main' && current) { focusHeading(current); return; } // the skip link
  const pane = panes.find(p => p.id === id) || panes.find(p => p.id === 'about');
  if (pane === current) return;
  current?.classList.remove('on');
  pane.classList.add('on');
  current = pane;
  for (const a of links) {
    if (a.getAttribute('href') === `#${pane.dataset.section}`) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  document.title = pane.id === 'about' ? T.home : `${titleOf(pane)} · Cognitiva Labs`;
  if (other) other.href = otherBase + (pane.id === 'about' ? '' : `#${pane.id}`);
  main.scrollTop = 0;
  if (narrow.matches && focus) window.scrollTo({ top: 0 });
  if (focus) focusHeading(pane);
}
function focusHeading(pane) {
  const h = pane.querySelector('h1');
  if (!h) return;
  h.tabIndex = -1;
  h.focus({ preventScroll: true });
}
const go = (id) => { if (location.hash !== `#${id}`) location.hash = id; else show(`#${id}`); };

window.addEventListener('hashchange', () => show(location.hash));
show(location.hash, { focus: false });

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (/^[1-6]$/.test(e.key)) { go(sections[Number(e.key) - 1]); return; }
  if (e.key === 'Escape' && current.classList.contains('case')) { go('work'); return; }
  if (current.classList.contains('case') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    const i = cases.indexOf(current) + (e.key === 'ArrowRight' ? 1 : -1);
    if (cases[i]) { e.preventDefault(); go(cases[i].id); }
  }
});

/* photos: the Work page's load once the home page has settled; a project's photo starts
 * loading as soon as a link to it is pointed at or focused, so it is there when it opens */
const eager = (img) => { if (img && img.loading !== 'eager') img.loading = 'eager'; };
const photoOf = (a) => document.getElementById(a?.getAttribute('href')?.slice(1) || '')?.querySelector('.case-photo img');
for (const type of ['pointerover', 'focusin']) {
  document.addEventListener(type, (e) => eager(photoOf(e.target.closest?.('a[href^="#work-"]'))));
}
window.addEventListener('load', () => (window.requestIdleCallback || setTimeout)(() => document.querySelectorAll('.projects img').forEach(eager)));

document.getElementById('year').textContent = new Date().getFullYear();

/* the contact form: opens the visitor's email app with the message ready to send */
const form = document.getElementById('contact-form');
const hint = document.getElementById('form-hint');
const EMAIL = 'cimentadaj@cognitivalabs.eu';
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const field = (name) => form.elements[name];
  let firstBad = null;
  for (const name of ['first', 'last', 'email', 'message']) {
    const el = field(name);
    const bad = !el.value.trim() || (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
    el.setAttribute('aria-invalid', String(bad));
    if (bad && !firstBad) firstBad = el;
  }
  if (firstBad) {
    hint.textContent = firstBad.name === 'email' && firstBad.value.trim() ? T.badEmail : T.empty;
    hint.classList.add('err');
    firstBad.focus();
    return;
  }
  const name = `${field('first').value.trim()} ${field('last').value.trim()}`;
  const subject = `${T.subject}: ${name}`;
  const body = `${field('message').value.trim()}\n\n${name}\n${field('email').value.trim()}`;
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  hint.classList.remove('err');
  hint.textContent = T.opened(EMAIL);
});
form.addEventListener('input', (e) => {
  if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) e.target.setAttribute('aria-invalid', 'false');
});
