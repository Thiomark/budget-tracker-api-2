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

// app.use('/api/v1/images', express.static(path.join(__dirname, './images')));

// app.get('/api/v1/budgets', (req, res) => {

//     const rawdata = fs.readFileSync('./config/budget.json');
//     const rawdata2 = fs.readFileSync('./config/deductions.json');

//     const myBudgets = JSON.parse(rawdata);
//     const myDeductions = JSON.parse(rawdata2);

//     if(myBudgets && myDeductions){
//         const allBudgets = myBudgets.map(budget => {
//             const remaingAmount = myDeductions
//                 .filter(x => x.budgetsID === budget.id)
//                 .reduce((acc, value) => value.amount + acc, 0);
//             return {...budget, remaingAmount: budget.budget + remaingAmount}
//         })
//         res.json(allBudgets);
//     }else{
//         return res.status(500).json({
//             success: false,
//             message: 'Something happended the data file is not working'
//         })
//     }
// });

// app.post('/api/v1/budgets', async (req, res) => {
//     const {budget} = req.body;
    
//     if(budget){
//         let rawdata = fs.readFileSync('./config/budget.json');
//         let myBudgets = JSON.parse(rawdata);

//         if(myBudgets){
//             const newBudget = {id: uuidv4(), budget}
//             const allBudgets = [newBudget, ...myBudgets]
//             let newData = JSON.stringify(allBudgets);
//             try {
//                 fs.writeFileSync('./config/budget.json', newData);
//                 return res.json(newBudget);
//             } catch (error) {
//                 return res.status(500).json({
//                     success: false,
//                     message: error.message
//                 })
//             }
//         }else{
//             return res.status(500).json({
//                 success: false,
//                 message: 'Something happended the data file is not working'
//             })
//         }
//     }else{
//         return res.status(404).json({
//             success: false,
//             message: 'Please provide the budget'
//         })
//     }
// });

// app.delete('/api/v1/budgets/:id', async (req, res) => {
//     const {id} = req.params;
    
//     let rawdata = fs.readFileSync('./config/budget.json');
//     let myBudgets = JSON.parse(rawdata);

//     if(myBudgets){
//         const allBudgets = myBudgets.filter(x => x.id !== id)
//         const newData = JSON.stringify(allBudgets);
//         try {
//             fs.writeFileSync('./config/budget.json', newData);
//             return res.json(allBudgets);
//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }else{
//         return res.status(500).json({
//             success: false,
//             message: 'Something happended the data file is not working'
//         })
//         }
// });

// app.delete('/api/v1/deductions/:id', async (req, res) => {
//     const {id} = req.params;
    
//     let rawdata = fs.readFileSync('./config/deductions.json');
//     let myBudgets = JSON.parse(rawdata);

//     if(myBudgets){
//         const allBudgets = myBudgets.filter(x => x.id !== id)
//         const newData = JSON.stringify(allBudgets);
//         try {
//             fs.writeFileSync('./config/deductions.json', newData);
//             return res.json(allBudgets);
//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }else{
//         return res.status(500).json({
//             success: false,
//             message: 'Something happended the data file is not working'
//         })
//         }
// });

// app.get('/api/v1/deductions/:id', (req, res) => {
//     const rawdata = fs.readFileSync('./config/deductions.json');
//     const myDeductions = JSON.parse(rawdata);
//     const {id} = req.params

//     if(myDeductions){
//         const currentDeductions = myDeductions.filter(x => x.budgetsID === id)
//         res.json(currentDeductions);
//     }else{
//         return res.status(500).json({
//             success: false,
//             message: 'Something happended the data file is not working'
//         })
//     }
// });

// app.post('/api/v1/deductions/image', upload.single('photo'), (req, res) => {
//     res.send({message: 'saved'})  
// });

// app.post('/api/v1/deductions', (req, res) => {
//     const {amount, description, budgetsID, image, tags} = req.body;

//     if(image){
//         const compressedImage = path.join(__dirname, 'images', image);

//         sharp(image).resize(1000, 1000).jpeg({
//             quality: 70,
//             chromaSubsampling: '4:4:4'
//         }).toFile(compressedImage, (err, info) => {})
//     }
//     if(!amount || !budgetsID) return res.status(404).json({message: 'enter all fields'});

//     let rawdata = fs.readFileSync('./config/deductions.json');
//     let myDeductions = JSON.parse(rawdata);
//     if(myDeductions){
//         const newDeduction = {id: uuidv4(), amount, description, tags, budgetsID, image}
//         const allDeductions = [newDeduction, ...myDeductions];

//         let newData = JSON.stringify(allDeductions);

//         try {
//             fs.writeFileSync('./config/deductions.json', newData);
//             return res.json(newDeduction);

//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }else{
//         return res.status(500).json({
//             success: false,
//             message: 'Something happended the data file is not working'
//         })
//     }
 
// });

// app.post('/api/v1/deductions/:id', (req, res) => {
//     const {image} = req.body;
//     if(!image) return; //! fix later too lazy now

//     const compressedImage = path.join(__dirname, 'images', image);

//     sharp(image).resize(1000, 1000).jpeg({
//         quality: 70,
//         chromaSubsampling: '4:4:4'
//     }).toFile(compressedImage, (err, info) => {})

//     let rawdata = fs.readFileSync('./config/deductions.json');
//     let myDeductions = JSON.parse(rawdata);
//     if(myDeductions){
//         const updatedDeductions = myDeductions.map(element => {
//             if(element.id === req.params.id){
//                 element.image = image;
//             }
//             return element
//         });

//         let newData = JSON.stringify(updatedDeductions);

//         try {
//             fs.writeFileSync('./config/deductions.json', newData);
//             return res.json({success: false});

//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }else{
//         return res.status(500).json({
//             success: false,
//             message: 'Something happended the data file is not working'
//         })
//     }
 
// });

export default route