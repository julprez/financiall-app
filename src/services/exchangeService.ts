interface ExchangeCredentials {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
  userId: string;
  createdAt: string;
}

interface ExchangeBalance {
  asset: string;
  free: string;
  locked: string;
  total: string;
  usdValue?: number;
}

interface ExchangePosition {
  symbol: string;
  asset: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

class ExchangeService {
  private readonly CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  private readonly BINANCE_BASE_URL = 'https://api.binance.com';
  private readonly BINANCE_TESTNET_URL = 'https://testnet.binance.vision';

  // Validar credenciales de API
  async validateCredentials(exchange: string, apiKey: string, apiSecret: string, testnet = false): Promise<boolean> {
    try {
      switch (exchange.toLowerCase()) {
        case 'binance':
          return await this.validateBinanceCredentials(apiKey, apiSecret, testnet);
        default:
          throw new Error(`Exchange ${exchange} no soportado`);
      }
    } catch (error: any) {
      console.error('Error validating credentials:', error);
      
      // Manejar errores específicos de red
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión. Verifica que el servidor backend esté ejecutándose.');
      }
      
      throw error;
    }
  }

  private async validateBinanceCredentials(apiKey: string, apiSecret: string, testnet: boolean): Promise<boolean> {
    try {
      const baseUrl = testnet ? this.BINANCE_TESTNET_URL : this.BINANCE_BASE_URL;
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      
      const signature = await this.createBinanceSignature(queryString, apiSecret);
      
      // Usar proxy CORS (solo para desarrollo)
      const proxyUrl = `${this.CORS_PROXY}${baseUrl}/api/v3/account?${queryString}&signature=${signature}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('API Key inválida o sin permisos suficientes');
        } else if (response.status === 403) {
          throw new Error('Acceso denegado. Verifica las restricciones de IP en tu cuenta de Binance');
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data.success;
    } catch (error: any) {
      console.error('Error validating Binance credentials:', error);
      throw error;
    }
  }

  // Obtener balances del exchange
  async getExchangeBalances(credentials: ExchangeCredentials): Promise<ExchangeBalance[]> {
    try {
      switch (credentials.name.toLowerCase()) {
        case 'binance':
          return await this.getBinanceBalances(credentials);
        default:
          throw new Error(`Exchange ${credentials.name} no soportado`);
      }
    } catch (error) {
      console.error('Error fetching exchange balances:', error);
      return [];
    }
  }

  private async getBinanceBalances(credentials: ExchangeCredentials): Promise<ExchangeBalance[]> {
    try {
      const baseUrl = credentials.testnet ? this.BINANCE_TESTNET_URL : this.BINANCE_BASE_URL;
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      
      const signature = await this.createBinanceSignature(queryString, credentials.apiSecret);
      
      const response = await fetch(`${baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
        headers: {
          'X-MBX-APIKEY': credentials.apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching Binance account data');
      }

      const data = await response.json();
      
      return data.balances
        .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        .map((balance: any) => ({
          asset: balance.asset,
          free: balance.free,
          locked: balance.locked,
          total: (parseFloat(balance.free) + parseFloat(balance.locked)).toString()
        }));
    } catch (error) {
      console.error('Error fetching Binance balances:', error);
      return [];
    }
  }

  // Sincronizar inversiones desde exchange
  async syncInvestmentsFromExchange(credentials: ExchangeCredentials): Promise<ExchangePosition[]> {
    try {
      const balances = await this.getExchangeBalances(credentials);
      const positions: ExchangePosition[] = [];

      for (const balance of balances) {
        if (parseFloat(balance.total) > 0) {
          // Obtener precio actual del activo
          const currentPrice = await this.getAssetPrice(balance.asset, credentials.name);
          
          positions.push({
            symbol: balance.asset,
            asset: balance.asset,
            quantity: parseFloat(balance.total),
            averagePrice: currentPrice, // En un exchange real, necesitaríamos el historial de trades
            currentPrice: currentPrice,
            value: parseFloat(balance.total) * currentPrice,
            pnl: 0, // Calculado con precio promedio real
            pnlPercent: 0
          });
        }
      }

      return positions;
    } catch (error) {
      console.error('Error syncing investments:', error);
      return [];
    }
  }

  private async getAssetPrice(asset: string, exchange: string): Promise<number> {
    try {
      if (exchange.toLowerCase() === 'binance') {
        // Para activos que no son USDT, obtener precio en USDT
        if (asset === 'USDT' || asset === 'BUSD') return 1;
        
        const symbol = `${asset}USDT`;
        const response = await fetch(`${this.BINANCE_BASE_URL}/api/v3/ticker/price?symbol=${symbol}`);
        
        if (response.ok) {
          const data = await response.json();
          return parseFloat(data.price);
        }
      }
      
      return 0;
    } catch (error) {
      console.error(`Error fetching price for ${asset}:`, error);
      return 0;
    }
  }

  private async createBinanceSignature(queryString: string, apiSecret: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(apiSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(queryString)
      );
      
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('Error creating signature:', error);
      throw new Error('Error generando la firma de autenticación');
    }
  }
}

export const exchangeService = new ExchangeService();
export type { ExchangeCredentials, ExchangeBalance, ExchangePosition };