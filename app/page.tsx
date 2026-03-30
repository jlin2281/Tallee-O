'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import MobileDrawer from '@/components/MobileDrawer';
import PersonField from '@/components/PersonField';
import ReceiptList from '@/components/ReceiptList';
import TipSection from '@/components/TipSection';
import AddItemModal from '@/components/AddItemModal';
import PayerSelectionModal from '@/components/PayerSelectionModal';
import { SplitSession, ReceiptItem, Person, SplitMode } from '@/types';
import { getNextColor } from '@/lib/colors';
import { saveSession, loadSession, saveCalculationResult } from '@/lib/localStorage';
import { calculateSplit } from '@/lib/calculations';

export default function HomePage() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isPayerModalOpen, setIsPayerModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReceiptItem | null>(null);
  
  // Initial session state - empty to avoid hydration mismatch
  const [session, setSession] = useState<SplitSession>({
    people: [],
    items: [],
    taxRatePercent: 8,
    tipMode: 'percentage',
    tipValue: 0,
    tipSplitMode: 'equal',
    taxSplitMode: 'proportional',
  });

  // Load session from localStorage on mount (client-side only)
  useEffect(() => {
    const savedSession = loadSession();
    if (savedSession) {
      setSession(savedSession);
    } else {
      // Initialize with one empty person only on client side
      setSession({
        people: [{ id: uuidv4(), name: '', color: getNextColor([]) }],
        items: [],
        taxRatePercent: 8,
        tipMode: 'percentage',
        tipValue: 0,
        tipSplitMode: 'equal',
        taxSplitMode: 'proportional',
      });
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    saveSession(session);
  }, [session]);

  // People management
  const addPerson = (name?: string) => {
    const usedColors = session.people.map(p => p.color);
    const newPerson: Person = {
      id: uuidv4(),
      name: name || '',
      color: getNextColor(usedColors),
    };
    setSession(prev => ({
      ...prev,
      people: [...prev.people, newPerson],
    }));
  };

  const updatePerson = (updatedPerson: Person) => {
    setSession(prev => ({
      ...prev,
      people: prev.people.map(p => 
        p.id === updatedPerson.id ? updatedPerson : p
      ),
    }));
  };

  const removePerson = (personId: string) => {
    if (session.people.length <= 1) return; // Keep at least one person
    
    // Also remove this person from any item allocations
    const updatedItems = session.items.map(item => ({
      ...item,
      allocations: item.allocations.filter(a => a.personId !== personId),
    }));

    setSession(prev => ({
      ...prev,
      people: prev.people.filter(p => p.id !== personId),
      items: updatedItems,
    }));
  };

  // Tax rate management
  const updateTaxRate = (rate: number) => {
    setSession(prev => ({
      ...prev,
      taxRatePercent: Math.max(0, Math.min(100, rate)),
    }));
  };

  // Tip management
  const updateTipMode = (mode: 'percentage' | 'fixed') => {
    setSession(prev => ({
      ...prev,
      tipMode: mode,
    }));
  };

  const updateTipValue = (value: number) => {
    setSession(prev => ({
      ...prev,
      tipValue: Math.max(0, value),
    }));
  };

  // Item management
  const handleAddItem = () => {
    setEditingItem(null);
    setIsAddItemModalOpen(true);
  };

  const handleEditItem = (item: ReceiptItem) => {
    setEditingItem(item);
    setIsAddItemModalOpen(true);
  };

  const handleSaveItem = (item: ReceiptItem) => {
    if (editingItem) {
      // Update existing item
      setSession(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === item.id ? item : i),
      }));
    } else {
      // Add new item
      setSession(prev => ({
        ...prev,
        items: [...prev.items, item],
      }));
    }
    setIsAddItemModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setSession(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId),
    }));
  };

  const handleCancelItem = () => {
    setIsAddItemModalOpen(false);
    setEditingItem(null);
  };

  // Validation and calculation
  const validateSession = (): string | null => {
    // Check if all people have names
    const unnamedPeople = session.people.filter(p => !p.name.trim());
    if (unnamedPeople.length > 0) {
      return 'Please name all people before calculating.';
    }

    // Check if there are any items
    if (session.items.length === 0) {
      return 'Please add at least one item before calculating.';
    }

    // Check if all items have at least one person assigned
    const unassignedItems = session.items.filter(item => item.allocations.length === 0);
    if (unassignedItems.length > 0) {
      return 'All items must have at least one person assigned.';
    }

    return null;
  };

  const handleCalculate = () => {
    const error = validateSession();
    if (error) {
      alert(error);
      return;
    }

    // Show payer selection modal
    setIsPayerModalOpen(true);
  };

  const handlePayerConfirm = (payerId: string) => {
    // Calculate split with payer
    const result = calculateSplit(session, payerId);
    
    // Save result and navigate
    saveSession(session);
    saveCalculationResult(result);
    router.push('/results');
    setIsPayerModalOpen(false);
  };

  // Calculate subtotal for tip section
  const subtotalCents = session.items.reduce((sum, item) => sum + item.priceCents, 0);

  return (
    <>
      <TopBar
        showMenuButton
        onMenuClick={() => setIsDrawerOpen(true)}
      />
      
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Menu</h3>
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              handleCalculate();
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Review and Calculate
          </button>
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              localStorage.clear();
              setSession({
                people: [{ id: uuidv4(), name: '', color: getNextColor([]) }],
                items: [],
                taxRatePercent: 8,
                tipMode: 'percentage',
                tipValue: 0,
                tipSplitMode: 'equal',
                taxSplitMode: 'proportional',
              });
            }}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            New Split (Reset All)
          </button>
        </div>
      </MobileDrawer>

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={handleCancelItem}
        onSave={handleSaveItem}
        onDelete={editingItem ? () => handleDeleteItem(editingItem.id) : undefined}
        item={editingItem}
        people={session.people}
        onAddPerson={addPerson}
      />

      <PayerSelectionModal
        isOpen={isPayerModalOpen}
        onClose={() => setIsPayerModalOpen(false)}
        onConfirm={handlePayerConfirm}
        people={session.people}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Tax Rate Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Rate
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={session.taxRatePercent}
              onChange={(e) => updateTaxRate(parseInt(e.target.value) || 0)}
              className="w-32 pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              %
            </div>
          </div>
        </div>

        {/* People Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              People
            </h2>
            <button
              onClick={() => addPerson()}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              + Add Person
            </button>
          </div>
          
          <div className="space-y-3">
            {session.people.map(person => (
              <PersonField
                key={person.id}
                person={person}
                onUpdate={updatePerson}
                onRemove={() => removePerson(person.id)}
                showRemoveButton={session.people.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Receipt Section */}
        <ReceiptList
          items={session.items}
          people={session.people}
          onItemClick={handleEditItem}
          onAddItem={handleAddItem}
        />

        {/* Tip Section */}
        <TipSection
          tipMode={session.tipMode}
          tipValue={session.tipValue}
          onTipModeChange={updateTipMode}
          onTipValueChange={updateTipValue}
          subtotalCents={subtotalCents}
        />

        {/* Calculate Button */}
        <div className="pt-8">
          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Review and Calculate
          </button>
        </div>
      </main>
    </>
  );
}