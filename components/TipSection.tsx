'use client';

import { TipMode } from '@/types';
import { formatCents, parseDollarsToCents } from '@/lib/calculations';

interface TipSectionProps {
  tipMode: TipMode;
  tipValue: number;
  onTipModeChange: (mode: TipMode) => void;
  onTipValueChange: (value: number) => void;
  subtotalCents: number;
}

export default function TipSection({
  tipMode,
  tipValue,
  onTipModeChange,
  onTipValueChange,
  subtotalCents,
}: TipSectionProps) {
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onTipModeChange('percentage');
    onTipValueChange(Math.max(0, Math.min(100, value)));
  };

  const handleFixedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cents = parseDollarsToCents(e.target.value);
    onTipModeChange('fixed');
    onTipValueChange(Math.max(0, cents));
  };

  // Calculate tip amount for display
  const tipAmountCents = tipMode === 'percentage'
    ? Math.round(subtotalCents * tipValue / 100)
    : tipValue;

  // Format fixed amount for display
  const fixedDisplay = tipMode === 'fixed' ? (tipValue / 100).toFixed(2) : '';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Tip
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Percentage input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Percentage
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={tipMode === 'percentage' ? tipValue : ''}
              onChange={handlePercentageChange}
              placeholder="0"
              className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              %
            </div>
          </div>
        </div>

        {/* Fixed amount input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fixed Amount
          </label>
          <div className="relative">
            <input
              type="text"
              value={tipMode === 'fixed' ? fixedDisplay : ''}
              onChange={handleFixedChange}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </div>
          </div>
        </div>
      </div>

      {/* Tip amount display */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Tip amount:
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCents(tipAmountCents)}
          </span>
        </div>
      </div>
    </div>
  );
}