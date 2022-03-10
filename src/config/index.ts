import 'dotenv/config';
import { Client } from 'pg';

const pool = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect();

export default pool;
