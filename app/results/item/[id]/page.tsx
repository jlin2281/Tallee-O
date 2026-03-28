'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { CalculationResult, ItemResult, SplitMode } from '@/types';
import { loadCalculationResult } from '@/lib/localStorage';
import { formatCents } from '@/lib/calculations';

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [itemResult, setItemResult] = useState<ItemResult | null>(null);

  useEffect(() => {
    const savedResult = loadCalculationResult();
    if (!savedResult) {
      router.push('/');
      return;
    }
    
    setResult(savedResult);
    
    const item = savedResult.itemResults.find(
      i => i.itemId === params.id
    );
    
    if (!item) {
      router.push('/results');
      return;
    }
    
    setItemResult(item);
  }, [params.id, router]);

  const handleBack = () => {
    router.push('/results');
  };

  if (!result || !itemResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const getSplitModeLabel = (mode: SplitMode): string => {
    switch (mode) {
      case 'equal': return 'Equal';
      case 'exact': return 'Exact amounts';
      case 'percentage': return 'Percentage';
      default: return mode;
    }
  };

  return (
    <>
      <TopBar
        title={itemResult.name}
        showBackButton
        onBack={handleBack}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Item Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {itemResult.name}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatCents(itemResult.priceCents)}
            </div>
            {!itemResult.taxed && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                Not taxed
              </span>
            )}
          </div>
        </div>

        {/* Per Person Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Per Person Breakdown
          </h2>
          
          {itemResult.personShares.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No people assigned to this item.
            </div>
          ) : (
            <div className="space-y-3">
              {itemResult.personShares.map(share => (
                <div
                  key={share.personId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: share.color }}
                    />
                    <span className="text-gray-900 dark:text-white">
                      {share.name}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCents(share.shareCents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Split Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Split Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Split mode</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getSplitModeLabel(itemResult.splitMode)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total price</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCents(itemResult.priceCents)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Number of people</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {itemResult.personShares.length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax status</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {itemResult.taxed ? 'Taxed' : 'Not taxed'}
              </span>
            </div>
          </div>
        </div>

        {/* Share Calculations */}
        {itemResult.personShares.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Share Calculations
            </h2>
            <div className="space-y-2">
              {itemResult.splitMode === 'equal' && (
                <div className="text-gray-600 dark:text-gray-400">
                  Each person pays an equal share of the total price.
                </div>
              )}
              
              {itemResult.splitMode === 'exact' && (
                <div className="text-gray-600 dark:text-gray-400">
                  Each person pays the exact amount specified.
                </div>
              )}
              
              {itemResult.splitMode === 'percentage' && (
                <div className="text-gray-600 dark:text-gray-400">
                  Each person pays a percentage of the total price.
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total shares:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCents(
                      itemResult.personShares.reduce((sum, share) => sum + share.shareCents, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}