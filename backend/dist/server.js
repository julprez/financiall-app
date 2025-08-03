"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const transactions_1 = require("./routes/transactions");
const investments_1 = require("./routes/investments");
const categories_1 = require("./routes/categories");
const entities_1 = require("./routes/entities");
const init_1 = require("./database/init");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Rutas
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/transactions', transactions_1.transactionRoutes);
app.use('/api/investments', investments_1.investmentRoutes);
app.use('/api/categories', categories_1.categoryRoutes);
app.use('/api/entities', entities_1.entityRoutes);
// Manejo de errores
app.use(errorHandler_1.errorHandler);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Inicializar base de datos y servidor
(0, init_1.initDatabase)().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/health`);
    });
}).catch(console.error);
//# sourceMappingURL=server.js.map