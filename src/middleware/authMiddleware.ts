import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
import pool from '../config/index';
const secret: any = process.env.JWT_SECRET

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: any

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, secret);
            const {rows: [user]} = await pool.query('select username, name, created_on from "User" where username = $1', [(decoded as any).username]);
        
            (req as any).user = user;

            next()
        } catch (error) {
            res.status(401)
            throw new Error('Not authorized, token failed')
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
}) 

const protectOld = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = 'thiomark';
    next()
}) 

export { protect, protectOld }

// const admin = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//       next()
//   } else {
//       res.status(401)
//       throw new Error('Not authorized as an admin')
//   }
// }

// module.exports = { 
//     protect, 
//     admin 
// }