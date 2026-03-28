'use client';

import { useState, useEffect, useRef } from 'react';

interface Person {
  id: string;
  name: string;
  color: string;
}

interface SettleItWheelProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
}

// Simple seeded PRNG for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

export default function SettleItWheel({ isOpen, onClose, people }: SettleItWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Person | null>(null);
  const [rotation, setRotation] = useState(0);
  const [seed, setSeed] = useState(Date.now());
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setWinner(null);
      setRotation(0);
      setIsSpinning(false);
      setSeed(Date.now());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const segmentAngle = 360 / people.length;
  const spinDuration = 3000; // 3 seconds

  const spinWheel = () => {
    if (isSpinning || people.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Generate a random winner using seeded PRNG
    const random = new SeededRandom(seed);
    const winnerIndex = Math.floor(random.next() * people.length);
    const newWinner = people[winnerIndex];
    
    // Calculate rotation: multiple full rotations + offset to land on winner
    const fullRotations = 5; // Number of full 360° rotations
    const targetRotation = fullRotations * 360 + (360 - winnerIndex * segmentAngle);
    
    // Animate the wheel
    setRotation(targetRotation);
    
    // Set winner after animation completes
    setTimeout(() => {
      setWinner(newWinner);
      setIsSpinning(false);
      // Update seed for next spin
      setSeed(Date.now());
    }, spinDuration);
  };

  const spinAgain = () => {
    setWinner(null);
    setRotation(0);
    setSeed(Date.now());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === ' ' && !isSpinning) {
      spinWheel();
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
                🎡 Settle-It Wheel
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

            {/* Wheel Container */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className="relative w-64 h-64 rounded-full overflow-hidden border-8 border-gray-300 dark:border-gray-600"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.3, 1)` : 'none',
                  }}
                >
                  {people.map((person, index) => {
                    const angle = index * segmentAngle;
                    const midAngle = angle + segmentAngle / 2;
                    const rad = (midAngle * Math.PI) / 180;
                    const labelX = 50 + 40 * Math.cos(rad);
                    const labelY = 50 + 40 * Math.sin(rad);
                    
                    return (
                      <div
                        key={person.id}
                        className="absolute inset-0 origin-center"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(segmentAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(segmentAngle * Math.PI / 180)}%)`,
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: person.color }}
                        />
                        <div
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
              {winner && (
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white animate-pulse">
                    🎉 Winner! 🎉
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: winner.color }}
                    />
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {winner.name}
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
                {winner ? (
                  <>
                    <button
                      onClick={spinAgain}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Spin Again
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={spinWheel}
                      disabled={isSpinning || people.length === 0}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSpinning ? 'Spinning...' : 'Spin!'}
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}