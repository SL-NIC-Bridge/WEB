import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppHeader from "@/components/layout/AppHeader";
import LoginPage from "@/pages/LoginPage";
import GNDashboard from "@/pages/GNDashboard";
import GNApplications from "@/pages/GNApplications";
import DSDashboard from "@/pages/DSDashboard";
import DSReview from "@/pages/DSReview";
import GNRegistrationPage from "@/pages/GNRegistrationPage";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import DSGNManagement from "./pages/DSGNManagement";
import DSProfile from "./pages/DSProfile";
import DSSettings from "./pages/DSSettings";
import GNProfile from "./pages/GNProfile";
import GNSettings from "./pages/GNSettings";
import DSCreateDivision from "./pages/DSCreateDivision";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/gn/register" element={<GNRegistrationPage />} />

                {/* Protected Routes with Layout */}
                <Route
                  path="/gn"
                  element={
                    <ProtectedRoute allowedRoles={["GN"]}>
                      <AppHeader />
                      <GNDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/gn/applications"
                  element={
                    <ProtectedRoute allowedRoles={["GN"]}>
                      <AppHeader />
                      <GNApplications />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ds"
                  element={
                    <ProtectedRoute allowedRoles={["DS"]}>
                      <AppHeader />
                      <DSDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gn/profile"
                  element={
                    <ProtectedRoute allowedRoles={["GN"]}>
                      <AppHeader />
                      <GNProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/gn/settings"
                  element={
                    <ProtectedRoute allowedRoles={["GN"]}>
                      <AppHeader />
                      <GNSettings />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ds/gn-management"
                  element={
                    <ProtectedRoute allowedRoles={["DS"]}>
                      <AppHeader />
                      <DSGNManagement />
                    </ProtectedRoute>
                  }
                />

                <Route path="/ds/create-division" element={
                  <ProtectedRoute allowedRoles={['DS']}>
                    <AppHeader />
                    <DSCreateDivision />
                  </ProtectedRoute>
                } />

                <Route
                  path="/ds/review/:applicationId"
                  element={
                    <ProtectedRoute allowedRoles={["DS"]}>
                      <AppHeader />
                      <DSReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ds/profile"
                  element={
                    <ProtectedRoute allowedRoles={["DS"]}>
                      <AppHeader />
                      <DSProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ds/settings"
                  element={
                    <ProtectedRoute allowedRoles={["DS"]}>
                      <AppHeader />
                      <DSSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Root redirect based on authentication */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
