'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReceiptItem, Person, SplitMode, ItemAllocation } from '@/types';
import { parseDollarsToCents } from '@/lib/calculations';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ReceiptItem) => void;
  onDelete?: () => void;
  item?: ReceiptItem | null;
  people: Person[];
  onAddPerson: (name: string) => void;
}

export default function AddItemModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  item,
  people,
  onAddPerson,
}: AddItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [taxed, setTaxed] = useState(true);
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [newPersonName, setNewPersonName] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'%' | '$'>('%');
  const [discountValue, setDiscountValue] = useState('');

  // Initialize form when item changes or modal opens
  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice((item.priceCents / 100).toFixed(2));
      setTaxed(item.taxed);
      
      const selected = new Set(item.allocations.map(a => a.personId));
      setSelectedPeople(selected);
      
      if (item.allocations.length > 0) {
        setSplitMode(item.allocations[0].mode);
        
        // Initialize exact amounts and percentages
        const exact: Record<string, string> = {};
        const perc: Record<string, string> = {};
        
        item.allocations.forEach(alloc => {
          if (alloc.mode === 'exact') {
            exact[alloc.personId] = (alloc.value / 100).toFixed(2);
          } else if (alloc.mode === 'percentage') {
            perc[alloc.personId] = alloc.value.toString();
          }
        });
        
        setExactAmounts(exact);
        setPercentages(perc);
      }
      
      // Initialize discount
      if (item.discountType && item.discountValue !== undefined) {
        setHasDiscount(true);
        setDiscountType(item.discountType);
        setDiscountValue(item.discountType === '%' ? item.discountValue.toString() : (item.discountValue / 100).toFixed(2));
      } else {
        setHasDiscount(false);
        setDiscountType('%');
        setDiscountValue('');
      }
    } else {
      // Reset form for new item
      setName('');
      setPrice('');
      setTaxed(true);
      setSelectedPeople(new Set());
      setSplitMode('equal');
      setExactAmounts({});
      setPercentages({});
      setNewPersonName('');
      setHasDiscount(false);
      setDiscountType('%');
      setDiscountValue('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handlePersonToggle = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const handleExactAmountChange = (personId: string, value: string) => {
    setExactAmounts(prev => ({
      ...prev,
      [personId]: value,
    }));
  };

  const handlePercentageChange = (personId: string, value: string) => {
    setPercentages(prev => ({
      ...prev,
      [personId]: value,
    }));
  };

  const handleAddNewPerson = () => {
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      // Note: The new person will be added to the people list by the parent
      // We'll clear the input field and the parent will re-render with updated people
      setNewPersonName('');
    }
  };

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return 'Item name is required.';
    }
    
    const priceCents = parseDollarsToCents(price);
    if (priceCents <= 0) {
      return 'Price must be greater than 0.';
    }
    
    if (selectedPeople.size === 0) {
      return 'At least one person must be assigned.';
    }
    
    // Validate exact amounts
    if (splitMode === 'exact') {
      const totalExact = Array.from(selectedPeople).reduce((sum, personId) => {
        const amount = exactAmounts[personId] || '0';
        return sum + parseDollarsToCents(amount);
      }, 0);
      
      if (totalExact !== priceCents) {
        return `Exact amounts must sum to $${(priceCents / 100).toFixed(2)}. Current sum: $${(totalExact / 100).toFixed(2)}`;
      }
    }
    
    // Validate percentages
    if (splitMode === 'percentage') {
      const totalPercent = Array.from(selectedPeople).reduce((sum, personId) => {
        const percent = parseInt(percentages[personId] || '0');
        return sum + percent;
      }, 0);
      
      if (totalPercent !== 100) {
        return `Percentages must sum to 100%. Current sum: ${totalPercent}%`;
      }
    }
    
    // Validate discount
    if (hasDiscount && discountValue.trim()) {
      if (discountType === '%') {
        const percent = parseFloat(discountValue);
        if (isNaN(percent) || percent < 0 || percent > 100) {
          return 'Percentage discount must be between 0 and 100.';
        }
      } else { // '$'
        const dollarDiscount = parseDollarsToCents(discountValue);
        if (dollarDiscount < 0 || dollarDiscount > priceCents) {
          return 'Dollar discount must be between 0 and the item price.';
        }
      }
    }
    
    return null;
  };

  const handleSave = () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    
    const priceCents = parseDollarsToCents(price);
    const allocations: ItemAllocation[] = [];
    
    Array.from(selectedPeople).forEach(personId => {
      if (splitMode === 'equal') {
        allocations.push({
          personId,
          mode: 'equal',
          value: 0, // Not used for equal mode
        });
      } else if (splitMode === 'exact') {
        const amount = exactAmounts[personId] || '0';
        allocations.push({
          personId,
          mode: 'exact',
          value: parseDollarsToCents(amount),
        });
      } else if (splitMode === 'percentage') {
        const percent = parseInt(percentages[personId] || '0');
        allocations.push({
          personId,
          mode: 'percentage',
          value: percent,
        });
      }
    });
    
    const newItem: ReceiptItem = {
      id: item?.id || uuidv4(),
      name: name.trim(),
      priceCents,
      taxed,
      allocations,
    };
    
    // Add discount if applicable
    if (hasDiscount && discountValue.trim()) {
      if (discountType === '%') {
        newItem.discountType = '%';
        newItem.discountValue = parseFloat(discountValue);
      } else { // '$'
        newItem.discountType = '$';
        newItem.discountValue = parseDollarsToCents(discountValue);
      }
    }
    
    onSave(newItem);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
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
                {item ? 'Edit Item' : 'Add Item'}
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

            {/* Item Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Item name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Pizza, Salad, Drink"
                autoFocus
              />
            </div>

            {/* Price and Tax */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    $
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax
                </label>
                <div className="flex items-center h-10">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!taxed}
                      onChange={e => setTaxed(!e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Item not taxed
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Discount Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={e => setHasDiscount(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Add discount
                  </span>
                </label>
              </div>
              
              {hasDiscount && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Discount type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDiscountType('%')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          discountType === '%'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Percentage (%)
                      </button>
                      <button
                        onClick={() => setDiscountType('$')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          discountType === '$'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Dollar ($)
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Discount value
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={discountValue}
                        onChange={e => setDiscountValue(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={discountType === '%' ? "0" : "0.00"}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        {discountType === '%' ? '%' : '$'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Assign to People */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assign to
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPeople.size === people.length && people.length > 0}
                    onChange={() => {
                      if (selectedPeople.size === people.length) {
                        // Clear all selections
                        setSelectedPeople(new Set());
                      } else {
                        // Select all people
                        const allPersonIds = new Set(people.map(p => p.id));
                        setSelectedPeople(allPersonIds);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Assign all people
                  </span>
                </label>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg divide-y divide-gray-300 dark:divide-gray-600">
                {people.map(person => (
                  <div key={person.id} className="flex items-center p-3">
                    <input
                      type="checkbox"
                      checked={selectedPeople.has(person.id)}
                      onChange={() => handlePersonToggle(person.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      id={`person-${person.id}`}
                    />
                    <label
                      htmlFor={`person-${person.id}`}
                      className="flex items-center space-x-3 ml-3 cursor-pointer flex-grow"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: person.color }}
                      />
                      <span className="text-gray-900 dark:text-white">
                        {person.name || `Person ${people.indexOf(person) + 1}`}
                      </span>
                    </label>
                    
                    {/* Exact amount input */}
                    {splitMode === 'exact' && selectedPeople.has(person.id) && (
                      <div className="relative w-32">
                        <input
                          type="text"
                          value={exactAmounts[person.id] || ''}
                          onChange={e => handleExactAmountChange(person.id, e.target.value)}
                          className="w-full pl-6 pr-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
                          $
                        </div>
                      </div>
                    )}
                    
                    {/* Percentage input */}
                    {splitMode === 'percentage' && selectedPeople.has(person.id) && (
                      <div className="relative w-24">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={percentages[person.id] || ''}
                          onChange={e => handlePercentageChange(person.id, e.target.value)}
                          className="w-full pl-8 pr-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
                          %
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add new person */}
                <div className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <input
                      type="text"
                      value={newPersonName}
                      onChange={e => setNewPersonName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddNewPerson()}
                      className="flex-grow px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add new person..."
                    />
                    <button
                      onClick={handleAddNewPerson}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Mode (only show if multiple people selected) */}
            {selectedPeople.size > 1 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Split mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['equal', 'exact', 'percentage'] as SplitMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSplitMode(mode)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        splitMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete Item
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  {item ? 'Save Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}