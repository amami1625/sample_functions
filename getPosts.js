const jsonPath = "./postData.json"; //jsonファイルのパス
const postsPerPage = 6; // 表示する投稿数
const characters = 40; // 投稿のタイトルの文字数の表示上限

window.addEventListener('DOMContentLoaded', () => {
  fetch(jsonPath)
  .then(res => res.json())
  .then(posts => generate_article(posts));
});


/* ====================================================
 * データをカテゴリ毎に分類して、表示数上限に数を合わせる
 * ==================================================== */
const categorize_posts = (posts, category) => {
  const postData = posts.posts.flatMap(post => post.data);
  const categorized = postData.filter(data => data.category === category).slice(0, postsPerPage);
  for (const data of categorized) {
    if (data.title.length >= characters) {
      data.title = `${data.title.substring(0, characters)}...`;
    }
  }
  return categorized;
};

/* ====================================================
 * データから表示するHTMLを作成する
 * ==================================================== */
const generate_article = (posts) => {
  const newsData = categorize_posts(posts, 'news');
  const topicsData = categorize_posts(posts, 'topics');
  let newsHTML = '';
  let topicsHTML = '';

  // news
  for (const data of newsData) {    
    newsHTML = `
    <div class="p-post-list_item">
      <a href="${data.link}">
        <div class="p-post-thumb">
          <figure>
            <img src="asets/image/post_thumb.png">
          </figure>
        </div>
        <div class="p-post-body">
          <div>
            <time class="p-post-time" datetime="${data.date}">${data.date}</time>
          </div>
          <h2 class="is-title-style_reset p-post-title">${data.title}</h2>
        </div>
      </a>
    </div>
    `;
  }
  document.getElementById('news').innerHTML = newsHTML;

  // topics
  for (const data of topicsData) {
    topicsHTML = `
    <div class="p-post-list_item">
      <a href="${data.link}">
        <div class="p-post-thumb">
          <figure>
            <img src="${data.thumb}">
          </figure>
        </div>
        <div class="p-post-body">
          <div>
            <time class="p-post-time" datetime="${data.date}">${data.date}</time>
          </div>
          <h2 class="is-title-style_reset p-post-title">${data.title}</h2>
        </div>
      </a>
    </div>
    `;
  }
  document.getElementById('topics').innerHTML = topicsHTML;
}