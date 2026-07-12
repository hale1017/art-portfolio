/* ============================================================
   data.js — JSON 資料載入(模組級快取)+ 圖片 CDN 網址包裝
   ============================================================ */

const cache = new Map();

/** 載入 data/<name>.json,同一份資料整站只 fetch 一次 */
export function loadData(name) {
  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(`data/${name}.json`, { cache: 'no-cache' }).then((r) => {
        if (!r.ok) throw new Error(`載入 data/${name}.json 失敗(HTTP ${r.status})`);
        return r.json();
      })
    );
  }
  return cache.get(name);
}

const IS_LOCAL =
  ['localhost', '127.0.0.1'].includes(location.hostname) ||
  location.protocol === 'file:';

/**
 * 圖片網址:改用倉庫內預產的縮圖(images/thumbs/,由 GitHub Action 自動生成),
 * 不再依賴主機的即時影像服務(Netlify Image CDN 走 credits 計費)。
 * 縮圖只有 480 / 1600 兩種寬度;SVG、影片與外部網址直接用原檔。
 * 本機開發回傳原始路徑;縮圖尚未生成時由呼叫端的 onerror 保險退回原圖。
 */
export function imgURL(path, width) {
  if (!path) return '';
  if (IS_LOCAL || !path.startsWith('/images/uploads/')) return path;
  if (!/\.(jpe?g|png)$/i.test(path)) return path;
  const stem = path.slice('/images/uploads/'.length).replace(/\.[^.]+$/, '');
  const w = width <= 800 ? 480 : 1600;
  return `/images/thumbs/${encodeURIComponent(stem)}-${w}.webp`;
}

/**
 * 縮圖對齊:把後台的 focus 值(center/top/bottom/left/right)轉成 CSS object-position。
 * 縮圖是「填滿固定比例框 + 裁掉多餘」,這個值決定裁切時保留哪一側。
 */
const FOCUS_POSITION = {
  center: 'center',
  top: 'center top',
  bottom: 'center bottom',
  left: 'left center',
  right: 'right center',
};
export function focusPosition(focus) {
  return FOCUS_POSITION[focus] || 'center';
}

/**
 * 建立 <img>:自帶「CDN 載入失敗就退回原圖」的保險。
 * 部署到非 Netlify 環境也不會破圖。
 * focus 控制縮圖裁切時保留哪一側(見 focusPosition)。
 */
export function makeImg(path, width, alt = '', focus = 'center', lazy = true) {
  const img = document.createElement('img');
  img.src = imgURL(path, width);
  img.alt = alt;
  img.style.objectPosition = focusPosition(focus);
  if (lazy) img.loading = 'lazy';
  if (img.src !== path) {
    img.addEventListener('error', () => { img.src = path; }, { once: true });
  }
  return img;
}

/** 把多行文字依換行切成 <p> 段落(給 bio / intro 用) */
export function paragraphs(text) {
  const frag = document.createDocumentFragment();
  String(text || '')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      frag.appendChild(p);
    });
  return frag;
}
