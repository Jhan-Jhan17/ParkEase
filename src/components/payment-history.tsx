import { useState } from 'react';
import { Transaction } from '../App';
import { Search, Download, DollarSign, CreditCard } from 'lucide-react';

interface PaymentHistoryProps {
  transactions: Transaction[];
}

export function PaymentHistory({ transactions }: PaymentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t =>
    t.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPaid = filteredTransactions.reduce((sum, t) => sum + t.cost, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Payments</p>
              <p className="text-blue-600">{filteredTransactions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="text-green-600">₱{totalPaid.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Export */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction ID or plate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Transaction ID</th>
                <th className="px-6 py-3 text-left text-gray-700">Plate Number</th>
                <th className="px-6 py-3 text-left text-gray-700">Vehicle Type</th>
                <th className="px-6 py-3 text-left text-gray-700">Check Out</th>
                <th className="px-6 py-3 text-left text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-gray-700">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{transaction.id}</td>
                  <td className="px-6 py-4 text-gray-900">{transaction.plateNumber}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                      {transaction.vehicleType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(transaction.checkOutTime)}</td>
                  <td className="px-6 py-4 text-gray-700">{transaction.duration.toFixed(2)} hrs</td>
                  <td className="px-6 py-4 text-green-600">₱{transaction.cost.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
