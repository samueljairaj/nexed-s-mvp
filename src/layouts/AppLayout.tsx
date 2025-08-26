
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
  LogOut,
  Settings,
  GraduationCap,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureFlag } from "@/components/common/FeatureFlag";

export const AppLayout = () => {
  const { currentUser, logout, isAuthenticated, isDSO, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Define navigation items based on user role
  const getNavItems = () => {
    // Items common to all users
    const commonItems = [
      { to: "/app/profile", label: "Profile", icon: <User size={20} /> },
    ];

    // Add settings only if basic settings are enabled
    // Keep basic settings for now
    commonItems.push({ to: "/app/settings", label: "Settings", icon: <Settings size={20} /> });

    // DSO-specific items (disabled for MVP)
    if (isDSO) {
      return [
        { to: "/app/dso-dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { to: "/app/dso-profile", label: "DSO Profile", icon: <Building2 size={20} /> },
        { to: "/app/documents", label: "Documents", icon: <FolderArchive size={20} /> },
        ...commonItems
      ];
    }

    // Student-specific items with feature flags
    const studentItems = [
      { to: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
      { to: "/app/documents", label: "Documents", icon: <FolderArchive size={20} /> },
    ];

    // Add compliance only if feature is enabled
    // Temporarily commented out for MVP
    // if (isFeatureEnabled('COMPLIANCE_HUB')) {
    //   studentItems.push({ to: "/app/compliance", label: "Compliance", icon: <FileCheck size={20} /> });
    // }

    // Add assistant only if feature is enabled  
    // Temporarily commented out for MVP
    // if (isFeatureEnabled('AI_ASSISTANT')) {
    //   studentItems.push({ to: "/app/assistant", label: "Assistant", icon: <MessageCircle size={20} /> });
    // }

    return [...studentItems, ...commonItems];
  };

  const navItems = getNavItems();

  // Handle logout with navigation
  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <NavLink to={isDSO ? "/app/dso-dashboard" : "/app/dashboard"} className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md nexed-gradient" />
              <span className="text-xl font-bold text-nexed-900 font-display">neXed</span>
              {isDSO && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                  DSO Portal
                </span>
              )}
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
                  "flex items-center space-x-1 text-sm py-2 transition-all duration-200",
                  isActive 
                    ? "text-nexed-700 font-medium border-b-2 border-nexed-500" 
                    : "text-gray-600 hover:text-nexed-600"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
              <LogOut size={18} className="mr-2" />
              <span>Log out</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16 animate-fade-in">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 p-3 rounded-md transition-all duration-200",
                  isActive 
                    ? "bg-nexed-50 text-nexed-700 font-medium" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {item.icon}
                <span className="text-lg">{item.label}</span>
              </NavLink>
            ))}
            <Button variant="ghost" className="justify-start" onClick={handleLogout}>
              <LogOut size={20} className="mr-3" />
              <span className="text-lg">Log out</span>
            </Button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};
