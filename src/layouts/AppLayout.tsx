
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileCheck,
  FolderArchive,
  MessageCircle,
  User,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (currentUser && !currentUser.onboardingComplete) {
      navigate("/onboarding");
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { to: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/app/compliance", label: "Compliance", icon: <FileCheck size={20} /> },
    { to: "/app/documents", label: "Documents", icon: <FolderArchive size={20} /> },
    { to: "/app/assistant", label: "Assistant", icon: <MessageCircle size={20} /> },
    { to: "/app/profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <NavLink to="/app/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md nexed-gradient" />
              <span className="text-xl font-bold text-nexed-900">neXed</span>
            </NavLink>
          </div>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          <nav className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center space-x-1 text-sm py-2",
                  isActive 
                    ? "text-nexed-700 font-medium border-b-2 border-nexed-500" 
                    : "text-gray-600 hover:text-nexed-600"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={18} className="mr-2" />
              <span>Log out</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 p-3 rounded-md",
                  isActive 
                    ? "bg-nexed-50 text-nexed-700 font-medium" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {item.icon}
                <span className="text-lg">{item.label}</span>
              </NavLink>
            ))}
            <Button variant="ghost" className="justify-start" onClick={logout}>
              <LogOut size={20} className="mr-3" />
              <span className="text-lg">Log out</span>
            </Button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
