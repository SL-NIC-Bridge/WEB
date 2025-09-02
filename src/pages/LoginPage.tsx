import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Eye, EyeOff, Shield, FileText, Users } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import heroImage from '@/assets/hero-government.jpg';
import certificationBadge from '@/assets/certification-badge.jpg';

const LoginPage: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (state.isAuthenticated && state.user) {
    const redirectPath = state.user.role === 'DS' ? '/ds' : '/gn';
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login({ email, password });
      if (!success) {
        // Error handling is done in the auth context
      }
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = () => {
    if (state.error) {
      clearError();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gov-blue text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <img 
                src={certificationBadge} 
                alt="Government Certification Badge" 
                className="h-16 w-16 rounded-full bg-white p-2"
              />
              <div>
                <h1 className="text-4xl font-bold mb-2">E-Certification Portal</h1>
                <p className="text-lg text-blue-100">
                  Government Document Verification System
                </p>
              </div>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Secure, efficient, and transparent document processing for citizens and government officials
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="flex items-center space-x-3 text-blue-100">
                <Shield className="h-6 w-6 text-blue-300" />
                <span>Secure Digital Signatures</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <FileText className="h-6 w-6 text-blue-300" />
                <span>Document Verification</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <Users className="h-6 w-6 text-blue-300" />
                <span>Multi-level Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="text-center space-y-1 pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {state.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@gov.lk"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      handleInputChange();
                    }}
                    required
                    className="h-11"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        handleInputChange();
                      }}
                      required
                      className="h-11 pr-10"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary-hover"
                  disabled={isSubmitting || state.isLoading}
                >
                  {isSubmitting || state.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* GN Registration Link */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Are you Grama Niladhari? 
                </p>
                <Link 
                  to="/gn/register" 
                  className="text-primary hover:text-primary-hover font-medium text-sm underline"
                >
                  Sign Up if you are not previously signed up
                </Link>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3 text-center">Demo Credentials:</p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-medium text-gray-700">DS Account</div>
                    <div className="text-gray-600">ds@slnicbridge.lk / DSadmin@123</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-medium text-gray-700">GN Account</div>
                    <div className="text-gray-600">gn@slnicbridge.lk / GNadmin@123</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;