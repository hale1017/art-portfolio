/* ============================================================
   about.js — 關於我:簡介段落 + 經歷 timeline
   ============================================================ */

import { loadData, imgURL, paragraphs, focusPosition } from './data.js';

const CV_LABEL = {
  exhibition: '展覽',
  award: '獲獎',
  education: '學歷',
  experience: '經歷',
};

async function init() {
  let data;
  try {
    data = await loadData('about');
  } catch (e) {
    console.error(e);
    return;
  }

  const portrait = document.getElementById('portrait');
  if (data.portrait) {
    portrait.src = imgURL(data.portrait, 600);
    portrait.style.objectPosition = focusPosition(data.portraitFocus);
    portrait.addEventListener('error', () => { portrait.src = data.portrait; }, { once: true });
  } else {
    portrait.closest('.about-portrait').hidden = true;
  }

  document.getElementById('bio').appendChild(paragraphs(data.bio));

  const list = document.getElementById('cv-list');
  (data.cv || []).forEach((item) => {
    const li = document.createElement('li');
    const year = document.createElement('span');
    year.className = 't-year';
    year.textContent = item.year || '';
    li.appendChild(year);
    if (item.category && CV_LABEL[item.category]) {
      const badge = document.createElement('span');
      badge.className = `badge badge-${item.category}`;
      badge.textContent = CV_LABEL[item.category];
      li.appendChild(badge);
    }
    const text = document.createElement('span');
    text.className = 't-text';
    text.textContent = item.text || '';
    li.appendChild(text);
    list.appendChild(li);
  });
}

init();
