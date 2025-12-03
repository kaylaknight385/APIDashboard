import { createChart } from "./chart.js";
import { loadDataFile, loadBtcLive } from "./data.js";
import { buildSeriesForSymbol } from "./series.js";
import {
  renderPrimary,
  renderTickers,
  renderNews,
  renderNewsMessage,
  setTickerStatus,
  markActiveStock,
} from "./ui.js";

const state = {
  tickers: [],
  news: [],
  chartData: { btc: [], equities: {} },
  primary: { symbol: "AAPL", range: "1 day", status: "Live" },
  markets: [
    {
      id: "nyse",
      name: "NYSE",
      tz: "America/New_York",
      open: "09:30",
      close: "16:00",
    },
    {
      id: "lse",
      name: "LSE",
      tz: "Europe/London",
      open: "08:00",
      close: "16:30",
    },
    { id: "tse", name: "TSE", tz: "Asia/Tokyo", open: "09:00", close: "15:00" },
  ],
};

let chartApi = null;

const els = {
  tickerList: document.querySelector('[data-role="ticker-list"]'),
  newsList: document.querySelector('[data-role="news-list"]'),
  chartArea: document.querySelector('[data-binding="chart-placeholder"]'),
  newsSearch: document.querySelector('[data-role="news-search"]'),
  navLinks: document.querySelectorAll("[data-nav-target]"),
};

// draws or updates the chart with series data for a symbol
function renderChart(symbol) {
  if (!els.chartArea) return;
  const seriesData = buildSeriesForSymbol(symbol, state);
  if (!seriesData.length) return;
  if (!chartApi) chartApi = createChart(els.chartArea);
  chartApi?.setData(seriesData);
}

// switches the primary symbol and refreshes the ui to match
function setActiveSymbol(symbol) {
  state.primary.symbol = symbol;
  renderPrimary(state);
  markActiveStock(symbol);
  renderChart(symbol);
}

// fetches tickers (plus btc) then fills the watchlist and chart
async function loadTickers() {
  setTickerStatus("Loading...");
  try {
    const data = await loadDataFile();
    state.tickers = data.quotes || [];
    state.chartData.equities = {};

    try {
      const btcLive = await loadBtcLive();
      // keep only btc points that have a valid date and numeric value
      const cleaned = (btcLive.series || []).filter(
        (p) =>
          Number.isFinite(new Date(p.label).getTime()) &&
          Number.isFinite(p.value)
      );
      state.chartData.btc = cleaned;
      const values = cleaned
        .map((p) => p.value)
        .filter((v) => Number.isFinite(v));
      state.tickers.push({
        symbol: "BTC",
        value: btcLive.value ?? values[values.length - 1] ?? null,
        high: Number.isFinite(btcLive.high)
          ? btcLive.high
          : Math.max(...values, 0),
        low: Number.isFinite(btcLive.low)
          ? btcLive.low
          : Math.min(...values, 0),
      });
    } catch {
      // keep only fallback btc points that have a valid date and numeric value
      const cleaned = (data.btcSeries || []).filter(
        (p) =>
          Number.isFinite(new Date(p.label).getTime()) &&
          Number.isFinite(p.value)
      );
      state.chartData.btc = cleaned;
      const values = cleaned
        .map((p) => p.value)
        .filter((v) => Number.isFinite(v));
      const last = cleaned[cleaned.length - 1];
      state.tickers.push({
        symbol: "BTC",
        value: last?.value ?? null,
        high: values.length ? Math.max(...values) : null,
        low: values.length ? Math.min(...values) : null,
      });
    }

    renderTickers(state.tickers, (val) => {
      if (typeof val !== "number" || Number.isNaN(val)) return "--";
      if (Math.abs(val) >= 1000) return `${Math.round(val / 1000)}K`;
      return `${Math.round(val)}`;
    });
    markActiveStock(state.primary.symbol);
    renderChart(state.primary.symbol);
  } catch (err) {
    console.error("Failed to load tickers", err);
    setTickerStatus("Error loading");
  }
}

// pulls news items from data file and renders the feed
async function loadNews() {
  renderNewsMessage("Loading news...");
  try {
    const data = await loadDataFile();
    state.news = data.news || [];
    renderNews(state.news);
  } catch (err) {
    console.error("Failed to load news", err);
    renderNewsMessage("Error loading news");
  }
}

// wires up click and input handlers for watchlist, news search, and nav
function bindInteractions() {
  if (els.tickerList) {
    els.tickerList.addEventListener("click", (e) => {
      const item = e.target.closest(".watchlist__item");
      if (!item) return;
      const symbol = item.dataset.symbol;
      if (!symbol) return;
      setActiveSymbol(symbol);
    });
  }

  if (els.newsSearch) {
    els.newsSearch.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = (state.news || []).filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.summary.toLowerCase().includes(term) ||
          (item.source || "").toLowerCase().includes(term)
      );
      renderNews(filtered);
    });
  }

  els.navLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.navTarget;
      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// updates each market chip with its current time and open/closed state
function renderMarketTimes() {
  const now = new Date();
  state.markets.forEach((market) => {
    const timeString = now.toLocaleTimeString("en-US", {
      timeZone: market.tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const isOpen = marketIsOpen(now, market);
    const timeEl = document.querySelector(
      `[data-binding="market-time-${market.id}"]`
    );
    const statusEl = document.querySelector(
      `[data-binding="market-status-${market.id}"]`
    );
    if (timeEl) timeEl.textContent = timeString;
    if (statusEl) statusEl.textContent = isOpen ? "Open" : "Closed";
  });
}

// checks if a market is open based on its timezone and hours
function marketIsOpen(now, market) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: market.tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [currentHour, currentMinute] = formatter
    .format(now)
    .split(":")
    .map(Number);
  // convert current time and open/close strings into minutes for easy compare
  const [openHour, openMinute] = market.open.split(":").map(Number);
  const [closeHour, closeMinute] = market.close.split(":").map(Number);
  const current = currentHour * 60 + currentMinute;
  const open = openHour * 60 + openMinute;
  const close = closeHour * 60 + closeMinute;
  return current >= open && current <= close;
}

// boots the dashboard, loads data, and starts the market timer
async function init() {
  renderPrimary(state);
  bindInteractions();
  await loadTickers();
  await loadNews();
  renderMarketTimes();
  setInterval(renderMarketTimes, 60000);
}

document.addEventListener("DOMContentLoaded", init);
