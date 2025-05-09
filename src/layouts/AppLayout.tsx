
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProfileProperty } from "@/utils/propertyMapping";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileCheck,
  FolderArchive,
  MessageCircle,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  GraduationCap
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

    if (currentUser && !getProfileProperty(currentUser, 'onboarding_complete')) {
      navigate("/onboarding");
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Define navigation items
  const navItems = [
    { to: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/app/compliance", label: "Compliance", icon: <FileCheck size={20} /> },
    { to: "/app/documents", label: "Documents", icon: <FolderArchive size={20} /> },
    { to: "/app/assistant", label: "Assistant", icon: <MessageCircle size={20} /> },
    { to: "/app/profile", label: "Profile", icon: <User size={20} /> },
    { to: "/app/settings", label: "Settings", icon: <Settings size={20} /> },
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
                  isActive ? "text-primary font-medium" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <span className="hidden xl:block">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
              onClick={logout}
            >
              <LogOut size={20} className="mr-2" />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-md">
          <nav className="container mx-auto py-4">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => cn(
                      "flex items-center space-x-3 px-4 py-2 rounded-md",
                      isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={closeMobileMenu}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 hover:bg-gray-100 px-4"
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Logout</span>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} neXed. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
