export function renderNews(listEl, items) {
  if (!listEl) return;

  listEl.innerHTML = "";

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "news-card";
    article.dataset.symbol = item.symbol;
    article.innerHTML = `
      <p class="news-card__kicker">Breaking</p>
      <h3 class="news-card__title">${item.title}</h3>
      <p class="news-card__summary">${item.summary}</p>
    `;
    listEl.appendChild(article);
  });
}
