-- Run once in the Supabase SQL Editor. No credentials belong in this file.
begin;
create table public.products (
 id text primary key, slug text unique not null, name text not null,
 description text not null, category text not null, brand text not null,
 price numeric(12,2) not null check(price > 0), original_price numeric(12,2) not null,
 image_url text not null, images jsonb not null, variants jsonb not null,
 tagline text not null, features jsonb not null,
 rating numeric(2,1) not null check(rating between 0 and 5), review_count integer not null,
 stock integer not null check(stock >= 0), created_at timestamptz default now() not null
);
create table public.carts (
 id uuid primary key default gen_random_uuid(), session_id text unique not null,
 customer_name text, customer_email text, address jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.cart_items (
 id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts on delete cascade,
 product_id text not null references public.products, variant text not null,
 quantity integer not null check(quantity between 1 and 10), saved boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(cart_id,product_id,variant)
);
create table public.orders (
 id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts,
 session_id text not null, request_id uuid not null, customer_name text not null, customer_email text not null,
 shipping_address jsonb not null, subtotal numeric(12,2) not null,
 shipping numeric(12,2) not null, total numeric(12,2) not null,
 status text not null default 'confirmed', express boolean not null, payment text not null,
 created_at timestamptz not null default now(), unique(cart_id,request_id)
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders on delete cascade,
 product_id text not null references public.products, product_name text not null, image_url text not null,
 variant text not null, unit_price numeric(12,2) not null, quantity integer not null check(quantity > 0)
);
create index on public.orders(cart_id,created_at desc);
create index on public.order_items(order_id);
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.products,public.carts,public.cart_items,public.orders,public.order_items from anon,authenticated;
grant select on public.products to anon,authenticated;
create policy "Catalog is public" on public.products for select to anon,authenticated using(true);

-- Only this capability-scoped function can access guest data. A cryptographically
-- random 256-bit token is kept in an HttpOnly cookie; only its hash is stored.
-- No service-role key is required. Every action locks its cart to serialize writes.
create function public.orbit_shop(p_token text,p_action text,p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 c public.carts; p public.products; i public.cart_items; o public.orders;
 sid text; qty integer; sub numeric(12,2); ship numeric(12,2); exp boolean;
 oid uuid; rid uuid; addr jsonb; result jsonb;
begin
 if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid session'; end if;
 sid := encode(sha256(convert_to(p_token,'UTF8')),'hex');
 insert into public.carts(session_id) values(sid) on conflict(session_id) do nothing;
 select * into c from public.carts where session_id=sid for update;
 if p_action='add' then
   select * into p from public.products where id=p_data->>'productId';
   if not found then raise exception 'Product not found'; end if;
   if not (p.variants ? (p_data->>'variant')) then raise exception 'Invalid variant'; end if;
   qty := (p_data->>'quantity')::integer;
   if qty is null or qty < 1 or qty > 10 then raise exception 'Invalid quantity'; end if;
   select * into i from public.cart_items where cart_id=c.id and product_id=p.id and variant=p_data->>'variant';
   qty := qty + case when found and not i.saved then i.quantity else 0 end;
   if qty > 10 or qty > p.stock then raise exception 'Quantity exceeds available stock or limit of 10'; end if;
   insert into public.cart_items(cart_id,product_id,variant,quantity) values(c.id,p.id,p_data->>'variant',qty)
   on conflict(cart_id,product_id,variant) do update set quantity=excluded.quantity,saved=false,updated_at=now();
 elsif p_action in ('update','delete') then
   select * into i from public.cart_items where id=(p_data->>'id')::uuid and cart_id=c.id;
   if not found then raise exception 'Cart item not found'; end if;
   if p_action='delete' then delete from public.cart_items where id=i.id;
   else
     qty := coalesce((p_data->>'quantity')::integer,i.quantity);
     select * into p from public.products where id=i.product_id;
     if qty < 1 or qty > 10 or qty > p.stock then raise exception 'Invalid quantity or insufficient stock'; end if;
     update public.cart_items set quantity=qty,saved=coalesce((p_data->>'saved')::boolean,saved),updated_at=now() where id=i.id;
   end if;
 elsif p_action='profile' then
   if length(trim(coalesce(p_data->>'name',''))) not between 2 and 100 or length(p_data->>'email') > 254 or coalesce(p_data->>'email','') !~ '^[^ @]+@[^ @]+\.[^ @]+$' then raise exception 'Enter a name and valid email'; end if;
   update public.carts set customer_name=trim(p_data->>'name'),customer_email=lower(trim(p_data->>'email')) where id=c.id;
 elsif p_action='order' then
   rid := (p_data->>'requestId')::uuid;
   if rid is null then raise exception 'Missing request ID'; end if;
   select * into o from public.orders where cart_id=c.id and request_id=rid;
   if found then return jsonb_build_object('id',o.id); end if;
   if c.customer_email is null then raise exception 'Complete your guest profile first'; end if;
   addr := p_data->'address';
   if addr is null or exists(select 1 from unnest(array['name','street','city','region','zip','country']) k where length(trim(coalesce(addr->>k,''))) not between 2 and 200) then raise exception 'Complete every address field'; end if;
   if addr->>'country'='United States' and addr->>'zip' !~ '^\d{5}(-\d{4})?$' then raise exception 'Enter a valid US ZIP code'; end if;
   if not exists(select 1 from public.cart_items where cart_id=c.id and not saved) then raise exception 'Your cart is empty'; end if;
   -- Lock product rows in stable order, then check aggregate quantities across variants.
   perform 1 from public.products where id in(select product_id from public.cart_items where cart_id=c.id and not saved) order by id for update;
   if exists(select 1 from public.cart_items ci join public.products pr on pr.id=ci.product_id where ci.cart_id=c.id and not ci.saved group by pr.id,pr.stock having sum(ci.quantity)>pr.stock) then raise exception 'Insufficient stock; update your cart'; end if;
   select sum(ci.quantity*pr.price) into sub from public.cart_items ci join public.products pr on pr.id=ci.product_id where ci.cart_id=c.id and not ci.saved;
   exp := coalesce((p_data->>'express')::boolean,false);
   ship := case when exp then 9.99 when sub>=50 then 0 else 4.99 end;
   insert into public.orders(cart_id,session_id,request_id,customer_name,customer_email,shipping_address,subtotal,shipping,total,express,payment)
   values(c.id,sid,rid,addr->>'name',c.customer_email,addr,sub,ship,sub+ship,exp,case when p_data->>'payment' like 'Pay on delivery%' then 'Pay on delivery (demo)' else 'Demo card ending 4242' end) returning id into oid;
   insert into public.order_items(order_id,product_id,product_name,image_url,variant,unit_price,quantity)
   select oid,pr.id,pr.name,pr.image_url,ci.variant,pr.price,ci.quantity from public.cart_items ci join public.products pr on pr.id=ci.product_id where ci.cart_id=c.id and not ci.saved;
   update public.products pr set stock=pr.stock-q.quantity from (select product_id,sum(quantity)::integer quantity from public.cart_items where cart_id=c.id and not saved group by product_id) q where pr.id=q.product_id;
   delete from public.cart_items where cart_id=c.id and not saved;
   update public.carts set address=addr,updated_at=now() where id=c.id;
   return jsonb_build_object('id',oid);
 elsif p_action not in ('state','orders') then raise exception 'Unknown operation';
 end if;
 update public.carts set updated_at=now() where id=c.id;
 select * into c from public.carts where id=c.id;
 select jsonb_build_object(
   'user',case when c.customer_email is null then null else jsonb_build_object('name',c.customer_name,'email',c.customer_email) end,
   'addresses',case when c.customer_email is null or c.address is null then '{}'::jsonb else jsonb_build_object(c.customer_email,c.address) end,
   'cart',coalesce((select jsonb_agg(jsonb_build_object('id',id,'productId',product_id,'variant',variant,'quantity',quantity) order by created_at) from public.cart_items where cart_id=c.id and not saved),'[]'::jsonb),
   'saved',coalesce((select jsonb_agg(jsonb_build_object('id',id,'productId',product_id,'variant',variant,'quantity',quantity)) from public.cart_items where cart_id=c.id and saved),'[]'::jsonb),
   'orders',coalesce((select jsonb_agg(jsonb_build_object('id',ord.id,'email',ord.customer_email,'created',ord.created_at,'address',ord.shipping_address,'payment',ord.payment,'shipping',ord.shipping,'subtotal',ord.subtotal,'total',ord.total,'express',ord.express,'items',(select jsonb_agg(jsonb_build_object('productId',oi.product_id,'variant',oi.variant,'quantity',oi.quantity,'title',oi.product_name,'image',oi.image_url,'price',oi.unit_price)) from public.order_items oi where oi.order_id=ord.id)) order by ord.created_at desc) from public.orders ord where ord.cart_id=c.id),'[]'::jsonb)
 ) into result;
 return result;
end $$;
revoke all on function public.orbit_shop(text,text,jsonb) from public;
grant execute on function public.orbit_shop(text,text,jsonb) to anon,authenticated;
commit;
