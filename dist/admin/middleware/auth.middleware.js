"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireRole = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../../configs/env.config");
const authenticateJWT = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const authHeader = req.headers.authorization || '';
    let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token && req.cookies && req.cookies['auth_token']) {
        token = req.cookies['auth_token'];
    }
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: token missing' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.SECRET_KEY);
        console.log('Admin Auth Middleware - Decoded User:', JSON.stringify(decoded, null, 2)); // Debug log
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error('Admin Auth Middleware - JWT verification failed:', err);
        console.error('Token used:', token.substring(0, 10) + '...'); // Log partial token safely
        return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }
};
exports.authenticateJWT = authenticateJWT;
const requireRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (user.role !== role)
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        next();
    };
};
exports.requireRole = requireRole;
exports.requireSuperAdmin = (0, exports.requireRole)('SUPER_ADMIN');
