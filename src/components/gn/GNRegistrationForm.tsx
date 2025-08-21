import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CreateGnForm } from '@/types';

interface GNRegistrationFormProps {
  onSubmit: (data: CreateGnForm) => Promise<void>;
}

const GNRegistrationForm: React.FC<GNRegistrationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CreateGnForm>({
    email: '',
    name: '',
    wasamaId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
      toast.success('Registration submitted successfully! Awaiting DS approval.');
      // Clear form
      setFormData({
        email: '',
        name: '',
        wasamaId: '',
        password: ''
      });
    } catch (error) {
      toast.error('Failed to submit registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GN Registration</CardTitle>
        <CardDescription>
          Register as a Grama Niladhari. Your account will be activated after DS approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wasamaId">GN Division ID</Label>
            <Input
              id="wasamaId"
              value={formData.wasamaId}
              onChange={(e) => setFormData(prev => ({ ...prev, wasamaId: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Register as GN'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GNRegistrationForm;
