"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.transactionRoutes = router;
// Placeholder routes
router.get('/', (req, res) => {
    res.json({ message: 'Transactions endpoint' });
});
//# sourceMappingURL=transactions.js.map