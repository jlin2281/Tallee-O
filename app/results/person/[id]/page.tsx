'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { CalculationResult, PersonResult } from '@/types';
import { loadCalculationResult } from '@/lib/localStorage';
import { formatCents } from '@/lib/calculations';

export default function PersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [personResult, setPersonResult] = useState<PersonResult | null>(null);

  useEffect(() => {
    const savedResult = loadCalculationResult();
    if (!savedResult) {
      router.push('/');
      return;
    }
    
    setResult(savedResult);
    
    const person = savedResult.personResults.find(
      p => p.personId === params.id
    );
    
    if (!person) {
      router.push('/results');
      return;
    }
    
    setPersonResult(person);
  }, [params.id, router]);

  const handleBack = () => {
    router.push('/results');
  };

  if (!result || !personResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopBar
        title={personResult.name}
        showBackButton
        onBack={handleBack}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Person Header */}
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded-full"
            style={{ backgroundColor: personResult.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {personResult.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed breakdown
            </p>
          </div>
        </div>

        {/* Item Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Item Breakdown
          </h2>
          
          {personResult.itemBreakdown.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No items assigned to this person.
            </div>
          ) : (
            <div className="space-y-3">
              {personResult.itemBreakdown.map(item => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCents(item.shareCents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Totals
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCents(personResult.subtotalCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCents(personResult.taxCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tip</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCents(personResult.tipCents)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCents(personResult.totalCents)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settlement Information */}
        {result.settlements.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Settlement
            </h2>
            <div className="space-y-3">
              {result.settlements
                .filter(t => t.fromPersonId === personResult.personId)
                .map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-red-600 dark:text-red-400">
                        Pays to
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: transaction.toColor }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {transaction.toName}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCents(transaction.amountCents)}
                    </span>
                  </div>
                ))}
              
              {result.settlements
                .filter(t => t.toPersonId === personResult.personId)
                .map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-green-600 dark:text-green-400">
                        Receives from
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: transaction.fromColor }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {transaction.fromName}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCents(transaction.amountCents)}
                    </span>
                  </div>
                ))}
              
              {result.settlements.filter(t => 
                t.fromPersonId === personResult.personId || 
                t.toPersonId === personResult.personId
              ).length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No settlement transactions for this person.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}