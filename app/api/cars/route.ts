import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { Car } from "@/types";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.cars);
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = getDb();
  const newCar: Car = { ...body, id: `car-${Date.now()}` };
  db.cars.push(newCar);
  saveDb(db);
  return NextResponse.json(newCar);
}
