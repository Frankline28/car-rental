import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { Booking } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const db = getDb();
  
  if (userId) {
    return NextResponse.json(db.bookings.filter((b) => b.userId === userId));
  } else {
    return NextResponse.json(db.bookings);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = getDb();
  const newBooking: Booking = { ...body, id: `book-${Date.now()}`, status: "confirmed" };
  
  const carIndex = db.cars.findIndex((c) => c.id === newBooking.carId);
  if (carIndex !== -1 && db.cars[carIndex].available > 0) {
    db.cars[carIndex].available -= 1;
    db.bookings.push(newBooking);
    saveDb(db);
    return NextResponse.json(newBooking);
  } else {
    return NextResponse.json({ message: "Car not available" }, { status: 400 });
  }
}
