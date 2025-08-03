import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Settings, FileText, LogOut, User, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Investments from './components/Investments';
import SettingsComponent from './components/Settings';
import Auth from './components/Auth';
import './App.css';
import Reports from './components/Reports';
import { useFinanceStore } from './store/useFinanceStore';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, isAuthenticated, currentUser, logout } = useFinanceStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleAuthSuccess = () => {
    // La autenticación exitosa se maneja automáticamente por el store
  };

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'investments':
        return <Investments />;
      case 'settings':
        return <SettingsComponent />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'transactions', name: 'Transacciones', icon: FileText },
    { id: 'investments', name: 'Inversiones', icon: TrendingUp },
    { id: 'reports', name: 'Reportes', icon: FileText },
    { id: 'settings', name: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                FinanciAll
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium text-sm sm:text-base truncate max-w-32 sm:max-w-none">
                  {currentUser?.name}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Cerrar Sesión"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Adaptativo */}
        <nav className={`
          fixed lg:sticky top-14 sm:top-16 left-0 z-50
          w-64 sm:w-72 lg:w-64 xl:w-72
          bg-white dark:bg-gray-800 shadow-lg lg:shadow-sm 
          h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="p-3 sm:p-4">
            {/* Usuario en móvil */}
            <div className="sm:hidden mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {currentUser?.name}
                </span>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              {navigationItems.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false); // Cerrar sidebar en móvil
                    }}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02]'
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content Adaptativo */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6 xl:p-8">
          <div className="max-w-full overflow-hidden">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
