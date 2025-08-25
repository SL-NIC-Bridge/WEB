import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, UserPlus, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GNSignatureCanvas from '@/components/gn/SignatureCanvas';
import * as mockDataService from '@/services/mockData';

const GNRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nic: '',
    gnDivisionId: '',
    password: '',
    confirmPassword: ''
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.nic.trim()) newErrors.nic = 'NIC is required';
    if (!formData.gnDivisionId) newErrors.gnDivisionId = 'GN Division is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!signatureDataUrl) newErrors.signature = 'Signature is required';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store registration data (in real app, this would be sent to backend)
      const registrationData = {
        ...formData,
        signature: signatureDataUrl,
        status: 'pending_approval',
        submittedAt: new Date().toISOString()
      };
      
      // Store in localStorage for demo purposes
      const existingRegistrations = JSON.parse(localStorage.getItem('gnRegistrations') || '[]');
      existingRegistrations.push({ ...registrationData, id: Date.now().toString() });
      localStorage.setItem('gnRegistrations', JSON.stringify(existingRegistrations));

      setIsSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
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
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nic">NIC Number *</Label>
                      <Input
                        id="nic"
                        value={formData.nic}
                        onChange={(e) => handleInputChange('nic', e.target.value)}
                        placeholder="Enter your NIC number"
                        disabled={isSubmitting}
                      />
                      {errors.nic && <p className="text-sm text-red-500">{errors.nic}</p>}
                    </div>
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
                        placeholder="07XXXXXXXX"
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
                    <Select onValueChange={(value) => handleInputChange('gnDivisionId', value)} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your assigned GN Division" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDataService.mockGnDivisions.map((gnDivision) => (
                          <SelectItem key={gnDivision.id} value={gnDivision.id}>
                            {gnDivision.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="Create a password"
                        disabled={isSubmitting}
                      />
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
                    <AlertDescription>
                      Please fix the errors above before submitting.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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