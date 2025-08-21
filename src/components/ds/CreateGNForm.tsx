import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mockWasamas } from '@/services/mockData';
import { CreateGnForm } from '@/types';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateGNFormProps {
  onClose: () => void;
}

const CreateGNForm: React.FC<CreateGNFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CreateGnForm>({
    email: '',
    name: '',
    wasamaId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateGnForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateGnForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.wasamaId) {
      newErrors.wasamaId = 'Please select a GN Division assignment';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would make an API call to create the GN account
      console.log('Creating GN account:', formData);
      
      toast.success(`GN account created successfully for ${formData.name}`);
      onClose();
    } catch (error) {
      toast.error('Failed to create GN account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateGnForm) => (
    value: string | React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = typeof value === 'string' ? value : value.target.value;
    setFormData(prev => ({ ...prev, [field]: newValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    toast.info('Password generated');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter GN's full name"
              value={formData.name}
              onChange={handleChange('name')}
              className={errors.name ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Official Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="gn@area.gov.lk"
              value={formData.email}
              onChange={handleChange('email')}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Wasama Assignment */}
          <div className="space-y-2">
            <Label>GN Division Assignment *</Label>
            <Select 
              value={formData.wasamaId} 
              onValueChange={handleChange('wasamaId')}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.wasamaId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select administrative area" />
              </SelectTrigger>
              <SelectContent>
                {mockWasamas.map((wasama) => (
                  <SelectItem key={wasama.id} value={wasama.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{wasama.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {wasama.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.wasamaId && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.wasamaId}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Initial Password *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                disabled={isLoading}
              >
                Generate
              </Button>
            </div>
            <Input
              id="password"
              type="text"
              placeholder="Enter initial password (min 8 characters)"
              value={formData.password}
              onChange={handleChange('password')}
              className={errors.password ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.password}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              The GN will be required to change this password on first login
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4">
            <Alert className="flex-1 mr-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Account credentials will be sent via secure email
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary-hover"
              >
                {isLoading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create GN Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateGNForm;