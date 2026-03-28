'use client';

import { ReceiptItem as ReceiptItemType, Person } from '@/types';
import { formatCents } from '@/lib/calculations';

interface ReceiptItemProps {
  item: ReceiptItemType;
  people: Person[];
  onClick: () => void;
}

export default function ReceiptItem({ item, people, onClick }: ReceiptItemProps) {
  // Find which people are assigned to this item
  const assignedPersonIds = item.allocations.map(a => a.personId);
  const assignedPeople = people.filter(p => assignedPersonIds.includes(p.id));

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <div className="flex items-center justify-between">
        {/* Left: Item name */}
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {item.name}
            </span>
            {!item.taxed && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Not taxed
              </span>
            )}
          </div>
        </div>
        
        {/* Middle: Assigned people dots */}
        <div className="flex items-center space-x-1 mx-4">
          {assignedPeople.map(person => (
            <div
              key={person.id}
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: person.color }}
              title={person.name}
              aria-label={`Assigned to ${person.name}`}
            />
          ))}
          {assignedPeople.length === 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              Unassigned
            </span>
          )}
        </div>
        
        {/* Right: Price */}
        <div className="font-semibold text-gray-900 dark:text-white">
          {formatCents(item.priceCents)}
        </div>
      </div>
    </button>
  );
}