import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from "express-async-handler";
import bcrypt from 'bcryptjs'
import pool from '../config/index';
import generateToken from '../utils/generateToken';
const route = express.Router();

route.post('/register', asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const { rows: [user] } = await pool.query(`select * from "User" where username = $1`, [email]);

    if(!password) throw new Error('Please provide a password')
    if(user) throw new Error('Email already exist');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const {rows: [newUser]} = await pool.query('insert into "User" (username, password, name) values ($1, $2, $3) returning username, name, created_on', [email, hashedPassword, name]);

    res.status(201).json({
        token: generateToken(newUser.username),
        username: newUser.username
    })
}));

route.post('/login', asyncHandler(async (req: Request, res:Response, next: NextFunction) => {
    const { email, password } = req.body;
    const { rows: [user] } = await pool.query(`select * from "User" where username = $1`, [email]);

    if(!password) throw new Error('Please provide a password')
    if(!user) throw new Error('invalid credentials');
    
    const checkPassword = await bcrypt.compare(password, user.password);
    if(!checkPassword) throw new Error('invalid credentials');

    res.status(201).json({
        token: generateToken(user.username),
        username: user.username
    })
}));

export default route