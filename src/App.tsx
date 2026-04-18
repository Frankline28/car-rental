import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import CarDetails from "./pages/CarDetails";
import { RootState } from "./store";

export default function App() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="cars/:id" element={<CarDetails />} />
          
          {/* Protected Customer Routes */}
          <Route 
            path="dashboard" 
            element={isAuthenticated && user?.role === "customer" ? <CustomerDashboard /> : <Navigate to="/login" />} 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="admin" 
            element={isAuthenticated && user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
        </Route>
      </Routes>
    </Router>
  );
}
