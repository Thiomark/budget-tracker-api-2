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
//import upload from '../middleware/upload';
const index_1 = __importDefault(require("../config/index"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const storage_1 = require("firebase/storage");
const helperFunctions_1 = require("../utils/helperFunctions");
const route = express_1.default.Router();
const memoryStorage = multer_1.default.memoryStorage();
const multerUpload = (0, multer_1.default)({
    storage: memoryStorage
});
// @desc    uploading a image with budget id
// @route   GET /api/v1/deductions/image
// @access  Private
route.post('/image/:id', multerUpload.single('featuredImage'), (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const { id } = req.params;
    if (file) {
        const storage = (0, storage_1.getStorage)();
        const reff = (0, storage_1.ref)(storage, `budgets/${id}/${file.originalname}`);
        // const img = await fetch(file.buffer);
        // const bytes = await img.blob();
        yield (0, storage_1.uploadBytes)(reff, file.buffer);
    }
    res.send('hello');
})));
// @desc    Fetch deductions by the budget id
// @route   GET /api/v1/deductions/:id
// @access  Private
route.get('/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username } = req.user;
    const storage = (0, storage_1.getStorage)();
    const listRef = (0, storage_1.ref)(storage, `budgets/${id}`);
    const { items } = yield (0, storage_1.listAll)(listRef);
    const images = yield Promise.all(items.map((itemRef) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            url: yield (0, storage_1.getDownloadURL)((0, storage_1.ref)(storage, `budgets/${id}/${itemRef.name}`)),
            imageName: itemRef.name
        };
    })));
    const { rows } = yield index_1.default.query(`select d.* from "Deduction" d inner join "BudgetUser" bu on bu.budget_id = d.budgets_id 
                                            where budgets_id = $1 and username = $2 order by created_on desc`, [id, username]);
    res.send((0, helperFunctions_1.searchForItem)(rows, images));
})));
// @desc    Adding a deduction by budget id
// @route   POST /api/v1/deductions/:id
// @access  Private
route.post('/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username } = req.user;
    let { amount, description, image, tags, created_on } = req.body;
    if (!amount)
        throw new Error('Provide an amount deducted');
    const { rows: [record] } = yield index_1.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [id, username]);
    if (!record)
        throw new Error('You do not have permission to do that');
    const newID = (0, uuid_1.v4)();
    const { rows: [newDeduction] } = yield index_1.default.query(`insert into "Deduction" (amount, description, image, tags, id, budgets_id, created_on)
                                                        values ($1, $2, $3, $4, $5, $6, $7) returning *`, [amount, description, image, tags, newID, id, new Date(created_on).toISOString()]);
    if (image) {
        const storage = (0, storage_1.getStorage)();
        image = yield (0, storage_1.getDownloadURL)((0, storage_1.ref)(storage, `budgets/${id}/${image}`));
    }
    res.json(Object.assign(Object.assign({}, newDeduction), { image }));
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
// @desc    deleting a deductions by the budget-id and deduction-id
// @route   GET /api/v1/deductions/:budgetID/:id
// @access  Private
route.delete('/:budgetID/:id', authMiddleware_1.protect, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { budgetID, id } = req.params;
    const { username } = req.user;
    const { rows: [record] } = yield index_1.default.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
    if (!record)
        throw new Error('You do not have permission to do that');
    const { rows: [singleDeduction] } = yield index_1.default.query(`select * from "Deduction" where id = $1`, [id]);
    yield index_1.default.query(`delete from "Deduction" where id = $1`, [id]);
    if (singleDeduction.image) {
        const storage = (0, storage_1.getStorage)();
        const desertRef = (0, storage_1.ref)(storage, `budgets/${budgetID}/${singleDeduction.image}`);
        try {
            yield (0, storage_1.deleteObject)(desertRef);
        }
        catch (error) {
            console.log(error);
        }
    }
    res.json({ success: true });
})));
exports.default = route;
