export function renderTickers(listEl, items) {
  if (!listEl) return;

  listEl.innerHTML = "";

  items.forEach((item) => {
    const displayValue =
      typeof item.value === "number" ? item.value.toLocaleString() : "--";

    const row = document.createElement("div");
    row.className = "watchlist__item";
    row.dataset.symbol = item.symbol;
    row.innerHTML = `
      <span class="watchlist__label">${item.symbol}</span>
      <span class="watchlist__value">${displayValue}</span>
    `;
    listEl.appendChild(row);
  });
}
