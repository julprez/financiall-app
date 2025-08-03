import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Palette,
  Globe,
  CreditCard,
  Building,
  Tag,
  Save,
  X,
  Percent
} from 'lucide-react';
import IconManager from './IconManager';
import { useFinanceStore, Category } from '../store/useFinanceStore';
import { FinanceIcon, FinanceIconType, FINANCE_ICONS } from './FinanceIcons';

type SettingsTab = 'general' | 'categories' | 'currencies' | 'entities' | 'taxes';

const SettingsPanel: React.FC = () => {
  const {
    categories,
    currencies,
    entities,
    taxConfigs,
    baseCurrency,
    theme,
    currentUser,
    addCategory,
    updateCategory,
    deleteCategory,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    addEntity,
    updateEntity,
    deleteEntity,
    addTaxConfig,
    updateTaxConfig,
    deleteTaxConfig,
    setBaseCurrency,
    setTheme
  } = useFinanceStore();
  
  // Add this useEffect to apply dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCurrencyForm, setShowCurrencyForm] = useState(false);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3b82f6',
    icon: 'wallet'
  });
  
  const [currencyForm, setCurrencyForm] = useState({
    code: '',
    name: '',
    symbol: '',
    exchangeRate: '1'
  });
  
  const [entityForm, setEntityForm] = useState({
    name: '',
    type: 'bank' as 'bank' | 'broker' | 'exchange' | 'other',
    color: '#3b82f6'
  });
  
  const [taxForm, setTaxForm] = useState({
    name: '',
    rate: '',
    country: 'ES',
    isDefault: false
  });
  
  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'categories', name: 'Categorías', icon: Tag },
    { id: 'currencies', name: 'Divisas', icon: Globe },
    { id: 'entities', name: 'Entidades', icon: Building },
    { id: 'taxes', name: 'Impuestos', icon: Percent },
  ];
  
  const handleCloseModal = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', type: 'expense', color: '#3b82f6', icon: 'wallet' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Editing category:', editingCategory);
    console.log('Form data:', categoryForm);
    
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryForm);
      setEditingCategory(null);
    } else {
      addCategory({
        ...categoryForm,
        userId: currentUser?.id || ''
      });
    }
    setCategoryForm({ name: '', type: 'expense', color: '#3b82f6', icon: 'Tag' });
    setShowCategoryForm(false);
  };

  const handleEditCategory = (category: Category) => {
    console.log('Opening edit modal for category:', category);
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    });
    setShowCategoryForm(true);
  };
  
  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    addCurrency({
      code: currencyForm.code.toUpperCase(),
      name: currencyForm.name,
      symbol: currencyForm.symbol,
      exchangeRate: parseFloat(currencyForm.exchangeRate)
    });
    setCurrencyForm({ code: '', name: '', symbol: '', exchangeRate: '1' });
    setShowCurrencyForm(false);
  };
  
  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    addEntity({
      ...entityForm,
      userId: currentUser?.id || ''
    });
    setEntityForm({ name: '', type: 'bank', color: '#3b82f6' });
    setShowEntityForm(false);
  };
  
  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    addTaxConfig({
      name: taxForm.name,
      rate: parseFloat(taxForm.rate),
      country: taxForm.country,
      isDefault: taxForm.isDefault,
      userId: currentUser?.id || ''
    });
    setTaxForm({ name: '', rate: '', country: 'ES', isDefault: false });
    setShowTaxForm(false);
  };
  
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda Base
            </label>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="input-field max-w-xs"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Esta será la moneda principal para mostrar los totales y cálculos
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  theme === 'light' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
                <span>Claro</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="w-4 h-4 bg-gray-800 rounded" />
                <span>Oscuro</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderCategoriesSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', type: 'expense', color: '#3b82f6', icon: 'Tag' });
            setShowCategoryForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-3">Categorías de Ingresos</h4>
          <div className="space-y-2">
            {categories.filter(cat => cat.type === 'income').map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <FinanceIcon 
                      type={category.icon as FinanceIconType} 
                      className="text-gray-600" 
                      size={20} 
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <span className="text-gray-900">{category.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditCategory(category)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(category.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-3">Categorías de Gastos</h4>
          <div className="space-y-2">
            {categories.filter(cat => cat.type === 'expense').map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <FinanceIcon 
                      type={category.icon as FinanceIconType} 
                      className="text-gray-600" 
                      size={20} 
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <span className="text-gray-900">{category.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditCategory(category)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(category.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseModal} />
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => {
                      console.log('Name changed to:', e.target.value);
                      setCategoryForm({ ...categoryForm, name: e.target.value });
                    }}
                    className="input-field"
                    placeholder="Nombre de la categoría"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    value={categoryForm.type}
                    onChange={(e) => {
                      console.log('Type changed to:', e.target.value);
                      setCategoryForm({ ...categoryForm, type: e.target.value as 'income' | 'expense' });
                    }}
                    className="input-field"
                  >
                    <option value="expense">Gasto</option>
                    <option value="income">Ingreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => {
                      console.log('Color changed to:', e.target.value);
                      setCategoryForm({ ...categoryForm, color: e.target.value });
                    }}
                    className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icono</label>
                  <IconManager
                    onIconSelect={(iconName) => {
                      setCategoryForm(prev => ({ ...prev, icon: iconName }));
                    }}
                    selectedIcon={categoryForm.icon}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={handleCloseModal} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>{editingCategory ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderCurrenciesSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Divisas</h3>
        <button
          onClick={() => setShowCurrencyForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Divisa</span>
        </button>
      </div>
      
      <div className="card">
        <div className="space-y-3">
          {currencies.map(currency => (
            <div key={currency.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-600">
                  {currency.symbol}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {currency.code} - {currency.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Tasa de cambio: {currency.exchangeRate}
                    {currency.code === baseCurrency && ' (Base)'}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setBaseCurrency(currency.code)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    currency.code === baseCurrency
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {currency.code === baseCurrency ? 'Base' : 'Hacer Base'}
                </button>
                <button 
                  onClick={() => deleteCurrency(currency.code)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  disabled={currency.code === baseCurrency}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Currency Form Modal */}
      {showCurrencyForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCurrencyForm(false)} />
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Nueva Divisa</h3>
                <button
                  onClick={() => setShowCurrencyForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddCurrency} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={currencyForm.code}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, code: e.target.value.toUpperCase() })}
                    className="input-field"
                    placeholder="USD, BTC, etc."
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={currencyForm.name}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Dólar Estadounidense"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Símbolo</label>
                  <input
                    type="text"
                    value={currencyForm.symbol}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                    className="input-field"
                    placeholder="$, ₿, etc."
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasa de Cambio (relativa a {baseCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={currencyForm.exchangeRate}
                    onChange={(e) => setCurrencyForm({ ...currencyForm, exchangeRate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowCurrencyForm(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Crear</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEntitiesSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Entidades Financieras</h3>
        <button
          onClick={() => setShowEntityForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Entidad</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map(entity => (
          <div key={entity.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: entity.color }}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{entity.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {entity.type === 'bank' ? 'Banco' : 
                     entity.type === 'broker' ? 'Broker' :
                     entity.type === 'exchange' ? 'Exchange' : 'Otro'}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setEntityForm({
                      name: entity.name,
                      type: entity.type,
                      color: entity.color
                    });
                    setShowEntityForm(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deleteEntity(entity.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Entity Form Modal */}
      {showEntityForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowEntityForm(false)} />
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nueva Entidad</h3>
                <button
                  onClick={() => setShowEntityForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddEntity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={entityForm.name}
                    onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                    className="input-field"
                    placeholder="Nombre de la entidad"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    value={entityForm.type}
                    onChange={(e) => setEntityForm({ ...entityForm, type: e.target.value as 'bank' | 'broker' | 'exchange' | 'other' })}
                    className="input-field"
                  >
                    <option value="bank">Banco</option>
                    <option value="broker">Broker</option>
                    <option value="exchange">Exchange</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                  <input
                    type="color"
                    value={entityForm.color}
                    onChange={(e) => setEntityForm({ ...entityForm, color: e.target.value })}
                    className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowEntityForm(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Crear</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTaxesSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración de Impuestos</h3>
        <button
          onClick={() => setShowTaxForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Impuesto</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {taxConfigs.map(tax => (
          <div key={tax.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-gray-900 dark:text-white">{tax.name}</div>
                  {tax.isDefault && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Por defecto
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tasa: {tax.rate}% • País: {tax.country}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setTaxForm({
                      name: tax.name,
                      rate: tax.rate.toString(),
                      country: tax.country,
                      isDefault: tax.isDefault
                    });
                    setShowTaxForm(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deleteTaxConfig(tax.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Tax Form Modal */}
      {showTaxForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowTaxForm(false)} />
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nuevo Impuesto</h3>
                <button
                  onClick={() => setShowTaxForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddTax} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={taxForm.name}
                    onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
                    className="input-field"
                    placeholder="IVA, IRPF, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tasa (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxForm.rate}
                    onChange={(e) => setTaxForm({ ...taxForm, rate: e.target.value })}
                    className="input-field"
                    placeholder="21.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País</label>
                  <select
                    value={taxForm.country}
                    onChange={(e) => setTaxForm({ ...taxForm, country: e.target.value })}
                    className="input-field"
                  >
                    <option value="ES">España</option>
                    <option value="US">Estados Unidos</option>
                    <option value="MX">México</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="PE">Perú</option>
                    <option value="CL">Chile</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={taxForm.isDefault}
                    onChange={(e) => setTaxForm({ ...taxForm, isDefault: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Usar como impuesto por defecto
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowTaxForm(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Crear</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'categories':
        return renderCategoriesSettings();
      case 'currencies':
        return renderCurrenciesSettings();
      case 'entities':
        return renderEntitiesSettings();
      case 'taxes':
        return renderTaxesSettings();
      default:
        return renderGeneralSettings();
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Personaliza tu aplicación financiera</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default SettingsPanel;