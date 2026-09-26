// Local integration-test adapter backed by an actual PostgreSQL engine (PGlite).
// Never used or deployed in production; production requires hosted Supabase.
const { PGlite } = require('@electric-sql/pglite');
const http = require('node:http');
const fs = require('node:fs');
(async () => {
  const db = new PGlite();
  await db.exec('create role anon; create role authenticated;');
  await db.exec(fs.readFileSync('supabase/001_marketplace.sql', 'utf8'));
  await db.exec(fs.readFileSync('supabase/002_seed.sql', 'utf8'));
  await db.exec('set role anon');
  http
    .createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      try {
        if (req.method === 'GET' && req.url.startsWith('/rest/v1/products?')) {
          res.end(
            JSON.stringify(
              (await db.query('select * from public.products order by created_at,id')).rows,
            ),
          );
          return;
        }
        if (req.method === 'POST' && req.url === '/rest/v1/rpc/orbit_shop') {
          let raw = '';
          for await (const chunk of req) {
            raw += chunk;
            if (raw.length > 15000) throw Error('Request too large');
          }
          const b = JSON.parse(raw);
          const result = await db.query('select public.orbit_shop($1,$2,$3::jsonb) as data', [
            b.p_token,
            b.p_action,
            JSON.stringify(b.p_data),
          ]);
          res.end(JSON.stringify(result.rows[0].data));
          return;
        }
        res.statusCode = 404;
        res.end('{}');
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ code: e.code, message: e.message }));
      }
    })
    .listen(54329, '127.0.0.1', () =>
      console.log('Local PostgreSQL integration fixture ready on 54329'),
    );
})();
