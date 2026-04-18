"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBookings } from "@/store/bookingSlice";
import { fetchCars } from "@/store/carSlice";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar, Car as CarIcon, CreditCard, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { RootState, AppDispatch } from "@/store";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { items: bookings, loading: bookingsLoading } = useSelector((state: RootState) => state.bookings);
  const { items: cars } = useSelector((state: RootState) => state.cars);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      dispatch(fetchBookings(user.id));
      dispatch(fetchCars());
    }
  }, [dispatch, user]);

  const getCarDetails = (carId: string) => cars.find(c => c.id === carId);

  const handleCancel = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status: "cancelled" });
      toast.success("Booking cancelled successfully");
      if (user) {
        dispatch(fetchBookings(user.id));
      }
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === "active") return b.status === "confirmed";
    if (activeTab === "history") return b.status === "completed" || b.status === "cancelled";
    return true;
  });

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Rentals", value: bookings.filter(b => b.status === "confirmed").length, icon: CarIcon, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Spent", value: `$${bookings.reduce((acc, b) => acc + (b.status !== "cancelled" ? b.totalPrice : 0), 0)}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <div className="p-8 text-center font-bold">Checking authentication...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back, {user?.name}</h1>
          <p className="text-[13px] font-medium text-muted-foreground">Manage your rentals and view your booking history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="sleek-card">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="sleek-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-extrabold tracking-tight">My Bookings</CardTitle>
              <TabsList className="bg-muted p-1 h-9 rounded-md">
                <TabsTrigger value="active" className="text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm px-4">Active</TabsTrigger>
                <TabsTrigger value="history" className="text-[11px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm px-4">History</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 px-6">Vehicle</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Period</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Total Price</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Status</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-[13px] font-medium">Loading bookings...</TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-[13px] font-medium text-muted-foreground">
                      No bookings found in this category.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const car = getCarDetails(booking.carId);
                    return (
                      <TableRow key={booking.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-16 rounded-md overflow-hidden border border-border">
                              <img 
                                src={car?.image} 
                                alt={car?.model} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold">{car?.make} {car?.model}</p>
                              <p className="text-[11px] text-muted-foreground font-medium">{car?.year}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[12px] font-medium text-muted-foreground flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                            {format(new Date(booking.startDate), "MMM dd")} - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] font-extrabold">${booking.totalPrice}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"}
                            className="text-[10px] font-bold capitalize"
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          {booking.status === "confirmed" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancel(booking.id)}
                            >
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          )}
                          {booking.status === "completed" && (
                            <div className="flex items-center justify-end text-green-600 text-[11px] font-bold">
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              Completed
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
