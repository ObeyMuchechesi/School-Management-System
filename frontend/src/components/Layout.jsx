import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', roles: ['admin','teacher','student','guardian','staff','accounts'] },
  { to: '/students', label: 'Students', icon: '🎓', roles: ['admin','teacher','staff'] },
  { to: '/teachers', label: 'Teachers', icon: '👨‍🏫', roles: ['admin','staff'] },
  { to: '/guardians', label: 'Guardians', icon: '👪', roles: ['admin','staff'] },
  { to: '/attendance', label: 'Attendance', icon: '✅', roles: ['admin','teacher'] },
  { to: '/timetable', label: 'Timetable', icon: '📅', roles: ['admin','teacher','student','guardian'] },
  { to: '/exams', label: 'Exams', icon: '📝', roles: ['admin','teacher','student','guardian'] },
  { to: '/fees', label: 'Fee Ledger', icon: '💰', roles: ['admin','accounts'] },
  { to: '/progress', label: 'Progress Reports', icon: '📈', roles: ['admin','teacher','student','guardian'] },
  { to: '/notices', label: 'Notice Board', icon: '📢', roles: ['admin','teacher','student','guardian','staff'] },
  { to: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  { to: '/profile', label: 'My Profile', icon: '👤', roles: ['admin','teacher','student','guardian','staff','accounts'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems.filter(i => i.roles.includes(user?.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform`}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">🏫 SchoolHub</h1>
          <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Portal</p>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
            🚪 Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-2xl">☰</button>
          <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
            Welcome, {user?.name}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm hidden sm:block">
              <p className="font-medium">{user?.name}</p>
              <p className="text-slate-500 capitalize text-xs">{user?.role}</p>
            </div>
          </div>
        </header>
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
