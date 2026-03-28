'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalculationResult } from '@/types';
import { formatCents } from '@/lib/calculations';

interface ResultsTabsProps {
  result: CalculationResult;
}

export default function ResultsTabs({ result }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<'person' | 'item'>('person');
  const router = useRouter();

  const handlePersonClick = (personId: string) => {
    router.push(`/results/person/${personId}`);
  };

  const handleItemClick = (itemId: string) => {
    router.push(`/results/item/${itemId}`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('person')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'person'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Per Person
          </button>
          <button
            onClick={() => setActiveTab('item')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'item'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Per Item
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'person' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Per Person Breakdown
          </h3>
          <div className="space-y-3">
            {result.personResults.map(person => (
              <button
                key={person.personId}
                onClick={() => handlePersonClick(person.personId)}
                className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: person.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {person.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCents(person.totalCents)}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Per Item Breakdown
          </h3>
          <div className="space-y-3">
            {result.itemResults.map(item => (
              <button
                key={item.itemId}
                onClick={() => handleItemClick(item.itemId)}
                className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                    <div className="flex items-center space-x-1">
                      {item.personShares.map(share => (
                        <div
                          key={share.personId}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: share.color }}
                          title={share.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCents(item.priceCents)}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}