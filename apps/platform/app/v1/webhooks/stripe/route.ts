import { getPlatform, json, error } from "@/lib/platform";

/** Stripe webhook stub — idempotent entitlement grant. */
export async function POST(req: Request) {
  const body = await req.json();
  const platform = getPlatform();
  try {
    const result = await platform.commerce.handleWebhook({
      type: body.type,
      paymentIntentId: body.data?.object?.id ?? body.paymentIntentId,
      orderId: body.orderId,
    });
    return json({
      orderStatus: result.order.status,
      entitlementId: result.entitlement?.id ?? null,
    });
  } catch (e) {
    return error("WEBHOOK_FAILED", e instanceof Error ? e.message : "failed", 400);
  }
}
