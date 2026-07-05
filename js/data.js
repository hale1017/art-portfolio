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
 * 圖片網址:部署在 Netlify 時走 Image CDN 自動縮圖轉 WebP,
 * 本機或其他環境回傳原始路徑。
 */
export function imgURL(path, width) {
  if (!path) return '';
  if (IS_LOCAL || !path.startsWith('/')) return path;
  return `/.netlify/images?url=${encodeURIComponent(path)}&w=${width}&fit=cover&fm=webp&q=75`;
}

/**
 * 建立 <img>:自帶「CDN 載入失敗就退回原圖」的保險。
 * 部署到非 Netlify 環境也不會破圖。
 */
export function makeImg(path, width, alt = '', lazy = true) {
  const img = document.createElement('img');
  img.src = imgURL(path, width);
  img.alt = alt;
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
