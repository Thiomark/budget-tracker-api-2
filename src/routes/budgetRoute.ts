import express, {NextFunction, Request, Response} from 'express';
const router = express.Router();
import asyncHandler from "express-async-handler";
import pool from '../config/index';
import { protect } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

router.get('/', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { username } = (req as any).user;
    const { rows } = await pool.query(`SELECT  bgt.*, cast(coalesce(sum(dd.amount), 0) AS int) as "removed_amount", budget - cast(coalesce(sum(dd.amount), 0) AS int) as "remaining_amount" FROM "Budget" bgt
                                            INNER JOIN "BudgetUser" bu on bu.budget_id = bgt.id
                                            LEFT JOIN "Deduction" dd ON dd.budgets_id = bgt.id
                                            where bu.username = $1
                                            GROUP BY bgt.id
                                            order by bgt.created_on desc;
                                            `, [username]);
    res.json(rows)
}));

router.get('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { id } = req.params;
    const { rows: [budget] } = await pool.query(`SELECT * FROM "Budget" WHERE id = $1`, [id]);
    res.json(budget)
}));

router.post('/', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { username } = (req as any).user;
    const { budget } = req.body;

    if(!budget) throw new Error('Provide a budget');

    const id = uuidv4();

    const {rows} = await pool.query('INSERT INTO "Budget" (budget, user_id, id) values ($1, $2, $3) returning *', [budget, username, id]);
    await pool.query('INSERT INTO "BudgetUser" (budget_id, username) values ($1, $2)', [id, username]);

    res.json(rows);
}));

router.delete('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {id} = req.params;
    await pool.query('DELETE FROM "Budget" WHERE id = $1', [id]);
    await pool.query('DELETE FROM "BudgetUser" WHERE budget_id = $1', [id]);
    res.json({success: true});
}));

router.post('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { budget } = req.body;
    const { id } = req.params;

    if(!budget) throw new Error('Provide a budget');

    const {rows} = await pool.query('UPDATE "Budget" SET budget = $1 WHERE id = $2 returning *', [budget, id]);
    res.json(rows);
}));

export default router;