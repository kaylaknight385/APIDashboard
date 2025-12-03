// returns a seeded random number helper so mock data stays the same
function seededRandom(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// builds a mock price path from a starting value and seed
function generateMockSeries(base, seedSymbol) {
  const rand = seededRandom(seedSymbol.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
  const points = [];
  let price = base || 100;
  for (let i = 0; i < 40; i += 1) {
    const drift = (rand() - 0.5) * 0.6;
    price = Math.max(1, price + drift);
    const day = 1700000000 + i * 86400;
    points.push({ label: day, value: Number(price.toFixed(2)) });
  }
  return points;
}

// turns raw label/value pairs into chart ready data
function normalizeSeries(series = []) {
  return series
    .map((p) => {
      const time = Number(new Date(p.label).getTime() / 1000);
      const value = Number(p.value);
      return { time, value };
    })
    .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.value));
}

// assembles chart data for btc or stocks with mock fallbacks when needed
export function buildSeriesForSymbol(symbol, state) {
  if (symbol === "BTC") {
    const btcSeries = normalizeSeries(state.chartData.btc);
    if (btcSeries.length) return btcSeries;
    const fallback = Number(state.tickers.find((t) => t.symbol === "BTC")?.value || 100);
    return normalizeSeries(generateMockSeries(fallback, "BTC"));
  }

  const value = state.tickers.find((item) => item.symbol === symbol)?.value ?? 0;
  const base = Number.isFinite(value) ? value : 0;
  return normalizeSeries(generateMockSeries(base, symbol));
}
