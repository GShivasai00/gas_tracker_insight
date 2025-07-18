import React, { useState, useEffect } from 'react';
import { GasWidget } from './GasWidget';
import { GasChart } from './GasChart';
import { SimulationPanel } from './SimulationPanel';
import { useGasStore } from '../store/gasStore';
import { GasService } from '../services/gasService';
import { ChainType } from '../types';

export const Dashboard: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState<ChainType>('ethereum');
  const [gasService, setGasService] = useState<GasService | null>(null);
  
  const { 
    mode, 
    setMode, 
    updateChainData, 
    setUsdPrice, 
    addGasPoint,
    usdPrice 
  } = useGasStore();

  useEffect(() => {
    // Initialize gas service
    const service = new GasService(
      updateChainData,
      setUsdPrice,
      addGasPoint
    );
    
    setGasService(service);
    service.startRealTimeUpdates();

    return () => {
      service.stopRealTimeUpdates();
    };
  }, [updateChainData, setUsdPrice, addGasPoint]);

  const toggleMode = () => {
    setMode(mode === 'live' ? 'simulation' : 'live');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cross-Chain Gas Tracker
              </h1>
              <p className="text-gray-600">
                Real-time gas prices across Ethereum, Polygon, and Arbitrum
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-sm text-gray-600">ETH/USD: </span>
                <span className="font-semibold text-green-600">
                  ${usdPrice.toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={toggleMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'live'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {mode === 'live' ? '🔴 Live Mode' : '🔧 Simulation Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Gas Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GasWidget chain="ethereum" />
          <GasWidget chain="polygon" />
          <GasWidget chain="arbitrum" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <div className="mb-4">
              <div className="flex space-x-2">
                {(['ethereum', 'polygon', 'arbitrum'] as ChainType[]).map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setSelectedChain(chain)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedChain === chain
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chain.charAt(0).toUpperCase() + chain.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <GasChart selectedChain={selectedChain} height={400} />
          </div>

          {/* Simulation Panel */}
          <div className="xl:col-span-1">
            {mode === 'simulation' ? (
              <SimulationPanel />
            ) : (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Live Statistics</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Average Gas Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {/* Calculate average across all chains */}
                      Loading...
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Cheapest Chain</p>
                    <p className="text-xl font-semibold text-green-600">
                      Calculating...
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Most Expensive Chain</p>
                    <p className="text-xl font-semibold text-red-600">
                      Calculating...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Real-time data from native RPC endpoints • USD prices from Uniswap V3 • 
            Updates every 6 seconds
          </p>
        </div>
      </div>
    </div>
  );
};
