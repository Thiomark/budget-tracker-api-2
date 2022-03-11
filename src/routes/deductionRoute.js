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
const authMiddleware_1 = require("../middleware/authMiddleware");
const index_1 = __importDefault(require("../config/index"));
const uuid_1 = require("uuid");
const storage_1 = require("firebase/storage");
const route = express_1.default.Router();
// @desc    Fetch deductions by the budget id
// @route   GET /api/v1/deductions/:id
// @access  Private
route.get('/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username } = req.user;
    const { rows } = yield index_1.default.query(`select d.* from "Deduction" d inner join "BudgetUser" bu on bu.budget_id = d.budgets_id 
                                            where budgets_id = $1 and username = $2 order by created_on desc`, [id, username]);
    res.json(rows);
})));
// @desc    Adding a deduction by budget id
// @route   POST /api/v1/deductions/:id
// @access  Private
route.post('/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username } = req.user;
    const { amount, description, image, tags, created_on } = req.body;
    if (!amount)
        throw new Error('Provide an amount deducted');
    const { rows: [record] } = yield index_1.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [id, username]);
    if (!record)
        throw new Error('You do not have permission to do that');
    const newID = (0, uuid_1.v4)();
    const { rows: [newDeduction] } = yield index_1.default.query(`insert into "Deduction" (amount, description, image, tags, id, budgets_id, created_on)
                                                        values ($1, $2, $3, $4, $5, $6, $7) returning *`, [amount, description, image, tags, newID, id, new Date(created_on).toISOString()]);
    res.json(newDeduction);
})));
// @desc    Editing a deduction by budget-id and deduction-id
// @route   POST /api/v1/deductions/:id
// @access  Private
route.post('/:budgetID/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { budgetID, id } = req.params;
    const { username } = req.user;
    const { amount, description, tags, created_on } = req.body;
    if (!amount)
        throw new Error('Provide an amount deducted');
    const { rows: [record] } = yield index_1.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
    if (!record)
        throw new Error('You do not have permission to do that');
    const { rows: [deduction] } = yield index_1.default.query(`UPDATE "Deduction" SET amount = $1, description = $2, tags = $3, created_on = $4 
                                                    WHERE id = $5 returning *`, [amount, description, tags, new Date(created_on).toISOString(), id]);
    res.json(deduction);
})));
route.get('/sss/sss/ss', (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const storage = (0, storage_1.getStorage)();
    const listRef = (0, storage_1.ref)(storage, 'budgets');
    // Find all the prefixes and items.
    (0, storage_1.listAll)(listRef)
        .then((res) => {
        res.items.forEach((itemRef) => {
            (0, storage_1.getDownloadURL)((0, storage_1.ref)(storage, `budgets/${itemRef.name}`))
                .then((url) => {
                console.log(url);
            })
                .catch((error) => {
                console.log(error);
            });
        });
    })
        .catch((error) => {
        console.log(error);
    });
    res.send({ yes: 'yes' });
})));
// @desc    deleting a deductions by the budget-id and deduction-id
// @route   GET /api/v1/deductions/:budgetID/:id
// @access  Private
route.delete('/:budgetID/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { budgetID, id } = req.params;
    const { username } = req.user;
    const { rows: [record] } = yield index_1.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
    if (!record)
        throw new Error('You do not have permission to do that');
    yield index_1.default.query(`delete from "Deduction" where id = $1`, [id]);
    res.json({ success: true });
})));
exports.default = route;
