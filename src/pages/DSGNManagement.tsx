import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Users, CheckCircle, XCircle, Clock, Eye, UserCheck, UserX, Search, Loader2, Edit, AlertCircle } from 'lucide-react';
import { userApiService } from '@/services/apiServices';
import { User } from '@/types';


interface PendingRegistration extends User {
  division?: {
    id: string;
    name: string;
    code: string;
  };
}

interface GNUser extends User {
  division?: {
    id: string;
    name: string;
    code: string;
  };
}

const DSGNManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<(PendingRegistration | GNUser)[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<(PendingRegistration | GNUser)[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | GNUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'DEACTIVATED'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both pending registrations and all GNs
      const allGNs: GNUser[] = await userApiService.getAllGNs();

      setRegistrations(allGNs);
      
    } catch (error) {
      console.error('Failed to load registrations:', error);
      setError('Failed to load GN registrations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg =>
        `${reg.firstName} ${reg.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reg.additionalData?.nic as string)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.currentStatus === statusFilter);
    }

    setFilteredRegistrations(filtered);
  };

  const handleViewDetails = (registration: PendingRegistration | GNUser) => {
    setSelectedRegistration(registration);
    setIsViewDialogOpen(true);
  };

  const handleStartReview = (registration: PendingRegistration | GNUser) => {
    setSelectedRegistration(registration);
    setReviewComment('');
    setIsReviewDialogOpen(true);
  };

const handleApproveReject = async (approve: boolean) => {
  if (!selectedRegistration) return;

  setIsProcessing(true);

  try {
    const newStatus = approve ? 'ACTIVE' : 'REJECTED';
    
    // Use the new updateGNStatus method
    const result = await userApiService.updateGNStatus(selectedRegistration.id, {
      status: newStatus,
      comment: reviewComment || undefined
    });

    // Reload the data to get the latest status
    await loadRegistrations();

    // Show success message
    const message = approve 
      ? `${selectedRegistration.firstName} ${selectedRegistration.lastName} has been approved as a GN` 
      : `${selectedRegistration.firstName} ${selectedRegistration.lastName}'s registration has been rejected`;
    
    console.log(message); // Replace with actual toast
    console.log(result.message); // API response message

    setIsReviewDialogOpen(false);
    setSelectedRegistration(null);
    setReviewComment('');
  } catch (error) {
    console.error('Failed to process review:', error);
    setError('Failed to process the review. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};

// OPTIONAL: Add a separate method for other status updates (deactivate, reactivate)
const handleStatusUpdate = async (status: string, comment?: string) => {
  if (!selectedRegistration) return;

  setIsProcessing(true);

  try {
    const result = await userApiService.updateGNStatus(selectedRegistration.id, {
      status,
      comment: reviewComment || undefined,
    });

    // Reload the data to get the latest status
    await loadRegistrations();

    // Show success message
    console.log(`Status updated: ${result.message}`);

    setIsReviewDialogOpen(false);
    setSelectedRegistration(null);
    setReviewComment('');
  } catch (error) {
    console.error('Failed to update status:', error);
    setError('Failed to update the status. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'DEACTIVATED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return <Clock className="h-4 w-4" />;
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'DEACTIVATED': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'Pending Approval';
      case 'ACTIVE': return 'Active';
      case 'REJECTED': return 'Rejected';
      case 'DEACTIVATED': return 'Deactivated';
      default: return status;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadRegistrations}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCount = registrations.filter(r => r.currentStatus === 'PENDING_APPROVAL').length;
  const activeCount = registrations.filter(r => r.currentStatus === 'ACTIVE').length;
  const rejectedCount = registrations.filter(r => r.currentStatus === 'REJECTED').length;
  const deactivatedCount = registrations.filter(r => r.currentStatus === 'DEACTIVATED').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-700">GN Management</h1>
              <p className="text-gray-600">Review and approve Grama Niladhari registrations</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{registrations.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Deactivated</p>
                    <p className="text-2xl font-bold text-gray-600">{deactivatedCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'DEACTIVATED'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Registration List */}
        <div className="space-y-4">
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No registrations found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No GN registrations have been submitted yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {registration.firstName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {registration.firstName} {registration.lastName}
                        </h3>
                        <p className="text-gray-600">{registration.email}</p>
                        <p className="text-sm text-gray-500">
                          {('division' in registration && registration.division?.name) || 'Unknown Division'} • 
                          NIC: {(registration.additionalData?.nic as string) || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(registration.createdAt).toLocaleDateString()} • 
                          Updated: {new Date(registration.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(registration.currentStatus)} flex items-center space-x-1 border`}>
                        {getStatusIcon(registration.currentStatus)}
                        <span>{getStatusLabel(registration.currentStatus)}</span>
                      </Badge>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(registration)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        <Button
                          variant={registration.currentStatus === 'PENDING_APPROVAL' ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => handleStartReview(registration)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {registration.currentStatus === 'PENDING_APPROVAL' ? 'Review' : 'Update Status'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>GN Registration Details</DialogTitle>
              <DialogDescription>
                Complete registration information for {selectedRegistration?.firstName} {selectedRegistration?.lastName}
              </DialogDescription>
            </DialogHeader>

            {selectedRegistration && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-sm font-medium">
                      {selectedRegistration.firstName} {selectedRegistration.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">NIC Number</Label>
                    <p className="text-sm font-medium">
                      {(selectedRegistration.additionalData?.nic as string) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm font-medium">{selectedRegistration.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-sm font-medium">{selectedRegistration.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Assigned Division</Label>
                    <p className="text-sm font-medium">
                      {('division' in selectedRegistration && selectedRegistration.division?.name) || 'Unknown Division'}
                      {('division' in selectedRegistration && selectedRegistration.division?.code) && ` (${selectedRegistration.division.code})`}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mr-4">Status</Label>
                    <Badge className={`${getStatusColor(selectedRegistration.currentStatus)} mt-1 border`}>
                      {getStatusIcon(selectedRegistration.currentStatus)}
                      <span className="ml-1">{getStatusLabel(selectedRegistration.currentStatus)}</span>
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Submitted</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedRegistration.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedRegistration.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleStartReview(selectedRegistration);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {selectedRegistration.currentStatus === 'PENDING_APPROVAL' ? 'Review' : 'Update Status'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review / Update Status Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Update GN Status</DialogTitle>
      <DialogDescription>
        Update status for {selectedRegistration?.firstName} {selectedRegistration?.lastName}'s registration
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {selectedRegistration && (
        <div className={`p-3 rounded border ${getStatusColor(selectedRegistration.currentStatus)} border`}>
          <Label className="text-sm font-medium">Current Status:</Label>
          <div className="flex items-center space-x-2 mt-1">
            {getStatusIcon(selectedRegistration.currentStatus)}
            <span className="text-sm font-medium">{getStatusLabel(selectedRegistration.currentStatus)}</span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="reviewComment">
          Comment (Optional)
        </Label>
        <Textarea
          id="reviewComment"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Add any comments about this status change..."
          className="mt-1"
          rows={3}
        />
      </div>

      {/* Status Action Buttons */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Select Action:</Label>
        
        <div className="grid grid-cols-1 gap-2">
          {selectedRegistration?.currentStatus !== 'ACTIVE' && (
            <Button
              onClick={() => handleStatusUpdate('ACTIVE')}
              disabled={isProcessing}
              className="justify-start h-auto py-3"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Approve / Activate</div>
                  <div className="text-xs text-gray-500">Grant GN access and activate account</div>
                </div>
              </div>
            </Button>
          )}

          {selectedRegistration?.currentStatus !== 'REJECTED' && (
            <Button
              onClick={() => handleStatusUpdate('REJECTED')}
              disabled={isProcessing}
              className="justify-start h-auto py-3"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">Reject</div>
                  <div className="text-xs text-gray-500">Deny GN registration request</div>
                </div>
              </div>
            </Button>
          )}

          {selectedRegistration?.currentStatus !== 'DEACTIVATED' && selectedRegistration?.currentStatus === 'ACTIVE' && (
            <Button
              onClick={() => handleStatusUpdate('DEACTIVATED')}
              disabled={isProcessing}
              className="justify-start h-auto py-3"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">Deactivate</div>
                  <div className="text-xs text-gray-500">Temporarily disable GN access</div>
                </div>
              </div>
            </Button>
          )}

          {(selectedRegistration?.currentStatus === 'REJECTED' || selectedRegistration?.currentStatus === 'DEACTIVATED') && (
            <Button
              onClick={() => handleStatusUpdate('PENDING_APPROVAL')}
              disabled={isProcessing}
              className="justify-start h-auto py-3"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div className="text-left">
                  <div className="font-medium">Set to Pending</div>
                  <div className="text-xs text-gray-500">Move back to pending approval status</div>
                </div>
              </div>
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setIsReviewDialogOpen(false)}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing status update...</span>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
      </div>
    </div>
  );
};

export default DSGNManagement;