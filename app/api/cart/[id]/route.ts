import { shop, respond, input, quantity, uuid, ApiError } from '@/lib/database';
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  return respond(async () => {
    const d = await input(request);
    if (d.quantity !== undefined) quantity(d.quantity);
    if (d.saved !== undefined && typeof d.saved !== 'boolean')
      throw new ApiError('Invalid saved flag');
    if (d.quantity === undefined && d.saved === undefined)
      throw new ApiError('Provide quantity or saved');
    return shop('update', { id: uuid((await params).id), quantity: d.quantity, saved: d.saved });
  });
}
export async function DELETE(request: Request, { params }: Context) {
  return respond(async () => {
    await input(request);
    return shop('delete', { id: uuid((await params).id) });
  });
}
