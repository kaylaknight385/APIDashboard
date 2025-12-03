export function createChart(container) {
  if (!container || !window.LightweightCharts) return null;
  const chart = window.LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 220,
    layout: { background: { color: "#f6f6f6" }, textColor: "#111" },
    grid: {
      vertLines: { color: "rgba(0,0,0,0.08)" },
      horzLines: { color: "rgba(0,0,0,0.08)" },
    },
    rightPriceScale: { borderVisible: false },
    timeScale: { borderVisible: false },
    crosshair: { mode: window.LightweightCharts.CrosshairMode.Magnet },
  });
  const series = chart.addLineSeries({ color: "#111", lineWidth: 2 });

  return {
    setData(data) {
      if (!Array.isArray(data) || !data.length) return;
      series.setData(data);
      chart.timeScale().fitContent();
    },
  };
}
