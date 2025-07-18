import { ethers } from 'ethers';
import { ChainType, GasPoint } from '../types';
import { CHAINS, REFRESH_INTERVAL, UNISWAP_V3_POOL_ADDRESS, UNISWAP_V3_POOL_ABI } from '../constants';
import { calculateEthUsdPrice } from '../utils';

export class GasService {
  private providers: Record<ChainType, ethers.JsonRpcProvider> = {} as any;
  private wsProviders: Record<ChainType, ethers.WebSocketProvider> = {} as any;
  private intervals: Record<ChainType, NodeJS.Timeout> = {} as any;
  private uniswapProvider: ethers.JsonRpcProvider;
  private uniswapContract: ethers.Contract;

  constructor(
    private onGasUpdate: (chain: ChainType, data: Partial<any>) => void,
    private onPriceUpdate: (price: number) => void,
    private onGasPoint: (chain: ChainType, point: GasPoint) => void
  ) {
    this.initializeProviders();
    this.initializeUniswap();
  }

  private initializeProviders() {
    Object.entries(CHAINS).forEach(([chain, config]) => {
      try {
        this.providers[chain as ChainType] = new ethers.JsonRpcProvider(config.rpcUrl);
        
        // Initialize WebSocket providers for real-time updates
        try {
          this.wsProviders[chain as ChainType] = new ethers.WebSocketProvider(config.wsUrl);
        } catch (error) {
          console.warn(`WebSocket not available for ${chain}, using HTTP polling`);
        }
      } catch (error) {
        console.error(`Failed to initialize provider for ${chain}:`, error);
      }
    });
  }

  private initializeUniswap() {
    this.uniswapProvider = new ethers.JsonRpcProvider(CHAINS.ethereum.rpcUrl);
    this.uniswapContract = new ethers.Contract(
      UNISWAP_V3_POOL_ADDRESS,
      UNISWAP_V3_POOL_ABI,
      this.uniswapProvider
    );
  }

  async startRealTimeUpdates() {
    // Start gas price monitoring for each chain
    Object.keys(CHAINS).forEach(chain => {
      this.startChainMonitoring(chain as ChainType);
    });

    // Start USD price monitoring
    this.startUsdPriceMonitoring();
  }

  private async startChainMonitoring(chain: ChainType) {
    const provider = this.providers[chain];
    const wsProvider = this.wsProviders[chain];

    if (!provider) return;

    // Initial fetch
    await this.fetchGasData(chain);

    // Set up WebSocket listeners if available
    if (wsProvider) {
      try {
        wsProvider.on('block', async (blockNumber) => {
          await this.fetchGasData(chain, blockNumber);
        });
        
        this.onGasUpdate(chain, { connected: true });
      } catch (error) {
        console.warn(`WebSocket failed for ${chain}, falling back to polling`);
        this.startPolling(chain);
      }
    } else {
      this.startPolling(chain);
    }
  }

  private startPolling(chain: ChainType) {
    this.intervals[chain] = setInterval(() => {
      this.fetchGasData(chain);
    }, REFRESH_INTERVAL);
  }

  private async fetchGasData(chain: ChainType, blockNumber?: number) {
    const provider = this.providers[chain];
    if (!provider) return;

    try {
      const block = blockNumber 
        ? await provider.getBlock(blockNumber)
        : await provider.getBlock('latest');
      
      if (!block) return;

      const baseFee = block.baseFeePerGas ? Number(block.baseFeePerGas) / 1e9 : 0;
      
      // Estimate priority fee (this is a simplified approach)
      const feeData = await provider.getFeeData();
      const priorityFee = feeData.maxPriorityFeePerGas ? Number(feeData.maxPriorityFeePerGas) / 1e9 : 2;

      const totalGasPrice = baseFee + priorityFee;
      const timestamp = Date.now();

      // Update store
      this.onGasUpdate(chain, {
        baseFee,
        priorityFee,
        connected: true,
      });

      // Add to history
      const gasPoint: GasPoint = {
        time: timestamp,
        open: totalGasPrice,
        high: totalGasPrice,
        low: totalGasPrice,
        close: totalGasPrice,
        baseFee,
        priorityFee,
      };

      this.onGasPoint(chain, gasPoint);

    } catch (error) {
      console.error(`Error fetching gas data for ${chain}:`, error);
      this.onGasUpdate(chain, { connected: false });
    }
  }

  private async startUsdPriceMonitoring() {
    // Initial fetch
    await this.fetchUsdPrice();

    // Set up event listener for Uniswap swaps
    try {
      this.uniswapContract.on('Swap', (
        sender,
        recipient,
        amount0,
        amount1,
        sqrtPriceX96,
        liquidity,
        tick
      ) => {
        try {
          const price = calculateEthUsdPrice(sqrtPriceX96);
          this.onPriceUpdate(price);
        } catch (error) {
          console.error('Error calculating USD price from swap:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up Uniswap listener:', error);
      // Fallback to periodic updates
      setInterval(() => this.fetchUsdPrice(), 30000);
    }
  }

  private async fetchUsdPrice() {
    try {
      // Get slot0 from Uniswap V3 pool to get current price
      const slot0 = await this.uniswapProvider.call({
        to: UNISWAP_V3_POOL_ADDRESS,
        data: '0x3850c7bd' // slot0() function selector
      });

      if (slot0) {
        // Parse the sqrtPriceX96 from slot0 response
        const sqrtPriceX96 = BigInt('0x' + slot0.slice(2, 66));
        const price = calculateEthUsdPrice(sqrtPriceX96);
        this.onPriceUpdate(price);
      }
    } catch (error) {
      console.error('Error fetching USD price:', error);
      // Fallback price
      this.onPriceUpdate(2000);
    }
  }

  stopRealTimeUpdates() {
    // Clear intervals
    Object.values(this.intervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });

    // Close WebSocket connections
    Object.values(this.wsProviders).forEach(provider => {
      if (provider) {
        try {
          provider.destroy();
        } catch (error) {
          console.warn('Error closing WebSocket provider:', error);
        }
      }
    });

    // Remove Uniswap listeners
    try {
      this.uniswapContract.removeAllListeners();
    } catch (error) {
      console.warn('Error removing Uniswap listeners:', error);
    }
  }
}
