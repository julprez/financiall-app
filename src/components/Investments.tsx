import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, PieChart } from 'lucide-react';
import { useFinanceStore, Investment } from '../store/useFinanceStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { exchangeService, ExchangeCredentials } from '../services/exchangeService';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const Investments: React.FC = () => {
  const {
    currencies,
    baseCurrency,
    entities,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    currentUser,
    getCurrentUserData,
    addExchangeCredentials,
    removeExchangeCredentials,
    getExchangeCredentials,
    syncInvestmentsFromExchange
  } = useFinanceStore();

  // Get user-specific data
  const userData = getCurrentUserData();
  const { investments } = userData;
  
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeFormData, setExchangeFormData] = useState({
    name: 'binance',
    apiKey: '',
    apiSecret: '',
    testnet: true
  });
  const [isValidatingCredentials, setIsValidatingCredentials] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const exchangeCredentials = getExchangeCredentials();
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock' as 'stock' | 'crypto' | 'bond' | 'fund' | 'other',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    currency: baseCurrency,
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    entityId: '',
  });
  
  const baseCurrencySymbol = currencies.find(c => c.code === baseCurrency)?.symbol || '€';
  
  // Calcular métricas
  const totalInvestmentValue = investments.reduce(
    (sum, inv) => sum + (inv.quantity * inv.currentPrice), 0
  );
  
  const totalInvestmentCost = investments.reduce(
    (sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0
  );
  
  const totalGainLoss = totalInvestmentValue - totalInvestmentCost;
  const totalGainLossPercent = totalInvestmentCost > 0 ? (totalGainLoss / totalInvestmentCost) * 100 : 0;
  
  // Datos para gráfico de distribución
  const portfolioData = investments.map(inv => ({
    name: inv.symbol,
    value: inv.quantity * inv.currentPrice,
    color: getColorByType(inv.type)
  }));
  
  function getColorByType(type: string) {
    const colors = {
      stock: '#3b82f6',
      crypto: '#f59e0b',
      bond: '#10b981',
      fund: '#8b5cf6',
      other: '#6b7280'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const investmentData = {
      symbol: formData.symbol,
      name: formData.name,
      type: formData.type,
      quantity: parseFloat(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: parseFloat(formData.currentPrice),
      currency: formData.currency,
      purchaseDate: formData.purchaseDate,
      entityId: formData.entityId,
      userId: currentUser?.id || '',
    };
    
    if (editingInvestment) {
      updateInvestment(editingInvestment.id, investmentData);
      setEditingInvestment(null);
    } else {
      addInvestment(investmentData);
    }
    
    setFormData({
      symbol: '',
      name: '',
      type: 'stock',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      currency: baseCurrency,
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      entityId: '',
    });
    setShowForm(false);
  };
  
  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que los campos no estén vacíos
    if (!exchangeFormData.apiKey.trim() || !exchangeFormData.apiSecret.trim()) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    setIsValidatingCredentials(true);
    
    try {
      console.log('Validando credenciales...', {
        exchange: exchangeFormData.name,
        testnet: exchangeFormData.testnet,
        apiKeyLength: exchangeFormData.apiKey.length,
        apiSecretLength: exchangeFormData.apiSecret.length
      });
      
      // Validar credenciales
      const isValid = await exchangeService.validateCredentials(
        exchangeFormData.name,
        exchangeFormData.apiKey.trim(),
        exchangeFormData.apiSecret.trim(),
        exchangeFormData.testnet
      );
      
      if (!isValid) {
        alert('Credenciales inválidas. Por favor, verifica tu API Key y Secret.');
        return;
      }
      
      // Guardar credenciales
      addExchangeCredentials({
        name: exchangeFormData.name,
        apiKey: exchangeFormData.apiKey.trim(),
        apiSecret: exchangeFormData.apiSecret.trim(),
        testnet: exchangeFormData.testnet,
        userId: currentUser?.id || ''
      });
      
      setExchangeFormData({ name: 'binance', apiKey: '', apiSecret: '', testnet: true });
      setShowExchangeForm(false);
      alert('Exchange conectado exitosamente!');
      
    } catch (error: any) {
      console.error('Error connecting exchange:', error);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error desconocido al validar las credenciales';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString().includes('NetworkError')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.toString().includes('CORS')) {
        errorMessage = 'Error de CORS. Puede ser necesario usar un proxy o configurar el servidor.';
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsValidatingCredentials(false);
    }
  };
  
  const handleSyncFromExchange = async (credentialsId: string) => {
    setIsSyncing(true);
    try {
      await syncInvestmentsFromExchange(credentialsId);
      alert('Inversiones sincronizadas exitosamente!');
    } catch (error) {
      console.error('Error syncing investments:', error);
      alert('Error sincronizando inversiones.');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      symbol: investment.symbol,
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity.toString(),
      purchasePrice: investment.purchasePrice.toString(),
      currentPrice: investment.currentPrice.toString(),
      currency: investment.currency,
      purchaseDate: format(new Date(investment.purchaseDate), 'yyyy-MM-dd'),
      entityId: investment.entityId || '',
    });
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio de Inversiones</h1>
          <p className="text-gray-600">Gestiona tus inversiones y analiza su rendimiento</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExchangeForm(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Conectar Exchange</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Añadir Manual</span>
          </button>
        </div>
      </div>
      
      {/* Exchange Connections */}
      {exchangeCredentials.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exchanges Conectados</h3>
          <div className="space-y-3">
            {exchangeCredentials.map((cred) => (
              <div key={cred.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {cred.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{cred.name}</p>
                    <p className="text-sm text-gray-600">
                      {cred.testnet ? 'Testnet' : 'Mainnet'} • 
                      Conectado el {format(new Date(cred.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncFromExchange(cred.id)}
                    disabled={isSyncing}
                    className="btn-primary text-sm"
                  >
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                  </button>
                  <button
                    onClick={() => removeExchangeCredentials(cred.id)}
                    className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                  >
                    Desconectar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {baseCurrencySymbol}{totalInvestmentValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coste Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {baseCurrencySymbol}{totalInvestmentCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-full bg-gray-500">
              <PieChart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ganancia/Pérdida</p>
              <p className={`text-2xl font-bold ${
                totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalGainLoss >= 0 ? '+' : ''}{baseCurrencySymbol}{totalGainLoss.toFixed(2)}
              </p>
              <p className={`text-sm ${
                totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              totalGainLoss >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-6 w-6 text-white" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución del Portfolio
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={(props: any) => {
                    const { name, percent } = props;
                    return `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`;
                  }}
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [
                    `${baseCurrencySymbol}${value.toFixed(2)}`, 
                    'Valor'
                  ]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Performance by Type */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rendimiento por Tipo
            </h3>
            <div className="space-y-3">
              {['stock', 'crypto', 'bond', 'fund', 'other'].map(type => {
                const typeInvestments = investments.filter(inv => inv.type === type);
                if (typeInvestments.length === 0) return null;
                
                const typeValue = typeInvestments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
                const typeCost = typeInvestments.reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
                const typeGainLoss = typeValue - typeCost;
                const typeGainLossPercent = typeCost > 0 ? (typeGainLoss / typeCost) * 100 : 0;
                
                const typeNames = {
                  stock: 'Acciones',
                  crypto: 'Criptomonedas',
                  bond: 'Bonos',
                  fund: 'Fondos',
                  other: 'Otros'
                };
                
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getColorByType(type) }}
                      />
                      <span className="font-medium text-gray-900">
                        {typeNames[type as keyof typeof typeNames]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {baseCurrencySymbol}{typeValue.toFixed(2)}
                      </p>
                      <p className={`text-sm ${
                        typeGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {typeGainLoss >= 0 ? '+' : ''}{typeGainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Exchange Connection Form Modal */}
      {showExchangeForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowExchangeForm(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Conectar Exchange
              </h3>
              
              <form onSubmit={handleExchangeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exchange
                  </label>
                  <select
                    value={exchangeFormData.name}
                    onChange={(e) => setExchangeFormData({ ...exchangeFormData, name: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="binance">Binance</option>
                    <option value="coinbase" disabled>Coinbase (Próximamente)</option>
                    <option value="kraken" disabled>Kraken (Próximamente)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={exchangeFormData.apiKey}
                    onChange={(e) => setExchangeFormData({ ...exchangeFormData, apiKey: e.target.value })}
                    className="input-field"
                    placeholder="Tu API Key del exchange"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={exchangeFormData.apiSecret}
                    onChange={(e) => setExchangeFormData({ ...exchangeFormData, apiSecret: e.target.value })}
                    className="input-field"
                    placeholder="Tu API Secret del exchange"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="testnet"
                    checked={exchangeFormData.testnet}
                    onChange={(e) => setExchangeFormData({ ...exchangeFormData, testnet: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="testnet" className="text-sm text-gray-700">
                    Usar Testnet (recomendado para pruebas)
                  </label>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Asegúrate de que tu API Key tenga permisos de solo lectura. 
                    Nunca compartas tus credenciales de API.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowExchangeForm(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isValidatingCredentials}
                    className="btn-primary"
                  >
                    {isValidatingCredentials ? 'Validando...' : 'Conectar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Investment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowForm(false)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editingInvestment ? 'Editar Inversión' : 'Nueva Inversión'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Símbolo
                    </label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      className="input-field"
                      placeholder="AAPL, BTC, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="input-field"
                      required
                    >
                      <option value="stock">Acción</option>
                      <option value="crypto">Criptomoneda</option>
                      <option value="bond">Bono</option>
                      <option value="fund">Fondo</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Apple Inc., Bitcoin, etc."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio de Compra
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Actual
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="input-field"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Compra
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entidad
                  </label>
                  <select
                    value={formData.entityId}
                    onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Seleccionar entidad</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name} ({entity.type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingInvestment(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingInvestment ? 'Actualizar' : 'Añadir'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Investments List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Inversiones</h3>
        {investments.length > 0 ? (
          <div className="space-y-3">
            {investments.map((investment) => {
              const gainLoss = (investment.currentPrice - investment.purchasePrice) * investment.quantity;
              const gainLossPercent = ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
              const currentValue = investment.quantity * investment.currentPrice;
              
              return (
                <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColorByType(investment.type) }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-900">{investment.symbol}</p>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {investment.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{investment.name}</p>
                      <p className="text-xs text-gray-500">
                        {investment.quantity} unidades • Comprado el {format(new Date(investment.purchaseDate), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {baseCurrencySymbol}{currentValue.toFixed(2)}
                      </p>
                      <p className={`text-sm font-medium ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gainLoss >= 0 ? '+' : ''}{baseCurrencySymbol}{gainLoss.toFixed(2)}
                      </p>
                      <p className={`text-xs ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(investment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteInvestment(investment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes inversiones</h3>
            <p className="text-gray-600 mb-4">Comienza añadiendo tu primera inversión para hacer seguimiento de tu portfolio</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Añadir Inversión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;