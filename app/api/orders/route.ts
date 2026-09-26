import { shop, respond, input, uuid, textField, ApiError } from '@/lib/database';
export async function GET() {
  return respond(async () => ({ orders: (await shop('orders')).orders }));
}
export async function POST(request: Request) {
  return respond(async () => {
    const d = await input(request);
    uuid(textField(d.requestId, 'request ID'));
    if (typeof d.express !== 'boolean') throw new ApiError('Invalid shipping option');
    if (!d.address || typeof d.address !== 'object')
      throw new ApiError('Delivery address is required');
    for (const k of ['name', 'street', 'city', 'region', 'zip', 'country'])
      textField(d.address[k], k);
    textField(d.payment, 'payment');
    return shop('order', d);
  }, 201);
}
