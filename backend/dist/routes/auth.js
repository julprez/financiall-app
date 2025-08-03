"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const init_1 = require("../database/init");
const router = express_1.default.Router();
exports.authRoutes = router;
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
        const existingUser = await (0, init_1.dbGet)('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }
        // Encriptar contraseña
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userId = (0, uuid_1.v4)();
        // Crear usuario
        await (0, init_1.dbRun)('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', [userId, name, email, hashedPassword]);
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
            await (0, init_1.dbRun)('INSERT INTO categories (id, user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), userId, category.name, category.type, category.color, category.icon]);
        }
        // Crear entidades por defecto
        const defaultEntities = [
            { name: 'Banco Santander', type: 'bank', color: '#dc2626' },
            { name: 'BBVA', type: 'bank', color: '#1d4ed8' },
            { name: 'eToro', type: 'broker', color: '#059669' },
            { name: 'Binance', type: 'exchange', color: '#f59e0b' },
        ];
        for (const entity of defaultEntities) {
            await (0, init_1.dbRun)('INSERT INTO entities (id, user_id, name, type, color) VALUES (?, ?, ?, ?, ?)', [(0, uuid_1.v4)(), userId, entity.name, entity.type, entity.color]);
        }
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: { id: userId, name, email }
        });
    }
    catch (error) {
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
        const user = await (0, init_1.dbGet)('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }
        // Verificar contraseña
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    }
    catch (error) {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await (0, init_1.dbGet)('SELECT id, name, email FROM users WHERE id = ?', [decoded.userId]);
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});
//# sourceMappingURL=auth.js.map