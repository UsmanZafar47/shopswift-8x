import { catalog, respond, ApiError } from '@/lib/database';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return respond(async () => {
    const { id } = await params;
    const product = (await catalog()).find((p) => p.id === id);
    if (!product) throw new ApiError('Product not found', 404);
    return { product };
  });
}
