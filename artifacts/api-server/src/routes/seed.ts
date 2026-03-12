import { Router } from "express";
import { db, storesTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEMO_STORES = [
  {
    name: "Pizzeria Prishtina",
    description: "Pizza autentike italiane me produkte të freskëta nga Kosova",
    category: "Restaurant",
    businessNumber: "DEMO-001",
    address: "Rr. Nënë Tereza 15",
    city: "Prishtinë",
    phone: "038-123-456",
    password: "demo123",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80",
    rating: "4.8",
    deliveryTime: "20-35 min",
    minOrder: "3.00",
    deliveryFee: "1.50",
    isOpen: true, isDemo: true,
  },
  {
    name: "Burger House Prizren",
    description: "Burgerat më të mirë në Kosovë, receta tradicionale amerikane",
    category: "Fast Food",
    businessNumber: "DEMO-002",
    address: "Sheshi i Lirisë 8",
    city: "Prizren",
    phone: "029-234-567",
    password: "demo123",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
    rating: "4.6",
    deliveryTime: "15-25 min",
    minOrder: "2.00",
    deliveryFee: "1.00",
    isOpen: true, isDemo: true,
  },
  {
    name: "Supermarketi Fruti",
    description: "Produkte të freskëta, ushqime organike dhe gjithçka që ju nevojitet",
    category: "Supermarket",
    businessNumber: "DEMO-003",
    address: "Rr. Garibaldi 22",
    city: "Mitrovicë",
    phone: "028-345-678",
    password: "demo123",
    imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80",
    rating: "4.5",
    deliveryTime: "25-40 min",
    minOrder: "5.00",
    deliveryFee: "2.00",
    isOpen: true, isDemo: true,
  },
  {
    name: "Kafeja Orient",
    description: "Kafe turke tradicionale, çaj dhe embëlsira orientale",
    category: "Kafe",
    businessNumber: "DEMO-004",
    address: "Rr. Skënderbeu 5",
    city: "Gjakovë",
    phone: "0390-123-456",
    password: "demo123",
    imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
    rating: "4.7",
    deliveryTime: "10-20 min",
    minOrder: "1.50",
    deliveryFee: "0.80",
    isOpen: true, isDemo: true,
  },
  {
    name: "Farmacia Plus",
    description: "Ilaçe, vitaminë dhe produkte shëndetësore me çmime të mira",
    category: "Farmaci",
    businessNumber: "DEMO-005",
    address: "Blloku B 12",
    city: "Ferizaj",
    phone: "0290-234-567",
    password: "demo123",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    rating: "4.4",
    deliveryTime: "20-30 min",
    minOrder: "2.00",
    deliveryFee: "1.20",
    isOpen: true, isDemo: true,
  },
];

const DEMO_PRODUCTS: Record<string, Array<{ name: string; description: string; price: string; category: string; imageUrl: string }>> = {
  "DEMO-001": [
    { name: "Pizza Margherita", description: "Salcë domate, mozzarella, borzilok i freskët", price: "5.50", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
    { name: "Pizza Quattro Stagioni", description: "Kërpudha, proshutë, piper i kuq, ullinj", price: "7.00", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80" },
    { name: "Pizza Diavola", description: "Salcë speca, proshutë pikante, mozzarella", price: "6.50", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80" },
    { name: "Pizza Capricciosa", description: "Kërpudha, proshutë, artishok, ullinj të zezë", price: "6.80", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" },
    { name: "Pasta Carbonara", description: "Spageti me vezë, pancetta, parmigiano reggiano", price: "5.00", category: "Pasta", imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80" },
    { name: "Sallatë Çezar", description: "Sallatë, pulë e grilluar, kos, krutone, parmigiano", price: "3.50", category: "Sallata", imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80" },
    { name: "Tiramisu", description: "Ëmbëlsirë italiane klasike", price: "2.50", category: "Ëmbëlsira", imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80" },
    { name: "Coca-Cola 330ml", description: "Pije freskuese", price: "1.00", category: "Pije", imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&q=80" },
  ],
  "DEMO-002": [
    { name: "Burger Klasik", description: "Mish viçi 180g, sallatë, domate, tranguj, mustardë", price: "3.50", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
    { name: "Cheese Burger", description: "Mish viçi, djathë çedar, sallatë, domate, sos special", price: "4.00", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80" },
    { name: "Double Burger", description: "Dy patty mishi viçi, djathë, bacon, sallatë", price: "5.50", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80" },
    { name: "Chicken Burger", description: "Fileto pule e krokante, sallatë çezar, sos mayo", price: "3.80", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80" },
    { name: "Patate Krokante", description: "Patate të freskëta, kripë deti, sos ketchup", price: "1.50", category: "Anke", imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80" },
    { name: "Onion Rings", description: "Qepë të panifikuara, krokante", price: "2.00", category: "Anke", imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80" },
    { name: "Milkshake Çokollatë", description: "Milkshake i kremoz me çokollatë belge", price: "2.50", category: "Pije", imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80" },
    { name: "Limonadë", description: "Limonadë e freskët me menta", price: "1.20", category: "Pije", imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80" },
  ],
  "DEMO-003": [
    { name: "Bukë e Freskët", description: "Bukë artizanale e pjekur çdo mëngjes", price: "0.80", category: "Bukë", imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80" },
    { name: "Qumësht Organik 1L", description: "Qumësht i freskët nga fermat lokale", price: "1.20", category: "Bulmet", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80" },
    { name: "Djathë Kos", description: "Djathë tradicional kosovar 500g", price: "2.50", category: "Bulmet", imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80" },
    { name: "Mollë të Freskëta 1kg", description: "Mollë organike nga Prizreni", price: "1.50", category: "Fruta", imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80" },
    { name: "Domate 1kg", description: "Domate të freskëta vendase", price: "1.00", category: "Perime", imageUrl: "https://images.unsplash.com/photo-1546470427-f5a3f0e8f4ce?w=400&q=80" },
    { name: "Vezë 12 copë", description: "Vezë të freskëta nga pulat e lira", price: "2.00", category: "Vezë", imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&q=80" },
    { name: "Kafe Lavazza 250g", description: "Kafe italiane premium", price: "4.50", category: "Kafe & Çaj", imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80" },
    { name: "Ujë Rugove 1.5L", description: "Ujë mineral nga burimet e Rugovës", price: "0.60", category: "Pije", imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80" },
  ],
  "DEMO-004": [
    { name: "Kafe Turke", description: "Kafe tradicionale turke, e bujshme dhe aromatike", price: "0.80", category: "Kafe", imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80" },
    { name: "Çaj Menteje", description: "Çaj i freskët me menta nga malet e Kosovës", price: "0.70", category: "Çaj", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80" },
    { name: "Cappuccino", description: "Kafe me qumësht të freskëtuar, cinnamon", price: "1.50", category: "Kafe", imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80" },
    { name: "Bakllavë", description: "Bakllava tradicionale me arra dhe mjaltë", price: "1.20", category: "Ëmbëlsira", imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&q=80" },
    { name: "Kadaifi", description: "Ëmbëlsirë orientale me fistikë dhe shurup", price: "1.50", category: "Ëmbëlsira", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80" },
    { name: "Lokum", description: "Lokum me aromatë trëndafili, pistaches", price: "2.00", category: "Ëmbëlsira", imageUrl: "https://images.unsplash.com/photo-1549203838-d84bf5ef12f2?w=400&q=80" },
    { name: "Boza", description: "Pija tradicionale e fermentuar e elbit", price: "1.00", category: "Pije", imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&q=80" },
    { name: "Sherbet Trëndafili", description: "Sherbet i freskët me aromë trëndafili", price: "0.80", category: "Pije", imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80" },
  ],
  "DEMO-005": [
    { name: "Paracetamol 500mg", description: "Tableta kundër dhimbjeve dhe temperaturës, 20 tableta", price: "1.50", category: "Ilaçe", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" },
    { name: "Vitamina C 1000mg", description: "Vitamina C eferveshente, shije limoni, 20 tableta", price: "2.50", category: "Vitamina", imageUrl: "https://images.unsplash.com/photo-1612276529731-4b21494e6d71?w=400&q=80" },
    { name: "Maska FFP2", description: "Maska mbrojtëse cilësi e lartë, paketa 10 copë", price: "3.00", category: "Mbrojtje", imageUrl: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&q=80" },
    { name: "Krem Nivea", description: "Krem i trupit me shea butter, 400ml", price: "4.50", category: "Kozmetikë", imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80" },
    { name: "Bandazhë Sterile", description: "Bandazhe sterile 5x5cm, 10 copë", price: "1.20", category: "Kujdes", imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80" },
    { name: "Magnez + B6", description: "Magnez me vitamina B6 për lodhjen dhe stresin", price: "5.00", category: "Vitamina", imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80" },
    { name: "Spray Fyti", description: "Spray anticeptik për fytyrën, 50ml", price: "3.50", category: "Kujdes", imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=80" },
    { name: "Omega 3", description: "Kapsulë vajra peshku, 60 kapsulla", price: "8.00", category: "Vitamina", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" },
  ],
};

router.post("/seed", async (req, res) => {
  try {
    let seededCount = 0;

    for (const storeData of DEMO_STORES) {
      const existing = await db.select().from(storesTable).where(eq(storesTable.businessNumber, storeData.businessNumber));
      if (existing.length > 0) continue;

      const [store] = await db.insert(storesTable).values(storeData).returning();

      const products = DEMO_PRODUCTS[storeData.businessNumber] ?? [];
      for (const product of products) {
        await db.insert(productsTable).values({ storeId: store.id, ...product, isAvailable: true });
      }
      seededCount++;
    }

    res.json({ success: true, message: `${seededCount} dyqane demo u shtuan` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error during seed" });
  }
});

export default router;
