import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const db = getDb();
  const index = db.cars.findIndex((c) => c.id === id);
  
  if (index !== -1) {
    db.cars[index] = { ...db.cars[index], ...body };
    saveDb(db);
    return NextResponse.json(db.cars[index]);
  } else {
    return NextResponse.json({ message: "Car not found" }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const db = getDb();
  db.cars = db.cars.filter((c) => c.id !== id);
  saveDb(db);
  return NextResponse.json({ success: true });
}
