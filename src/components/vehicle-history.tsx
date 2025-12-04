import { useState } from 'react';
import { Transaction } from '../App';
import { Search, Download, Calendar, Car, DollarSign } from 'lucide-react';

interface VehicleHistoryProps {
  transactions: Transaction[];
}

export function VehicleHistory({ transactions }: VehicleHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.vehicleType === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.cost, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Transactions</p>
              <p className="text-red-700">{filteredTransactions.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Car className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-green-600">₱{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Avg. Duration</p>
              <p className="text-purple-600">
                {(filteredTransactions.reduce((sum, t) => sum + t.duration, 0) / filteredTransactions.length).toFixed(1)} hrs
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Vehicle Types</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="car">Car</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck</option>
          </select>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Transaction ID</th>
                <th className="px-6 py-3 text-left text-gray-700">Plate Number</th>
                <th className="px-6 py-3 text-left text-gray-700">Vehicle Type</th>
                <th className="px-6 py-3 text-left text-gray-700">Slot</th>
                <th className="px-6 py-3 text-left text-gray-700">Check In</th>
                <th className="px-6 py-3 text-left text-gray-700">Check Out</th>
                <th className="px-6 py-3 text-left text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left text-gray-700">Cost</th>
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
                  <td className="px-6 py-4 text-gray-700">#{transaction.slotId}</td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(transaction.checkInTime)}</td>
                  <td className="px-6 py-4 text-gray-700">{formatDate(transaction.checkOutTime)}</td>
                  <td className="px-6 py-4 text-gray-700">{transaction.duration.toFixed(2)} hrs</td>
                  <td className="px-6 py-4 text-green-600">₱{transaction.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}