import express, {Request, Response, NextFunction} from 'express';
import asyncHandler from "express-async-handler";
const route = express.Router();

route.get('/', asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    
}))

export default route