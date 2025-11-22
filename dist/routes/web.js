import { Router } from 'express';
import { query } from '../db.js';
const router = Router();
// Dashboard
router.get('/', async (req, res) => {
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
    res.render('dashboard', { links: r.rows, q: q || '', sort: sortCol, dir: sortDir.toLowerCase() });
});
// Stats page
router.get('/code/:code', async (req, res) => {
    const { code } = req.params;
    const r = await query('SELECT code, url, created_at, last_clicked_at, total_clicks FROM links WHERE code = $1', [code]);
    if (r.rows.length === 0) {
        return res.status(404).render('stats', { link: null });
    }
    res.render('stats', { link: r.rows[0] });
});
// Redirect
router.get('/:code', async (req, res, next) => {
    const code = req.params.code;
    // Skip if path is one of defined routes
    if (code === 'healthz' || code === 'api' || code === 'code' || code === 'public') {
        return next();
    }
    const r = await query('SELECT url FROM links WHERE code = $1', [code]);
    if (r.rows.length === 0) {
        return res.status(404).send('Not Found');
    }
    // Update clicks and last_clicked_at
    await query('UPDATE links SET total_clicks = total_clicks + 1, last_clicked_at = NOW() WHERE code = $1', [code]);
    res.redirect(302, r.rows[0].url);
});
export default router;
