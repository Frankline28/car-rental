import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const db = getDb();
  const index = db.bookings.findIndex((b) => b.id === id);
  
  if (index !== -1) {
    const oldBooking = db.bookings[index];
    db.bookings[index] = { ...oldBooking, ...body };
    
    if (body.status === "cancelled" && oldBooking.status !== "cancelled") {
      const carIndex = db.cars.findIndex((c) => c.id === oldBooking.carId);
      if (carIndex !== -1) {
        db.cars[carIndex].available += 1;
      }
    }
    
    saveDb(db);
    return NextResponse.json(db.bookings[index]);
  } else {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }
}
