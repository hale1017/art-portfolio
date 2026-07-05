/* ============================================================
   kits.js — 材料包影片看板(廣告輪播)
   首頁與娃衣頁共用:頁面上要有 #kit-section 與 #kit-billboard。
   規則:
   - 同時只有一支影片在播(靜音自動播放,播完換下一格)
   - 沒有影片的材料包顯示封面圖,停留 5 秒後換下一格
   - 捲出畫面自動暫停;prefers-reduced-motion 不自動播
   ============================================================ */

import { loadData, imgURL } from './data.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IMAGE_SLIDE_MS = 5000;

export async function initBillboard() {
  const section = document.getElementById('kit-section');
  const mount = document.getElementById('kit-billboard');
  if (!section || !mount) return;

  let data;
  try {
    data = await loadData('kits');
  } catch (e) {
    console.error(e);
    return;
  }
  const kits = (data.kits || []).filter((k) => k && k.name);
  if (!kits.length) return;

  section.hidden = false;
  const introEl = document.getElementById('kit-intro');
  if (introEl && data.intro) introEl.textContent = data.intro;

  /* ---------- DOM ---------- */
  const root = document.createElement('div');
  root.className = 'billboard';
  const track = document.createElement('div');
  track.className = 'billboard-track';
  root.appendChild(track);

  const slides = kits.map((kit, idx) => {
    const slide = document.createElement('div');
    slide.className = 'billboard-slide' + (kit.available === false ? ' soldout' : '');

    let video = null;
    if (kit.video) {
      video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.preload = 'metadata';
      video.src = kit.video;
      if (kit.poster) video.poster = kit.poster;
      if (kits.length === 1) video.loop = true;
      slide.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.className = 'slide-media';
      img.src = imgURL(kit.poster, 1200) || '';
      img.alt = kit.name;
      if (img.src !== kit.poster) {
        img.addEventListener('error', () => { img.src = kit.poster || ''; }, { once: true });
      }
      slide.appendChild(img);
    }

    if (kit.available === false) {
      const tag = document.createElement('span');
      tag.className = 'soldout-tag';
      tag.textContent = '補貨中';
      slide.appendChild(tag);
    }

    const overlay = document.createElement('div');
    overlay.className = 'billboard-overlay';
    const info = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'kit-name';
    name.textContent = kit.name;
    info.appendChild(name);
    if (kit.price) {
      const price = document.createElement('div');
      price.className = 'kit-price';
      price.textContent = kit.price;
      info.appendChild(price);
    }
    overlay.appendChild(info);
    if (kit.orderUrl) {
      const order = document.createElement('a');
      order.className = 'btn-order';
      order.href = kit.orderUrl;
      order.target = '_blank';
      order.rel = 'noopener';
      order.textContent = kit.available === false ? '查看賣場' : '我要訂購';
      overlay.appendChild(order);
    }
    slide.appendChild(overlay);

    track.appendChild(slide);
    return { el: slide, video, kit, idx };
  });

  /* ---------- 控制列(單一格時不顯示) ---------- */
  let dots = [];
  if (slides.length > 1) {
    const prev = document.createElement('button');
    prev.className = 'billboard-arrow prev';
    prev.setAttribute('aria-label', '上一個材料包');
    prev.textContent = '‹';
    const next = document.createElement('button');
    next.className = 'billboard-arrow next';
    next.setAttribute('aria-label', '下一個材料包');
    next.textContent = '›';
    prev.addEventListener('click', () => show(cur - 1));
    next.addEventListener('click', () => show(cur + 1));
    root.append(prev, next);

    const dotsBox = document.createElement('div');
    dotsBox.className = 'billboard-dots';
    dots = slides.map((s, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `第 ${i + 1} 個材料包:${s.kit.name}`);
      b.addEventListener('click', () => show(i));
      dotsBox.appendChild(b);
      return b;
    });
    root.appendChild(dotsBox);
  }

  mount.innerHTML = '';
  mount.appendChild(root);

  /* ---------- 輪播邏輯 ---------- */
  let cur = -1;
  let timer = null;
  let visible = true;

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function pauseSlide(i) {
    if (i < 0) return;
    const s = slides[i];
    if (s.video) s.video.pause();
  }

  function showPlayFallback(slide, video) {
    if (slide.el.querySelector('.play-fallback')) return;
    const btn = document.createElement('button');
    btn.className = 'play-fallback';
    btn.setAttribute('aria-label', '播放影片');
    btn.textContent = '▶';
    btn.addEventListener('click', () => {
      btn.remove();
      video.play().catch(() => {});
    });
    slide.el.appendChild(btn);
  }

  function playCurrent() {
    const s = slides[cur];
    if (!visible) return;
    if (s.video) {
      if (REDUCED) {
        showPlayFallback(s, s.video);
        return;
      }
      s.video.currentTime = 0;
      s.video.play().catch(() => showPlayFallback(s, s.video));
    } else if (slides.length > 1 && !REDUCED) {
      clearTimer();
      timer = setTimeout(() => show(cur + 1), IMAGE_SLIDE_MS);
    }
  }

  function show(n) {
    const i = (n + slides.length) % slides.length;
    if (i === cur) return;
    clearTimer();
    pauseSlide(cur);
    if (cur >= 0) slides[cur].el.classList.remove('active');
    cur = i;
    slides[cur].el.classList.add('active');
    dots.forEach((d, di) => {
      if (di === cur) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    playCurrent();
  }

  // 影片播完 → 下一格
  slides.forEach((s) => {
    if (s.video && slides.length > 1) {
      s.video.addEventListener('ended', () => {
        if (s.idx === cur) show(cur + 1);
      });
    }
  });

  // 捲出畫面暫停、捲回繼續
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (!visible) {
          clearTimer();
          pauseSlide(cur);
        } else {
          playCurrent();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(root);
  }

  show(0);
}
