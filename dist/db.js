import 'dotenv/config';
import { Pool } from 'pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL not set');
}
export const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});
export async function query(text, params) {
    return pool.query(text, params);
}
