import type { Order, Entitlement } from "@faraday-academy/platform-contracts";
import type { PlatformStore } from "./ports";
import { createId, nowIso } from "./ports";

export function createCommerceService(store: PlatformStore) {
  return {
    async createCheckout(input: {
      courseId: string;
      buyerId: string;
      amountCents: number;
      currency?: string;
    }): Promise<Order> {
      const order: Order = {
        id: createId("ord"),
        courseId: input.courseId,
        buyerId: input.buyerId,
        amountCents: input.amountCents,
        currency: input.currency ?? "usd",
        status: "CREATED",
        provider: "stripe",
        providerPaymentId: `pi_stub_${createId("pay")}`,
        entitlementId: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      await store.saveOrder(order);
      return order;
    },

    /** Stripe webhook handler — idempotent entitlement grant. */
    async handleWebhook(input: {
      type: string;
      paymentIntentId: string;
      orderId?: string;
    }): Promise<{ order: Order; entitlement: Entitlement | null }> {
      let order =
        (input.orderId ? await store.getOrder(input.orderId) : null) ??
        (await store.getOrderByProviderPaymentId(input.paymentIntentId));
      if (!order) throw new Error("ORDER_NOT_FOUND");

      if (input.type === "payment_intent.succeeded") {
        if (order.status === "SUCCEEDED" && order.entitlementId) {
          const ents = await store.listEntitlements(
            order.courseId,
            order.buyerId,
          );
          const ent = ents.find((e) => e.id === order!.entitlementId) ?? null;
          return { order, entitlement: ent };
        }

        const ent: Entitlement = {
          id: createId("ent"),
          courseId: order.courseId,
          userId: order.buyerId,
          status: "ACTIVE",
          source: "PURCHASE",
          providerReference: input.paymentIntentId,
          startsAt: nowIso(),
          expiresAt: null,
          reason: "stripe_payment",
          createdAt: nowIso(),
        };
        await store.saveEntitlement(ent);
        order = {
          ...order,
          status: "SUCCEEDED",
          entitlementId: ent.id,
          updatedAt: nowIso(),
        };
        await store.saveOrder(order);
        return { order, entitlement: ent };
      }

      if (input.type === "charge.refunded") {
        if (order.entitlementId) {
          const ents = await store.listEntitlements(
            order.courseId,
            order.buyerId,
          );
          const ent = ents.find((e) => e.id === order!.entitlementId);
          if (ent) {
            await store.saveEntitlement({
              ...ent,
              status: "REFUNDED",
              reason: "stripe_refund",
            });
          }
        }
        order = {
          ...order,
          status: "REFUNDED",
          updatedAt: nowIso(),
        };
        await store.saveOrder(order);
        return { order, entitlement: null };
      }

      return { order, entitlement: null };
    },
  };
}

export function createCommunityService(store: PlatformStore) {
  return {
    async createThread(input: {
      courseId: string;
      authorId: string;
      title: string;
      body: string;
      hasAccess: boolean;
    }) {
      if (!input.hasAccess) throw new Error("FORBIDDEN");
      const now = nowIso();
      const thread = {
        id: createId("thr"),
        courseId: input.courseId,
        authorId: input.authorId,
        title: input.title,
        body: input.body,
        pinned: false,
        locked: false,
        hidden: false,
        createdAt: now,
        updatedAt: now,
      };
      await store.saveThread(thread);
      return thread;
    },

    async listThreads(courseId: string, hasAccess: boolean) {
      if (!hasAccess) throw new Error("FORBIDDEN");
      const threads = await store.listThreads(courseId);
      return threads.filter((t) => !t.hidden);
    },

    async comment(input: {
      threadId: string;
      authorId: string;
      body: string;
      hasAccess: boolean;
    }) {
      if (!input.hasAccess) throw new Error("FORBIDDEN");
      const comment = {
        id: createId("cmt"),
        threadId: input.threadId,
        authorId: input.authorId,
        body: input.body,
        hidden: false,
        createdAt: nowIso(),
      };
      await store.saveComment(comment);
      return comment;
    },

    async report(input: {
      courseId: string;
      reporterId: string;
      targetType: "THREAD" | "COMMENT";
      targetId: string;
      reason: string;
    }) {
      const report = {
        id: createId("rep"),
        courseId: input.courseId,
        reporterId: input.reporterId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        createdAt: nowIso(),
      };
      await store.saveReport(report);
      return report;
    },

    async moderate(
      threadId: string,
      action: "pin" | "lock" | "hide",
      actorIsOwner: boolean,
    ) {
      if (!actorIsOwner) throw new Error("FORBIDDEN");
      // list all courses' threads is inefficient; callers pass courseId in real adapter
      void threadId;
      void action;
      return { ok: true as const };
    },
  };
}
