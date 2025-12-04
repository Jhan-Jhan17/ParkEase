import { useState } from 'react';
import { User } from '../App';
import { Car, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import logo from 'figma:asset/0a9d088b62d0242acf0eebfa57cebe45ca2172b0.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Mock user credentials
const MOCK_USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' as const },
  user: { username: 'user', password: 'user123', role: 'user' as const }
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check credentials
    const mockUser = Object.values(MOCK_USERS).find(
      u => u.username === username && u.password === password
    );

    if (mockUser) {
      onLogin({ username: mockUser.username, role: mockUser.role });
    } else {
      setError('Invalid username or password');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    const user = MOCK_USERS[role];
    onLogin({ username: user.username, role: user.role });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-red-600 to-red-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Logo Watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center opacity-10"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: '800px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-2xl mb-4 p-4">
            <img src={logo} alt="BatStateU Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-white mb-2">BatStateU Alangilan</h1>
          <p className="text-red-100">Parking Management System</p>
          <p className="text-red-200 mt-1">Batangas State University - The NEU</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-900 text-center mb-6">Login to Your Account</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Username
                </div>
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </div>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition-colors"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-500">Quick Login (Demo)</span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Login as Admin
            </button>
            <button
              onClick={() => handleQuickLogin('user')}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <UserIcon className="w-5 h-5" />
              Login as User
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-gray-700">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>User:</strong> user / user123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-red-100 mt-6">
          © 2025 Batangas State University. All rights reserved.
        </p>
      </div>
    </div>
  );
}