const API_KEY = "V4DL0XVLHDVWARHT";
const BASE_URL = "https://www.alphavantage.co/query";

// Alpha Vantage NEWS_SENTIMENT supports tickers param (comma separated)
export async function fetchNews(symbols = []) {
  // TODO: add api call for news with NEWS_SENTIMENT and tickers
  return symbols.map((symbol) => ({
    symbol,
    title: `${symbol} headline`,
    summary: "placeholder summary",
  }));
}
