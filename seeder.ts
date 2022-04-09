import pool from './src/config';

async function start(){

    await pool.query(`
    alter table "Deduction" add column user_id text references "User"(username);
    
    `).then(x => {
        console.log('x.rows')
    }).catch(x => {
        console.log(x.message)
    });
}

console.log(start())