/* ============================================================
   gallery.js — 作品集:動態分類篩選 + lightbox
   分類完全來自 data/categories.json,後台新增分類
   之後,篩選按鈕會自動出現,不需要改程式。
   ============================================================ */

import { loadData, imgURL, makeImg } from './data.js';

let categories = [];
let works = [];
let filtered = [];
let labelOf = new Map();
let lightboxIndex = 0;

function currentFilter() {
  const m = location.hash.match(/cat=([^&]+)/);
  const slug = m ? decodeURIComponent(m[1]) : 'all';
  return slug !== 'all' && labelOf.has(slug) ? slug : 'all';
}

function renderChips() {
  const box = document.getElementById('category-chips');
  box.innerHTML = '';
  const active = currentFilter();
  const all = [{ slug: 'all', label: '全部' }, ...categories];
  all.forEach((c) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = c.label;
    b.setAttribute('aria-pressed', String(c.slug === active));
    b.addEventListener('click', () => {
      location.hash = 'cat=' + encodeURIComponent(c.slug);
    });
    box.appendChild(b);
  });
}

function renderGrid() {
  const grid = document.getElementById('works-grid');
  const empty = document.getElementById('works-empty');
  const active = currentFilter();
  filtered = active === 'all' ? works : works.filter((w) => w.category === active);

  grid.innerHTML = '';
  empty.hidden = filtered.length > 0;

  filtered.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `看大圖:${w.title}`);
    btn.addEventListener('click', () => openLightbox(i));

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.appendChild(makeImg(w.image, 480, w.title, w.focus));

    const body = document.createElement('div');
    body.className = 'card-body';
    const t = document.createElement('div');
    t.className = 'card-title';
    t.textContent = w.title;
    const m = document.createElement('div');
    m.className = 'card-meta';
    m.textContent = [labelOf.get(w.category), w.year].filter(Boolean).join('・');
    body.append(t, m);

    btn.append(thumb, body);
    card.appendChild(btn);
    grid.appendChild(card);
  });
}

/* ---------- lightbox ---------- */
const dialog = document.getElementById('lightbox');

function fillLightbox() {
  const w = filtered[lightboxIndex];
  if (!w) return;
  const img = document.getElementById('lightbox-img');
  img.src = imgURL(w.image, 1600);
  img.alt = w.title;
  img.onerror = () => { img.onerror = null; img.src = w.image; };
  document.getElementById('lightbox-title').textContent = w.title;
  document.getElementById('lightbox-meta').textContent =
    [labelOf.get(w.category), w.year, w.size].filter(Boolean).join('・');
  document.getElementById('lightbox-desc').textContent = w.description || '';
}

function openLightbox(i) {
  lightboxIndex = i;
  fillLightbox();
  dialog.showModal();
}

function step(delta) {
  if (!filtered.length) return;
  lightboxIndex = (lightboxIndex + delta + filtered.length) % filtered.length;
  fillLightbox();
}

dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox-nav.prev').addEventListener('click', () => step(-1));
dialog.querySelector('.lightbox-nav.next').addEventListener('click', () => step(1));
dialog.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

/* ---------- init ---------- */
async function init() {
  try {
    const [catsData, worksData] = await Promise.all([
      loadData('categories'),
      loadData('works'),
    ]);
    categories = catsData.categories || [];
    works = worksData.works || [];
    labelOf = new Map(categories.map((c) => [c.slug, c.label]));
  } catch (e) {
    console.error(e);
    const empty = document.getElementById('works-empty');
    empty.textContent = '內容載入失敗,請重新整理頁面。';
    empty.hidden = false;
    return;
  }
  renderChips();
  renderGrid();
  window.addEventListener('hashchange', () => {
    renderChips();
    renderGrid();
  });
}

init();
