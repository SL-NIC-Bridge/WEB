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
import { Users, CheckCircle, XCircle, Clock, Eye, UserCheck, UserX, Search } from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/layout/AppHeader';
import { mockGNRegistrations } from '@/services/mockData';


if (!localStorage.getItem('gnRegistrations')) {
  localStorage.setItem('gnRegistrations', JSON.stringify(mockGNRegistrations));
}

interface GNRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  wasamaId: string;
  wasamaName?: string;
  signature: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewComment?: string;
}

const DSGNManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<GNRegistration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<GNRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<GNRegistration | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const loadRegistrations = () => {
    const stored = localStorage.getItem('gnRegistrations');
    if (stored) {
      const data = JSON.parse(stored);
      // Add wasama names
      const enhanced = data.map((reg: any) => ({
        ...reg,
        wasamaName: getWasamaName(reg.wasamaId)
      }));
      setRegistrations(enhanced);
    }
  };

  const getWasamaName = (wasamaId: string) => {
    const wasamas = [
      { id: 'wasama1', name: 'Colombo Central GN Division' },
      { id: 'wasama2', name: 'Kandy Municipal GN Division' },
      { id: 'wasama3', name: 'Galle Urban GN Division' }
    ];
    return wasamas.find(w => w.id === wasamaId)?.name || 'Unknown GN Division';
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.nic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }

    setFilteredRegistrations(filtered);
  };

  const handleViewDetails = (registration: GNRegistration) => {
    setSelectedRegistration(registration);
    setIsViewDialogOpen(true);
  };

  const handleStartReview = (registration: GNRegistration) => {
    setSelectedRegistration(registration);
    setReviewComment('');
    setIsReviewDialogOpen(true);
  };

  const handleApproveReject = async (approve: boolean) => {
    if (!selectedRegistration) return;

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedRegistrations = registrations.map(reg => {
        if (reg.id === selectedRegistration.id) {
          return {
            ...reg,
            status: approve ? 'approved' as const : 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewComment: reviewComment || undefined
          };
        }
        return reg;
      });

      setRegistrations(updatedRegistrations);
      localStorage.setItem('gnRegistrations', JSON.stringify(updatedRegistrations));

      toast.success(
        approve 
          ? `${selectedRegistration.name} has been approved as a GN` 
          : `${selectedRegistration.name}'s registration has been rejected`
      );

      setIsReviewDialogOpen(false);
      setSelectedRegistration(null);
      setReviewComment('');
    } catch (error) {
      toast.error('Failed to process the review. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingCount = registrations.filter(r => r.status === 'pending_approval').length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-background">
      
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-white-700">GN Management</h1>
              <p className="text-gray-600">Review and approve Grama Niladhari registrations</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
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
            <div className="flex gap-2">
              {(['all', 'pending_approval', 'approved', 'rejected'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                          {registration.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{registration.name}</h3>
                        <p className="text-gray-600">{registration.email}</p>
                        <p className="text-sm text-gray-500">
                          {registration.wasamaName} • NIC: {registration.nic}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(registration.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(registration.status)} flex items-center space-x-1`}>
                        {getStatusIcon(registration.status)}
                        <span className="capitalize">{registration.status.replace('_', ' ')}</span>
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

                        {registration.status === 'pending_approval' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStartReview(registration)}
                          >
                            Review
                          </Button>
                        )}
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
                Complete registration information for {selectedRegistration?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedRegistration && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-sm font-medium">{selectedRegistration.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">NIC Number</Label>
                    <p className="text-sm font-medium">{selectedRegistration.nic}</p>
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
                    <Label className="text-sm font-medium text-gray-500">Assigned GN Division</Label>
                    <p className="text-sm font-medium">{selectedRegistration.wasamaName}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-2 block">Digital Signature</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img 
                      src={selectedRegistration.signature} 
                      alt="GN Signature" 
                      className="max-w-full h-32 object-contain border bg-white rounded"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge className={`${getStatusColor(selectedRegistration.status)} mt-1`}>
                      {selectedRegistration.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Submitted</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedRegistration.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedRegistration.reviewComment && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Review Comment</Label>
                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded border">
                      {selectedRegistration.reviewComment}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review GN Registration</DialogTitle>
              <DialogDescription>
                Review and approve or reject {selectedRegistration?.name}'s registration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reviewComment">Review Comment (Optional)</Label>
                <Textarea
                  id="reviewComment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add any comments about this registration..."
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproveReject(false)}
                  disabled={isProcessing}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => handleApproveReject(true)}
                  disabled={isProcessing}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DSGNManagement;