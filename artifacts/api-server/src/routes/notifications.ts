import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;

    let notifications = await db.select().from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.userType, userType as string)));

    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(notifications.map(n => ({
      id: n.id,
      userId: n.userId,
      userType: n.userType,
      title: n.title,
      message: n.message,
      type: n.type,
      orderId: n.orderId,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/notifications/:notificationId/read", async (req, res) => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, notificationId));
    res.json({ success: true, message: "Njoftimi u lexua" });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
