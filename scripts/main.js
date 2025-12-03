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

function renderChart(symbol) {
  if (!els.chartArea) return;
  const seriesData = buildSeriesForSymbol(symbol, state);
  if (!seriesData.length) return;
  if (!chartApi) chartApi = createChart(els.chartArea);
  chartApi?.setData(seriesData);
}

function setActiveSymbol(symbol) {
  state.primary.symbol = symbol;
  renderPrimary(state);
  markActiveStock(symbol);
  renderChart(symbol);
}

async function loadTickers() {
  setTickerStatus("Loading...");
  try {
    const data = await loadDataFile();
    state.tickers = data.quotes || [];
    state.chartData.equities = {};

    try {
      const btcLive = await loadBtcLive();
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
  const [openHour, openMinute] = market.open.split(":").map(Number);
  const [closeHour, closeMinute] = market.close.split(":").map(Number);
  const current = currentHour * 60 + currentMinute;
  const open = openHour * 60 + openMinute;
  const close = closeHour * 60 + closeMinute;
  return current >= open && current <= close;
}

async function init() {
  renderPrimary(state);
  bindInteractions();
  await loadTickers();
  await loadNews();
  renderMarketTimes();
  setInterval(renderMarketTimes, 60000);
}

document.addEventListener("DOMContentLoaded", init);
