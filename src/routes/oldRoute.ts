import express, {Request, Response, NextFunction} from 'express';
import asyncHandler from "express-async-handler";
import { protectOld } from '../middleware/authMiddleware';
import pool from '../config/index';
const route = express.Router();

route.get('/budgets', protectOld, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const username = 'thiomark'
    const { rows } = await pool.query(`SELECT  bgt.*, cast(coalesce(sum(dd.amount), 0) AS int) as "remaingAmount", budget + cast(coalesce(sum(dd.amount), 0) AS int) as "remaingAmount" FROM "Budget" bgt
                                            INNER JOIN "BudgetUser" bu on bu.budget_id = bgt.id
                                            LEFT JOIN "Deduction" dd ON dd.budgets_id = bgt.id
                                            where bu.username = $1
                                            GROUP BY bgt.id
                                            order by bgt.created_on desc;
                                            `, [username]);
    res.json(rows)
}))

export default route