import { Router } from "express";
import { db, ordersTable, storesTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function createNotification(userId: string, userType: string, title: string, message: string, type: string, orderId?: number) {
  try {
    await db.insert(notificationsTable).values({ userId, userType, title, message, type, orderId: orderId ?? null, isRead: false });
  } catch (e) {
    console.error("Failed to create notification", e);
  }
}

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    storeId: o.storeId,
    storeName: o.storeName,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    items: o.items,
    totalAmount: parseFloat(o.totalAmount),
    deliveryFee: parseFloat(o.deliveryFee),
    status: o.status,
    driverId: o.driverId,
    estimatedDeliveryTime: o.estimatedDeliveryTime,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

router.post("/orders", async (req, res) => {
  try {
    const { storeId, customerName, customerPhone, customerAddress, items, notes } = req.body;

    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
    if (!store) return res.status(404).json({ error: "Dyqani nuk u gjet" });

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const deliveryFee = parseFloat(store.deliveryFee ?? "1.50");

    const [order] = await db.insert(ordersTable).values({
      storeId,
      storeName: store.name,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount: totalAmount.toString(),
      deliveryFee: deliveryFee.toString(),
      status: "pending",
      notes,
    }).returning();

    await createNotification(
      storeId.toString(), "store",
      "Porosi e re!", `${customerName} ka bërë një porosi prej ${(totalAmount + deliveryFee).toFixed(2)}€`,
      "new_order", order.id
    );

    res.status(201).json(formatOrder(order));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/orders/:orderId", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) return res.status(404).json({ error: "Porosia nuk u gjet" });
    res.json(formatOrder(order));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/orders/:orderId/status", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status, estimatedDeliveryTime } = req.body;

    const [order] = await db.update(ordersTable).set({
      status,
      estimatedDeliveryTime,
      updatedAt: new Date(),
    }).where(eq(ordersTable.id, orderId)).returning();

    if (!order) return res.status(404).json({ error: "Porosia nuk u gjet" });

    const statusMessages: Record<string, string> = {
      confirmed: "Porosia juaj është konfirmuar!",
      preparing: "Porosia juaj po përgatitet!",
      ready: "Porosia juaj është gati për t'u marrë!",
      picked_up: "Porosia juaj u mor nga korrieri!",
      delivered: "Porosia juaj u dorëzua! Mirë ardhë!",
      cancelled: "Porosia juaj u anulua.",
    };

    const statusTitles: Record<string, string> = {
      confirmed: "Konfirmuar",
      preparing: "Duke u Përgatitur",
      ready: "Gati",
      picked_up: "Duke u Dorëzuar",
      delivered: "Dorëzuar",
      cancelled: "Anuluar",
    };

    if (statusMessages[status]) {
      await createNotification(
        order.customerPhone, "customer",
        statusTitles[status] ?? "Përditësim",
        statusMessages[status],
        "order_update", orderId
      );
    }

    if (status === "delivered" && order.driverId) {
      await db.update(ordersTable).set({ status: "delivered" }).where(eq(ordersTable.id, orderId));
    }

    res.json(formatOrder(order));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
