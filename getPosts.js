const jsonPath = "./postData.json"; //jsonファイルのパス
const postsPerPage = 6; // 表示する投稿数
const characters = 40; // 投稿のタイトルの文字数の表示上限

window.addEventListener('DOMContentLoaded', () => {
  fetch(jsonPath)
  .then(res => res.json())
  .then(resJson => {
    const postData = resJson.posts.flatMap(post => post.data);
    generate_article(postData);
  });
});

const generate_article = (postData) => {
  const newsData = postData.filter(data => data.category === 'news').slice(0, postsPerPage);
  const topicsData = postData.filter(data => data.category === 'topics').slice(0, postsPerPage);
  let newsHTML = '';
  let topicsHTML = '';

  // news
  for (const data of newsData) {
    if (data['title'].length >= characters) {
      data['title'] = `${data['title'].substring(0, characters)}...`;
    }
    
    newsHTML = `
    <div class="p-post-list_item">
      <a href="${data['link']}">
        <div class="p-post-thumb">
          <figure>
            <img src="asets/image/post_thumb.png">
          </figure>
        </div>
        <div class="p-post-body">
          <div>
            <time class="p-post-time" datetime="${data['date']}">${data['date']}</time>
          </div>
          <h2 class="is-title-style_reset p-post-title">${data['title']}</h2>
        </div>
      </a>
    </div>
    `;
  }
  document.getElementById('news').innerHTML = newsHTML;

  // topics
  for (const data of topicsData) {
    if (data['title'].length >= characters) {
      data['title'] = `${data['title'].substring(0, characters)}...`;
    }

    topicsHTML = `
    <div class="p-post-list_item">
      <a href="${data['link']}">
        <div class="p-post-thumb">
          <figure>
            <img src="${data['thumb']}">
          </figure>
        </div>
        <div class="p-post-body">
          <div>
            <time class="p-post-time" datetime="${data['date']}">${data['date']}</time>
          </div>
          <h2 class="is-title-style_reset p-post-title">${data['title']}</h2>
        </div>
      </a>
    </div>
    `;
  }
  document.getElementById('topics').innerHTML = topicsHTML;
}