"use client";
import styles from "./home.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCars } from "@/store/carSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { RootState, AppDispatch } from "@/store";
import { Car } from "@/types";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: cars, loading } = useSelector((state: RootState) => state.cars);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         car.model.toLowerCase().includes(searchTerm.toLowerCase());
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vehicle Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-10 border-border bg-white text-sm">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                {carTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="h-10 bg-primary hover:bg-primary/90 font-bold text-sm">
            Search Available
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Explore Our Fleet</h2>
            <p className="text-muted-foreground font-medium text-sm mt-1">Found {filteredCars.length} premium vehicles for your search</p>
          </div>
          <div className="w-full md:w-64">
            <Input
              placeholder="Search make or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 bg-white border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] rounded-xl bg-muted/40 animate-pulse" />
            ))
          ) : (
            filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden border-border bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={car.image}
                      alt={`${car.make} ${car.model}`}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        car.available > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {car.available > 0 ? "Available" : "Sold Out"}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="p-5 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">{car.type}</p>
                        <CardTitle className="text-xl font-extrabold group-hover:text-primary transition-colors">
                          {car.make} {car.model}
                        </CardTitle>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-muted-foreground">Starting</p>
                        <p className="text-xl font-black text-foreground">${car.rate}<span className="text-xs font-bold text-muted-foreground ml-1">/HR</span></p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="flex flex-wrap gap-2 mt-4 mb-6">
                      {car.features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Button asChild className="w-full h-11 bg-slate-950 hover:bg-primary transition-all duration-300 font-bold tracking-tight rounded-lg">
                      <Link href={`/cars/${car.id}`}>View Rental Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border mt-8">
            <h3 className="text-xl font-bold text-foreground">No vehicles found</h3>
            <p className="text-muted-foreground font-medium mt-1">Try adjusting your filters or search terms</p>
            <Button 
              variant="link" 
              className="mt-4 font-bold text-primary"
              onClick={() => { setSearchTerm(""); setFilterType("All"); }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
