const DATA_URL = "./data/data.json";
const BTC_LIVE_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily";

export async function loadDataFile() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("failed to load data file");
  return res.json();
}

export async function loadBtcLive() {
  const res = await fetch(BTC_LIVE_URL);
  if (!res.ok) throw new Error("failed btc live");
  const json = await res.json();
  const series = cleanBtcSeries(json?.prices);
  const values = series.map((p) => p.value);
  return {
    value: values[values.length - 1] ?? null,
    high: values.length ? Math.max(...values) : null,
    low: values.length ? Math.min(...values) : null,
    series,
  };
}

export function formatCompact(num) {
  if (typeof num !== "number" || Number.isNaN(num)) return "--";
  if (Math.abs(num) >= 1000) return `${Math.round(num / 1000)}K`;
  return `${Math.round(num)}`;
}

function cleanBtcSeries(prices = []) {
  return prices
    .filter(
      (p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])
    )
    .map((p) => ({
      label: new Date(p[0]).toISOString().slice(0, 10),
      value: p[1],
    }));
}
