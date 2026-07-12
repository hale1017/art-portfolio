/* ============================================================
   home.js — 首頁:hero、材料包看板、精選作品
   ============================================================ */

import { loadData, imgURL, makeImg, focusPosition } from './data.js';
import { initBillboard } from './kits.js';

const SERIES_LABEL = { occupation: '職業系列', animal: '動物系列' };

async function init() {
  /* hero */
  try {
    const site = await loadData('site');
    document.title = `${site.siteTitle}|${site.tagline || '個人作品集'}`;
    const tagline = document.querySelector('[data-tagline]');
    tagline.textContent = site.tagline || '';
    tagline.hidden = !site.tagline;
    document.querySelector('[data-hero-title]').textContent = site.siteTitle || site.artistName || '';
    document.querySelector('[data-hero-text]').textContent = site.heroText || '';
    const heroImg = document.querySelector('[data-hero-img]');
    if (site.heroImage) {
      heroImg.src = imgURL(site.heroImage, 1200);
      heroImg.style.objectPosition = focusPosition(site.heroFocus);
      heroImg.addEventListener('error', () => { heroImg.src = site.heroImage; }, { once: true });
    } else {
      heroImg.closest('.hero-img').hidden = true;
    }
  } catch (e) {
    console.error(e);
  }

  /* 材料包看板 */
  initBillboard();

  /* 精選作品(2D 作品 + 娃衣 的 featured,最多 8 件) */
  try {
    const [catsData, worksData, dollsData] = await Promise.all([
      loadData('categories'),
      loadData('works'),
      loadData('dolls'),
    ]);
    const labelOf = new Map((catsData.categories || []).map((c) => [c.slug, c.label]));

    const featured = [
      ...(worksData.works || [])
        .filter((w) => w.featured)
        .map((w) => ({
          title: w.title,
          image: w.image,
          focus: w.focus,
          meta: [labelOf.get(w.category), w.year].filter(Boolean).join('・'),
          href: 'gallery.html#cat=' + encodeURIComponent(w.category || 'all'),
        })),
      ...(dollsData.dolls || [])
        .filter((d) => d.featured)
        .map((d) => ({
          title: d.name,
          image: (d.images || [])[0],
          focus: d.focus,
          portrait: true,
          meta: ['娃衣', SERIES_LABEL[d.series]].filter(Boolean).join('・'),
          href: 'dolls.html#series=' + encodeURIComponent(d.series || 'all'),
        })),
    ].slice(0, 8);

    if (featured.length) {
      document.getElementById('featured-section').hidden = false;
      const row = document.getElementById('featured-row');
      featured.forEach((f) => {
        const a = document.createElement('a');
        a.className = 'card';
        a.href = f.href;
        a.style.textDecoration = 'none';
        a.style.color = 'inherit';

        const thumb = document.createElement('div');
        thumb.className = 'thumb' + (f.portrait ? ' thumb--portrait' : '');
        thumb.appendChild(makeImg(f.image, 480, f.title, f.focus));

        const body = document.createElement('div');
        body.className = 'card-body';
        const t = document.createElement('div');
        t.className = 'card-title';
        t.textContent = f.title;
        const m = document.createElement('div');
        m.className = 'card-meta';
        m.textContent = f.meta;
        body.append(t, m);

        a.append(thumb, body);
        row.appendChild(a);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

init();
