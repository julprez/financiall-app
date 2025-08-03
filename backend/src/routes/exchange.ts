import express from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';

const router = express.Router();

// Endpoint para validar credenciales de Binance
router.post('/validate-binance', async (req, res) => {
  try {
    const { apiKey, apiSecret, testnet } = req.body;
    
    const baseUrl = testnet 
      ? 'https://testnet.binance.vision' 
      : 'https://api.binance.com';
    
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    
    // Crear firma HMAC SHA256
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
    
    const response = await fetch(`${baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        error: errorData.msg || `HTTP ${response.status}: ${response.statusText}`
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error validating Binance credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;