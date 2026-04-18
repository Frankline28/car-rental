import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { User } from "@/types";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();
  const db = getDb();
  
  if (db.users.find((u) => u.email === email)) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
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
  return NextResponse.json(userWithoutPassword);
}
