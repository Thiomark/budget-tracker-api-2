import pool from './src/config';

async function start(){

    await pool.query(`
        ALTER TABLE "Budget" RENAME COLUMN divideBy TO divide_by;
        ALTER TABLE "Deduction" RENAME COLUMN divideBy TO divide_by;


    
    `).then(x => {
        console.log('x.rows')
    }).catch(x => {
        console.log(x.message)
    });
}

console.log(start())