
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleBasedRedirect } from "./components/routing/RoleBasedRedirect";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import DSODashboard from "./pages/DSODashboard";
import DSOProfile from "./pages/DSOProfile";
import Compliance from "./pages/Compliance";
import Documents from "./pages/Documents";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetching data when window regains focus
      retry: 1, // Limit retry attempts
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <RoleBasedRedirect>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dso-dashboard" element={<DSODashboard />} />
                <Route path="dso-profile" element={<DSOProfile />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="documents" element={<Documents />} />
                <Route path="assistant" element={<Assistant />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoleBasedRedirect>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
