import pool from './src/config';
import deductions from './delete/deductions';

async function start(){

    await pool.query(`
    delete from "User" where username = 'test'
    
    `).then(x => {
        console.log('x')
    }).catch(x => {
        console.log(x)
    });
}

console.log(start())