// Isolated PostgreSQL engine test; production must still use hosted Supabase.
const { PGlite } = require('@electric-sql/pglite');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
(async () => {
  const db = new PGlite();
  await db.exec('create role anon; create role authenticated;');
  await db.exec(fs.readFileSync('supabase/001_marketplace.sql', 'utf8'));
  await db.exec(fs.readFileSync('supabase/002_seed.sql', 'utf8'));
  const a = randomBytes(32).toString('hex'),
    b = randomBytes(32).toString('hex');
  const rpc = async (token, action, data = {}) =>
    (
      await db.query('select public.orbit_shop($1,$2,$3::jsonb) as data', [
        token,
        action,
        JSON.stringify(data),
      ])
    ).rows[0].data;
  await db.exec('set role anon');
  assert.equal((await db.query('select count(*)::int as n from public.products')).rows[0].n, 20);
  await assert.rejects(() => db.query('select * from public.orders'), /permission denied/);
  assert.equal((await rpc(a, 'state')).cart.length, 0);
  let state = await rpc(a, 'add', { productId: 'puma-trainers', variant: 'US 9', quantity: 2 });
  assert.equal(state.cart[0].quantity, 2);
  const id = state.cart[0].id;
  assert.equal((await rpc(b, 'state')).cart.length, 0);
  await assert.rejects(() => rpc(b, 'delete', { id }), /not found/);
  await assert.rejects(
    () => rpc(a, 'add', { productId: 'puma-trainers', variant: 'fake', quantity: 1 }),
    /Invalid variant/,
  );
  await assert.rejects(() => rpc(a, 'update', { id, quantity: 999 }), /quantity/);
  state = await rpc(a, 'update', { id, saved: true });
  assert.equal(state.cart.length, 0);
  assert.equal(state.saved.length, 1);
  await rpc(a, 'update', { id, saved: false, quantity: 1 });
  await rpc(a, 'profile', { name: 'Test Guest', email: 'test@example.com' });
  const requestId = randomUUID();
  const order = {
    requestId,
    address: {
      name: 'Test Guest',
      street: '123 Demo Lane',
      city: 'Portland',
      region: 'Oregon',
      zip: '97201',
      country: 'United States',
    },
    express: true,
    payment: 'Demo card',
  };
  await assert.rejects(() => rpc(a, 'order', { ...order, address: {} }), /address/);
  assert.equal((await rpc(a, 'state')).cart.length, 1);
  const placed = await rpc(a, 'order', order);
  assert.equal((await rpc(a, 'order', order)).id, placed.id);
  state = await rpc(a, 'state');
  assert.equal(state.cart.length, 0);
  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].total, 73.99);
  assert.equal(state.orders[0].items[0].title, 'Puma Future Rider trainers');
  assert.equal((await rpc(b, 'orders')).orders.length, 0);
  await db.exec('reset role');
  const stock = (await db.query("select stock from public.products where id='puma-trainers'"))
    .rows[0].stock;
  assert.equal(
    stock,
    JSON.parse(fs.readFileSync('supabase/catalog-seed.json', 'utf8')).find(
      (p) => p.id === 'puma-trainers',
    ).stock - 1,
  );
  await rpc(a, 'add', { productId: 'puma-trainers', variant: 'US 9', quantity: 1 });
  await db.exec("update public.products set stock=0 where id='puma-trainers'");
  await assert.rejects(() => rpc(a, 'order', { ...order, requestId: randomUUID() }), /stock/);
  state = await rpc(a, 'state');
  assert.equal(state.cart.length, 1);
  assert.equal(state.orders.length, 1);
  await assert.rejects(
    () => rpc(a, 'add', { productId: 'puma-trainers', variant: 'US 9', quantity: 1 }),
    /stock/,
  );
  console.log(
    'PASS PostgreSQL schema/seed, RLS isolation, cart CRUD, validation, atomic checkout, snapshots, stock decrement, and idempotent retry',
  );
  await db.close();
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
