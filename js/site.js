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

/* each project links to the one before and after it */
cases.forEach((pane, i) => {
  const prev = cases[i - 1];
  const next = cases[i + 1];
  const nav = document.createElement('nav');
  nav.className = 'case-nav';
  nav.setAttribute('aria-label', 'More projects');
  nav.innerHTML = `${prev ? `<a class="prev" href="#${prev.id}">← ${titleOf(prev)}</a>` : '<a class="prev" href="#work">← All projects</a>'}
    ${next ? `<a class="next" href="#${next.id}">${titleOf(next)} →</a>` : '<a class="next" href="#work">All projects →</a>'}`;
  pane.appendChild(nav);
});

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
  document.title = pane.id === 'about' ? 'Cognitiva Labs · Boutique AI consultancy, Madrid' : `${titleOf(pane)} · Cognitiva Labs`;
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

document.getElementById('year').textContent = new Date().getFullYear();

/* the contact form: opens the visitor's email app with the message ready to send */
const form = document.getElementById('contact-form');
const hint = document.getElementById('form-hint');
const EMAIL = 'cimentadaj@gmail.com';
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
    hint.textContent = firstBad.name === 'email' && firstBad.value.trim() ? 'That email address doesn’t look right.' : 'Please fill in every field.';
    hint.classList.add('err');
    firstBad.focus();
    return;
  }
  const name = `${field('first').value.trim()} ${field('last').value.trim()}`;
  const subject = `Free consultation: ${name}`;
  const body = `${field('message').value.trim()}\n\n${name}\n${field('email').value.trim()}`;
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  hint.classList.remove('err');
  hint.textContent = `Your email app should open with the message. If it doesn’t, write to ${EMAIL}.`;
});
form.addEventListener('input', (e) => {
  if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) e.target.setAttribute('aria-invalid', 'false');
});
