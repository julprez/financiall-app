import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  Info,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { format, subDays, isAfter, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { FinanceIcon, FinanceIconType } from './FinanceIcons';

const Dashboard: React.FC = () => {
  const { getCurrentUserData, baseCurrency, currentUser, currencies } = useFinanceStore();
  const userData = getCurrentUserData();
  const { transactions, investments, categories } = userData;
  
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showValues, setShowValues] = useState(true);

  // Colores modernos para las gráficas
  const CHART_COLORS = {
    income: '#10b981', // Verde esmeralda
    expenses: '#f59e0b', // Ámbar
    net: '#3b82f6', // Azul
    gradient: {
      income: ['#10b981', '#34d399'],
      expenses: ['#f59e0b', '#fbbf24'],
      net: ['#3b82f6', '#60a5fa']
    }
  };

  const PIE_COLORS = [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#6366f1', '#84cc16'
  ];

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {entry.name}: 
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Tooltip para gráfica de pastel
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <FinanceIcon type={data.icon as FinanceIconType} className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              {data.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-500">
            {((data.value / totalExpenses) * 100).toFixed(1)}% del total
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Función para obtener el rango de fechas
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      case '1y': return subDays(now, 365);
      default: return subDays(now, 30);
    };
  };
  
  const startDate = getDateRange();
  const filteredTransactions = transactions.filter(t => 
    isAfter(new Date(t.date), startDate)
  );
  
  // Calculate totals with time range
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netWorth = totalIncome - totalExpenses;
  
  const totalInvestmentValue = investments.reduce(
    (sum, inv) => sum + (inv.quantity * inv.currentPrice), 0
  );
  
  const totalInvestmentCost = investments.reduce(
    (sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0
  );
  
  const investmentGainLoss = totalInvestmentValue - totalInvestmentCost;
  const investmentGainLossPercent = totalInvestmentCost > 0 
    ? (investmentGainLoss / totalInvestmentCost) * 100 
    : 0;
  
  // Recent transactions (last 7 days)
  const recentTransactions = transactions
    .filter(t => isAfter(new Date(t.date), subDays(new Date(), 7)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Chart data for selected time range
  const getDaysInRange = () => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };
  
  const chartData = Array.from({ length: getDaysInRange() }, (_, i) => {
    const date = subDays(new Date(), getDaysInRange() - 1 - i);
    const dayTransactions = transactions.filter(t => 
      format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: timeRange === '1y' ? format(date, 'MMM') : format(date, 'dd/MM'),
      income,
      expenses,
      net: income - expenses
    };
  });
  
  // Category breakdown for pie chart
  const categoryData = categories.map(category => {
    const categoryTransactions = filteredTransactions.filter(t => 
      t.category === category.name && t.type === 'expense'
    );
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: total,
      color: category.color,
      icon: category.icon
    };
  }).filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  
  const baseCurrencySymbol = currencies.find(c => c.code === baseCurrency)?.symbol || '€';
  
  const formatCurrency = (value: number) => {
    if (!showValues) return '••••';
    return `${baseCurrencySymbol}${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
  };
  
  const StatCard = ({ title, value, change, icon: Icon, color }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {showValues ? formatCurrency(value) : '••••••'}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-xs sm:text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span className="ml-1 truncate">
                {Math.abs(change).toFixed(1)}% vs mes anterior
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color} flex-shrink-0 ml-2`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            ¡Hola, {currentUser?.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Aquí tienes un resumen de tus finanzas
          </p>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Patrimonio Neto"
          value={netWorth}
          change={12.5}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Ingresos Totales"
          value={totalIncome}
          change={8.2}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Gastos Totales"
          value={totalExpenses}
          change={-3.1}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title="Inversiones"
          value={totalInvestmentValue}
          change={investmentGainLoss > 0 ? 15.7 : -5.2}
          icon={PiggyBank}
          color="bg-purple-500"
        />
      </div>

      {/* Sección de Posición Global */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Widget de Evolución */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evolución Financiera</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Últimos 12 meses</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(netWorth)}
                </span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">+5.1%</span>
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Widget de Distribución Circular */}
        <div className="card">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Distribución</h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(Math.abs(totalExpenses))}
            </div>
          </div>
          
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sección de Métricas Detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ingresos</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(totalIncome)}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-blue-600 dark:text-blue-400">Este mes</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pagos</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatCurrency(totalExpenses)}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-orange-600 dark:text-orange-400">Este mes</span>
              </div>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Balance</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(netWorth)}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-600 dark:text-green-400">Total</span>
              </div>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Inversiones</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(totalInvestmentValue)}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-purple-600 dark:text-purple-400">Total</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="space-y-6">
        {/* Controles de tiempo y visualización */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Período:
              </span>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 días' : 
                   range === '30d' ? '30 días' : 
                   range === '90d' ? '3 meses' : '1 año'}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{showValues ? 'Ocultar valores' : 'Mostrar valores'}</span>
          </button>
        </div>

        {/* Gráfica principal mejorada */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Gráfica de líneas con área */}
          <div className="xl:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Flujo de Efectivo
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ingresos vs Gastos - {timeRange === '7d' ? 'Últimos 7 días' : 
                                            timeRange === '30d' ? 'Últimos 30 días' : 
                                            timeRange === '90d' ? 'Últimos 3 meses' : 'Último año'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Gastos</span>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.expenses} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.expenses} stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => showValues ? `${baseCurrencySymbol}${(value/1000).toFixed(0)}k` : '•••'}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke={CHART_COLORS.income}
                    strokeWidth={3}
                    fill="url(#incomeGradient)"
                    name="Ingresos"
                    dot={{ fill: CHART_COLORS.income, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: CHART_COLORS.income, strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke={CHART_COLORS.expenses}
                    strokeWidth={3}
                    fill="url(#expensesGradient)"
                    name="Gastos"
                    dot={{ fill: CHART_COLORS.expenses, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: CHART_COLORS.expenses, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de pastel mejorada */}
          <div>
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <PieChartIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Gastos por Categoría
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Distribución del gasto
                  </p>
                </div>
              </div>
              
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
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
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Leyenda personalizada */}
                  <div className="space-y-2 mt-4">
                    {categoryData.slice(0, 4).map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <FinanceIcon type={item.icon as FinanceIconType} className="w-4 h-4" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {showValues ? formatCurrency(item.value) : '•••'}
                        </span>
                      </div>
                    ))}
                    {categoryData.length > 4 && (
                      <div className="text-xs text-gray-500 text-center pt-2">
                        +{categoryData.length - 4} categorías más
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No hay gastos por categoría</p>
                  <p className="text-xs">Añade transacciones para ver el análisis</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfica de barras para comparación mensual */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Balance Neto Diario
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Diferencia entre ingresos y gastos
              </p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => showValues ? `${baseCurrencySymbol}${(value/1000).toFixed(0)}k` : '•••'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="net" 
                name="Balance Neto"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.net >= 0 ? CHART_COLORS.income : CHART_COLORS.expenses}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transacciones Recientes
        </h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(transaction.date), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {baseCurrencySymbol}{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{transaction.category}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ArrowUpRight className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No hay transacciones recientes</p>
            <p className="text-sm">Añade tu primera transacción para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;