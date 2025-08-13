import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppHeader from '@/components/layout/AppHeader';
import LoginPage from '@/pages/LoginPage';
import GNDashboard from '@/pages/GNDashboard';
import GNApplications from '@/pages/GNApplications';
import DSDashboard from '@/pages/DSDashboard';
import DSReview from '@/pages/DSReview';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

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
                
                {/* Protected Routes with Layout */}
                <Route path="/gn" element={
                  <ProtectedRoute allowedRoles={['GN']}>
                    <AppHeader />
                    <GNDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/gn/applications" element={
                  <ProtectedRoute allowedRoles={['GN']}>
                    <AppHeader />
                    <GNApplications />
                  </ProtectedRoute>
                } />
                
                <Route path="/ds" element={
                  <ProtectedRoute allowedRoles={['DS']}>
                    <AppHeader />
                    <DSDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/ds/review/:applicationId" element={
                  <ProtectedRoute allowedRoles={['DS']}>
                    <AppHeader />
                    <DSReview />
                  </ProtectedRoute>
                } />
                
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