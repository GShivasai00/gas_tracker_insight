import { GWEI_TO_ETH, USDC_DECIMALS } from '../constants';

export const formatGwei = (wei: number): string => {
  return (wei / 1e9).toFixed(2);
};

export const formatEth = (wei: number): string => {
  return (wei * GWEI_TO_ETH).toFixed(6);
};

export const formatUsd = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateEthUsdPrice = (sqrtPriceX96: bigint): number => {
  // Convert sqrtPriceX96 to actual price
  // Price = (sqrtPriceX96^2 * 10^12) / (2^192)
  // Since USDC has 6 decimals and ETH has 18, we need to adjust
  const Q96 = BigInt(2) ** BigInt(96);
  const price = (sqrtPriceX96 * sqrtPriceX96 * BigInt(10 ** USDC_DECIMALS)) / (Q96 * Q96);
  return Number(price) / 1e18;
};

export const aggregateToCandles = (history: any[], interval: number) => {
  const candles = [];
  const sortedHistory = history.sort((a, b) => a.time - b.time);
  
  if (sortedHistory.length === 0) return candles;
  
  let currentCandle = {
    time: Math.floor(sortedHistory[0].time / interval) * interval,
    open: sortedHistory[0].close,
    high: sortedHistory[0].close,
    low: sortedHistory[0].close,
    close: sortedHistory[0].close,
  };
  
  for (const point of sortedHistory) {
    const candleTime = Math.floor(point.time / interval) * interval;
    
    if (candleTime === currentCandle.time) {
      currentCandle.high = Math.max(currentCandle.high, point.close);
      currentCandle.low = Math.min(currentCandle.low, point.close);
      currentCandle.close = point.close;
    } else {
      candles.push(currentCandle);
      currentCandle = {
        time: candleTime,
        open: point.close,
        high: point.close,
        low: point.close,
        close: point.close,
      };
    }
  }
  
  candles.push(currentCandle);
  return candles;
};

export const getChainColor = (chain: string): string => {
  const colors = {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    arbitrum: '#28A0F0',
  };
  return colors[chain as keyof typeof colors] || '#666666';
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
