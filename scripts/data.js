// local json used for quotes, btc fallback, and news
const DATA_URL = "./data/data.json";
// coingecko endpoint that returns 30 days of btc prices
const BTC_LIVE_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily";

// loads the local data file for quotes, btc fallback, and news
export async function loadDataFile() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("failed to load data file");
  return res.json();
}

// fetches btc prices from coingecko and returns cleaned series plus summary
export async function loadBtcLive() {
  // pull btc history and guard against bad responses
  const res = await fetch(BTC_LIVE_URL);
  if (!res.ok) throw new Error("failed btc live");
  const json = await res.json();
  // normalize the api price pairs into date labels and values
  const series = cleanBtcSeries(json?.prices);
  // derive summary stats from the cleaned series
  const values = series.map((p) => p.value);
  return {
    value: values[values.length - 1] ?? null,
    high: values.length ? Math.max(...values) : null,
    low: values.length ? Math.min(...values) : null,
    series,
  };
}

// formats large numbers into compact labels for display
export function formatCompact(num) {
  if (typeof num !== "number" || Number.isNaN(num)) return "--";
  if (Math.abs(num) >= 1000) return `${Math.round(num / 1000)}K`;
  return `${Math.round(num)}`;
}

// cleans and normalizes btc price pairs into label/value objects
function cleanBtcSeries(prices = []) {
  return prices
    // keep only pairs with numeric timestamp and price
    .filter(
      (p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])
    )
    .map((p) => ({
      label: new Date(p[0]).toISOString().slice(0, 10),
      value: p[1],
    }));
}
