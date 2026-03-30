'use client';

import { SettlementTransaction, PersonResult } from '@/types';
import { formatCents } from '@/lib/calculations';

interface SettlementSectionProps {
  settlements: SettlementTransaction[];
  payerId?: string;
  personResults: PersonResult[];
}

export default function SettlementSection({ 
  settlements, 
  payerId, 
  personResults 
}: SettlementSectionProps) {
  // If payer is selected, show payer-based settlement
  if (payerId) {
    const payer = personResults.find(p => p.personId === payerId);
    
    if (!payer) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Settlement
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Payer information not found.
            </p>
          </div>
        </div>
      );
    }
    
    // If only one person, no settlements needed
    if (personResults.length === 1) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Settlement
          </h3>
          <div className="text-center py-8">
            <div className="text-green-500 dark:text-green-400 text-4xl mb-4">✓</div>
            <p className="text-gray-600 dark:text-gray-400">
              No settlements needed (only one person)
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Settlement
        </h3>
        
        {/* Payer info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: payer.color }}
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {payer.name} paid for everyone
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {formatCents(payer.totalCents)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Settlements */}
        {settlements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-500 dark:text-green-400 text-4xl mb-4">✓</div>
            <p className="text-gray-600 dark:text-gray-400">
              Everyone is settled up!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {settlements.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#374151] rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: transaction.fromColor }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {transaction.fromName}
                    </span>
                  </div>
                  
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: transaction.toColor }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {transaction.toName}
                    </span>
                  </div>
                </div>
                
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatCents(transaction.amountCents)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total transactions:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {settlements.length}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  // Original debt minimization settlements
  if (settlements.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Settlement
        </h3>
        <div className="text-center py-8">
          <div className="text-green-500 dark:text-green-400 text-4xl mb-4">✓</div>
          <p className="text-gray-600 dark:text-gray-400">
            Everyone is settled up!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Settlement
      </h3>
      <div className="space-y-4">
        {settlements.map((transaction, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#374151] rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: transaction.fromColor }}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {transaction.fromName}
                </span>
              </div>
              
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: transaction.toColor }}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {transaction.toName}
                </span>
              </div>
            </div>
            
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCents(transaction.amountCents)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total transactions:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {settlements.length}
          </span>
        </div>
      </div>
    </div>
  );
}