import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

const Reports: React.FC = () => {
  const { getCurrentUserData, categories, baseCurrency } = useFinanceStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showValues, setShowValues] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const userData = getCurrentUserData();
  const { transactions } = userData;

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    if (!showValues) return '•••';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: baseCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filtrar transacciones por período
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };

  const { start, end } = getDateRange();
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
    return transactionDate >= start && transactionDate <= end && categoryMatch;
  });

  // Métricas principales
  const metrics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100) : 0;
    
    return { income, expenses, balance, savingsRate };
  }, [filteredTransactions]);

  // Datos para gráfico de tendencias mensuales
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expenses: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expenses += transaction.amount;
      }
    });
    
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  // Datos para gráfico de categorías
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, { name: string; value: number; color: string }> = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = categories.find(c => c.name === transaction.category);
        const categoryName = category?.name || transaction.category;
        const categoryColor = category?.color || '#8b5cf6';
        
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = {
            name: categoryName,
            value: 0,
            color: categoryColor
          };
        }
        
        categoryTotals[categoryName].value += transaction.amount;
      });
    
    return Object.values(categoryTotals)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categorías
  }, [filteredTransactions, categories]);

  // Datos para análisis semanal
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { week: string; income: number; expenses: number; balance: number }> = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, income: 0, expenses: 0, balance: 0 };
      }
      
      if (transaction.type === 'income') {
        weeks[weekKey].income += transaction.amount;
      } else {
        weeks[weekKey].expenses += transaction.amount;
      }
      
      weeks[weekKey].balance = weeks[weekKey].income - weeks[weekKey].expenses;
    });
    
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week));
  }, [filteredTransactions]);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

      {/* Sección de Posición Global */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Posición Global</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Últimos 12 meses</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">2024</button>
            <button className="px-3 py-1 text-sm text-gray-500 rounded-full">2023</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Evolución de ventas */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics.income)}
                </span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">55.10%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total ingresos</p>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                    return monthNames[parseInt(month) - 1];
                  }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Compras y gastos - Donut chart */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compras y gastos</h4>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={1}
                    dataKey="value"
                  >
                    {categoryData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Valor central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metrics.expenses)}
                  </div>
                  <div className="text-xs text-gray-500">Total gastos</div>
                </div>
              </div>
            </div>
            
            {/* Lista de categorías */}
            <div className="mt-6 space-y-3">
              {categoryData.slice(0, 5).map((category, index) => {
                const percentage = metrics.expenses > 0 ? (category.value / metrics.expenses * 100) : 0;
                return (
                  <div key={category.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-gray-600 dark:text-gray-400">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(category.value)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes Financieros</h2>
          <p className="text-gray-600 dark:text-gray-400">Análisis detallado de tus finanzas</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="text-sm">{showValues ? 'Ocultar' : 'Mostrar'} valores</span>
          </button>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Últimos 3 meses</option>
            <option value="year">Último año</option>
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.income)}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.expenses)}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</p>
              <p className={`text-2xl font-bold ${
                metrics.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(metrics.balance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              metrics.balance >= 0 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                metrics.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Ahorro</p>
              <p className={`text-2xl font-bold ${
                metrics.savingsRate >= 20 ? 'text-green-600' : 
                metrics.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {showValues ? `${metrics.savingsRate.toFixed(1)}%` : '•••'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              metrics.savingsRate >= 20 ? 'bg-green-100 dark:bg-green-900/20' : 
              metrics.savingsRate >= 10 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <PieChartIcon className={`h-6 w-6 ${
                metrics.savingsRate >= 20 ? 'text-green-600' : 
                metrics.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia mensual */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tendencia Mensual</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos vs Gastos</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(-2)}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(Number(value)), name === 'income' ? 'Ingresos' : 'Gastos']}
                labelFormatter={(label) => {
                  const [year, month] = label.split('-');
                  return `${month}/${year}`;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por categorías */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <PieChartIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gastos por Categoría</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distribución de gastos</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análisis semanal */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Análisis Semanal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Balance semanal</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [
                formatCurrency(Number(value)), 
                name === 'income' ? 'Ingresos' : name === 'expenses' ? 'Gastos' : 'Balance'
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return `Semana del ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              name="Ingresos"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              name="Gastos"
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#8b5cf6"
              strokeWidth={3}
              name="Balance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen de categorías */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen por Categorías</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryData.map((category, index) => {
            const percentage = metrics.expenses > 0 ? (category.value / metrics.expenses * 100) : 0;
            return (
              <div key={category.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(category.value)}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: category.color,
                      width: `${percentage}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;