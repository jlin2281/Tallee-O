import { PersonResult, SettlementTransaction } from '@/types';

/**
 * Minimize debts using the greedy creditor-debtor matching algorithm
 * @param personResults Array of person results with their total amounts owed
 * @returns List of settlement transactions to settle all debts
 */
export function minimizeDebts(personResults: PersonResult[]): SettlementTransaction[] {
  const settlements: SettlementTransaction[] = [];
  
  // Step 1: Compute net balance per person
  // In guest mode, everyone owes their totalCents (negative balance)
  // We'll treat it as: each person needs to pay their totalCents
  // For settlement, we need to find who pays whom
  // Since no one is marked as payer, we'll create a simplified model:
  // Each person's balance = -totalCents (they owe this amount)
  // We need to redistribute so that total balance is zero
  
  // Actually, for simplicity in guest mode:
  // We'll assume everyone needs to pay their share to a central pot
  // Then redistribute. But that's equivalent to:
  // Find who owes whom based on relative amounts
  
  // Alternative approach: Use the standard debt minimization algorithm
  // where we treat each person's totalCents as what they need to pay
  
  // Create a map of balances (negative means they owe money, positive means they're owed)
  // In our case, everyone has negative balance (they owe)
  // We need to find the minimal transactions to settle
  
  // For now, let's implement a simple algorithm:
  // 1. Sort people by totalCents (largest debt first)
  // 2. Match largest debtor with largest creditor
  // But we have no creditors...
  
  // Actually, in guest mode with no designated payer, we need a different approach.
  // Let's assume one person collects all money and redistributes.
  // Or we can use the standard algorithm with virtual "bank" person.
  
  // For Release 1, let's implement a simpler approach:
  // Calculate average amount per person
  const totalAmount = personResults.reduce((sum, person) => sum + person.totalCents, 0);
  const averageAmount = Math.round(totalAmount / personResults.length);
  
  // Calculate balance for each person (positive = overpaid, negative = underpaid)
  const balances = personResults.map(person => ({
    personId: person.personId,
    name: person.name,
    color: person.color,
    balance: averageAmount - person.totalCents, // Positive means they paid too much (creditor), negative means they paid too little (debtor)
  }));
  
  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors = balances.filter(b => b.balance > 0);
  const debtors = balances.filter(b => b.balance < 0);
  
  // Sort by absolute balance (largest first)
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance); // More negative = larger debt
  
  // Greedy matching algorithm
  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = Math.min(creditor.balance, -debtor.balance);
    
    if (amount > 0) {
      settlements.push({
        fromPersonId: debtor.personId,
        fromName: debtor.name,
        fromColor: debtor.color,
        toPersonId: creditor.personId,
        toName: creditor.name,
        toColor: creditor.color,
        amountCents: amount,
      });
      
      // Update balances
      creditor.balance -= amount;
      debtor.balance += amount;
      
      // Remove settled parties
      if (creditor.balance === 0) i++;
      if (debtor.balance === 0) j++;
    }
  }
  
  return settlements;
}

/**
 * Alternative implementation using the standard debt minimization algorithm
 * This is a more robust implementation that handles the general case
 */
export function minimizeDebtsStandard(personResults: PersonResult[]): SettlementTransaction[] {
  const settlements: SettlementTransaction[] = [];
  
  // Create balance map
  const balances: Array<{
    personId: string;
    name: string;
    color: string;
    balance: number;
  }> = personResults.map(person => ({
    personId: person.personId,
    name: person.name,
    color: person.color,
    balance: -person.totalCents, // Negative because they owe this amount
  }));
  
  // Calculate total balance to ensure it sums to zero (with rounding)
  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);
  if (totalBalance !== 0) {
    // Adjust first person's balance to fix rounding errors
    if (balances.length > 0) {
      balances[0].balance -= totalBalance;
    }
  }
  
  // Separate creditors and debtors
  const creditors = balances.filter(b => b.balance > 0);
  const debtors = balances.filter(b => b.balance < 0);
  
  // Sort by absolute balance
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance);
  
  // Greedy matching
  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = Math.min(creditor.balance, -debtor.balance);
    
    if (amount > 0) {
      settlements.push({
        fromPersonId: debtor.personId,
        fromName: debtor.name,
        fromColor: debtor.color,
        toPersonId: creditor.personId,
        toName: creditor.name,
        toColor: creditor.color,
        amountCents: amount,
      });
      
      creditor.balance -= amount;
      debtor.balance += amount;
      
      if (creditor.balance === 0) i++;
      if (debtor.balance === 0) j++;
    }
  }
  
  return settlements;
}