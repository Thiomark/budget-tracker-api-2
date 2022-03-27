import pool from './src/config';

async function start(){

    await pool.query(`
    ALTER TABLE "Budget" ALTER COLUMN budget TYPE numeric;
    ALTER TABLE "Deduction" ALTER COLUMN amount TYPE numeric;
    
    `).then(x => {
        console.log('x.rows')
    }).catch(x => {
        console.log(x.message)
    });
}

console.log(start())