const API_KEY = "V4DL0XVLHDVWARHT";
const BASE_URL = "https://www.alphavantage.co/query";

// stocks like AAPL and SPY use TIME_SERIES_INTRADAY or GLOBAL_QUOTE
export async function fetchEquityQuote(symbol) {
  // TODO: add api call for equity quote using GLOBAL_QUOTE
  return { symbol, value: null };
}

// bitcoin uses DIGITAL_CURRENCY_DAILY with market=USD
export async function fetchCryptoDaily(symbol, market = "USD") {
  // TODO: add api call for crypto daily
  return { symbol, market, series: [] };
}

export async function fetchTickers() {
  // TODO: aggregate latest values from equity and crypto endpoints
  return [
    { symbol: "AAPL", value: null },
    { symbol: "SPY", value: null },
    { symbol: "BTC", value: null },
  ];
}
