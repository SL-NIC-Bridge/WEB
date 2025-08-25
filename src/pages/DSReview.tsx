import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { mockApplications, generateMockApplications } from '@/services/mockData';
import { Application } from '@/types';
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  XCircle,
  Clock,
  PenTool
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DSReview: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [holdReason, setHoldReason] = useState('');

  // Mock GN signature (in real app, this would come from the GN registration data)
  const mockGnSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // placeholder

  // Find the application
  const application = useMemo(() => {
    const allApplications = [...mockApplications, ...generateMockApplications(25)];
    return allApplications.find(app => app.id === applicationId);
  }, [applicationId]);

  const handleSendToDRP = async () => {
    if (!application) return;
    
    setIsProcessing(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success('Application successfully sent to DRP for final processing');
      navigate('/ds');
    } catch (error) {
      toast.error('Failed to send application to DRP');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Application has been rejected: ${rejectReason}`);
      setShowRejectDialog(false);
      navigate('/ds');
    } catch (error) {
      toast.error('Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHold = async () => {
    if (!application || !holdReason.trim()) {
      toast.error('Please provide a reason for holding');
      return;
    }
    
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Application has been put on hold: ${holdReason}`);
      setShowHoldDialog(false);
      navigate('/ds');
    } catch (error) {
      toast.error('Failed to hold application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/ds');
  };

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertDescription className="text-center">
              Application not found or you don't have permission to view it.
            </AlertDescription>
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (application.status !== 'confirmed_by_gn') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Alert>
              <AlertDescription className="text-center">
                This application is not ready for DS review. Current status: {application.status}
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Application Review</h1>
            <p className="text-muted-foreground">
              DS Review for Application #{application.id.split('-').pop()?.toUpperCase()}
            </p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Application Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Applicant Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{application.applicantName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Application Type</Label>
                  <Badge variant={application.applicationType === 'new_nic' ? 'default' : 'secondary'}>
                    {application.applicationType === 'new_nic' ? 'New NIC Application' : 'Verification'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{application.applicantPhone}</span>
                  </p>
                </div>
                {application.applicantNic && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">NIC Number</Label>
                    <p className="font-mono">{application.applicantNic}</p>
                  </div>
                )}
              </div>
              
              {application.applicationType === 'new_nic' && (
                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> This is a new NIC application. The applicant does not have an existing NIC number.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Area and Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Administrative Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Administrative Area</Label>
                  <p className="font-medium">{application.gnDivisionName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assigned Grama Niladhari</Label>
                  <p className="font-medium">{application.assignedGnName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Application Submitted</Label>
                  <p className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(application.submittedAt), 'MMM d, yyyy h:mm a')}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">GN Confirmed</Label>
                  <p className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{format(new Date(application.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Submitted Documents</span>
              </CardTitle>
              <CardDescription>
                Documents submitted by the applicant and verified by the GN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Birth Certificate</span>
                    </div>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Original birth certificate document
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Photo ID</span>
                    </div>
                    <Badge variant="outline">JPG</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Applicant's photograph for verification
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          {/* GN Signature Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PenTool className="h-5 w-5" />
                <span>GN Signature Verification</span>
              </CardTitle>
              <CardDescription>
                Compare the GN's signature on the application with their registered signature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Registered GN Signature
                  </Label>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[120px] flex items-center justify-center">
                    <div className="text-center">
                      <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">GN Registered Signature</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {application.assignedGnName}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Application Signature
                  </Label>
                  <div className="border rounded-lg p-4 bg-white min-h-[120px] flex items-center justify-center">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700">Signature Applied</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(application.updatedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Signature Status:</strong> The signatures match and the GN verification is authentic.
                  You can proceed with sending this application to DRP.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* GN Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>GN Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Verified and Confirmed</p>
                  <p className="text-sm text-muted-foreground">
                    By {application.assignedGnName}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Verification Date</Label>
                <p className="text-sm">{format(new Date(application.updatedAt), 'PPP p')}</p>
              </div>
              {application.signedPdfUrl && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Digital Signature</Label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Document Signed</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Signed Document
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>DS Actions</CardTitle>
              <CardDescription>
                Review the application and send to DRP for final processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  This application has been verified by the GN and is ready for DS approval.
                  Once approved, it will be sent to the District Registrar of Properties (DRP) for final processing.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover"
                  onClick={handleSendToDRP}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send to DRP
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                    disabled={isProcessing}
                    onClick={() => setShowHoldDialog(true)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Hold
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                    disabled={isProcessing}
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">GN Confirmed</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(application.updatedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Under GN Review</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(application.submittedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Application Submitted</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(application.submittedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. The applicant and GN will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="rejectReason" className="text-sm font-medium">Reason for Rejection *</label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex space-x-3 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectReason.trim()}>
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hold Dialog */}
      <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for putting this application on hold. The applicant and GN will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="holdReason" className="text-sm font-medium">Reason for Hold *</label>
              <Textarea
                id="holdReason"
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Explain why this application is being put on hold..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex space-x-3 justify-end">
              <Button variant="outline" onClick={() => setShowHoldDialog(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleHold} disabled={isProcessing || !holdReason.trim()}>
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Hold Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DSReview;