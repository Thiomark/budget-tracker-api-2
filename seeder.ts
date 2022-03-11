import pool from './src/config';

async function start(){

    await pool.query(`
    
    `).then(x => {
        console.log('x.rows')
    }).catch(x => {
        console.log(x.message)
    });
}

console.log(start())