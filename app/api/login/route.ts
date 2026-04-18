import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const db = getDb();
  const user = db.users.find((u) => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } else {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
}
