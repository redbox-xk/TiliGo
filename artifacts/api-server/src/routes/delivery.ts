import { Router } from "express";
import { db, deliveryDriversTable, ordersTable, notificationsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";

const router = Router();

function formatDriver(d: typeof deliveryDriversTable.$inferSelect) {
  return {
    id: d.id,
    name: d.name,
    idNumber: d.idNumber,
    phone: d.phone,
    vehicleType: d.vehicleType,
    isActive: d.isActive,
    totalDeliveries: d.totalDeliveries ?? 0,
    createdAt: d.createdAt.toISOString(),
  };
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

router.post("/delivery/register", async (req, res) => {
  try {
    const { name, idNumber, phone, vehicleType, password } = req.body;

    const existing = await db.select().from(deliveryDriversTable).where(eq(deliveryDriversTable.idNumber, idNumber));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Numri i ID-së ekziston tashmë" });
    }

    const [driver] = await db.insert(deliveryDriversTable).values({
      name, idNumber, phone, vehicleType, password,
      isActive: true, totalDeliveries: 0,
    }).returning();

    res.status(201).json(formatDriver(driver));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/delivery/login", async (req, res) => {
  try {
    const { idNumber, password } = req.body;

    const [driver] = await db.select().from(deliveryDriversTable)
      .where(and(eq(deliveryDriversTable.idNumber, idNumber), eq(deliveryDriversTable.password, password)));

    if (!driver) {
      return res.status(401).json({ error: "Numri i ID-së ose fjalëkalimi i gabuar" });
    }

    res.json(formatDriver(driver));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/delivery/:driverId/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable)
      .where(inArray(ordersTable.status, ["ready"]));

    res.json(orders.map(formatOrder));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/delivery/:driverId/accept/:orderId", async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const orderId = parseInt(req.params.orderId);

    const [order] = await db.update(ordersTable).set({
      driverId,
      status: "picked_up",
      updatedAt: new Date(),
    }).where(eq(ordersTable.id, orderId)).returning();

    if (!order) return res.status(404).json({ error: "Porosia nuk u gjet" });

    await db.insert(notificationsTable).values({
      userId: order.customerPhone,
      userType: "customer",
      title: "Duke u Dorëzuar",
      message: "Porosia juaj u mor nga korrieri dhe po vjen drejt jush!",
      type: "order_update",
      orderId,
      isRead: false,
    });

    res.json(formatOrder(order));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/delivery/:driverId/active", async (req, res) => {
  try {
    const driverId = parseInt(req.params.driverId);
    const orders = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.driverId, driverId), inArray(ordersTable.status, ["picked_up"])));
    res.json(orders.map(formatOrder));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
