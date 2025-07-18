import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useGasStore } from '../store/gasStore';
import { ChainType } from '../types';
import { aggregateToCandles, getChainColor } from '../utils';
import { CANDLESTICK_INTERVAL } from '../constants';

interface GasChartProps {
  selectedChain: ChainType;
  height?: number;
}

export const GasChart: React.FC<GasChartProps> = ({ selectedChain, height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const { chains, mode } = useGasStore();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: '#e1e5e9' },
        horzLines: { color: '#e1e5e9' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#cccccc',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current) return;

    const chainData = chains[selectedChain];
    if (!chainData || chainData.history.length === 0) return;

    // Aggregate data to candlesticks
    const candles = aggregateToCandles(chainData.history, CANDLESTICK_INTERVAL);
    
    // Convert to lightweight-charts format
    const chartData = candles.map(candle => ({
      time: Math.floor(candle.time / 1000), // Convert to seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(chartData);
  }, [chains, selectedChain]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Gas Price Chart - {selectedChain.toUpperCase()}</h3>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getChainColor(selectedChain) }}
          />
          <span className="text-sm text-gray-600">
            {mode === 'live' ? 'Live Updates' : 'Simulation Mode'}
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
