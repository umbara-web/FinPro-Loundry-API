"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_config_1 = require("../../configs/env.config");
const customError_1 = require("./customError");
// Generate a JWT token with the given payload.
function generateToken(payload, expiresIn = '1h') {
    return jsonwebtoken_1.default.sign(payload, env_config_1.SECRET_KEY, { expiresIn });
}
// Verify a JWT token and return the decoded payload.
// Throws a custom error if the token is invalid or expired.
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_config_1.SECRET_KEY);
    }
    catch (err) {
        throw (0, customError_1.createCustomError)(400, 'Invalid or expired token');
    }
}
// Hash a password using bcrypt.
async function hashPassword(password) {
    const salt = await bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
}
// Compare a plain password with a hashed password.
async function comparePassword(plainPassword, hashedPassword) {
    return bcrypt_1.default.compare(plainPassword, hashedPassword);
}
