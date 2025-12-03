export function renderPrimary({ symbol, range, status }) {
  const symbolEl = document.querySelector('[data-binding="primary-symbol"]');
  const rangeEl = document.querySelector('[data-binding="primary-range"]');
  const statusEl = document.querySelector('[data-binding="primary-status"]');

  if (symbolEl) symbolEl.textContent = symbol;
  if (rangeEl) rangeEl.textContent = range;
  if (statusEl) statusEl.textContent = status;
}
