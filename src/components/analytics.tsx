import { Transaction, ParkingSlot } from '../App';
import { TrendingUp, DollarSign, Car, Clock, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  transactions: Transaction[];
  parkingSlots: ParkingSlot[];
}

export function Analytics({ transactions, parkingSlots }: AnalyticsProps) {
  // Calculate metrics
  const totalRevenue = transactions.reduce((sum, t) => sum + t.cost, 0);
  const avgDuration = transactions.reduce((sum, t) => sum + t.duration, 0) / transactions.length;
  const occupancyRate = (parkingSlots.filter(s => s.isOccupied).length / parkingSlots.length) * 100;

  // Revenue by vehicle type
  const revenueByType = transactions.reduce((acc, t) => {
    acc[t.vehicleType] = (acc[t.vehicleType] || 0) + t.cost;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(revenueByType).map(([type, revenue]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: revenue
  }));

  // Daily revenue (last 7 days)
  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.checkOutTime);
      return tDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayTransactions.reduce((sum, t) => sum + t.cost, 0)
    };
  });

  // Hourly usage pattern
  const hourlyUsage = Array.from({ length: 24 }, (_, hour) => {
    const count = transactions.filter(t => {
      const checkInHour = new Date(t.checkInTime).getHours();
      return checkInHour === hour;
    }).length;
    return {
      hour: `${hour}:00`,
      count
    };
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-gray-500">Total Transactions</p>
              <p className="text-blue-600">{transactions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Avg. Duration</p>
              <p className="text-purple-600">{avgDuration.toFixed(1)} hrs</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Occupancy Rate</p>
              <p className="text-orange-600">{occupancyRate.toFixed(1)}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Daily Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${Number(value).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Vehicle Type */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4">Revenue by Vehicle Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₱${Number(value).toFixed(2)}`} />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Usage Pattern */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Hourly Usage Pattern</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="Check-ins" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vehicle Type Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Vehicle Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(revenueByType).map(([type, revenue]) => {
            const count = transactions.filter(t => t.vehicleType === type).length;
            return (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 capitalize mb-2">{type}</p>
                <p className="text-blue-600 mb-1">{count} transactions</p>
                <p className="text-green-600">₱{revenue.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
