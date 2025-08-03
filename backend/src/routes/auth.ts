import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet } from '../database/init';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'financiall-secret-key';

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validación de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Crear usuario
    await dbRun(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [userId, name, email, hashedPassword]
    );

    // Crear categorías por defecto
    const defaultCategories = [
      { name: 'Salario', type: 'income', color: '#22c55e', icon: 'salary' },
      { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'wallet' },
      { name: 'Inversiones', type: 'income', color: '#8b5cf6', icon: 'investment' },
      { name: 'Alimentación', type: 'expense', color: '#f59e0b', icon: 'food' },
      { name: 'Transporte', type: 'expense', color: '#ef4444', icon: 'transport' },
      { name: 'Vivienda', type: 'expense', color: '#06b6d4', icon: 'home' },
      { name: 'Entretenimiento', type: 'expense', color: '#ec4899', icon: 'entertainment' },
      { name: 'Salud', type: 'expense', color: '#10b981', icon: 'health' },
    ];

    for (const category of defaultCategories) {
      await dbRun(
        'INSERT INTO categories (id, user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, category.name, category.type, category.color, category.icon]
      );
    }

    // Crear entidades por defecto
    const defaultEntities = [
      { name: 'Banco Santander', type: 'bank', color: '#dc2626' },
      { name: 'BBVA', type: 'bank', color: '#1d4ed8' },
      { name: 'eToro', type: 'broker', color: '#059669' },
      { name: 'Binance', type: 'exchange', color: '#f59e0b' },
    ];

    for (const entity of defaultEntities) {
      await dbRun(
        'INSERT INTO entities (id, user_id, name, type, color) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), userId, entity.name, entity.type, entity.color]
      );
    }

    // Generar JWT
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = await dbGet('SELECT id, name, email FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export { router as authRoutes };