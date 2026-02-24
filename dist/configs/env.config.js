"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GMAIL_APP_PASS = exports.GMAIL_EMAIL = exports.CLOUDINARY_CLOUD_NAME = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.SECRET_KEY = exports.NEXT_PUBLIC_WEB_URL = exports.PORT = void 0;
require("dotenv/config");
const PORT = process.env.PORT || 8000;
exports.PORT = PORT;
let NEXT_PUBLIC_WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
exports.NEXT_PUBLIC_WEB_URL = NEXT_PUBLIC_WEB_URL;
// Force HTTP for localhost to avoid SSL errors
if (NEXT_PUBLIC_WEB_URL.includes('localhost') &&
    NEXT_PUBLIC_WEB_URL.startsWith('https://')) {
    exports.NEXT_PUBLIC_WEB_URL = NEXT_PUBLIC_WEB_URL = NEXT_PUBLIC_WEB_URL.replace('https://', 'http://');
}
// Validate required environment variables
if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY is required in .env file. Please add: SECRET_KEY=your-secret-key');
}
const SECRET_KEY = process.env.SECRET_KEY;
exports.SECRET_KEY = SECRET_KEY;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
exports.CLOUDINARY_API_KEY = CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
exports.CLOUDINARY_API_SECRET = CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
exports.CLOUDINARY_CLOUD_NAME = CLOUDINARY_CLOUD_NAME;
const GMAIL_EMAIL = process.env.GMAIL_EMAIL || '';
exports.GMAIL_EMAIL = GMAIL_EMAIL;
const GMAIL_APP_PASS = (process.env.GMAIL_APP_PASS || '').replace(/\s/g, '');
exports.GMAIL_APP_PASS = GMAIL_APP_PASS;
