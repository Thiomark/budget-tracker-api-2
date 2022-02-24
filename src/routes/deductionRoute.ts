import express, {Request, Response, NextFunction} from 'express';
import asyncHandler from "express-async-handler";
import { protect } from '../middleware/authMiddleware';
import pool from '../config/index';
import { v4 as uuidv4 } from 'uuid';
const route = express.Router();

route.get('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {id} = req.params;
    const { username } = (req as any).user;

    const { rows } = await pool.query(`select d.* from "Deduction" d inner join "BudgetUser" bu on bu.budget_id = d.budgets_id 
                                            where budgets_id = $1 and username = $2`, [id, username]);

    res.json(rows)
}));

route.post('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {id} = req.params;
    const { username } = (req as any).user;
    const { amount, description, image, tags } = req.body;

    if(!amount) throw new Error('Provide an amount deducted')

    const { rows: [record] } = await pool.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [id, username]);
    if(!record) throw new Error('You do not have permission to do that');

    const newID = uuidv4();

    const {rows: [newDeduction]} = await pool.query(`insert into "Deduction" (amount, description, image, tags, id, budgets_id )
                                                        values ($1, $2, $3, $4, $5, $6) returning *`, [amount, description, image, tags, newID, id])
    res.json(newDeduction)
}));

route.delete('/:budgetID/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {budgetID, id} = req.params;
    const { username } = (req as any).user;

    const { rows: [record] } = await pool.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
    if(!record) throw new Error('You do not have permission to do that');

    await pool.query(`delete from "Deduction" where id = $1`, [id]);

    res.json({success: true});
}));

export default route