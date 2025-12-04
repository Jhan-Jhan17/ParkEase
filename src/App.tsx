import { useState } from 'react';
import { AdminDashboard } from './components/admin-dashboard';
import { UserView } from './components/user-view';
import { LoginPage } from './components/login-page';
import { Sidebar } from './components/sidebar';
import { VehicleHistory } from './components/vehicle-history';
import { Analytics } from './components/analytics';
import { UserManagement } from './components/user-management';
import { Reservations } from './components/reservations';
import { PaymentHistory } from './components/payment-history';
import { Settings } from './components/settings';
import { MyReservations } from './components/my-reservations';
import { Car } from 'lucide-react';
import logo from 'figma:asset/0a9d088b62d0242acf0eebfa57cebe45ca2172b0.png';

export interface ParkingSlot {
  id: number;
  isOccupied: boolean;
  vehicle?: {
    plateNumber: string;
    vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck';
    checkInTime: Date;
  };
}

export interface PricingRate {
  id: string;
  vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck';
  hourlyRate: number;
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}

export interface Transaction {
  id: string;
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck';
  checkInTime: Date;
  checkOutTime: Date;
  duration: number;
  cost: number;
  slotId: number;
}

export interface Reservation {
  id: string;
  username: string;
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck';
  slotId: number;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  
  // Initialize parking slots (50 slots)
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const isOccupied = Math.random() > 0.7; // Random initial occupancy
      return {
        id: i + 1,
        isOccupied: isOccupied,
        vehicle: isOccupied ? {
          plateNumber: `ABC${Math.floor(Math.random() * 9000) + 1000}`,
          vehicleType: ['car', 'motorcycle', 'suv', 'truck'][Math.floor(Math.random() * 4)] as any,
          checkInTime: new Date(Date.now() - Math.random() * 3600000 * 5)
        } : undefined
      };
    });
  });

  const [pricingRates, setPricingRates] = useState<PricingRate[]>([
    { id: '1', vehicleType: 'motorcycle', hourlyRate: 20 },
    { id: '2', vehicleType: 'car', hourlyRate: 50 },
    { id: '3', vehicleType: 'suv', hourlyRate: 70 },
    { id: '4', vehicleType: 'truck', hourlyRate: 100 }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Generate mock transaction history
    return Array.from({ length: 20 }, (_, i) => ({
      id: `txn-${i + 1}`,
      plateNumber: `ABC${Math.floor(Math.random() * 9000) + 1000}`,
      vehicleType: ['car', 'motorcycle', 'suv', 'truck'][Math.floor(Math.random() * 4)] as any,
      checkInTime: new Date(Date.now() - Math.random() * 86400000 * 7),
      checkOutTime: new Date(Date.now() - Math.random() * 86400000 * 6),
      duration: Math.random() * 8 + 0.5,
      cost: Math.random() * 400 + 50,
      slotId: Math.floor(Math.random() * 50) + 1
    }));
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `res-${i + 1}`,
      username: i < 3 ? 'user' : `user${i}`,
      plateNumber: `XYZ${Math.floor(Math.random() * 9000) + 1000}`,
      vehicleType: ['car', 'motorcycle', 'suv', 'truck'][Math.floor(Math.random() * 4)] as any,
      slotId: Math.floor(Math.random() * 50) + 1,
      date: new Date(Date.now() + Math.random() * 86400000 * 7),
      status: ['pending', 'confirmed', 'cancelled'][Math.floor(Math.random() * 3)] as any
    }));
  });

  const [users, setUsers] = useState<AppUser[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@parkease.com',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      username: 'user',
      email: 'user@parkease.com',
      role: 'user',
      status: 'active',
      createdAt: new Date('2024-01-15')
    },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `${i + 3}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: 'user' as const,
      status: Math.random() > 0.2 ? 'active' as const : 'inactive' as const,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 60)
    }))
  ]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  // Show login page if not logged in
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    if (currentUser.role === 'admin') {
      switch (currentPage) {
        case 'dashboard':
          return (
            <AdminDashboard
              parkingSlots={parkingSlots}
              setParkingSlots={setParkingSlots}
              pricingRates={pricingRates}
              setPricingRates={setPricingRates}
              addTransaction={addTransaction}
            />
          );
        case 'history':
          return <VehicleHistory transactions={transactions} />;
        case 'analytics':
          return <Analytics transactions={transactions} parkingSlots={parkingSlots} />;
        case 'users':
          return <UserManagement users={users} setUsers={setUsers} />;
        case 'reservations':
          return <Reservations reservations={reservations} setReservations={setReservations} />;
        case 'payments':
          return <PaymentHistory transactions={transactions} />;
        case 'settings':
          return <Settings currentUser={currentUser} />;
        default:
          return (
            <AdminDashboard
              parkingSlots={parkingSlots}
              setParkingSlots={setParkingSlots}
              pricingRates={pricingRates}
              setPricingRates={setPricingRates}
              addTransaction={addTransaction}
            />
          );
      }
    } else {
      switch (currentPage) {
        case 'dashboard':
          return <UserView parkingSlots={parkingSlots} pricingRates={pricingRates} />;
        case 'my-reservations':
          return (
            <MyReservations
              reservations={reservations.filter(r => r.username === currentUser.username)}
              setReservations={setReservations}
              parkingSlots={parkingSlots}
              pricingRates={pricingRates}
              currentUser={currentUser}
            />
          );
        case 'payments':
          return (
            <PaymentHistory
              transactions={transactions.filter(t => 
                reservations.some(r => r.username === currentUser.username && r.plateNumber === t.plateNumber)
              )}
            />
          );
        case 'settings':
          return <Settings currentUser={currentUser} />;
        default:
          return <UserView parkingSlots={parkingSlots} pricingRates={pricingRates} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Background Logo Watermark */}
      <div 
        className="fixed inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: '600px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 relative z-10">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-gray-900">
                  {currentPage === 'dashboard' && 'Dashboard'}
                  {currentPage === 'history' && 'Vehicle History'}
                  {currentPage === 'analytics' && 'Analytics & Reports'}
                  {currentPage === 'users' && 'User Management'}
                  {currentPage === 'reservations' && 'Reservations'}
                  {currentPage === 'my-reservations' && 'My Reservations'}
                  {currentPage === 'payments' && 'Payment History'}
                  {currentPage === 'settings' && 'Settings'}
                </h1>
                <p className="text-gray-500">
                  {currentUser.role === 'admin' ? 'Administrator Panel' : 'Customer Portal'} - Alangilan Campus
                </p>
              </div>
              <div className="flex items-center gap-3">
                <img src={logo} alt="BatStateU Logo" className="w-12 h-12 object-contain" />
                <div className="text-right">
                  <p className="text-gray-500">Logged in as</p>
                  <p className="text-gray-900">{currentUser.username}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}