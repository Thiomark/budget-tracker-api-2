import express, {Request, Response, NextFunction} from 'express';
import asyncHandler from "express-async-handler";
import path from 'path'
import { protect } from '../middleware/authMiddleware';
//import upload from '../middleware/upload';
import pool from '../config/index';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import {getStorage, ref, deleteObject, listAll, getDownloadURL, uploadBytes} from 'firebase/storage';
import { searchForItem } from '../utils/helperFunctions';
const route = express.Router();

const memoryStorage = multer.memoryStorage();
const multerUpload = multer({
    storage: memoryStorage
})

// @desc    uploading a image with budget id
// @route   GET /api/v1/deductions/image
// @access  Private
route.post('/image/:id', multerUpload.single('featuredImage'), asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const file = req.file;
    const { id } = req.params;

    if(file){
        const storage = getStorage();
        const reff = ref(storage, `budgets/${id}/${file.originalname}`);
        // const img = await fetch(file.buffer);
        // const bytes = await img.blob();
        await uploadBytes(reff, file.buffer);

    }
    res.send('hello')
}))

// @desc    Fetch deductions by the budget id
// @route   GET /api/v1/deductions/:id
// @access  Private
route.get('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {id} = req.params;
    const { username } = (req as any).user;
    const storage = getStorage();
    const listRef = ref(storage, `budgets/${id}`);

    const { items } = await listAll(listRef);
    const images: any = await Promise.all(items.map(async itemRef => {
        return {
            url: await getDownloadURL(ref(storage, `budgets/${id}/${itemRef.name}`)),
            imageName: itemRef.name
        }
    }));

    const { rows } = await pool.query(`select d.* from "Deduction" d inner join "BudgetUser" bu on bu.budget_id = d.budgets_id 
                                            where budgets_id = $1 and username = $2 order by created_on desc`, [id, username]);

    res.send(searchForItem(rows, images))

}));

// @desc    Adding a deduction by budget id
// @route   POST /api/v1/deductions/:id
// @access  Private
route.post('/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {id} = req.params;
    const { username } = (req as any).user;
    let { amount, description, image, tags, created_on } = req.body;

    if(!amount) throw new Error('Provide an amount deducted')

    const { rows: [record] } = await pool.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [id, username]);
    if(!record) throw new Error('You do not have permission to do that');

    const newID = uuidv4();

    const {rows: [newDeduction]} = await pool.query(`insert into "Deduction" (amount, description, image, tags, id, budgets_id, created_on)
                                                        values ($1, $2, $3, $4, $5, $6, $7) returning *`, [amount, description, image, tags, newID, id, new Date(created_on).toISOString()])
    
    if(image){
        const storage = getStorage();
        image = await getDownloadURL(ref(storage, `budgets/${id}/${image}`))
    }
    res.json({...newDeduction, image })
}));


// @desc    Editing a deduction by budget-id and deduction-id
// @route   POST /api/v1/deductions/:id
// @access  Private
route.post('/:budgetID/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {budgetID, id} = req.params;
    const { username } = (req as any).user;
    const { amount, description, tags, created_on } = req.body;
    
    if(!amount) throw new Error('Provide an amount deducted')

    const { rows: [record] } = await pool.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
    if(!record) throw new Error('You do not have permission to do that');

    const {rows: [deduction]} = await pool.query(`UPDATE "Deduction" SET amount = $1, description = $2, tags = $3, created_on = $4 
                                                    WHERE id = $5 returning *`, [amount, description, tags, new Date(created_on).toISOString(), id]);

    res.json(deduction);
}));


// @desc    deleting a deductions by the budget-id and deduction-id
// @route   GET /api/v1/deductions/:budgetID/:id
// @access  Private
route.delete('/:budgetID/:id', protect, asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const {budgetID, id} = req.params;
    const { username } = (req as any).user;

    const { rows: [record] } = await pool.query(`select * from "BudgetUser" bu where bu.budget_id = $1 and username = $2`, [budgetID, username]);
    if(!record) throw new Error('You do not have permission to do that');

    const {rows: [singleDeduction]} = await pool.query(`select * from "Deduction" where id = $1`, [id]);

    await pool.query(`delete from "Deduction" where id = $1`, [id]);

    if(singleDeduction.image){
        const storage = getStorage();
        const desertRef = ref(storage, `budgets/${budgetID}/${singleDeduction.image}`);
        try {
            await deleteObject(desertRef);
        } 
        catch (error) { 
            console.log(error)
        }
    }

    res.json({success: true});
}));

export default route