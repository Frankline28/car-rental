export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  image: string;
  rate: number;
  rates: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  features: string[];
  available: number;
  total: number;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  packageType: string;
  totalPrice: number;
  status: "confirmed" | "cancelled" | "completed";
}

export interface Package {
  id: string;
  name: string;
  duration: string;
  discount: number;
  multiplier: number;
}
