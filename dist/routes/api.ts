import { Router } from 'express';
import { query } from '../db.js';
import { isValidUrl, isValidCode, normalizeCode } from '../lib/validate.js';
const router = Router();
// POST /api/links - create
router.post('/links', async (req, res) => {
    const { url, code } = req.body;
    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'invalid_url', message: 'Provide a valid http/https URL.' });
    }
    let finalCode;
    if (code) {
        const c = normalizeCode(code);
        if (!isValidCode(c)) {
            return res.status(400).json({ error: 'invalid_code', message: 'Code must be 3-32 chars: a-z, 0-9, dash.' });
        }
        finalCode = c;
        const exists = await query('SELECT 1 FROM links WHERE code = $1', [finalCode]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: 'code_exists', message: 'This code is already in use.' });
        }
    }
    else {
        // Generate simple random code: 6 chars
        const gen = () => Math.random().toString(36).slice(2, 8);
        let candidate = normalizeCode(gen());
        let attempts = 0;
        while (attempts < 5) {
            const r = await query('SELECT 1 FROM links WHERE code = $1', [candidate]);
            if (r.rows.length === 0)
                break;
            candidate = normalizeCode(gen());
            attempts++;
        }
        finalCode = candidate;
    }
    const ins = await query('INSERT INTO links (code, url) VALUES ($1, $2) RETURNING code, url, created_at, last_clicked_at, total_clicks', [finalCode, url]);
    res.status(201).json(ins.rows[0]);
});
// GET /api/links - list
router.get('/links', async (req, res) => {
    const { q, sort = 'created_at', dir = 'desc' } = req.query;
    const allowedSort = new Set(['code', 'url', 'total_clicks', 'last_clicked_at', 'created_at']);
    const sortCol = allowedSort.has(sort) ? sort : 'created_at';
    const sortDir = dir === 'asc' ? 'ASC' : 'DESC';
    let sql = `SELECT code, url, created_at, last_clicked_at, total_clicks FROM links`;
    const params = [];
    if (q) {
        sql += ` WHERE code ILIKE $1 OR url ILIKE $1`;
        params.push(`%${q}%`);
    }
    sql += ` ORDER BY ${sortCol} ${sortDir} NULLS LAST`;
    const r = await query(sql, params);
    res.json(r.rows);
});
// GET /api/links/:code - stats
router.get('/links/:code', async (req, res) => {
    const code = req.params.code;
    const r = await query('SELECT code, url, created_at, last_clicked_at, total_clicks FROM links WHERE code = $1', [code]);
    if (r.rows.length === 0)
        return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
});
// DELETE /api/links/:code
router.delete('/links/:code', async (req, res) => {
    const code = req.params.code;
    const del = await query('DELETE FROM links WHERE code = $1 RETURNING code', [code]);
    if (del.rows.length === 0)
        return res.status(404).json({ error: 'not_found' });
    res.status(204).send();
});
export default router;
