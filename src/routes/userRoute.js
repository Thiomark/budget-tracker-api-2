"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = __importDefault(require("../config/index"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const route = express_1.default.Router();
route.post('/register', (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const { rows: [user] } = yield index_1.default.query(`select * from "User" where username = $1`, [email]);
    if (!password)
        throw new Error('Please provide a password');
    if (user)
        throw new Error('Email already exist');
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    const { rows: [newUser] } = yield index_1.default.query('insert into "User" (username, password, name) values ($1, $2, $3) returning username, name, created_on', [email, hashedPassword, name]);
    res.status(201).json({
        token: (0, generateToken_1.default)(newUser.username)
    });
})));
route.post('/login', (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { rows: [user] } = yield index_1.default.query(`select * from "User" where username = $1`, [email]);
    if (!password)
        throw new Error('Please provide a password');
    if (!user)
        throw new Error('invalid credentials');
    const checkPassword = yield bcryptjs_1.default.compare(password, user.password);
    if (!checkPassword)
        throw new Error('invalid credentials');
    res.status(201).json({
        token: (0, generateToken_1.default)(user.username)
    });
})));
exports.default = route;
