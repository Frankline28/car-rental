import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, CheckCircle2, Info, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { RootState } from "../store";
import { Car, Package } from "../types";
import { DateRange } from "react-day-picker";

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [car, setCar] = useState<Car | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPackage, setSelectedPackage] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, pkgRes] = await Promise.all([
          api.get(`/cars`),
          api.get("/packages")
        ]);
        const foundCar = carRes.data.find((c: Car) => c.id === id);
        setCar(foundCar);
        setPackages(pkgRes.data);
        if (pkgRes.data.length > 0) setSelectedPackage(pkgRes.data[1].id); // Default to Daily
      } catch (error) {
        toast.error("Failed to load car details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const calculateTotal = () => {
    if (!car || !selectedPackage || !dateRange?.to) return 0;
    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return 0;
    
    const days = Math.max(1, differenceInDays(dateRange.to, dateRange.from || new Date()));
    return car.rate * pkg.multiplier * (pkg.name === "Daily" ? days : 1);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a car");
      return navigate("/login");
    }

    if (!dateRange?.from || !dateRange?.to) {
      return toast.error("Please select a date range");
    }

    setIsBooking(true);
    try {
      await api.post("/bookings", {
        userId: user?.id,
        carId: car?.id,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        packageId: selectedPackage,
        totalPrice: calculateTotal(),
      });
      toast.success("Booking confirmed! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!car) return <div className="text-center py-20">Car not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="h-9 text-[13px] font-bold text-muted-foreground hover:text-primary p-0">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to listings
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Car Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[400px] rounded-2xl overflow-hidden sleek-card"
          >
            <img 
              src={car.image} 
              alt={car.model} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8">
              <div className="flex items-end justify-between">
                <div className="text-white">
                  <Badge className="mb-3 bg-primary hover:bg-primary/90 text-[10px] font-bold border-none">{car.type}</Badge>
                  <h1 className="text-4xl font-extrabold tracking-tight">{car.make} {car.model}</h1>
                  <p className="text-slate-300 text-sm font-medium mt-1">{car.year} • {car.available} units available</p>
                </div>
                <div className="text-right text-white">
                  <p className="text-3xl font-extrabold">${car.rate}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">base rate / day</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="sleek-card">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Info className="mr-2 h-4 w-4 text-primary" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-[13px] font-medium text-muted-foreground">Make</span>
                  <span className="text-[13px] font-bold">{car.make}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-[13px] font-medium text-muted-foreground">Model</span>
                  <span className="text-[13px] font-bold">{car.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-[13px] font-medium text-muted-foreground">Year</span>
                  <span className="text-[13px] font-bold">{car.year}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[13px] font-medium text-muted-foreground">Category</span>
                  <span className="text-[13px] font-bold">{car.type}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="sleek-card">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="grid grid-cols-1 gap-3">
                  {car.features.map(feature => (
                    <li key={feature} className="flex items-center text-[13px] font-medium text-foreground">
                      <CheckCircle2 className="mr-2.5 h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold tracking-tight flex items-center">
                <ShieldCheck className="mr-2.5 h-6 w-6 text-primary" />
                DriveSync Protection
              </h3>
              <p className="text-slate-400 text-[13px] font-medium max-w-md">
                Every rental includes basic insurance, 24/7 roadside assistance, and our best-price guarantee.
              </p>
            </div>
            <Button variant="outline" className="h-10 px-6 text-[13px] font-bold text-white border-white hover:bg-white hover:text-slate-900 transition-all">
              Learn More
            </Button>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="space-y-6">
          <Card className="sticky top-24 sleek-card overflow-hidden">
            <div className="bg-primary p-6 text-white">
              <CardTitle className="text-xl font-extrabold tracking-tight">Book This Vehicle</CardTitle>
              <p className="text-primary-foreground/80 text-[11px] font-bold uppercase tracking-wider mt-1">Select dates & package</p>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rental Package</label>
                <Select value={selectedPackage} onValueChange={(val) => setSelectedPackage(val || "")}>
                  <SelectTrigger className="h-11 border-border bg-white text-[13px] font-medium">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id} className="text-[13px]">
                        {pkg.name} Rental
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rental Period</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left text-[13px] font-medium border-border",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range: any) => setDateRange(range)}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                      className="rounded-md border border-border"
                      classNames={{}}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-muted-foreground">Total Price</span>
                  <span className="text-primary text-2xl font-extrabold">${calculateTotal()}</span>
                </div>
                <Button 
                  className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/10" 
                  size="lg"
                  onClick={handleBooking}
                  disabled={isBooking || car.available === 0}
                >
                  {isBooking ? "Processing..." : car.available === 0 ? "Sold Out" : "Confirm Booking"}
                </Button>
                <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  No hidden fees • Free cancellation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
