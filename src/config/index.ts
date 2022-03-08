import 'dotenv/config';
import { Client } from 'pg';

const pool = new Client({
    connectionString: process.env.DATABASE_URL,
    // user: 'postgres',
    // host: 'localhost',
    // database: 'budgets',
    // password: '8927623',
    // port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect();

export default pool;
