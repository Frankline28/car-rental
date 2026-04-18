"use client";
import styles from "./admin.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCars } from "@/store/carSlice";
import { fetchBookings } from "@/store/bookingSlice";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { 
  Plus, Edit, Trash2, Users, Car as CarIcon, 
  DollarSign, Calendar, Download 
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { RootState, AppDispatch } from "@/store";
import { Car, User, Booking } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { items: cars } = useSelector((state: RootState) => state.cars);
  const { items: bookings } = useSelector((state: RootState) => state.bookings);
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Form states
  const [isCarDialogOpen, setIsCarDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || user?.role !== "admin") return;
      setDataLoading(true);
      try {
        await Promise.all([
          dispatch(fetchCars()),
          dispatch(fetchBookings(undefined)),
          api.get("/users").then(res => setUsers(res.data))
        ]);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [dispatch, isAuthenticated, user]);

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCar?.id) {
        await api.put(`/cars/${editingCar.id}`, editingCar);
        toast.success("Car updated successfully");
      } else {
        await api.post("/cars", { ...editingCar, available: editingCar?.total });
        toast.success("Car added successfully");
      }
      dispatch(fetchCars());
      setIsCarDialogOpen(false);
      setEditingCar(null);
    } catch (error) {
      toast.error("Failed to save car");
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (confirm("Are you sure you want to delete this car?")) {
      try {
        await api.delete(`/cars/${id}`);
        toast.success("Car deleted successfully");
        dispatch(fetchCars());
      } catch (error) {
        toast.error("Failed to delete car");
      }
    }
  };

  // Reporting Data
  const revenueByMonth = [
    { name: "Jan", total: 4000 },
    { name: "Feb", total: 3000 },
    { name: "Mar", total: 2000 },
    { name: "Apr", total: 2780 },
    { name: "May", total: 1890 },
    { name: "Jun", total: 2390 },
  ];

  const carTypeData = [
    { name: "Sedan", value: cars.filter(c => c.type === "Sedan").length },
    { name: "SUV", value: cars.filter(c => c.type === "SUV").length },
    { name: "Luxury", value: cars.filter(c => c.type === "Luxury").length },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const stats = [
    { label: "Total Revenue", value: `$${bookings.reduce((acc, b) => acc + (b.status !== "cancelled" ? b.totalPrice : 0), 0)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Bookings", value: bookings.filter(b => b.status === "confirmed").length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Users", value: users.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Fleet Size", value: cars.length, icon: CarIcon, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  if (authLoading || (!isAuthenticated && !authLoading) || (isAuthenticated && user?.role !== "admin")) {
    return <div className="p-8 text-center font-bold">Checking admin permissions...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-[13px] font-medium text-muted-foreground">Manage your fleet, users, and view business reports.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-9 text-[13px] font-bold border-border">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isCarDialogOpen} onOpenChange={setIsCarDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-primary hover:bg-primary/90 text-[13px] font-bold" onClick={() => setEditingCar({ make: "", model: "", year: 2024, type: "Sedan", rate: 0, total: 1, features: [], image: "" })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] sleek-card p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-extrabold tracking-tight">{editingCar?.id ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCarSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Make</Label>
                    <Input type="text" value={editingCar?.make || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCar({...editingCar, make: e.target.value})} className="sleek-input" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model</Label>
                    <Input type="text" value={editingCar?.model || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCar({...editingCar, model: e.target.value})} className="sleek-input" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Year</Label>
                    <Input type="number" value={editingCar?.year || 2024} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCar({...editingCar, year: parseInt(e.target.value)})} className="sleek-input" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</Label>
                    <Input type="text" value={editingCar?.type || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCar({...editingCar, type: e.target.value})} className="sleek-input" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Daily Rate ($)</Label>
                    <Input type="number" value={editingCar?.rate || 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCar({...editingCar, rate: parseInt(e.target.value)})} className="sleek-input" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Units</Label>
                    <Input type="number" value={editingCar?.total || 1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCar({...editingCar, total: parseInt(e.target.value)})} className="sleek-input" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image URL</Label>
                  <Input type="text" value={editingCar?.image || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingCar({...editingCar, image: e.target.value})} placeholder="https://..." className="sleek-input" required />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-bold text-sm">Save Vehicle</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList className="bg-white border border-border p-1 h-11 rounded-lg">
          <TabsTrigger value="fleet" className="px-6 text-[13px] font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">Fleet</TabsTrigger>
          <TabsTrigger value="bookings" className="px-6 text-[13px] font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">Bookings</TabsTrigger>
          <TabsTrigger value="users" className="px-6 text-[13px] font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">Users</TabsTrigger>
          <TabsTrigger value="reports" className="px-6 text-[13px] font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet">
          <Card className="sleek-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-extrabold tracking-tight">Fleet Management</CardTitle>
              <CardDescription className="text-[13px] font-medium">View and manage your car inventory.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 px-6">Car</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Type</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Rate</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Inventory</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 text-right px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.map((car) => (
                    <TableRow key={car.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={car.image} alt={car.model} className="h-10 w-16 object-cover rounded-md border border-border" referrerPolicy="no-referrer" />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold">{car.make} {car.model}</span>
                            <span className="text-[11px] text-muted-foreground font-medium">{car.year}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] font-bold border-border">{car.type}</Badge></TableCell>
                      <TableCell className="text-[13px] font-bold">${car.rate}/day</TableCell>
                      <TableCell className="text-[13px] font-medium">{car.available} / {car.total}</TableCell>
                      <TableCell className="text-right px-6 space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setEditingCar(car); setIsCarDialogOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDeleteCar(car.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="sleek-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-extrabold tracking-tight">Recent Bookings</CardTitle>
              <CardDescription className="text-[13px] font-medium">Monitor all customer reservations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 px-6">ID</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Customer</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Vehicle</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Amount</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 px-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const car = cars.find(c => c.id === booking.carId);
                    const bookingUser = users.find(u => u.id === booking.userId);
                    return (
                      <TableRow key={booking.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="px-6 py-4 font-mono text-[10px] text-muted-foreground">{booking.id.slice(0, 8)}...</TableCell>
                        <TableCell className="text-[13px] font-bold">{bookingUser?.name || "Unknown"}</TableCell>
                        <TableCell className="text-[13px] font-medium">{car?.make} {car?.model}</TableCell>
                        <TableCell className="text-[13px] font-extrabold">${booking.totalPrice}</TableCell>
                        <TableCell className="px-6">
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-[10px] font-bold">
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="sleek-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-extrabold tracking-tight">User Management</CardTitle>
              <CardDescription className="text-[13px] font-medium">View all registered users and their roles.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 px-6">Name</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Email</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Role</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 px-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="px-6 py-4 text-[13px] font-bold">{u.name}</TableCell>
                      <TableCell className="text-[13px] font-medium text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] font-bold capitalize border-border">{u.role}</Badge></TableCell>
                      <TableCell className="px-6"><Badge className="bg-green-500 text-[10px] font-bold">Active</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="sleek-card">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-lg font-extrabold tracking-tight">Revenue Overview</CardTitle>
                <CardDescription className="text-[13px] font-medium">Monthly revenue performance.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      labelStyle={{ fontWeight: 700, fontSize: 12 }}
                    />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="sleek-card">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-lg font-extrabold tracking-tight">Fleet Distribution</CardTitle>
                <CardDescription className="text-[13px] font-medium">Breakdown of car types in inventory.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={carTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {carTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
