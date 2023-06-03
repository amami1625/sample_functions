class Pagination {
  constructor() {
    this.paramKey = "page";
    this.articleCount = 12;
    this.pagerMaxCount = 5;
  }

  init() {
    const category = document.querySelector("section").id; // 表示する記事のカテゴリ
    const jsonPath = getJson(category); //　jsonファイルのパス
    const currentPage = get_current_page_number(pagerOptions["paramKey"]); //現在のページ数

    if (category) {
      window.addEventListener("DOMContentLoaded", () => {
        fetch(jsonPath)
          .then((res) => res.json())
          .then((posts) => generate_article(posts, category, currentPage));
      });
    }
  }

  /* =============================================
   * 記事、ページネーション、タイトルの作成を開始
   * ============================================= */
  generate_article(posts, category, currentPage) {
    let articleData = "";

    // news, topics用の配列を作成
    if (category === "news" || category === "topics") {
      articleData = categorize_posts(posts, category);
    }
    // archive用の配列を作成
    if (category === "archive") {
      articleData = divide_by_year(posts);
    }
    generate_html(articleData, currentPage, category);
    generate_pager(articleData, currentPage);
    generate_title(category);
  }

  /* ====================================================
   * news, topics用の配列を作る関数
   * ==================================================== */
  categorize_posts(posts, category) {
    const regex = /^\.\/(?:news|topics)\//; // news, topicsのリンクの整形に使う正規表現
    const postData = posts.posts.flatMap((post) => post.data);
    const categorized = postData
      .filter((data) => data.category === category)
      .map((data) => ({
        ...data,
        link: data.link.replace(regex, "./"),
        thumb: "." + data.thumb,
      }));
    return categorized;
  }

  /* ====================================================
   * archive用の配列を作る関数
   * ==================================================== */
  divide_by_year(posts) {
    const year = document.querySelector("section").getAttribute("data-year");
    const yearData = posts.posts
      .find((data) => data.headline === year)
      .data.reverse()
      .map((data) => ({
        ...data,
        link: data.link.replace("./", "../../"),
        thumb: data.thumb.replace("./", "../../"),
      }));
    return yearData;
  }

  /* =============================================
   * 表示する内容を作成する関数
   * ============================================= */
  generate_html(data, current, category) {
    const first = this.articleCount * (current - 1); // データを何件目から表示するか
    const last = first + this.articleCount; // データを何件目まで表示するか
    let articleHTML = ""; // 記事を格納するための変数

    for (let i = first; i < Math.min(last, data.length); i++) {
      // 記事タイトルが25文字以上の時、25文字までに整形
      if (data[i].title.length >= 25) {
        data[i].title = `${data[i].title.substring(0, 25)}...`;
      }
      // 記事本文が40文字以上の時、40文字までに整形
      if (data[i].body.length >= 40) {
        data[i].body = `${data[i].body.substring(0, 40)}...`;
      }

      articleHTML += `
      <div class="p-post-list_item">
        <a href="${data[i].link}">
          <div class="p-post-thumb">
            <figure>
              <img src="${data[i].thumb}">
            </figure>
          </div>
          <div class="p-post-body">
            <h2 class="is-title-style_reset p-post-title">${data[i].title}</h2>
            <p class="p-post-content">${data[i].body}</p>
            <div class="u-mb-010">
              <time class="p-post-time" datetime="${data[i].date}">${data[i].date}</time>
              ${category === "archive" ? `<span class="category-tag">${data[i].category}</span>`: ''}
            </div>
          </div>
        </a>
      </div>
      `;
    }
    document.getElementById("js-article").innerHTML = articleHTML;
  }
/* =============================================
 * ページャー(HTML)を作成する関数
 * ============================================= */
  generate_pager(data, current) {
    const baseUrl = `./?${this.paramKey}=`;
    const pagerLength = Math.ceil(data.length / this.articleCount); // ページャーの数
    let pagerVisibleCount = this.pagerMaxCount; // ページャーの最大数(5)

    // 記事が0件の場合またはページャーが1件のみの場合は表示しない
    if(pagerLength <= 1) { return; }

    // 現在のページが存在しない場合は1ページ目にリダイレクト
    if(current > pagerLength) { location.href = baseUrl + 1; }

    let startNumber = 1;

    if(pagerLength <= this.pagerMaxCount) {
      pagerVisibleCount = pagerLength;
    } else if (current > pagerLength - Math.ceil(this.pagerMaxCount / 2)) {
      startNumber = pagerLength - this.pagerMaxCount + 1;
    }

    const pagerHTML = `
    <div class="pager">
      ${current !== 1 ? `<a class="pager_first" href="${baseUrl}1#pager-transition">最初へ</a>` : ''}
      ${current !== 1 ? `<a class="pager_prev" href="${baseUrl}${current - 1}#pager-transition">&lt;</a>` : ''}
      <ol class="pager_list">
        ${Array.from({ length: pagerVisibleCount }, (_, index) => {
          const pageNumber = startNumber + index;
          return `
          <li class="pager_item ${pageNumber === current ? 'is-current' : ''}">
            <a href="${baseUrl}${pageNumber}#pager-transition">${pageNumber}</a>
          </li>`;
        }).join('')}
      </ol>
      ${current !== pagerLength ? `<a class="pager_next" href="${baseUrl}${current + 1}#pager-transition">&gt;</a>` : ''}
      ${current !== pagerLength ? `<a class="pager_last" href="${baseUrl}${pagerLength}#pager-transition">最後へ</a>` : ''}
    </div>
    `;
    document.getElementById('js-pager').innerHTML = pagerHTML;
}
/* =============================================
 * タイトルを作成する関数(アーカイブページのみ)
 * ============================================= */
  generate_title(category) {
    if (category === 'archive') {
      const year = document.querySelector('section').getAttribute('data-year');
      const titleHTML = `<h2>${year}年</h2>`;
      document.getElementById('js-title').innerHTML = titleHTML;
    }
  };
  
/* =============================================
 * 今表示されているのが何ページ目かを取得する関数
 * ============================================= */
  get_current_page_number(key) {
    const query = location.search; // ページのURLを取得
    const paramObj = new URLSearchParams(query); // パラメータを操作しやすい形に変換
    const param = Number(paramObj.get(key)); //　key(='page')のパラメータを取得

    // key(='page')が取得できたら、その値を返す (@example) page='1'の場合、'1'を返す
    if (param) {
      return param;
    } else {
      return 1;
    }
  }

/* =============================================
 * jsonファイルのパスを取得する関数
 * ============================================= */
  getJson(category) {
    if (!category) { return; }

    if (category === 'archive') {
      return '../../postData.json';
    }

    if (category === 'news' || category === 'topics') {
      return '../postData.json';
    }
  }
}

new Pagination().init();