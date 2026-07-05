/* ============================================================
   courses.js — 教學課程卡片
   ============================================================ */

import { loadData, makeImg } from './data.js';

async function init() {
  let data, site;
  try {
    [data, site] = await Promise.all([loadData('courses'), loadData('site')]);
  } catch (e) {
    console.error(e);
    const empty = document.getElementById('course-empty');
    empty.textContent = '內容載入失敗,請重新整理頁面。';
    empty.hidden = false;
    return;
  }

  if (data.intro) document.getElementById('course-intro').textContent = data.intro;

  const grid = document.getElementById('course-grid');
  const courses = data.courses || [];
  document.getElementById('course-empty').hidden = courses.length > 0;

  courses.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'course-card' + (c.open === false ? ' closed' : '');

    if (c.image) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.appendChild(makeImg(c.image, 640, c.title));
      card.appendChild(thumb);
    }

    const body = document.createElement('div');
    body.className = 'body';

    const h3 = document.createElement('h3');
    h3.textContent = c.title;
    if (c.open === false) {
      const badge = document.createElement('span');
      badge.className = 'badge badge-closed';
      badge.textContent = '額滿/未開課';
      h3.appendChild(badge);
    }
    body.appendChild(h3);

    if (c.description) {
      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = c.description;
      body.appendChild(desc);
    }

    const facts = document.createElement('ul');
    facts.className = 'facts';
    [
      ['適合對象', c.audience],
      ['上課時間', c.schedule],
      ['上課地點', c.location],
      ['費用', c.price],
    ].forEach(([k, v]) => {
      if (!v) return;
      const li = document.createElement('li');
      const key = document.createElement('span');
      key.className = 'k';
      key.textContent = k;
      const val = document.createElement('span');
      val.textContent = v;
      li.append(key, val);
      facts.appendChild(li);
    });
    body.appendChild(facts);

    const cta = document.createElement('div');
    cta.className = 'cta';
    if (c.open === false) {
      const b = document.createElement('span');
      b.className = 'btn';
      b.setAttribute('aria-disabled', 'true');
      b.textContent = '目前未開放報名';
      cta.appendChild(b);
    } else if (c.signupUrl) {
      const a = document.createElement('a');
      a.className = 'btn btn-primary';
      a.href = c.signupUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = '我要報名';
      cta.appendChild(a);
    } else if (site.email) {
      const a = document.createElement('a');
      a.className = 'btn btn-primary';
      a.href = `mailto:${site.email}?subject=${encodeURIComponent(`課程詢問:${c.title}`)}`;
      a.textContent = '來信詢問';
      cta.appendChild(a);
    }
    body.appendChild(cta);

    card.appendChild(body);
    grid.appendChild(card);
  });
}

init();
