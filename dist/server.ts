import 'dotenv/config';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import apiRouter from './routes/api.ts';
import webRouter from './routes/web.ts';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/api', apiRouter);
app.use('/', webRouter);
// Healthcheck
const startedAt = Date.now();
app.get('/healthz', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({
            ok: true,
            version: '1.0',
            uptime_ms: Date.now() - startedAt,
            timestamp: new Date().toISOString()
        });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: 'db_unavailable' });
    }
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    if (req.headers.accept?.includes('application/json') || req.path.startsWith('/api')) {
        res.status(500).json({ error: 'internal_error' });
    }
    else {
        res.status(500).send('Internal Server Error');
    }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`TinyLink listening on port ${port}`);
});
