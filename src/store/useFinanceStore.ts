import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  entity?: string;
  taxAmount?: number;
  taxRate?: number;
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  type: 'stock' | 'crypto' | 'bond' | 'fund' | 'other';
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  createdAt: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}

export interface Entity {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'broker' | 'exchange' | 'other';
  color: string;
  createdAt: string;
}

export interface TaxConfig {
  id: string;
  userId: string;
  name: string;
  rate: number;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

interface ExchangeCredentials {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
  userId: string;
  createdAt: string;
}

interface UserData {
  transactions: Transaction[];
  investments: Investment[];
  categories: Category[];
  entities: Entity[];
  taxConfigs: TaxConfig[];
  exchangeCredentials: ExchangeCredentials[];
}

interface FinanceState {
  // State
  currentUser: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  baseCurrency: string;
  categories: Category[];
  currencies: Currency[];
  entities: Entity[];
  taxConfigs: TaxConfig[];
  
  // Exchange methods
  addExchangeCredentials: (credentials: Omit<ExchangeCredentials, 'id' | 'createdAt'>) => void;
  removeExchangeCredentials: (id: string) => void;
  getExchangeCredentials: () => ExchangeCredentials[];
  syncInvestmentsFromExchange: (credentialsId: string) => Promise<void>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setBaseCurrency: (currency: string) => void;
  
  // Auth actions
  loginWithAPI: (email: string, password: string) => Promise<boolean>;
  registerWithAPI: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  syncWithAPI: () => Promise<void>;
  
  // Data actions
  getCurrentUserData: () => UserData;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt'>) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCurrency: (currency: Omit<Currency, 'id'>) => void;
  updateCurrency: (id: string, currency: Partial<Currency>) => void;
  deleteCurrency: (id: string) => void;
  addEntity: (entity: Omit<Entity, 'id' | 'createdAt'>) => void;
  updateEntity: (id: string, entity: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  addTaxConfig: (taxConfig: Omit<TaxConfig, 'id' | 'createdAt'>) => void;
  updateTaxConfig: (id: string, taxConfig: Partial<TaxConfig>) => void;
  deleteTaxConfig: (id: string) => void;
  resetAllData: () => void;
  exportUserData: () => string;
  importUserData: (data: string) => void;
}

// Default data
const defaultCategories: Category[] = [
  { id: '1', userId: '', name: 'Salario', type: 'income', color: '#10b981', icon: 'salary', createdAt: new Date().toISOString() },
  { id: '2', userId: '', name: 'Inversiones', type: 'income', color: '#8b5cf6', icon: 'investment', createdAt: new Date().toISOString() },
  { id: '3', userId: '', name: 'Alimentación', type: 'expense', color: '#f59e0b', icon: 'food', createdAt: new Date().toISOString() },
  { id: '4', userId: '', name: 'Transporte', type: 'expense', color: '#ef4444', icon: 'transport', createdAt: new Date().toISOString() },
  { id: '5', userId: '', name: 'Vivienda', type: 'expense', color: '#06b6d4', icon: 'home', createdAt: new Date().toISOString() },
  { id: '6', userId: '', name: 'Entretenimiento', type: 'expense', color: '#ec4899', icon: 'entertainment', createdAt: new Date().toISOString() },
  { id: '7', userId: '', name: 'Salud', type: 'expense', color: '#10b981', icon: 'health', createdAt: new Date().toISOString() },
];

const defaultCurrencies: Currency[] = [
  { id: '1', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 1 },
  { id: '2', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.1 },
  { id: '3', code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.85 },
];

const defaultEntities: Entity[] = [
  { id: '1', userId: '', name: 'Banco Principal', type: 'bank', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: '2', userId: '', name: 'Broker', type: 'broker', color: '#8b5cf6', createdAt: new Date().toISOString() },
];

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Utility function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

export const useFinanceStore = create<FinanceState>()(persist(
  (set, get) => ({
    // Initial state
    currentUser: null,
    isAuthenticated: false,
    theme: 'light',
    baseCurrency: 'EUR',
    categories: defaultCategories,
    currencies: defaultCurrencies,
    entities: defaultEntities,
    taxConfigs: [],
    
    // Theme actions
    setTheme: (theme) => set({ theme }),
    setBaseCurrency: (currency) => set({ baseCurrency: currency }),
    
    // Auth actions
    loginWithAPI: async (email: string, password: string) => {
      try {
        const response = await apiCall('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        
        localStorage.setItem('authToken', response.token);
        set({ 
          currentUser: response.user, 
          isAuthenticated: true 
        });
        
        // Sync data after login
        await get().syncWithAPI();
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    
    registerWithAPI: async (name: string, email: string, password: string) => {
      try {
        const response = await apiCall('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        
        localStorage.setItem('authToken', response.token);
        set({ 
          currentUser: response.user, 
          isAuthenticated: true 
        });
        
        // Sync data after registration
        await get().syncWithAPI();
        return true;
      } catch (error) {
        console.error('Registration failed:', error);
        return false;
      }
    },
    
    verifyToken: async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return false;
        
        const response = await apiCall('/auth/verify');
        set({ 
          currentUser: response.user, 
          isAuthenticated: true 
        });
        return true;
      } catch (error) {
        localStorage.removeItem('authToken');
        set({ currentUser: null, isAuthenticated: false });
        return false;
      }
    },
    
    syncWithAPI: async () => {
      try {
        // Sync categories, entities, etc. from API
        // This would be implemented based on your API endpoints
      } catch (error) {
        console.error('Sync failed:', error);
      }
    },
    
    login: async (email: string, password: string) => {
      return get().loginWithAPI(email, password);
    },
    
    register: async (name: string, email: string, password: string) => {
      return get().registerWithAPI(name, email, password);
    },
    
    logout: () => {
      localStorage.removeItem('authToken');
      set({ 
        currentUser: null, 
        isAuthenticated: false,
        categories: defaultCategories,
        entities: defaultEntities,
        taxConfigs: []
      });
    },
    
    // Data retrieval
    getCurrentUserData: (): UserData => {
      const state = get();
      const userId = state.currentUser?.id || '';
      
      // Get data from localStorage for now (would be from API in production)
      const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
      const allExchangeCredentials = JSON.parse(localStorage.getItem('exchangeCredentials') || '[]');
      
      return {
        transactions: allTransactions.filter((t: Transaction) => t.userId === userId),
        investments: allInvestments.filter((i: Investment) => i.userId === userId),
        categories: state.categories.filter(c => c.userId === userId || c.userId === ''),
        entities: state.entities.filter(e => e.userId === userId || e.userId === ''),
        taxConfigs: state.taxConfigs.filter(t => t.userId === userId),
        exchangeCredentials: allExchangeCredentials.filter((ec: ExchangeCredentials) => ec.userId === userId)
      };
    },
    
    // Transaction actions
    addTransaction: (transaction) => {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      allTransactions.push(newTransaction);
      localStorage.setItem('transactions', JSON.stringify(allTransactions));
    },
    
    updateTransaction: (id, updates) => {
      const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const index = allTransactions.findIndex((t: Transaction) => t.id === id);
      if (index !== -1) {
        allTransactions[index] = { ...allTransactions[index], ...updates };
        localStorage.setItem('transactions', JSON.stringify(allTransactions));
      }
    },
    
    deleteTransaction: (id) => {
      const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const filtered = allTransactions.filter((t: Transaction) => t.id !== id);
      localStorage.setItem('transactions', JSON.stringify(filtered));
    },
    
    // Investment actions
    addInvestment: (investment) => {
      const newInvestment = {
        ...investment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
      allInvestments.push(newInvestment);
      localStorage.setItem('investments', JSON.stringify(allInvestments));
    },
    
    updateInvestment: (id, updates) => {
      const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
      const index = allInvestments.findIndex((i: Investment) => i.id === id);
      if (index !== -1) {
        allInvestments[index] = { ...allInvestments[index], ...updates };
        localStorage.setItem('investments', JSON.stringify(allInvestments));
      }
    },
    
    deleteInvestment: (id) => {
      const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
      const filtered = allInvestments.filter((i: Investment) => i.id !== id);
      localStorage.setItem('investments', JSON.stringify(filtered));
    },
    
    // Category actions
    addCategory: (category) => {
      const newCategory = {
        ...category,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      set(state => ({ categories: [...state.categories, newCategory] }));
    },
    
    updateCategory: (id, updates) => {
      set(state => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    },
    
    deleteCategory: (id) => {
      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    },
    
    // Currency actions
    addCurrency: (currency) => {
      const newCurrency = {
        ...currency,
        id: Date.now().toString()
      };
      set(state => ({ currencies: [...state.currencies, newCurrency] }));
    },
    
    updateCurrency: (id, updates) => {
      set(state => ({
        currencies: state.currencies.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    },
    
    deleteCurrency: (id) => {
      set(state => ({
        currencies: state.currencies.filter(c => c.id !== id)
      }));
    },
    
    // Entity actions
    addEntity: (entity) => {
      const newEntity = {
        ...entity,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      set(state => ({ entities: [...state.entities, newEntity] }));
    },
    
    updateEntity: (id, updates) => {
      set(state => ({
        entities: state.entities.map(e => e.id === id ? { ...e, ...updates } : e)
      }));
    },
    
    deleteEntity: (id) => {
      set(state => ({
        entities: state.entities.filter(e => e.id !== id)
      }));
    },
    
    // Tax config actions
    addTaxConfig: (taxConfig) => {
      const newTaxConfig = {
        ...taxConfig,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      set(state => ({ taxConfigs: [...state.taxConfigs, newTaxConfig] }));
    },
    
    updateTaxConfig: (id, updates) => {
      set(state => ({
        taxConfigs: state.taxConfigs.map(t => t.id === id ? { ...t, ...updates } : t)
      }));
    },
    
    deleteTaxConfig: (id) => {
      set(state => ({
        taxConfigs: state.taxConfigs.filter(t => t.id !== id)
      }));
    },
    
    // Utility actions
    resetAllData: () => {
      localStorage.clear();
      set({
        currentUser: null,
        isAuthenticated: false,
        categories: defaultCategories,
        entities: defaultEntities,
        taxConfigs: []
      });
    },
    
    exportUserData: () => {
      const userData = get().getCurrentUserData();
      return JSON.stringify(userData, null, 2);
    },
    
    importUserData: (data: string) => {
      try {
        const parsedData = JSON.parse(data);
        // Import logic would go here
        console.log('Importing data:', parsedData);
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    },

    // Exchange methods
    addExchangeCredentials: (credentials) => {
      const { currentUser } = get();
      if (!currentUser) return;

      const newCredentials: ExchangeCredentials = {
        ...credentials,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const allExchangeCredentials = JSON.parse(localStorage.getItem('exchangeCredentials') || '[]');
      allExchangeCredentials.push(newCredentials);
      localStorage.setItem('exchangeCredentials', JSON.stringify(allExchangeCredentials));
    },

    removeExchangeCredentials: (id) => {
      const allExchangeCredentials = JSON.parse(localStorage.getItem('exchangeCredentials') || '[]');
      const filtered = allExchangeCredentials.filter((cred: ExchangeCredentials) => cred.id !== id);
      localStorage.setItem('exchangeCredentials', JSON.stringify(filtered));
    },

    getExchangeCredentials: () => {
      const { currentUser } = get();
      if (!currentUser) return [];
      
      const allExchangeCredentials = JSON.parse(localStorage.getItem('exchangeCredentials') || '[]');
      return allExchangeCredentials.filter((cred: ExchangeCredentials) => cred.userId === currentUser.id);
    },

    syncInvestmentsFromExchange: async (credentialsId) => {
      const { currentUser, addInvestment } = get();
      if (!currentUser) return;

      const credentials = get().getExchangeCredentials().find(cred => cred.id === credentialsId);
      if (!credentials) return;

      try {
        const { exchangeService } = await import('../services/exchangeService');
        const positions = await exchangeService.syncInvestmentsFromExchange(credentials);
        
        // Convertir posiciones a inversiones
        positions.forEach(position => {
          if (position.quantity > 0) {
            addInvestment({
              symbol: position.symbol,
              name: `${position.asset} (${credentials.name})`,
              type: 'crypto',
              quantity: position.quantity,
              purchasePrice: position.averagePrice,
              currentPrice: position.currentPrice,
              currency: 'EUR', // Convertir desde USD si es necesario
              purchaseDate: new Date().toISOString().split('T')[0],
              userId: currentUser.id,
            });
          }
        });
      } catch (error) {
        console.error('Error syncing from exchange:', error);
      }
    }
  }),
  {
    name: 'finance-store',
    partialize: (state) => ({
      theme: state.theme,
      baseCurrency: state.baseCurrency,
      categories: state.categories,
      currencies: state.currencies,
      entities: state.entities,
      taxConfigs: state.taxConfigs
    })
  }
));