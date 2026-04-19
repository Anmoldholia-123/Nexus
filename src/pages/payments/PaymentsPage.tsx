import React, { useState } from 'react';
import { 
  CreditCard, ArrowUpRight, ArrowDownLeft, Send, Search, Bell, History
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { 
  getTransactionsForUser, 
  getWalletBalance, 
  simulateDeposit, 
  simulateTransfer, 
  simulateWithdraw 
} from '../../data/payments';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const [balance, setBalance] = useState(getWalletBalance(user.id));
  const [transactions, setTransactions] = useState(getTransactionsForUser(user.id));
  
  const [transferAmount, setTransferAmount] = useState('');
  const [transferUser, setTransferUser] = useState('');

  const refreshData = () => {
    setBalance(getWalletBalance(user.id));
    setTransactions(getTransactionsForUser(user.id));
  };

  const handleDeposit = () => {
    simulateDeposit(5000, user.id);
    refreshData();
  };

  const handleWithdraw = () => {
    simulateWithdraw(1000, user.id);
    refreshData();
  };

  const handleTransfer = () => {
    if (!transferAmount || !transferUser) return;
    simulateTransfer(Number(transferAmount), user.id, transferUser);
    setTransferAmount('');
    setTransferUser('');
    refreshData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
          <p className="text-gray-500">Manage your virtual funds and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" leftIcon={<Bell size={16}/>}>Alerts</Button>
          <Button variant="primary" size="sm" leftIcon={<CreditCard size={16}/>}>Link Account</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Balance & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl relative overflow-hidden text-center sm:text-left">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <CardBody className="p-6 relative z-10">
              <p className="text-gray-300 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button 
                  onClick={handleDeposit}
                  variant="primary" 
                  className="bg-white text-gray-900 hover:bg-gray-100 flex-1"
                  leftIcon={<ArrowDownLeft size={18} />}
                >
                  Deposit
                </Button>
                <Button 
                  onClick={handleWithdraw}
                  variant="primary" 
                  className="bg-gray-700 text-white hover:bg-gray-600 border-none flex-1"
                  leftIcon={<ArrowUpRight size={18} />}
                >
                  Withdraw
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <h3 className="font-semibold flex items-center text-gray-800">
                <Send className="mr-2 h-5 w-5 text-gray-400" /> Quick Transfer
              </h3>
            </CardHeader>
            <CardBody className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Recipient ID / Email</label>
                <Input 
                  placeholder="e.g. e2 or email" 
                  value={transferUser} 
                  onChange={e => setTransferUser(e.target.value)} 
                  fullWidth 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={transferAmount} 
                  onChange={e => setTransferAmount(e.target.value)} 
                  fullWidth 
                />
              </div>
              <Button onClick={handleTransfer} variant="primary" fullWidth className="py-2.5">
                Send Funds
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center border-b pb-4">
              <h3 className="font-semibold flex items-center text-gray-800">
                <History className="mr-2 h-5 w-5 text-gray-400" /> Recent Transactions
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 bg-white"
                />
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                    <th className="px-6 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No recent transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isIncoming = tx.receiver === user.id;
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {isIncoming ? `From ${tx.sender}` : `To ${tx.receiver}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap font-medium">
                            <span className={isIncoming ? 'text-green-600' : 'text-gray-900'}>
                              {isIncoming ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} className="capitalize">
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
};
