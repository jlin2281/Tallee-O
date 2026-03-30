'use client';

import { useState, useEffect, useRef } from 'react';

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

// Mulberry32 PRNG implementation
function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export default function PayerSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  people,
}: PayerSelectionModalProps) {
  const [selectedPayerId, setSelectedPayerId] = useState<string>('');
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPayerId('');
      setShowWheel(false);
      setIsSpinning(false);
      setWinnerIndex(null);
      setRotation(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayerSelect = (personId: string) => {
    setSelectedPayerId(personId);
  };

  const handleSpinWheel = () => {
    if (isSpinning || people.length === 0) return;
    
    setIsSpinning(true);
    setWinnerIndex(null);
    
    // Generate random winner using mulberry32 PRNG
    const seed = Date.now() + spinCount;
    const rand = mulberry32(seed)();
    const newWinnerIndex = Math.floor(rand * people.length);
    
    // Calculate rotation: multiple full rotations + offset to land on winner
    const fullRotations = 5; // Number of full 360° rotations
    const segmentAngle = 360 / people.length;
    const targetRotation = fullRotations * 360 + (360 - newWinnerIndex * segmentAngle) - (0.5 * segmentAngle);
    
    // Animate the wheel
    setRotation(targetRotation);
    
    // Set winner after animation completes
    setTimeout(() => {
      setWinnerIndex(newWinnerIndex);
      setSelectedPayerId(people[newWinnerIndex].id);
      setIsSpinning(false);
      setSpinCount(prev => prev + 1);
    }, 3000); // 3 second animation
  };

  const handleBackFromWheel = () => {
    setShowWheel(false);
    setWinnerIndex(null);
    setRotation(0);
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

  // Generate conic gradient for wheel
  const generateWheelGradient = () => {
    if (people.length === 0) return '';
    
    const segmentAngle = 360 / people.length;
    let gradientString = '';
    
    for (let i = 0; i < people.length; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      gradientString += `${people[i].color} ${startAngle}deg ${endAngle}deg`;
      if (i < people.length - 1) {
        gradientString += ', ';
      }
    }
    
    return `conic-gradient(${gradientString})`;
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
                {showWheel ? '🎡 Settle-It Wheel' : 'Who is paying?'}
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

            {showWheel ? (
              /* Wheel View */
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Wheel Container */}
                <div className="relative">
                  {/* Wheel */}
                  <div
                    ref={wheelRef}
                    className="relative w-64 h-64 rounded-full overflow-hidden border-8 border-gray-300 dark:border-gray-600"
                    style={{
                      background: generateWheelGradient(),
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none',
                    }}
                  >
                    {/* Segment labels */}
                    {people.map((person, index) => {
                      const segmentAngle = 360 / people.length;
                      const midAngle = (index * segmentAngle) + (segmentAngle / 2);
                      const rad = (midAngle * Math.PI) / 180;
                      const labelX = 50 + 35 * Math.cos(rad);
                      const labelY = 50 + 35 * Math.sin(rad);
                      
                      return (
                        <div
                          key={person.id}
                          className="absolute text-white font-medium text-sm"
                          style={{
                            left: `${labelX}%`,
                            top: `${labelY}%`,
                            transform: 'translate(-50%, -50%)',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          {person.name}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
                  </div>
                </div>

                {/* Winner Display */}
                {winnerIndex !== null && (
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white animate-pulse">
                      🎉 Winner! 🎉
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: people[winnerIndex].color }}
                      />
                      <span className="text-xl font-semibold text-gray-900 dark:text-white">
                        {people[winnerIndex].name}
                      </span>
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      pays!
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {isSpinning ? 'Spinning...' : 'Click Spin to randomly select who pays!'}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-4">
                  {winnerIndex !== null ? (
                    <>
                      <button
                        onClick={handleSpinWheel}
                        disabled={isSpinning}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Spin Again
                      </button>
                      <button
                        onClick={handleBackFromWheel}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                      >
                        Back
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSpinWheel}
                        disabled={isSpinning || people.length === 0}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSpinning ? 'Spinning...' : 'Spin!'}
                      </button>
                      <button
                        onClick={handleBackFromWheel}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                      >
                        Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Payer Selection View */
              <>
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

                {/* Spin Wheel Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowWheel(true)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-3"
                  >
                    <span className="text-xl">🎡</span>
                    <span>Spin the Settle-It Wheel</span>
                  </button>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}