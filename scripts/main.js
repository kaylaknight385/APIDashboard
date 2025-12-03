import { state } from "./state.js";
import { fetchTickers } from "./api/market.js";
import { fetchNews } from "./api/news.js";
import { renderPrimary } from "./render/primary.js";
import { renderTickers } from "./render/tickers.js";
import { renderNews } from "./render/news.js";

const symbols = ["AAPL", "SPY", "BTC"];

function getElements() {
  return {
    tickerList: document.querySelector('[data-role="ticker-list"]'),
    newsList: document.querySelector('[data-role="news-list"]'),
  };
}

async function init() {
  const els = getElements();
  renderPrimary(state.primary);

  try {
    state.tickers = await fetchTickers();
    renderTickers(els.tickerList, state.tickers);
  } catch (err) {
    console.error("Failed to load tickers", err);
  }

  try {
    state.news = await fetchNews(symbols);
    renderNews(els.newsList, state.news);
  } catch (err) {
    console.error("Failed to load news", err);
  }

  // TODO: add chart rendering inside [data-binding="chart-placeholder"]
}

document.addEventListener("DOMContentLoaded", init);
