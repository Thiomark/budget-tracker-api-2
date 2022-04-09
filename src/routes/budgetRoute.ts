import express, {NextFunction, Request, Response} from 'express';
const router = express.Router();
import asyncHandler from "express-async-handler";
import pool from '../config/index';
import { protect } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

router.get('/', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { username } = (req as any).user;
    const { rows } = await pool.query(`SELECT  bgt.*, cast(coalesce(sum(dd.amount), 0) AS int) as "removed_amount", budget + cast(coalesce(sum(dd.amount), 0) AS int) as "remaining_amount" FROM "Budget" bgt
                                            INNER JOIN "BudgetUser" bu on bu.budget_id = bgt.id
                                            LEFT JOIN "Deduction" dd ON dd.budgets_id = bgt.id
                                            where bu.username = $1
                                            GROUP BY bgt.id
                                            order by bgt.created_on desc;
                                            `, [username]);
    res.json(rows.map(x => ({...x, remaining_amount: Number(x.remaining_amount), budget: Number(x.budget)})))
}));

router.get('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { id } = req.params;
    const { rows: [budget] } = await pool.query(`SELECT * FROM "Budget" WHERE id = $1`, [id]);
    res.json(budget)
}));

// @desc    add a budget
// @route   POST /api/v1/budgets
// @access  Private
router.post('/', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { username } = (req as any).user;
    const { budget, created_on, description, divide_by } = req.body;

    if(!budget) throw new Error('Provide a budget');

    const id = uuidv4();

    const {rows: [createdBudget]}: any = await pool.query('INSERT INTO "Budget" (budget, user_id, id, created_on, description, divide_by) values ($1, $2, $3, $4, $5, $6) returning *', [budget, username, id, new Date(created_on ? created_on : Date.now()).toISOString(), description, divide_by]);
    await pool.query('INSERT INTO "BudgetUser" (budget_id, username) values ($1, $2)', [id, username]);

    res.json({...createdBudget, budget: Number(createdBudget.budget)});
}));

router.post('/add/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { username } = (req as any).user;
    const { userToAdd } = req.body;
    const { id } = req.params

    if(!userToAdd) throw new Error('Provide a user to add');

    const {rows: [budget]} = await pool.query('select * from "Budget" where id = $1 and user_id = $2', [id, username]);
    if(!budget) throw new Error(`You do not have permision to add users`);

    const {rows: [user]} = await pool.query('select * from "User" where username = $1', [userToAdd])
    if(!user) throw new Error('User does not exist');

    await pool.query('INSERT INTO "BudgetUser" (budget_id, username) values ($1, $2)', [id, userToAdd]);
    res.json({message: "User added to your budgets"});
}));

router.delete('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {id} = req.params;
    const { username } = (req as any).user;
    const {rows: [budget]} = await pool.query('select * from "Budget" where id = $1 and user_id = $2', [id, username]);
    if(!budget) throw new Error(`You do not have permision to add users`);
    
    await pool.query('DELETE FROM "BudgetUser" WHERE budget_id = $1', [id]);
    await pool.query('DELETE FROM "Budget" WHERE id = $1', [id]);
    res.json({success: true});
}));

// @desc    update a budget
// @route   POST /api/v1/budgets/:id
// @access  Private

router.post('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { budget, description, created_on, divide_by } = req.body;
    const { id } = req.params;

    if(!budget) throw new Error('Provide a budget');

    const {rows: [updatedBudget]}: any = await pool.query('UPDATE "Budget" SET budget = $1, description = $2, created_on = $3, divide_by = $4 WHERE id = $5 returning *', [budget, description, new Date(created_on).toISOString(), divide_by, id]);
    res.json({...updatedBudget, budget: Number(updatedBudget.budget)});
}));

export default router;