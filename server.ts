import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { User, Car, Booking, Package } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Db {
  users: User[];
  cars: Car[];
  bookings: Booking[];
  packages: Package[];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const dbPath = path.join(__dirname, "db.json");

  const getDb = (): Db => JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  const saveDb = (data: Db) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

  // Auth API
  app.post("/api/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/register", (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const db = getDb();
    if (db.users.find((u) => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: "customer"
    };
    db.users.push(newUser);
    saveDb(db);
    const { password: _, ...userWithoutPassword } = newUser;
    res.json(userWithoutPassword);
  });

  // Cars API
  app.get("/api/cars", (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.cars);
  });

  app.post("/api/cars", (req: Request, res: Response) => {
    const db = getDb();
    const newCar: Car = { ...req.body, id: `car-${Date.now()}` };
    db.cars.push(newCar);
    saveDb(db);
    res.json(newCar);
  });

  app.put("/api/cars/:id", (req: Request, res: Response) => {
    const db = getDb();
    const index = db.cars.findIndex((c) => c.id === req.params.id);
    if (index !== -1) {
      db.cars[index] = { ...db.cars[index], ...req.body };
      saveDb(db);
      res.json(db.cars[index]);
    } else {
      res.status(404).json({ message: "Car not found" });
    }
  });

  app.delete("/api/cars/:id", (req: Request, res: Response) => {
    const db = getDb();
    db.cars = db.cars.filter((c) => c.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Bookings API
  app.get("/api/bookings", (req: Request, res: Response) => {
    const db = getDb();
    const { userId } = req.query;
    if (userId) {
      res.json(db.bookings.filter((b) => b.userId === userId));
    } else {
      res.json(db.bookings);
    }
  });

  app.post("/api/bookings", (req: Request, res: Response) => {
    const db = getDb();
    const newBooking: Booking = { ...req.body, id: `book-${Date.now()}`, status: "confirmed" };
    
    // Update car availability
    const carIndex = db.cars.findIndex((c) => c.id === newBooking.carId);
    if (carIndex !== -1 && db.cars[carIndex].available > 0) {
      db.cars[carIndex].available -= 1;
      db.bookings.push(newBooking);
      saveDb(db);
      res.json(newBooking);
    } else {
      res.status(400).json({ message: "Car not available" });
    }
  });

  app.patch("/api/bookings/:id", (req: Request, res: Response) => {
    const db = getDb();
    const index = db.bookings.findIndex((b) => b.id === req.params.id);
    if (index !== -1) {
      const oldBooking = db.bookings[index];
      db.bookings[index] = { ...oldBooking, ...req.body };
      
      // If cancelled, restore car availability
      if (req.body.status === "cancelled" && oldBooking.status !== "cancelled") {
        const carIndex = db.cars.findIndex((c) => c.id === oldBooking.carId);
        if (carIndex !== -1) {
          db.cars[carIndex].available += 1;
        }
      }
      
      saveDb(db);
      res.json(db.bookings[index]);
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  });

  // Users API (Admin)
  app.get("/api/users", (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.users.map(({ password, ...u }) => u));
  });

  // Packages API
  app.get("/api/packages", (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.packages);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
