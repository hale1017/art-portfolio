# art-portfolio — 美術從業人員個人網站

零建置(zero-build)純靜態網站 + Git-based CMS 後台。給開發者看的文件;
網站主人(美術人)請看《[維護手冊](維護手冊.pdf)》。

## 架構一句話

純 vanilla HTML/CSS/JS,頁面在瀏覽器端 fetch `data/*.json` 渲染;
內容由 [Sveltia CMS](https://github.com/sveltia/sveltia-cms)(Decap 相容)在 `/admin/` 編輯,
背後直接 commit 到 GitHub;部署 Netlify(無 build command,push 即上線)。
**沒有 npm、沒有 node_modules、沒有建置步驟。**

## 目錄結構

```
index.html / gallery.html / dolls.html / about.html / courses.html / 404.html
css/        base.css(tokens+元件) layout.css(版面) billboard.css(影片看板)
js/         include.js(共用header/footer) data.js(loadData/imgURL)
            home.js gallery.js dolls.js about.js courses.js kits.js(看板輪播)
data/       site / categories / works / dolls / kits / about / courses (.json)
images/     uploads/(CMS 上傳的圖與影片) site/(favicon、OG 圖)
admin/      index.html(Sveltia,版本釘死) config.yml(全繁中欄位)
tools/      serve.py(本機開發伺服器,支援 HTTP Range)
netlify.toml
```

## 本機開發

```bash
python tools/serve.py          # http://localhost:8765
```

不要用 `python -m http.server` —— 它不支援 Range 請求,MP4 影片會卡住(serve.py 已解決)。

後台本機測試(擇一):
- **Sveltia 本地模式**(推薦):Chrome/Edge 開 `http://localhost:8765/admin/`,
  按「Work with Local Repository」選 repo 資料夾,即可直接編輯本地檔案(免 token、免 proxy)。
- **decap-server**:`npx decap-server`(port 8081),config 已含 `local_backend: true`。

## 設計系統(2026-07 定稿)

由十套候選主題經獨立評審後,藝術家選定「**鉛筆手稿底 × 辰宇落雁體手寫標題**」混血版:

- **色票**:石墨 `#3a3936`(accent)+ 便利貼黃 `#f2c94c`(`--sticky`,全站唯一彩色,只給
  購買/報名 CTA)+ 近白底 `#fdfdfd`。全部 token 在 `css/base.css` 的 `:root`。
- **字型**:標題=辰宇落雁體 Thin(手寫),內文=Noto Sans TC,Latin 點綴=Caveat。
  手寫字型只有 400 → 全站標題 `font-weight:400; font-synthesis:none`,以放大字級補償
  (藝術家要求手寫字要大)。
- **裝飾語彙**:筆記本格線 hero(含左紅邊線)、鉛筆亂線標題底線、手繪圈籤片、
  卡片 hover 手繪雙框、螢光筆標語、便利貼句號、鉛筆空心圈時間軸。
- **外部依賴注意**:辰宇落雁體走 [ZeoSeven Fonts](https://fontsapi.zeoseven.com/96/main/result.css)
  切片 CDN(中國服務)。若日後不穩,逃生門:用 fonttools/pyftsubset 對
  [官方 TTF](https://github.com/Chenyu-otf/chenyuluoyan_thin) 做子集化自架到 `fonts/`
  (一次性產出,仍零建置);字型鏈已墊 Iansui(Google Fonts)作為手寫 fallback。
- 十套候選主題與選樣機制封存在 git tag **`themes-archive`**,要回顧或改選時
  `git checkout themes-archive` 即可。

## 資料驅動的關鍵設計

- **媒材分類是動態的**:`data/categories.json` 新增一筆 → 後台作品編輯的下拉選單
  (relation widget)與作品集頁的篩選按鈕自動出現,不用改程式。
  `slug` 是不可變的英文代號(改中文名只改 `label`)。
- **陣列順序 = 顯示順序**:後台 list widget 拖曳排序,前台照存檔順序渲染。
- **首次登入請驗證 relation widget**:Sveltia 對 file-collection relation
  (`value_field: "categories.*.slug"`)如有異常,降級方案 = 把 `works` 的 `category`
  欄位改成 `select` widget、選項寫死在 config.yml(五分鐘的事,但之後新增分類要改 config)。

### enum 同步點(改一處就要同步另一處)

| enum | config.yml | 前端 JS |
|---|---|---|
| 娃衣系列 | dolls 的 `series` select | `js/dolls.js` 的 `SERIES` / `SERIES_LABEL`(+ `js/home.js`) |
| 經歷類型 | about 的 `category` select | `js/about.js` 的 `CV_LABEL` + `css/base.css` 的 `.badge-*` |
| 社群平台 | site 的 `platform` select | `js/include.js` 的 `ICONS` |

(媒材分類**不在**此表 —— 它是動態的,這正是設計重點。)

## 圖片與影片

- 前台圖片用 **倉庫內預產縮圖**(`images/thumbs/<檔名>-480.webp` 與 `-1600.webp`),
  由 GitHub Action(`.github/workflows/images.yml` → `tools/process_images.py`)在
  push 後自動生成;同一支腳本也會把 uploads 的原圖壓到長邊 ≤2000px
  (藝術家可直接傳手機原圖)。`js/data.js` 的 `imgURL()` 依寬度取 480/1600 檔;
  本機直接回原始路徑;`<img>` 掛了 onerror 保險,縮圖缺檔自動退回原圖。
  (2026-07 起不再用 Netlify Image CDN 即時轉換 —— credits 計費大宗,
  且預產縮圖讓網站不依賴任何主機的影像服務。)
- **影片**直出檔案(不經 CDN),靠 `preload="metadata"` + 同時只播一支省頻寬。
  上傳規範:單支 ≤30MB、約 30–60 秒(CMS 欄位有 hint,手冊有教學)。
  GitHub 單檔硬限 100MB。若影片累積過多 → 擴充點:`js/kits.js` 可加
  「video 欄位若是 YouTube 網址就改用 iframe」的判斷,無痛混用外連影片。

## 部署(一次性設定)

1. GitHub 建 repo(建議建在**美術人帳號**下,開發者掛 collaborator),push。
2. `admin/config.yml` 的 `backend.repo` 改成實際 `帳號/repo名`。
3. Netlify「Import from Git」選 repo;build command **留空**、publish 設 `.`。
4. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App:
   callback URL 填 `https://api.netlify.com/auth/done`。
5. Netlify 站台 → Access & security → OAuth → Install provider(GitHub),貼 Client ID/Secret。
6. 用美術人的 GitHub 帳號開 `https://<site>.netlify.app/admin/` 驗收。
   (備援登入:fine-grained PAT,Sveltia 登入頁的「Sign In Using Access Token」。)
7. 不要用 Netlify Identity / Git Gateway —— 已被官方棄用。

## 救援與還原

每次後台儲存 = 一個 git commit。改壞了:`git revert <sha>` 或 GitHub 網頁 revert,
push 後幾十秒站上復原。

## 逃生門與未來擴充

- **作品超過 ~150 件**:works 改 folder collection(一作品一檔)+ GitHub Action
  把 entries 合併輸出 works.json(只有 Action commit 生成檔,網站本身仍零建置)。
- **縫紉小教室**(針法步驟動畫,已規劃未實作):新增 `sewing-class.html` +
  資料驅動的 SVG 步驟播放器,不影響既有頁面。
- **OG 圖**:`images/site/og-default.svg` 建議換成 1200×630 的 JPG/PNG
  (部分社群平台不吃 SVG OG 圖)。

## SEO 取捨(有意的決定)

內容為 client-side render;每頁的 `<title>`/meta/OG 寫死在各自 HTML head(SEO 主體)。
個人作品集流量主要來自 IG/名片直連,可接受。未來在意的話,把精選作品直接寫進 index.html。
