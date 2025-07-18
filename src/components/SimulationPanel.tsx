import React, { useEffect } from 'react';
import { useGasStore } from '../store/gasStore';
import { formatUsd } from '../utils';
import { CHAINS } from '../constants';
import { ChainType } from '../types';

export const SimulationPanel: React.FC = () => {
  const { 
    simulation, 
    setSimulationInput, 
    calculateSimulation, 
    usdPrice 
  } = useGasStore();

  const { input, results } = simulation;

  useEffect(() => {
    calculateSimulation();
  }, [input, calculateSimulation]);

  const handleInputChange = (field: string, value: string) => {
    setSimulationInput({
      ...input,
      [field]: value,
    });
  };

  const handleChainChange = (chain: ChainType) => {
    setSimulationInput({
      ...input,
      chain,
    });
  };

  const sortedResults = [...results].sort((a, b) => a.totalCostUSD - b.totalCostUSD);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Transaction Simulation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({CHAINS[input.chain].currency})
          </label>
          <input
            type="number"
            value={input.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.1"
            step="0.001"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gas Limit
          </label>
          <input
            type="number"
            value={input.gasLimit}
            onChange={(e) => handleInputChange('gasLimit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="21000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Chain
          </label>
          <select
            value={input.chain}
            onChange={(e) => handleChainChange(e.target.value as ChainType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(CHAINS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Current ETH/USD Price: <span className="font-semibold">{formatUsd(usdPrice)}</span>
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-semibold">Cross-Chain Cost Comparison</h4>
        
        {sortedResults.map((result, index) => {
          const chainConfig = CHAINS[result.chain];
          const isOptimal = index === 0;
          
          return (
            <div
              key={result.chain}
              className={`p-4 rounded-lg border-2 ${
                isOptimal 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{chainConfig.icon}</span>
                  <span className="font-semibold">{chainConfig.name}</span>
                  {isOptimal && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      Cheapest
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatUsd(result.totalCostUSD)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {result.totalCostETH.toFixed(6)} {chainConfig.currency}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Gas Cost</p>
                  <p className="font-semibold">
                    {formatUsd(result.gasCostUSD)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Transaction Value</p>
                  <p className="font-semibold">
                    {formatUsd((parseFloat(input.amount) || 0) * usdPrice)}
                  </p>
                </div>
              </div>
              
              {!isOptimal && sortedResults[0] && (
                <div className="mt-2 text-sm text-red-600">
                  +{formatUsd(result.totalCostUSD - sortedResults[0].totalCostUSD)} more expensive
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
