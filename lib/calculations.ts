import { SplitSession, CalculationResult, PersonResult, ItemResult, SettlementTransaction, SplitMode } from '@/types';
import { minimizeDebts } from './debtMinimization';

// Helper functions for formatting and parsing
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function parseDollarsToCents(value: string): number {
  // Remove any non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  if (!cleaned) return 0;
  
  // Parse as float and convert to cents
  const dollars = parseFloat(cleaned);
  return Math.round(dollars * 100);
}

// Helper for round-robin remainder distribution with offset
function distributeWithRoundRobin(
  totalCents: number,
  n: number,
  startIndex: number
): { shares: number[], nextStartIndex: number } {
  if (n === 0) {
    return { shares: [], nextStartIndex: startIndex };
  }
  
  const base = Math.floor(totalCents / n);
  const remainder = totalCents % n;
  
  const shares = Array(n).fill(base);
  
  // Distribute remainder cents round-robin starting at startIndex
  for (let i = 0; i < remainder; i++) {
    const index = (startIndex + i) % n;
    shares[index] += 1;
  }
  
  const nextStartIndex = (startIndex + remainder) % n;
  return { shares, nextStartIndex };
}

// Helper for round-robin remainder distribution (backward compatibility)
function distributeRemainderRoundRobin(values: number[], total: number): number[] {
  const { shares } = distributeWithRoundRobin(total, values.length, 0);
  return shares;
}

// Helper for largest remainder rounding (kept for backward compatibility)
function largestRemainderRounding(values: number[], total: number): number[] {
  const rounded = values.map(Math.floor);
  let remainder = total - rounded.reduce((sum, val) => sum + val, 0);
  
  // Sort indices by fractional part (largest remainder first)
  const indices = values
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
    .map(item => item.index);
  
  // Distribute remainder
  for (let i = 0; i < remainder; i++) {
    rounded[indices[i]]++;
  }
  
  return rounded;
}

// Calculate item shares based on split mode with round-robin offset
function calculateItemShares(
  priceCents: number,
  allocations: { personId: string; mode: SplitMode; value: number }[],
  roundRobinOffset: number
): { personId: string; shareCents: number; nextOffset: number }[] {
  if (allocations.length === 0) return [];
  
  // If only one person, they get the full amount
  if (allocations.length === 1) {
    return [{ personId: allocations[0].personId, shareCents: priceCents, nextOffset: roundRobinOffset }];
  }
  
  const shares: { personId: string; shareCents: number; nextOffset: number }[] = [];
  
  // Check if all allocations have the same mode
  const firstMode = allocations[0].mode;
  const allSameMode = allocations.every(a => a.mode === firstMode);
  
  if (!allSameMode) {
    // Mixed modes not supported in this version
    // Default to equal split with round-robin
    const { shares: shareAmounts, nextStartIndex } = distributeWithRoundRobin(
      priceCents,
      allocations.length,
      roundRobinOffset
    );
    
    for (let i = 0; i < allocations.length; i++) {
      shares.push({ 
        personId: allocations[i].personId, 
        shareCents: shareAmounts[i],
        nextOffset: nextStartIndex
      });
    }
    return shares;
  }
  
  switch (firstMode) {
    case 'equal': {
      const { shares: shareAmounts, nextStartIndex } = distributeWithRoundRobin(
        priceCents,
        allocations.length,
        roundRobinOffset
      );
      
      for (let i = 0; i < allocations.length; i++) {
        shares.push({ 
          personId: allocations[i].personId, 
          shareCents: shareAmounts[i],
          nextOffset: nextStartIndex
        });
      }
      break;
    }
    
    case 'exact': {
      // Use exact values provided
      let total = 0;
      for (const alloc of allocations) {
        shares.push({ 
          personId: alloc.personId, 
          shareCents: alloc.value,
          nextOffset: roundRobinOffset // Offset doesn't change for exact splits
        });
        total += alloc.value;
      }
      
      // Adjust if total doesn't match price
      if (total !== priceCents) {
        const diff = priceCents - total;
        if (diff !== 0 && shares.length > 0) {
          shares[0].shareCents += diff;
        }
      }
      break;
    }
    
    case 'percentage': {
      // Calculate shares based on percentages
      const percentages = allocations.map(a => a.value);
      const totalPercent = percentages.reduce((sum, p) => sum + p, 0);
      
      if (totalPercent === 0) {
        // If no percentages, split equally with round-robin
        const { shares: shareAmounts, nextStartIndex } = distributeWithRoundRobin(
          priceCents,
          allocations.length,
          roundRobinOffset
        );
        
        for (let i = 0; i < allocations.length; i++) {
          shares.push({ 
            personId: allocations[i].personId, 
            shareCents: shareAmounts[i],
            nextOffset: nextStartIndex
          });
        }
      } else {
        // Calculate exact shares using largest remainder
        const exactShares = percentages.map(p => (priceCents * p) / totalPercent);
        const roundedShares = largestRemainderRounding(exactShares, priceCents);
        
        for (let i = 0; i < allocations.length; i++) {
          shares.push({ 
            personId: allocations[i].personId, 
            shareCents: roundedShares[i],
            nextOffset: roundRobinOffset // Offset doesn't change for percentage splits
          });
        }
      }
      break;
    }
  }
  
  // Return the last nextOffset (all shares should have same nextOffset)
  const finalNextOffset = shares.length > 0 ? shares[shares.length - 1].nextOffset : roundRobinOffset;
  
  // Return shares directly with the nextOffset included
  return shares;
}

// Generate settlements based on payer
function generatePayerSettlements(
  personResults: PersonResult[],
  payerId: string
): SettlementTransaction[] {
  const payer = personResults.find(p => p.personId === payerId);
  if (!payer) return [];
  
  const settlements: SettlementTransaction[] = [];
  
  for (const person of personResults) {
    if (person.personId === payerId) continue; // Skip payer
    
    if (person.totalCents > 0) {
      settlements.push({
        fromPersonId: person.personId,
        fromName: person.name,
        fromColor: person.color,
        toPersonId: payerId,
        toName: payer.name,
        toColor: payer.color,
        amountCents: person.totalCents,
      });
    }
  }
  
  return settlements;
}

export function calculateSplit(session: SplitSession, payerId?: string): CalculationResult {
  const { people, items, taxRatePercent, tipMode, tipValue, tipSplitMode, taxSplitMode } = session;
  
  // Step 1: Calculate item shares and build person subtotals
  const personSubtotals = new Map<string, number>();
  const personTaxBases = new Map<string, number>(); // Only taxed items
  const itemResults: ItemResult[] = [];
  const personItemBreakdown = new Map<string, { itemId: string; name: string; shareCents: number }[]>();
  
  // Initialize maps
  for (const person of people) {
    personSubtotals.set(person.id, 0);
    personTaxBases.set(person.id, 0);
    personItemBreakdown.set(person.id, []);
  }
  
  // Process each item with running round-robin offset
  let roundRobinOffset = 0;
  
  for (const item of items) {
    const sharesWithOffset = calculateItemShares(item.priceCents, item.allocations, roundRobinOffset);
    
    // Update offset for next item directly from the calculated shares
    if (sharesWithOffset.length > 0) {
      roundRobinOffset = sharesWithOffset[sharesWithOffset.length - 1].nextOffset;
    }
    
    // Map to the shape expected by the rest of the function
    const shares = sharesWithOffset.map(({ personId, shareCents }) => ({ personId, shareCents }));
    
    // Determine the dominant split mode for this item
    const splitMode = item.allocations.length > 0 ? item.allocations[0].mode : 'equal';
    
    // Build person shares for item result
    const personShares = shares.map(share => {
      const person = people.find(p => p.id === share.personId);
      return {
        personId: share.personId,
        name: person?.name || 'Unknown',
        color: person?.color || '#000000',
        shareCents: share.shareCents,
      };
    });
    
    itemResults.push({
      itemId: item.id,
      name: item.name,
      priceCents: item.priceCents,
      taxed: item.taxed,
      splitMode,
      personShares,
    });
    
    // Update person subtotals and tax bases
    for (const share of shares) {
      const currentSubtotal = personSubtotals.get(share.personId) || 0;
      personSubtotals.set(share.personId, currentSubtotal + share.shareCents);
      
      // Add to tax base if item is taxed
      if (item.taxed) {
        const currentTaxBase = personTaxBases.get(share.personId) || 0;
        personTaxBases.set(share.personId, currentTaxBase + share.shareCents);
      }
      
      // Add to item breakdown
      const breakdown = personItemBreakdown.get(share.personId) || [];
      breakdown.push({
        itemId: item.id,
        name: item.name,
        shareCents: share.shareCents,
      });
      personItemBreakdown.set(share.personId, breakdown);
    }
  }
  
  // Step 2: Calculate total tax
  const totalTaxBase = Array.from(personTaxBases.values()).reduce((sum, base) => sum + base, 0);
  const totalTaxCents = Math.round(totalTaxBase * taxRatePercent / 100);
  
  // Step 3: Calculate tax per person
  const personTaxes = new Map<string, number>();
  
  if (taxSplitMode === 'equal') {
    // Divide tax equally among all people with round-robin remainder using current offset
    const { shares: taxShares, nextStartIndex } = distributeWithRoundRobin(
      totalTaxCents,
      people.length,
      roundRobinOffset
    );
    
    for (let i = 0; i < people.length; i++) {
      personTaxes.set(people[i].id, taxShares[i]);
    }
    
    // Update offset for next distribution (tip)
    roundRobinOffset = nextStartIndex;
  } else {
    // Proportional tax based on tax base
    const taxBases = people.map(person => personTaxBases.get(person.id) || 0);
    const exactTaxes = taxBases.map(base => (totalTaxCents * base) / totalTaxBase);
    const roundedTaxes = distributeRemainderRoundRobin(exactTaxes, totalTaxCents);
    
    for (let i = 0; i < people.length; i++) {
      personTaxes.set(people[i].id, roundedTaxes[i]);
    }
  }
  
  // Step 4: Calculate total tip
  const totalSubtotalCents = Array.from(personSubtotals.values()).reduce((sum, subtotal) => sum + subtotal, 0);
  let totalTipCents = 0;
  
  if (tipMode === 'percentage') {
    totalTipCents = Math.round(totalSubtotalCents * tipValue / 100);
  } else {
    totalTipCents = tipValue; // Already in cents
  }
  
  // Step 5: Calculate tip per person
  const personTips = new Map<string, number>();
  
  if (tipSplitMode === 'equal') {
    // Divide tip equally among all people with round-robin remainder using current offset
    const { shares: tipShares, nextStartIndex } = distributeWithRoundRobin(
      totalTipCents,
      people.length,
      roundRobinOffset
    );
    
    for (let i = 0; i < people.length; i++) {
      personTips.set(people[i].id, tipShares[i]);
    }
    
    // Update offset (though not used further)
    roundRobinOffset = nextStartIndex;
  } else {
    // Proportional tip based on subtotal
    const subtotals = people.map(person => personSubtotals.get(person.id) || 0);
    const exactTips = subtotals.map(subtotal => (totalTipCents * subtotal) / totalSubtotalCents);
    const roundedTips = distributeRemainderRoundRobin(exactTips, totalTipCents);
    
    for (let i = 0; i < people.length; i++) {
      personTips.set(people[i].id, roundedTips[i]);
    }
  }
  
  // Step 6: Build person results
  const personResults: PersonResult[] = people.map(person => {
    const subtotalCents = personSubtotals.get(person.id) || 0;
    const taxCents = personTaxes.get(person.id) || 0;
    const tipCents = personTips.get(person.id) || 0;
    const totalCents = subtotalCents + taxCents + tipCents;
    
    return {
      personId: person.id,
      name: person.name,
      color: person.color,
      subtotalCents,
      taxCents,
      tipCents,
      totalCents,
      itemBreakdown: personItemBreakdown.get(person.id) || [],
    };
  });
  
  // Step 7: Calculate grand total
  const grandTotalCents = totalSubtotalCents + totalTaxCents + totalTipCents;
  
  // Step 8: Generate settlements
  let settlements: SettlementTransaction[] = [];
  if (payerId) {
    settlements = generatePayerSettlements(personResults, payerId);
  } else {
    settlements = minimizeDebts(personResults);
  }
  
  return {
    personResults,
    itemResults,
    settlements,
    totalSubtotalCents,
    totalTaxCents,
    totalTipCents,
    grandTotalCents,
    payerId,
  };
}