"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
const generateToken = (username) => {
    return jsonwebtoken_1.default.sign({ username }, secret, {
        expiresIn: '30d',
    });
};
exports.default = generateToken;
