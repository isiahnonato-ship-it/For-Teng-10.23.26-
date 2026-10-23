// Respect the visitor's reduced-motion setting.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (id) => document.getElementById(id);
const apology = $('apology'), success = $('success');
const yes = $('yes'), no = $('no'), note = $('note');

const rand = (min, max) => Math.random() * (max - min) + min;

/* ---------- Floating hearts and stars ---------- */
function createFloaters() {
  if (reduceMotion) return;
  const bg = $('bg');
  const icons = ['💜', '💛', '✦', '✨', '💜', '💛'];
  const count = window.innerWidth < 600 ? 14 : 22; // keep it light on phones
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    const icon = icons[i % icons.length];
    el.className = 'float' + (icon === '✦' || icon === '✨' ? ' star' : '');
    el.textContent = icon;
    el.style.left = rand(0, 100) + 'vw';
    el.style.fontSize = rand(14, 30) + 'px';
    el.style.animationDuration = rand(12, 24) + 's';
    el.style.animationDelay = -rand(0, 24) + 's';
    bg.appendChild(el);
  }
}

/* ---------- Playful "No" button ---------- */
const phrases = ['Are you sure? 🥺', 'Think again! 😭', 'Please? 💛', 'Just one chance? 💜', 'Pretty please? 🥹'];
const MAX_DODGES = 7;   // after this, the button stops running away
let dodges = 0;

// True if two rectangles overlap (with a small margin).
function overlaps(a, b, m = 10) {
  return a.left < b.right + m && a.right > b.left - m && a.top < b.bottom + m && a.bottom > b.top - m;
}

// Moves the No button to a random spot inside the viewport that
// doesn't cover the heading, message, question or Yes button.
function moveNo() {
  if (dodges >= MAX_DODGES) return settleNo();
  dodges++;

  // Switch to fixed positioning, starting from where the button currently is.
  if (!no.classList.contains('flying')) {
    const r = no.getBoundingClientRect();
    no.style.left = r.left + 'px';
    no.style.top = r.top + 'px';
    no.classList.add('flying');
    void no.offsetWidth; // force reflow so the move animates
  }

  const w = no.offsetWidth, h = no.offsetHeight, pad = 10;
  const maxX = window.innerWidth - w - pad;
  const maxY = window.innerHeight - h - pad;
  const avoid = ['h1', '.msg', '.question'].map(s => apology.querySelector(s).getBoundingClientRect());
  avoid.push(yes.getBoundingClientRect());

  let x, y, found = false;
  for (let i = 0; i < 60 && !found; i++) {
    x = rand(pad, maxX);
    y = rand(pad, maxY);
    const box = { left: x, top: y, right: x + w, bottom: y + h };
    found = !avoid.some(r => overlaps(box, r));
  }
  if (!found) { // crowded (small phones): tuck into a bottom corner
    x = Math.random() < .5 ? pad : maxX;
    y = maxY;
  }
  no.style.left = Math.max(pad, Math.min(x, maxX)) + 'px';
  no.style.top = Math.max(pad, Math.min(y, maxY)) + 'px';
  no.textContent = phrases[(dodges - 1) % phrases.length];
}

// After enough dodges, the button gently returns and stays put.
function settleNo() {
  no.classList.remove('flying');
  no.style.left = no.style.top = '';
  no.textContent = 'No 🥺';
  note.textContent = 'Okay, I’ll stop playing around. Whatever you choose, I’m listening. 💜';
}

// Mouse: dodge on hover. Touch: dodge on touch so the layout isn't broken by taps.
no.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') moveNo(); });
no.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' && dodges < MAX_DODGES) { e.preventDefault(); moveNo(); }
});

// A real click on No (e.g. keyboard, or after it settles) gets a kind reply.
no.addEventListener('click', () => {
  note.textContent = 'That’s okay. Take all the time you need. I’ll be here when you’re ready. 💜';
});

/* ---------- Yes: switch screens + celebrate ---------- */
yes.addEventListener('click', () => {
  no.classList.remove('flying');
  apology.classList.add('out');
  setTimeout(() => {
    apology.classList.add('hidden');
    success.classList.remove('hidden');
    success.classList.add('in');
    window.scrollTo(0, 0);
    launchConfetti();
  }, reduceMotion ? 0 : 450);
});

// Purple-and-yellow confetti plus a few hearts, removed after they fall.
function launchConfetti() {
  if (reduceMotion) return;
  const colors = ['#6C3BBD', '#FFD93D', '#FFC857', '#DCCBFA', '#51258F'];
  const total = window.innerWidth < 600 ? 60 : 110;
  for (let i = 0; i < total; i++) {
    const el = document.createElement('span');
    el.className = 'confetti';
    if (i % 9 === 0) {
      el.textContent = i % 18 === 0 ? '💜' : '💛';
      el.style.fontSize = rand(16, 26) + 'px';
    } else {
      el.style.width = rand(7, 12) + 'px';
      el.style.height = rand(10, 16) + 'px';
      el.style.background = colors[i % colors.length];
      el.style.borderRadius = i % 3 === 0 ? '50%' : '2px';
    }
    el.style.left = rand(0, 100) + 'vw';
    el.style.animationDuration = rand(2.8, 5.5) + 's';
    el.style.animationDelay = rand(0, 1.2) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 7500);
  }
}

createFloaters();
