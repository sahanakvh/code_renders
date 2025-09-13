import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import PatientPage from "./pages/PatientPage";
import TherapistPage from "./pages/TherapistPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user?.role === 'therapist' ? 
            <Navigate to="/doctors" replace /> : 
            <Navigate to="/patient" replace />
        } 
      />
      <Route 
        path="/patient" 
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/doctors" 
        element={
          <ProtectedRoute requiredRole="therapist">
            <TherapistPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/landing" element={<Index />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
