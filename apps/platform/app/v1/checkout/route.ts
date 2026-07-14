import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = await req.json();
  const platform = getPlatform();
  const course = await platform.store.getCourse(body.courseId);
  if (!course) return error("NOT_FOUND", "course not found", 404);
  if (course.access !== "PUBLIC_PAID") {
    return error("NOT_PAID_COURSE", "course is not paid", 400);
  }
  const order = await platform.commerce.createCheckout({
    courseId: course.id,
    buyerId: userId,
    amountCents: body.amountCents ?? 1999,
    currency: body.currency,
  });
  return json({
    orderId: order.id,
    providerPaymentId: order.providerPaymentId,
    checkoutUrl: `/checkout/stub?order=${order.id}`,
  });
}
