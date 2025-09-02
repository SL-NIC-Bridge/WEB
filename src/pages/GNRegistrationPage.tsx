import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, UserPlus, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GNSignatureCanvas from '@/components/gn/SignatureCanvas';
import { type GnDivision, type CreateGnForm, UserRole } from '@/types';
import { divisionApiService, userApiService } from '@/services/apiServices';
import * as bcrypt from 'bcryptjs';

const GNRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);
  const [divisions, setDivisions] = useState<GnDivision[]>([]);
  const [divisionsError, setDivisionsError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    gnDivisionId: '',
    password: '',
    confirmPassword: ''
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load divisions on component mount
  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    try {
      setIsLoadingDivisions(true);
      setDivisionsError('');
      
      // Fetch all divisions with pagination - adjust limit as needed
      const response = await divisionApiService.getGnDivisions(1, 100);
      setDivisions(response.data);
    } catch (error) {
      console.error('Failed to load divisions:', error);
      setDivisionsError('Failed to load GN Divisions. Please refresh the page to try again.');
      toast.error('Failed to load GN Divisions');
    } finally {
      setIsLoadingDivisions(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Personal Information Validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number (e.g., 0771234567)';
    }
    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required';
    } else if (!/^(\d{9}[vVxX]|\d{12})$/.test(formData.nic)) {
      newErrors.nic = 'Please enter a valid NIC number (e.g., 123456789V or 123456789012)';
    }

    // Administrative Information Validation
    if (!formData.gnDivisionId) newErrors.gnDivisionId = 'GN Division is required';

    // Security Validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Signature Validation
    if (!signatureDataUrl) newErrors.signature = 'Digital signature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignature = async (dataUrl: string): Promise<void> => {
    setSignatureDataUrl(dataUrl);
    if (errors.signature) {
      setErrors(prev => ({ ...prev, signature: '' }));
    }
    toast.success('Signature captured successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
     
      // Prepare registration data according to CreateGnForm interface
      const registrationData: CreateGnForm = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        additionalData: {
        nic: formData.nic.trim()},
        phone: formData.phone.trim(),
        role: UserRole.GN,
        divisionId: formData.gnDivisionId, // Array as per your interface
        password: formData.password,
      };

      // TODO: Include signature data in the registration
      // You might need to upload the signature first or include it in the registration data
      // This depends on your backend API structure

      // Call the real API service
      const createdUser = await userApiService.createGN(registrationData);
      
      console.log('Registration successful:', createdUser);
      
      setIsSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your registration has been submitted for approval. You will be notified once it's reviewed by the District Secretary.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link 
              to="/login" 
              className="inline-flex items-center text-primary hover:text-primary-hover font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-primary mr-3" />
                <CardTitle className="text-2xl font-bold">GN Registration</CardTitle>
              </div>
              <CardDescription>
                Register as a Grama Niladhari to access the E-Certification Portal
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        disabled={isSubmitting}
                      />
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        disabled={isSubmitting}
                      />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nic">NIC Number *</Label>
                    <Input
                      id="nic"
                      value={formData.nic}
                      onChange={(e) => handleInputChange('nic', e.target.value.toUpperCase())}
                      placeholder="Enter your NIC number (e.g., 123456789V or 123456789012)"
                      disabled={isSubmitting}
                    />
                    {errors.nic && <p className="text-sm text-red-500">{errors.nic}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@gov.lk"
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0771234567"
                        disabled={isSubmitting}
                      />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Administrative Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Administrative Assignment</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gnDivision">GN Division *</Label>
                    
                    {isLoadingDivisions ? (
                      <div className="flex items-center justify-center p-4 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-600">Loading GN Divisions...</span>
                      </div>
                    ) : divisionsError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <span>{divisionsError}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={loadDivisions}
                            disabled={isLoadingDivisions}
                          >
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Select 
                        onValueChange={(value) => handleInputChange('gnDivisionId', value)} 
                        disabled={isSubmitting || divisions.length === 0}
                        value={formData.gnDivisionId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your assigned GN Division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((division) => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.name} ({division.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {errors.gnDivisionId && <p className="text-sm text-red-500">{errors.gnDivisionId}</p>}
                  </div>
                </div>

                <Separator />

                {/* Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a strong password"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                      {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        disabled={isSubmitting}
                      />
                      {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Signature */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Digital Signature *</h3>
                  <p className="text-sm text-gray-600">
                    Your signature will be used for document verification. Please ensure it matches your official signature.
                  </p>
                  
                  <GNSignatureCanvas onSign={handleSignature} />
                  {errors.signature && <p className="text-sm text-red-500">{errors.signature}</p>}
                </div>

                {Object.keys(errors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please fix the errors above before submitting.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={isSubmitting || isLoadingDivisions || !!divisionsError}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Submitting Registration...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GNRegistration;