export interface GasPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  baseFee: number;
  priorityFee: number;
}

export interface ChainData {
  baseFee: number;
  priorityFee: number;
  history: GasPoint[];
  connected: boolean;
  lastUpdate: number;
}

export interface SimulationInput {
  amount: string;
  gasLimit: string;
  chain: ChainType;
}

export interface SimulationResult {
  chain: ChainType;
  gasCostETH: number;
  gasCostUSD: number;
  totalCostETH: number;
  totalCostUSD: number;
}

export type ChainType = 'ethereum' | 'polygon' | 'arbitrum';
export type AppMode = 'live' | 'simulation';

export interface GasStore {
  mode: AppMode;
  chains: Record<ChainType, ChainData>;
  usdPrice: number;
  simulation: {
    input: SimulationInput;
    results: SimulationResult[];
  };
  setMode: (mode: AppMode) => void;
  updateChainData: (chain: ChainType, data: Partial<ChainData>) => void;
  setUsdPrice: (price: number) => void;
  setSimulationInput: (input: SimulationInput) => void;
  addGasPoint: (chain: ChainType, point: GasPoint) => void;
  calculateSimulation: () => void;
}

export interface ChainConfig {
  name: string;
  rpcUrl: string;
  wsUrl: string;
  currency: string;
  color: string;
  icon: string;
}

export interface UniswapSwapEvent {
  sender: string;
  recipient: string;
  amount0: bigint;
  amount1: bigint;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
}
