'use client';

import { useState, useEffect } from 'react';

interface Person {
  id: string;
  name: string;
  color: string;
}

interface PayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payerId: string) => void;
  people: Person[];
}

export default function PayerSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  people,
}: PayerSelectionModalProps) {
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedPayerId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayerSelect = (personId: string) => {
    setSelectedPayerId(personId);
  };

  const handleConfirm = () => {
    if (selectedPayerId) {
      onConfirm(selectedPayerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Who is paying?
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* People List */}
            <div className="space-y-3">
              {people.map(person => (
                <div
                  key={person.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedPayerId === person.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                  onClick={() => handlePayerSelect(person.id)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: person.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {person.name || `Person ${people.indexOf(person) + 1}`}
                  </span>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedPayerId === person.id
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {selectedPayerId === person.id && (
                        <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedPayerId}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}