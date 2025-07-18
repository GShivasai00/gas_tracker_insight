import { create } from 'zustand';
import { GasStore, ChainType, GasPoint, ChainData } from '../types';
import { DEFAULT_GAS_LIMIT, GWEI_TO_ETH } from '../constants';

const initialChainData: ChainData = {
  baseFee: 0,
  priorityFee: 0,
  history: [],
  connected: false,
  lastUpdate: 0,
};

export const useGasStore = create<GasStore>((set, get) => ({
  mode: 'live',
  chains: {
    ethereum: { ...initialChainData },
    polygon: { ...initialChainData },
    arbitrum: { ...initialChainData },
  },
  usdPrice: 0,
  simulation: {
    input: {
      amount: '0.1',
      gasLimit: DEFAULT_GAS_LIMIT.toString(),
      chain: 'ethereum',
    },
    results: [],
  },

  setMode: (mode) => set({ mode }),

  updateChainData: (chain, data) =>
    set((state) => ({
      chains: {
        ...state.chains,
        [chain]: {
          ...state.chains[chain],
          ...data,
          lastUpdate: Date.now(),
        },
      },
    })),

  setUsdPrice: (price) => set({ usdPrice: price }),

  setSimulationInput: (input) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        input,
      },
    })),

  addGasPoint: (chain, point) =>
    set((state) => {
      const chainData = state.chains[chain];
      const newHistory = [...chainData.history, point];
      
      // Keep only last 100 points to prevent memory issues
      if (newHistory.length > 100) {
        newHistory.shift();
      }

      return {
        chains: {
          ...state.chains,
          [chain]: {
            ...chainData,
            history: newHistory,
            baseFee: point.baseFee,
            priorityFee: point.priorityFee,
          },
        },
      };
    }),

  calculateSimulation: () => {
    const state = get();
    const { input } = state.simulation;
    const { chains, usdPrice } = state;
    
    const gasLimit = parseInt(input.gasLimit) || DEFAULT_GAS_LIMIT;
    const results = [];

    for (const [chainName, chainData] of Object.entries(chains)) {
      const totalGasPrice = chainData.baseFee + chainData.priorityFee;
      const gasCostWei = totalGasPrice * gasLimit;
      const gasCostETH = gasCostWei * GWEI_TO_ETH;
      const gasCostUSD = gasCostETH * usdPrice;
      
      const transactionAmount = parseFloat(input.amount) || 0;
      const totalCostETH = gasCostETH + transactionAmount;
      const totalCostUSD = totalCostETH * usdPrice;

      results.push({
        chain: chainName as ChainType,
        gasCostETH,
        gasCostUSD,
        totalCostETH,
        totalCostUSD,
      });
    }

    set((state) => ({
      simulation: {
        ...state.simulation,
        results,
      },
    }));
  },
}));
