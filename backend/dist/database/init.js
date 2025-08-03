"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.initDatabase = exports.dbAll = exports.dbGet = exports.dbRun = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dataDir = path_1.default.join(__dirname, '../../data');
const dbPath = path_1.default.join(dataDir, 'financiall.db');
// Crear directorio data si no existe
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const db = new sqlite3_1.default.Database(dbPath);
exports.db = db;
// Promisificar métodos de la base de datos
exports.dbRun = (0, util_1.promisify)(db.run.bind(db));
exports.dbGet = (0, util_1.promisify)(db.get.bind(db));
exports.dbAll = (0, util_1.promisify)(db.all.bind(db));
const initDatabase = async () => {
    try {
        // Tabla de usuarios
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Tabla de transacciones
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'EUR',
        entity TEXT,
        tax_amount REAL,
        tax_rate REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        // Tabla de inversiones
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS investments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity REAL NOT NULL,
        purchase_price REAL NOT NULL,
        current_price REAL NOT NULL,
        purchase_date TEXT NOT NULL,
        type TEXT CHECK(type IN ('stock', 'crypto', 'bond', 'fund')) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'EUR',
        entity TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        // Tabla de categorías
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        // Tabla de entidades
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('bank', 'broker', 'exchange', 'other')) NOT NULL,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        // Tabla de configuraciones de impuestos
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS tax_configs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        rate REAL NOT NULL,
        country TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
        console.log('✅ Base de datos inicializada correctamente');
    }
    catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        throw error;
    }
};
exports.initDatabase = initDatabase;
//# sourceMappingURL=init.js.map