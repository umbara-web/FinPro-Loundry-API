"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
exports.createCustomError = createCustomError;
class CustomError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "CustomError";
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }
    }
}
exports.CustomError = CustomError;
function createCustomError(statusCode, message) {
    return new CustomError(statusCode, message);
}
