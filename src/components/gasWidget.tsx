import React from 'react';
import { ChainType } from '../types';
import { useGasStore } from '../store/gasStore';
import { formatGwei, formatUsd } from '../utils';
import { CHAINS } from '../constants';

interface GasWidgetProps {
  chain: ChainType;
}

export const GasWidget: React.FC<GasWidgetProps> = ({ chain }) => {
  const { chains, usdPrice } = useGasStore();
  const chainData = chains[chain];
  const chainConfig = CHAINS[chain];

  const totalGasPrice = chainData.baseFee + chainData.priorityFee;
  const gasCostUSD = (totalGasPrice * 21000 * 1e-9) * usdPrice;

  return (
    <div className={`gas-widget chain-${chain}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{chainConfig.icon}</span>
          <div>
            <h3 className="font-semibold text-lg">{chainConfig.name}</h3>
            <p className="text-sm text-gray-600">{chainConfig.currency}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              chainData.connected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-500">
            {chainData.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Base Fee</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatGwei(chainData.baseFee)} Gwei
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Priority Fee</p>
          <p className="text-lg font-semibold text-purple-600">
            {formatGwei(chainData.priorityFee)} Gwei
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">Standard Transfer (21K gas)</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">
            {formatGwei(totalGasPrice)} Gwei
          </span>
          <span className="text-lg font-semibold text-green-600">
            {formatUsd(gasCostUSD)}
          </span>
        </div>
      </div>

      {chainData.lastUpdate > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {new Date(chainData.lastUpdate).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
