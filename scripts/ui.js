export function renderPrimary(state) {
  const symbolEl = document.querySelector('[data-binding="primary-symbol"]');
  const rangeEl = document.querySelector('[data-binding="primary-range"]');
  const statusEl = document.querySelector('[data-binding="primary-status"]');
  if (symbolEl) symbolEl.textContent = state.primary.symbol;
  if (rangeEl) rangeEl.textContent = state.primary.range;
  if (statusEl) statusEl.textContent = state.primary.status;
}

export function renderTickers(tickers, formatCompact) {
  const listEl = document.querySelector('[data-role="ticker-list"]');
  if (!listEl) return;
  listEl.innerHTML = "";
  tickers.forEach((item) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "watchlist__item";
    row.dataset.symbol = item.symbol;
    row.innerHTML = `
      <span class="watchlist__label">${item.symbol}</span>
      <span class="watchlist__value">${typeof item.value === "number" ? item.value.toLocaleString() : "--"}</span>
      <span class="watchlist__meta">H: ${formatCompact(item.high)} | L: ${formatCompact(item.low)}</span>
    `;
    listEl.appendChild(row);
  });
}

export function renderNews(items) {
  const listEl = document.querySelector('[data-role="news-list"]');
  if (!listEl) return;
  listEl.innerHTML = "";
  items.slice(0, 8).forEach((item) => {
    const sourceMarkup = item.source ? `<p class="news-card__source">${item.source}</p>` : "";
    const article = document.createElement("article");
    article.className = "news-card";
    article.innerHTML = `
      <h3 class="news-card__title">${item.title}</h3>
      <p class="news-card__summary">${item.summary}</p>
      ${sourceMarkup}
    `;
    listEl.appendChild(article);
  });
}

export function renderNewsMessage(text) {
  const listEl = document.querySelector('[data-role="news-list"]');
  if (!listEl) return;
  listEl.innerHTML = `<div class="news-card"><p class="news-card__summary">${text}</p></div>`;
}

export function setTickerStatus(text) {
  document.querySelectorAll(".watchlist__value").forEach((node) => {
    node.textContent = text;
  });
}

export function markActiveStock(symbol) {
  document.querySelectorAll(".watchlist__item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.symbol === symbol);
  });
}
