'use client';

import { ReceiptItem as ReceiptItemType, Person } from '@/types';
import { formatCents } from '@/lib/calculations';
import ReceiptItem from './ReceiptItem';

interface ReceiptListProps {
  items: ReceiptItemType[];
  people: Person[];
  onItemClick: (item: ReceiptItemType) => void;
  onAddItem: () => void;
}

export default function ReceiptList({
  items,
  people,
  onItemClick,
  onAddItem,
}: ReceiptListProps) {
  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);

  return (
    <div className="space-y-4">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Receipt Items
        </h2>
        <button
          onClick={onAddItem}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          + Add Item
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              No items yet. Add an item to get started.
            </p>
          </div>
        ) : (
          items.map(item => (
            <ReceiptItem
              key={item.id}
              item={item}
              people={people}
              onClick={() => onItemClick(item)}
            />
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {items.length} {items.length === 1 ? 'item' : 'items'} · Total:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCents(totalCents)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}