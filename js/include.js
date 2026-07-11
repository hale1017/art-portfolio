/* ============================================================
   include.js — 共用 header / footer(custom elements,零建置)
   導覽列與頁尾的 markup 只存在這一個檔案。
   ============================================================ */

import { loadData } from './data.js';

const NAV = [
  ['index.html', '首頁'],
  ['gallery.html', '作品集'],
  ['dolls.html', '娃衣與材料包'],
  ['courses.html', '教學課程'],
  ['about.html', '關於我'],
];

const ICONS = {
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.3.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.3.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.3-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.3-.4 1.2-.1 1.6-.1 4.8-.1zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.1-2.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>',
  facebook:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V21h3.4z"/></svg>',
  line:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11.1c0 4 3.6 7.4 8.4 8 .3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.6 1.1-.5 6-3.5 8.2-6 1.5-1.7 2.2-3.4 2.2-5.4C22.5 6.6 17.5 3 12 3zM7.4 13.8H5.3c-.3 0-.6-.3-.6-.6V9.1c0-.3.3-.6.6-.6s.6.3.6.6v3.5h1.5c.3 0 .6.3.6.6s-.3.6-.6.6zm2.2-.6c0 .3-.3.6-.6.6s-.6-.3-.6-.6V9.1c0-.3.3-.6.6-.6s.6.3.6.6v4.1zm5 0c0 .3-.2.5-.4.6h-.2c-.2 0-.4-.1-.5-.2l-2.1-2.9v2.5c0 .3-.3.6-.6.6s-.6-.3-.6-.6V9.1c0-.3.2-.5.4-.6h.2c.2 0 .4.1.5.2l2.1 2.9V9.1c0-.3.3-.6.6-.6s.6.3.6.6v4.1zm3.4-2.7c.3 0 .6.3.6.6s-.3.6-.6.6h-1.5v1h1.5c.3 0 .6.3.6.6s-.3.6-.6.6h-2.1c-.3 0-.6-.3-.6-.6V9.1c0-.3.3-.6.6-.6H18c.3 0 .6.3.6.6s-.3.6-.6.6h-1.5v1H18z"/></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z"/></svg>',
  threads:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 22c-2.9 0-5.1-1-6.6-2.9C4.2 17.4 3.5 15 3.5 12s.7-5.4 2.1-7.1C7.1 3 9.3 2 12.2 2c2.2 0 4.1.6 5.5 1.8 1.3 1.1 2.2 2.6 2.7 4.5l-1.9.5c-.8-3.1-2.9-4.8-6.3-4.8-2.3 0-4 .8-5.1 2.2C6 7.6 5.4 9.6 5.4 12s.6 4.4 1.7 5.8c1.1 1.4 2.8 2.2 5.1 2.2 2.1 0 3.6-.5 4.7-1.6.9-.9 1.3-2 1.2-3.2-.1-.8-.4-1.5-1-2-.2 1.2-.7 2.2-1.5 2.9-.9.8-2 1.2-3.4 1.3-1.1 0-2.1-.2-2.9-.8a3.1 3.1 0 0 1-1.4-2.4c-.1-1 .3-1.9 1-2.6.8-.7 1.9-1.1 3.3-1.2.9 0 1.8 0 2.6.2 0-.7-.2-1.2-.5-1.6-.4-.5-1.1-.7-1.9-.7-1 0-1.9.3-2.5 1.2l-1.6-1c1-1.4 2.4-2 4.2-2 1.4 0 2.5.4 3.3 1.2.8.8 1.2 2 1.3 3.5v.3c1.6.8 2.6 2 2.8 3.6.2 1.8-.5 3.5-1.8 4.7-1.4 1.4-3.4 2.2-6 2.2zm.4-8.7h-.5c-1.7.1-2.4.7-2.4 1.6.1 1 .9 1.4 2.2 1.4 1.7-.1 2.7-1 2.9-2.8-.7-.1-1.4-.2-2.2-.2z"/></svg>',
  shopee:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1.9 0 3.4 1.7 3.6 3.9h3.6c.5 0 .9.4.9.9l-.9 13.4c-.1 1-.9 1.8-1.9 1.8H6.7c-1 0-1.8-.8-1.9-1.8L3.9 6.8c0-.5.4-.9.9-.9h3.6C8.6 3.7 10.1 2 12 2zm0 1.6c-1 0-1.9 1-2 2.3h4c-.1-1.3-1-2.3-2-2.3zm.1 5.1c-1.8 0-3 1-3 2.4 0 1.5 1.3 2 2.7 2.5 1.3.4 1.9.7 1.9 1.4 0 .6-.6 1.1-1.6 1.1-.9 0-1.8-.4-2.5-1l-.8 1.1c.9.8 2.1 1.2 3.3 1.2 1.9 0 3.1-1 3.1-2.5s-1.4-2-2.8-2.5c-1.2-.4-1.8-.7-1.8-1.4 0-.6.6-1 1.5-1 .8 0 1.5.3 2.1.7l.7-1.1c-.8-.6-1.7-.9-2.8-.9z"/></svg>',
  other:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l2.8-2.8a3 3 0 0 1 4.2 4.2l-2 2a1 1 0 0 1-1.4-1.4l2-2a1 1 0 0 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-2.8 2.8a3 3 0 1 1-4.2-4.2l2-2a1 1 0 0 1 1.4 1.4l-2 2a1 1 0 1 0 1.4 1.4L12 10.6a1 1 0 0 1 1.4 0z"/></svg>',
};

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const here = location.pathname.split('/').pop() || 'index.html';
    this.innerHTML = `
      <header class="site-header">
        <div class="bar">
          <a class="brand" href="index.html" data-brand>作品集<span class="brand-dot">。</span></a>
          <button class="nav-toggle" aria-label="開關選單" aria-expanded="false">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          <nav class="main-nav" aria-label="主選單">
            <ul>
              ${NAV.map(
                ([href, label]) =>
                  `<li><a href="${href}" ${href === here ? 'aria-current="page"' : ''}>${label}</a></li>`
              ).join('')}
            </ul>
          </nav>
        </div>
      </header>`;

    const toggle = this.querySelector('.nav-toggle');
    const nav = this.querySelector('.main-nav');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    loadData('site')
      .then((site) => {
        const brand = this.querySelector('[data-brand]');
        brand.innerHTML = '';
        brand.append(site.siteTitle || site.artistName || '作品集');
        const dot = document.createElement('span');
        dot.className = 'brand-dot';
        dot.textContent = '。';
        brand.appendChild(dot);
      })
      .catch(() => {});
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="cols">
          <div class="footer-contact">
            <h3>聯絡方式</h3>
            <ul data-contact></ul>
          </div>
          <div>
            <h3>追蹤我</h3>
            <div class="social-links" data-social></div>
          </div>
        </div>
        <div class="copyright">
          <span data-copy></span>
          <a class="manual-link" href="/manual.html">網站使用手冊</a>
        </div>
      </footer>`;

    loadData('site')
      .then((site) => {
        const contact = this.querySelector('[data-contact]');
        if (site.email) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `mailto:${site.email}`;
          a.textContent = site.email;
          li.append('Email:', a);
          contact.appendChild(li);
        }
        if (site.phone) {
          const li = document.createElement('li');
          li.textContent = `電話:${site.phone}`;
          contact.appendChild(li);
        }
        if (site.location) {
          const li = document.createElement('li');
          li.textContent = `所在地:${site.location}`;
          contact.appendChild(li);
        }

        const social = this.querySelector('[data-social]');
        (site.social || []).forEach((s) => {
          if (!s.url) return;
          const a = document.createElement('a');
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.innerHTML = `${ICONS[s.platform] || ICONS.other}<span>${s.label || s.platform}</span>`;
          social.appendChild(a);
        });

        this.querySelector('[data-copy]').textContent =
          `© ${new Date().getFullYear()} ${site.artistName || ''} 版權所有,圖文請勿轉載。`;
      })
      .catch(() => {
        this.querySelector('[data-copy]').textContent = '';
      });
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
