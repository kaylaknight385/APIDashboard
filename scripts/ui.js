// updates the hero header with the current symbol, range, and status
export function renderPrimary(state) {
  const symbolEl = document.querySelector('[data-binding="primary-symbol"]');
  const rangeEl = document.querySelector('[data-binding="primary-range"]');
  const statusEl = document.querySelector('[data-binding="primary-status"]');
  if (symbolEl) symbolEl.textContent = state.primary.symbol;
  if (rangeEl) rangeEl.textContent = state.primary.range;
  if (statusEl) statusEl.textContent = state.primary.status;
}

// paints the watchlist items with current values and high/low labels
export function renderTickers(tickers, formatCompact) {
  const listEl = document.querySelector('[data-role="ticker-list"]');
  if (!listEl) return;
  // clear any previous items before rendering new ones
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

// renders up to eight news cards from the provided items
export function renderNews(items) {
  const listEl = document.querySelector('[data-role="news-list"]');
  if (!listEl) return;
  // replace the grid contents with the latest slice
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

// shows a simple message in place of the news grid
export function renderNewsMessage(text) {
  const listEl = document.querySelector('[data-role="news-list"]');
  if (!listEl) return;
  listEl.innerHTML = `<div class="news-card"><p class="news-card__summary">${text}</p></div>`;
}

// replaces ticker value placeholders with a status string
export function setTickerStatus(text) {
  document.querySelectorAll(".watchlist__value").forEach((node) => {
    node.textContent = text;
  });
}

// highlights the active ticker in the watchlist
export function markActiveStock(symbol) {
  document.querySelectorAll(".watchlist__item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.symbol === symbol);
  });
}
