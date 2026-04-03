'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import ResultsTabs from '@/components/ResultsTabs';
import SettlementSection from '@/components/SettlementSection';
import { CalculationResult } from '@/types';
import { loadCalculationResult } from '@/lib/localStorage';
import { formatCents } from '@/lib/calculations';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const savedResult = loadCalculationResult();
    if (!savedResult) {
      // No calculation result found, redirect to home
      router.push('/');
      return;
    }
    setResult(savedResult);
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push('/');
  };

  return (
    <>
      <TopBar
        title="Results"
        showBackButton
        onBack={handleBack}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Results Tabs */}
        <ResultsTabs result={result} />
        
        {/* Settlement Section */}
        <SettlementSection 
          settlements={result.settlements} 
          payerId={result.payerId}
          personResults={result.personResults}
        />
        
        {/* Totals Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Totals
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCents(result.totalSubtotalCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCents(result.totalTaxCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tip</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCents(result.totalTipCents)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCents(result.grandTotalCents)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
      </main>
    </>
  );
}
