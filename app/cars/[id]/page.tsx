"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchCars } from "@/store/carSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RootState, AppDispatch } from "@/store";
import { Package } from "@/types";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function CarDetails() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: cars, loading } = useSelector((state: RootState) => state.cars);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (cars.length === 0) {
      dispatch(fetchCars());
    }
    
    api.get("/packages").then(res => {
      setPackages(res.data);
      if (res.data.length > 0) setSelectedPackage(res.data[1].id); // Default to Daily
    });
  }, [dispatch, cars.length]);

  const car = cars.find(c => c.id === id);

  if (loading || !car) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pkg = packages.find(p => p.id === selectedPackage);
  const totalPrice = pkg ? car.rate * pkg.multiplier : 0;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a car");
      router.push("/login");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select dates");
      return;
    }

    setBookingLoading(true);
    try {
      await api.post("/bookings", {
        userId: user?.id,
        carId: car.id,
        packageId: selectedPackage,
        startDate,
        endDate,
        totalPrice
      });
      toast.success("Booking confirmed successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <div className="bg-white border-b border-border mb-8">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
          <Button variant="ghost" size="sm" asChild className="font-bold text-xs -ml-2 text-muted-foreground hover:text-primary">
            <Link href="/">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Fleet
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Car Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm"
            >
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img 
                  src={car.image} 
                  alt={car.model} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                       <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                        {car.type}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{car.year} Model</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">{car.make} {car.model}</h1>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Market Rate</p>
                    <p className="text-3xl font-black text-primary">${car.rate}<span className="text-lg font-bold text-muted-foreground ml-1">/HR</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-border/50">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Power</p>
                      <p className="text-sm font-bold">280 HP</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-border/50">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">0-100 km/h</p>
                      <p className="text-sm font-bold">5.2s</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-border/50">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Security</p>
                      <p className="text-sm font-bold">5-Star</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-border/50">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">GPS</p>
                      <p className="text-sm font-bold">Enabled</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-black tracking-tight mb-4">In-Built Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {car.features.map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Unlimited Kilometers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Insurance Included</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Booking Card */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24"
            >
              <Card className="border-border shadow-xl shadow-primary/5 bg-white overflow-hidden">
                <div className="p-1 bg-primary text-[10px] font-black uppercase text-center text-white tracking-widest">
                  Reservations Open
                </div>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rental Package</label>
                      <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                        <SelectTrigger className="h-11 border-border font-semibold">
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} Rental
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pick Up Date</label>
                        <Input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-11 border-border font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Drop Off Date</label>
                        <Input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-11 border-border font-semibold"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-border/50 space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-muted-foreground">Base Rental</span>
                        <span>${car.rate} /hr</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-muted-foreground">Package Multiplier</span>
                        <span>x{pkg?.multiplier}</span>
                      </div>
                      <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                        <span className="font-extrabold text-foreground">Total Estimate</span>
                        <span className="text-2xl font-black text-primary">${totalPrice}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleBooking} 
                      disabled={bookingLoading || car.available === 0}
                      className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-black text-base shadow-lg shadow-primary/20 tracking-tight"
                    >
                      {bookingLoading ? "Processing..." : (
                        <span className="flex items-center">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Confirm Reservation
                        </span>
                      )}
                    </Button>
                    
                    <p className="text-[10px] text-center font-bold text-muted-foreground uppercase leading-tight">
                      By clicking confirm, you agree to our <br/>
                      <span className="underline cursor-pointer">Terms & Conditions</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 p-6 rounded-2xl border border-dashed border-border bg-white flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">Free Cancellation</p>
                  <p className="text-[11px] font-medium text-muted-foreground">Up to 24 hours before pickup</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
