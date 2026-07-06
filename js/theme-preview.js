/* ============================================================
   theme-preview.js — 主題選樣機制(選樣期間專用,定稿後整檔移除)

   用法:
   - 網址帶 ?theme=a~j 進入該主題(會記住,跨頁沿用)
   - ?theme=off 回到現行設計
   - 右下角浮動膠囊可即時熱切換
   同步執行(在 </head> 前載入)→ 主題樣式表 render-blocking,零閃爍。
   ============================================================ */
(function () {
  'use strict';

  var THEMES = {
    a: { name: '白線手帖', dot: '#bf4342', bg: '#ffffff' },
    b: { name: '水彩筆記', dot: '#4f8f88', bg: '#fdfdfc' },
    c: { name: '牛皮手作誌', dot: '#c9573b', bg: '#faf3e6' },
    d: { name: '蠟筆塗鴉', dot: '#e75f8e', bg: '#ffffff' },
    e: { name: '墨白畫廊', dot: '#c2402a', bg: '#fcfcfa' },
    f: { name: '麻線標本冊', dot: '#7a8450', bg: '#fbfaf6' },
    g: { name: '藍曬手記', dot: '#2f5d9e', bg: '#ffffff' },
    h: { name: '奶油圓點', dot: '#d98a63', bg: '#fffdf8' },
    i: { name: '色紙拼貼', dot: '#e0532f', bg: '#ffffff' },
    j: { name: '鉛筆手稿', dot: '#3a3936', bg: '#fdfdfd' }
  };
  /* 膠囊上顯示的選項(評審選出的六強,依名次;落選主題仍可用 ?theme= 叫出) */
  var PILL_LIST = ['a', 'd', 'b', 'j', 'i', 'g'];
  var KEY = 'preview-theme';
  var BASE_THEME_COLOR = '#faf6f0';

  /* ---------- 讀取參數 → localStorage ---------- */
  var param = new URLSearchParams(location.search).get('theme');
  if (param) {
    try { sessionStorage.removeItem('theme-pill-hidden'); } catch (e) {}
    if (THEMES[param]) {
      try { localStorage.setItem(KEY, param); } catch (e) {}
    } else if (param === 'off') {
      try { localStorage.removeItem(KEY); } catch (e) {}
    }
  }

  var current = null;
  try { current = localStorage.getItem(KEY); } catch (e) {}
  if (current && !THEMES[current]) current = null;

  /* ---------- 同步注入主題樣式表(零 FOUC) ---------- */
  function setThemeColor(color) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }

  function applyTheme(key) {
    var link = document.getElementById('theme-css');
    if (key && THEMES[key]) {
      if (!link) {
        link = document.createElement('link');
        link.id = 'theme-css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = '/css/themes/theme-' + key + '.css';
      document.documentElement.dataset.theme = key;
      setThemeColor(THEMES[key].bg);
      try { localStorage.setItem(KEY, key); } catch (e) {}
    } else {
      if (link) link.remove();
      delete document.documentElement.dataset.theme;
      setThemeColor(BASE_THEME_COLOR);
      try { localStorage.removeItem(KEY); } catch (e) {}
    }
    current = key && THEMES[key] ? key : null;
  }

  if (current) applyTheme(current);

  /* ---------- 浮動切換膠囊 ---------- */
  function buildPill() {
    var hidden = false;
    try { hidden = sessionStorage.getItem('theme-pill-hidden') === '1'; } catch (e) {}
    if (hidden) return;

    var style = document.createElement('style');
    style.textContent =
      '#theme-pill{position:fixed;right:14px;bottom:14px;z-index:2000;display:flex;align-items:center;gap:5px;' +
      'padding:6px 8px;background:#fff;border:1px solid #ddd;border-radius:999px;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.18);font:12px/1 sans-serif;}' +
      '#theme-pill button{width:30px;height:30px;border-radius:50%;border:1.5px solid #ccc;background:#fff;' +
      'color:#555;font:600 12px/1 sans-serif;cursor:pointer;padding:0;}' +
      '#theme-pill button[aria-pressed="true"]{color:#fff;border-color:transparent;}' +
      '#theme-pill .pill-close{border:none;background:none;color:#999;font-size:14px;width:22px;}' +
      '@media print{#theme-pill{display:none}}';
    document.head.appendChild(style);

    var pill = document.createElement('div');
    pill.id = 'theme-pill';
    pill.setAttribute('role', 'group');
    pill.setAttribute('aria-label', '主題預覽切換');

    var buttons = {};

    function refresh() {
      Object.keys(buttons).forEach(function (k) {
        var b = buttons[k];
        var active = (k === 'off') ? !current : (current === k);
        b.setAttribute('aria-pressed', String(active));
        if (k === 'off') {
          b.style.background = active ? '#33302a' : '#fff';
          b.style.color = active ? '#fff' : '#555';
        } else {
          b.style.background = active ? THEMES[k].dot : '#fff';
          b.style.color = active ? '#fff' : THEMES[k].dot;
          b.style.borderColor = active ? 'transparent' : THEMES[k].dot;
        }
      });
    }

    var offBtn = document.createElement('button');
    offBtn.textContent = '原';
    offBtn.title = '現行設計';
    offBtn.addEventListener('click', function () { applyTheme(null); refresh(); });
    buttons.off = offBtn;
    pill.appendChild(offBtn);

    PILL_LIST.forEach(function (k) {
      if (!THEMES[k]) return;
      var b = document.createElement('button');
      b.textContent = k.toUpperCase();
      b.title = THEMES[k].name;
      b.addEventListener('click', function () { applyTheme(k); refresh(); });
      buttons[k] = b;
      pill.appendChild(b);
    });

    var close = document.createElement('button');
    close.className = 'pill-close';
    close.textContent = '✕';
    close.title = '關閉切換列(目前主題會保持)';
    close.setAttribute('aria-label', '關閉主題切換列');
    close.addEventListener('click', function () {
      try { sessionStorage.setItem('theme-pill-hidden', '1'); } catch (e) {}
      pill.remove();
    });
    pill.appendChild(close);

    document.body.appendChild(pill);
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPill);
  } else {
    buildPill();
  }
})();
