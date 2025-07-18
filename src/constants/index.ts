import { ChainConfig } from '../types';

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    wsUrl: 'wss://eth-mainnet.g.alchemy.com/v2/demo',
    currency: 'ETH',
    color: '#627EEA',
    icon: '⟠'
  },
  polygon: {
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    wsUrl: 'wss://polygon-rpc.com',
    currency: 'MATIC',
    color: '#8247E5',
    icon: '◢'
  },
  arbitrum: {
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    wsUrl: 'wss://arb1.arbitrum.io/ws',
    currency: 'ETH',
    color: '#28A0F0',
    icon: '◉'
  }
};

export const UNISWAP_V3_POOL_ADDRESS = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';
export const UNISWAP_V3_POOL_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'
];

export const REFRESH_INTERVAL = 6000; // 6 seconds
export const CANDLESTICK_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds

export const DEFAULT_GAS_LIMIT = 21000;
export const GWEI_TO_ETH = 1e-9;
export const USDC_DECIMALS = 6;
