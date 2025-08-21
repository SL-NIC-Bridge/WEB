import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, MapPin, Calendar, FileText } from 'lucide-react';

const GNProfile: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  if (!user) return null;

  // Get registration data from localStorage for additional profile info
  const registrationData = localStorage.getItem('gnRegistrations');
  const registrations = registrationData ? JSON.parse(registrationData) : [];
  const currentUserRegistration = registrations.find((reg: any) => reg.email === user.email);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            {user.name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">Grama Niladhari</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              {currentUserRegistration && (
                <>
                  <Separator />
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">NIC Number</p>
                      <p className="text-sm text-muted-foreground">{currentUserRegistration.nic}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{currentUserRegistration.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Registration Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentUserRegistration.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Role & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Status</CardTitle>
              <CardDescription>Current role and account status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Role</p>
                <Badge variant="secondary">Grama Niladhari</Badge>
              </div>
              
              {user.wasamaName && (
                <div>
                  <p className="text-sm font-medium mb-2">Wasama</p>
                  <Badge variant="outline">{user.wasamaName}</Badge>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium mb-2">Account Status</p>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signature */}
        {currentUserRegistration?.signature && (
          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
              <CardDescription>Your registered signature for document verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <img 
                  src={currentUserRegistration.signature} 
                  alt="Digital Signature" 
                  className="max-h-32 mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GNProfile;