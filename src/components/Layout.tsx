import { Link, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { Button } from "@/components/ui/button";
import { Car, LogOut, LayoutDashboard } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RootState, AppDispatch } from "../store";

export default function Layout() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white border-b border-border sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-primary">
            <Car className="h-7 w-7" />
            <span className="text-2xl font-extrabold tracking-tighter">DriveSync</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[13px] font-semibold text-muted-foreground hover:text-primary transition-colors">
              Cars
            </Link>
            <Link to="#" className="text-[13px] font-semibold text-muted-foreground hover:text-primary transition-colors">
              Packages
            </Link>
            <Link to="#" className="text-[13px] font-semibold text-muted-foreground hover:text-primary transition-colors">
              How it Works
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} className="cursor-pointer text-sm">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer text-sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" asChild className="h-9 px-4 text-[13px] font-bold border-border">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="h-9 px-4 text-[13px] font-bold bg-primary hover:bg-primary/90">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[13px] text-muted-foreground font-medium">
            © {new Date().getFullYear()} DriveSync Car Rental. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
