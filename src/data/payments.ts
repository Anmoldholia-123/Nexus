export interface Transaction {
  id: string;
  amount: number;
  date: string;
  sender: string;
  receiver: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'deposit' | 'withdrawal' | 'transfer';
}

let transactions: Transaction[] = [
  { id: 't1', amount: 50000, date: '2024-03-01', sender: 'External Bank', receiver: 'i1', status: 'completed', type: 'deposit' },
  { id: 't2', amount: 25000, date: '2024-03-05', sender: 'i1', receiver: 'e1', status: 'completed', type: 'transfer' },
];

export const getTransactionsForUser = (userId: string) => {
  return transactions.filter(t => t.sender === userId || t.receiver === userId);
};

export const getWalletBalance = (userId: string) => {
  let balance = 0;
  // Initialize default funds based on role
  if (userId.startsWith('i')) balance = 1000000;
  if (userId.startsWith('e')) balance = 15000;

  transactions.forEach(t => {
    if (t.status === 'completed') {
      if (t.receiver === userId) balance += t.amount;
      if (t.sender === userId) balance -= t.amount;
    }
  });

  return balance;
};

export const simulateTransfer = (amount: number, sender: string, receiver: string) => {
  transactions.unshift({
    id: `t${Date.now()}`,
    amount,
    date: new Date().toISOString().split('T')[0],
    sender,
    receiver,
    status: 'completed',
    type: 'transfer'
  });
};

export const simulateDeposit = (amount: number, receiver: string) => {
  transactions.unshift({
    id: `t${Date.now()}`,
    amount,
    date: new Date().toISOString().split('T')[0],
    sender: 'External Bank',
    receiver,
    status: 'completed',
    type: 'deposit'
  });
};

export const simulateWithdraw = (amount: number, sender: string) => {
  transactions.unshift({
    id: `t${Date.now()}`,
    amount,
    date: new Date().toISOString().split('T')[0],
    sender,
    receiver: 'External Bank',
    status: 'completed',
    type: 'withdrawal'
  });
};
