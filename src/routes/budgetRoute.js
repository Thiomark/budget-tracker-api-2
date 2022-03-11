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
const router = express_1.default.Router();
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const index_1 = __importDefault(require("../config/index"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const uuid_1 = require("uuid");
router.get('/', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.user;
    const { rows } = yield index_1.default.query(`SELECT  bgt.*, cast(coalesce(sum(dd.amount), 0) AS int) as "removed_amount", budget + cast(coalesce(sum(dd.amount), 0) AS int) as "remaining_amount" FROM "Budget" bgt
                                            INNER JOIN "BudgetUser" bu on bu.budget_id = bgt.id
                                            LEFT JOIN "Deduction" dd ON dd.budgets_id = bgt.id
                                            where bu.username = $1
                                            GROUP BY bgt.id
                                            order by bgt.created_on desc;
                                            `, [username]);
    res.json(rows);
})));
router.get('/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { rows: [budget] } = yield index_1.default.query(`SELECT * FROM "Budget" WHERE id = $1`, [id]);
    res.json(budget);
})));
router.post('/', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.user;
    const { budget, created_on } = req.body;
    if (!budget)
        throw new Error('Provide a budget');
    const id = (0, uuid_1.v4)();
    const { rows } = yield index_1.default.query('INSERT INTO "Budget" (budget, user_id, id, created_on) values ($1, $2, $3, $4) returning *', [budget, username, id, new Date(created_on).toISOString()]);
    yield index_1.default.query('INSERT INTO "BudgetUser" (budget_id, username) values ($1, $2)', [id, username]);
    res.json(rows);
})));
router.post('/add/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.user;
    const { userToAdd } = req.body;
    const { id } = req.params;
    if (!userToAdd)
        throw new Error('Provide a user to add');
    const { rows: [budget] } = yield index_1.default.query('select * from "Budget" where id = $1 and user_id = $2', [id, username]);
    if (!budget)
        throw new Error(`You do not have permision to add users`);
    const { rows: [user] } = yield index_1.default.query('select * from "User" where username = $1', [userToAdd]);
    if (!user)
        throw new Error('User does not exist');
    yield index_1.default.query('INSERT INTO "BudgetUser" (budget_id, username) values ($1, $2)', [id, userToAdd]);
    res.json({ message: "User added to your budgets" });
})));
router.delete('/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username } = req.user;
    const { rows: [budget] } = yield index_1.default.query('select * from "Budget" where id = $1 and user_id = $2', [id, username]);
    if (!budget)
        throw new Error(`You do not have permision to add users`);
    yield index_1.default.query('DELETE FROM "BudgetUser" WHERE budget_id = $1', [id]);
    yield index_1.default.query('DELETE FROM "Budget" WHERE id = $1', [id]);
    res.json({ success: true });
})));
router.post('/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { budget } = req.body;
    const { id } = req.params;
    if (!budget)
        throw new Error('Provide a budget');
    const { rows } = yield index_1.default.query('UPDATE "Budget" SET budget = $1 WHERE id = $2 returning *', [budget, id]);
    res.json(rows);
})));
exports.default = router;
