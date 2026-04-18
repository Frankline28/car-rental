import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCars } from "../store/carSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { RootState, AppDispatch } from "../store";
import { Car } from "../types";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: cars, loading } = useSelector((state: RootState) => state.cars);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  const filteredCars = cars.filter(car => {
    const matchesSearch = `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || car.type === filterType;
    return matchesSearch && matchesType;
  });

  const carTypes = ["All", ...new Set(cars.map(car => car.type))];

  return (
    <div className="space-y-8 pb-12">
      {/* Search Bar Section */}
      <section className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
            <Input 
              placeholder="Airport, City, or ZIP" 
              className="h-10 border-border bg-white text-sm"
              value="San Francisco Int'l (SFO)"
              readOnly
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pick up</label>
            <Input type="date" className="h-10 border-border bg-white text-sm" defaultValue="2024-10-25" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Drop off</label>
            <Input type="date" className="h-10 border-border bg-white text-sm" defaultValue="2024-10-28" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Car Type</label>
            <Select value={filterType} onValueChange={(val) => setFilterType(val || "All")}>
              <SelectTrigger className="h-10 border-border bg-white text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {carTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="h-10 bg-primary hover:bg-primary/90 font-bold text-sm">
            Search
          </Button>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-8 hidden lg:block">
          <div className="space-y-4">
            <h4 className="text-[13px] font-bold text-foreground">Vehicle Category</h4>
            <div className="space-y-2">
              {carTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "flex items-center w-full text-[13px] py-1 transition-colors",
                    filterType === type ? "text-primary font-bold" : "text-muted-foreground font-medium"
                  )}
                >
                  <span className="mr-2">{filterType === type ? "●" : "○"}</span>
                  {type} Vehicles
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[13px] font-bold text-foreground">Rental Duration</h4>
            <div className="space-y-2">
              {["Hourly", "Daily", "Weekly", "Monthly"].map(duration => (
                <button
                  key={duration}
                  className={cn(
                    "flex items-center w-full text-[13px] py-1 transition-colors",
                    duration === "Daily" ? "text-primary font-bold" : "text-muted-foreground font-medium"
                  )}
                >
                  <span className="mr-2">{duration === "Daily" ? "●" : "○"}</span>
                  {duration}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Car Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[320px] bg-white border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="sleek-card group h-full flex flex-col">
                    <div className="relative h-36 bg-slate-100 overflow-hidden">
                      <img 
                        src={car.image} 
                        alt={car.model} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {index % 3 === 0 && (
                        <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-primary shadow-sm">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-[15px] font-bold">{car.make} {car.model}</CardTitle>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <span>{car.type}</span>
                        <span>•</span>
                        <span>5 Seats</span>
                        <span>•</span>
                        <span>{car.features[0] || "Standard"}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                      <div className="pt-3 border-t border-border flex items-baseline justify-between">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-extrabold">${car.rate}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">/day</span>
                        </div>
                        <Button asChild className="h-8 px-3 text-[11px] font-bold bg-primary hover:bg-primary/90">
                          <Link to={`/cars/${car.id}`}>Book Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredCars.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-border">
              <h3 className="text-lg font-bold">No vehicles found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
