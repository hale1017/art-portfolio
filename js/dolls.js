/* ============================================================
   dolls.js — 娃衣作品:系列篩選 + 單品多圖 lightbox
   下方的材料包看板由 kits.js 負責。
   ============================================================ */

import { loadData, imgURL, makeImg } from './data.js';
import { initBillboard } from './kits.js';

const SERIES = [
  { slug: 'all', label: '全部' },
  { slug: 'occupation', label: '職業系列' },
  { slug: 'animal', label: '動物系列' },
];
const SERIES_LABEL = { occupation: '職業系列', animal: '動物系列' };

let dolls = [];
let filtered = [];
let currentDoll = null;
let imageIndex = 0;

function currentFilter() {
  const m = location.hash.match(/series=([^&]+)/);
  const slug = m ? decodeURIComponent(m[1]) : 'all';
  return SERIES.some((s) => s.slug === slug) ? slug : 'all';
}

function renderChips() {
  const box = document.getElementById('series-chips');
  box.innerHTML = '';
  const active = currentFilter();
  SERIES.forEach((s) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = s.label;
    b.setAttribute('aria-pressed', String(s.slug === active));
    b.addEventListener('click', () => {
      location.hash = 'series=' + s.slug;
    });
    box.appendChild(b);
  });
}

function renderGrid() {
  const grid = document.getElementById('dolls-grid');
  const empty = document.getElementById('dolls-empty');
  const active = currentFilter();
  filtered = active === 'all' ? dolls : dolls.filter((d) => d.series === active);

  grid.innerHTML = '';
  empty.hidden = filtered.length > 0;

  filtered.forEach((d) => {
    const card = document.createElement('div');
    card.className = 'card';
    const btn = document.createElement('button');
    const count = (d.images || []).length;
    btn.setAttribute('aria-label', `看照片:${d.name}(共 ${count} 張)`);
    btn.addEventListener('click', () => openLightbox(d));

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.appendChild(makeImg((d.images || [])[0], 480, d.name, d.focus));

    const body = document.createElement('div');
    body.className = 'card-body';
    const t = document.createElement('div');
    t.className = 'card-title';
    t.textContent = d.name;
    const m = document.createElement('div');
    m.className = 'card-meta';
    const badge = document.createElement('span');
    badge.className = `badge badge-${d.series}`;
    badge.textContent = SERIES_LABEL[d.series] || '';
    m.appendChild(badge);
    if (d.year) m.append(` ${d.year}`);
    body.append(t, m);

    btn.append(thumb, body);
    card.appendChild(btn);
    grid.appendChild(card);
  });
}

/* ---------- lightbox(單品多圖) ---------- */
const dialog = document.getElementById('lightbox');

function fillLightbox() {
  const imgs = currentDoll.images || [];
  const path = imgs[imageIndex];
  const img = document.getElementById('lightbox-img');
  img.src = imgURL(path, 1600);
  img.alt = `${currentDoll.name} 照片 ${imageIndex + 1}`;
  img.onerror = () => { img.onerror = null; img.src = path; };
  document.getElementById('lightbox-title').textContent = currentDoll.name;
  document.getElementById('lightbox-meta').textContent =
    [SERIES_LABEL[currentDoll.series], currentDoll.year].filter(Boolean).join('・');
  document.getElementById('lightbox-desc').textContent = currentDoll.description || '';
  const counter = document.getElementById('lightbox-counter');
  counter.textContent = imgs.length > 1 ? `${imageIndex + 1} / ${imgs.length}` : '';
  const showNav = imgs.length > 1 ? '' : 'none';
  dialog.querySelector('.lightbox-nav.prev').style.display = showNav;
  dialog.querySelector('.lightbox-nav.next').style.display = showNav;
}

function openLightbox(doll) {
  currentDoll = doll;
  imageIndex = 0;
  fillLightbox();
  dialog.showModal();
}

function step(delta) {
  const imgs = currentDoll?.images || [];
  if (imgs.length < 2) return;
  imageIndex = (imageIndex + delta + imgs.length) % imgs.length;
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
    const data = await loadData('dolls');
    dolls = data.dolls || [];
  } catch (e) {
    console.error(e);
    const empty = document.getElementById('dolls-empty');
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
  initBillboard();
}

init();
