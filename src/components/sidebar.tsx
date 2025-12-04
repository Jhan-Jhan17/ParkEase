import { User } from '../App';
import { 
  Car, 
  LayoutDashboard, 
  History, 
  BarChart3, 
  Users, 
  Calendar, 
  Receipt, 
  Settings as SettingsIcon,
  LogOut,
  CalendarCheck
} from 'lucide-react';
import logo from 'figma:asset/0a9d088b62d0242acf0eebfa57cebe45ca2172b0.png';

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

export function Sidebar({ currentUser, currentPage, setCurrentPage, onLogout }: SidebarProps) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Vehicle History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'payments', label: 'Payment History', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-reservations', label: 'My Reservations', icon: CalendarCheck },
    { id: 'payments', label: 'Payment History', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const menuItems = currentUser.role === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-red-700 text-white flex flex-col shadow-xl z-20">
      {/* Logo */}
      <div className="p-6 border-b border-red-600 bg-red-800">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <img src={logo} alt="BatStateU Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h2 className="text-white">BatStateU</h2>
            <p className="text-red-200">Alangilan Campus</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-red-700'
                      : 'text-red-100 hover:bg-red-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-red-600">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-100 hover:bg-red-900 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}