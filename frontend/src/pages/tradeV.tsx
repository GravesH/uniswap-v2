import React, { useEffect, useRef } from "react";
import { createChart, ColorType, ISeriesApi, LineData, LineSeries } from "lightweight-charts";

export default function RealtimeChart() {
  const chartContainer = useRef<HTMLDivElement | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      width: 600,
      height: 300,
      layout: { background: { type: ColorType.Solid, color: "#fff" }, textColor: "#000" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
      rightPriceScale: { borderColor: "#ccc" },
      timeScale: { borderColor: "#ccc" },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#2196f3",
      lineWidth: 2,
    }) as ISeriesApi<"Line">;

    lineSeriesRef.current = lineSeries;

    // 模拟实时数据
    const interval = setInterval(() => {
      const time = Math.floor(Date.now() / 1000);
      const value = Math.random() * 100;
      lineSeriesRef.current?.update({ time, value } as LineData);
    }, 1000);

    return () => {
      clearInterval(interval);
      chart.remove();
    };
  }, []);

  return <div ref={chartContainer} style={{ width: "600px", height: "300px" }} />;
}
