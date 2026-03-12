import { Router } from "express";
import { db, storesTable, productsTable, ordersTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";

const router = Router();

router.get("/stores", async (req, res) => {
  try {
    const { category, search } = req.query;
    let stores = await db.select().from(storesTable);

    if (category && typeof category === "string") {
      stores = stores.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (search && typeof search === "string") {
      stores = stores.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    const result = stores.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      businessNumber: s.businessNumber,
      address: s.address,
      city: s.city,
      phone: s.phone,
      imageUrl: s.imageUrl,
      coverImageUrl: s.coverImageUrl,
      rating: parseFloat(s.rating ?? "4.5"),
      deliveryTime: s.deliveryTime,
      minOrder: parseFloat(s.minOrder ?? "0"),
      deliveryFee: parseFloat(s.deliveryFee ?? "1.50"),
      isOpen: s.isOpen,
      isDemo: s.isDemo,
      createdAt: s.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/stores", async (req, res) => {
  try {
    const { name, description, category, businessNumber, address, city, phone, password, imageUrl, coverImageUrl, deliveryTime, minOrder, deliveryFee } = req.body;

    const existing = await db.select().from(storesTable).where(eq(storesTable.businessNumber, businessNumber));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Numri i biznesit ekziston tashmë" });
    }

    const [store] = await db.insert(storesTable).values({
      name, description, category, businessNumber, address, city, phone, password,
      imageUrl, coverImageUrl,
      deliveryTime: deliveryTime ?? "20-35 min",
      minOrder: minOrder?.toString() ?? "0",
      deliveryFee: deliveryFee?.toString() ?? "1.50",
      isOpen: true, isDemo: false,
    }).returning();

    res.status(201).json({
      id: store.id,
      name: store.name,
      description: store.description,
      category: store.category,
      businessNumber: store.businessNumber,
      address: store.address,
      city: store.city,
      phone: store.phone,
      imageUrl: store.imageUrl,
      coverImageUrl: store.coverImageUrl,
      rating: parseFloat(store.rating ?? "4.5"),
      deliveryTime: store.deliveryTime,
      minOrder: parseFloat(store.minOrder ?? "0"),
      deliveryFee: parseFloat(store.deliveryFee ?? "1.50"),
      isOpen: store.isOpen,
      isDemo: store.isDemo,
      createdAt: store.createdAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/stores/login", async (req, res) => {
  try {
    const { businessNumber, password } = req.body;
    const [store] = await db.select().from(storesTable)
      .where(and(eq(storesTable.businessNumber, businessNumber), eq(storesTable.password, password)));

    if (!store) {
      return res.status(401).json({ error: "Numri i biznesit ose fjalëkalimi i gabuar" });
    }

    res.json({
      id: store.id,
      name: store.name,
      description: store.description,
      category: store.category,
      businessNumber: store.businessNumber,
      address: store.address,
      city: store.city,
      phone: store.phone,
      imageUrl: store.imageUrl,
      coverImageUrl: store.coverImageUrl,
      rating: parseFloat(store.rating ?? "4.5"),
      deliveryTime: store.deliveryTime,
      minOrder: parseFloat(store.minOrder ?? "0"),
      deliveryFee: parseFloat(store.deliveryFee ?? "1.50"),
      isOpen: store.isOpen,
      isDemo: store.isDemo,
      createdAt: store.createdAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stores/:storeId", async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId));
    if (!store) return res.status(404).json({ error: "Dyqani nuk u gjet" });

    res.json({
      id: store.id,
      name: store.name,
      description: store.description,
      category: store.category,
      businessNumber: store.businessNumber,
      address: store.address,
      city: store.city,
      phone: store.phone,
      imageUrl: store.imageUrl,
      coverImageUrl: store.coverImageUrl,
      rating: parseFloat(store.rating ?? "4.5"),
      deliveryTime: store.deliveryTime,
      minOrder: parseFloat(store.minOrder ?? "0"),
      deliveryFee: parseFloat(store.deliveryFee ?? "1.50"),
      isOpen: store.isOpen,
      isDemo: store.isDemo,
      createdAt: store.createdAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stores/:storeId/products", async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const products = await db.select().from(productsTable).where(eq(productsTable.storeId, storeId));
    res.json(products.map(p => ({
      id: p.id,
      storeId: p.storeId,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      category: p.category,
      imageUrl: p.imageUrl,
      isAvailable: p.isAvailable,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/stores/:storeId/products", async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    const [product] = await db.insert(productsTable).values({
      storeId, name, description,
      price: price.toString(),
      category,
      imageUrl,
      isAvailable: isAvailable ?? true,
    }).returning();

    res.status(201).json({
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/stores/:storeId/products/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    const [product] = await db.update(productsTable).set({
      name, description,
      price: price.toString(),
      category, imageUrl,
      isAvailable: isAvailable ?? true,
    }).where(eq(productsTable.id, productId)).returning();

    if (!product) return res.status(404).json({ error: "Produkti nuk u gjet" });

    res.json({
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      createdAt: product.createdAt.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/stores/:storeId/products/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    await db.delete(productsTable).where(eq(productsTable.id, productId));
    res.json({ success: true, message: "Produkti u fshi" });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stores/:storeId/orders", async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId);
    const { status } = req.query;

    let storeOrders = await db.select().from(ordersTable).where(eq(ordersTable.storeId, storeId));

    if (status && typeof status === "string") {
      storeOrders = storeOrders.filter(o => o.status === status);
    }

    storeOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(storeOrders.map(o => ({
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
    })));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
