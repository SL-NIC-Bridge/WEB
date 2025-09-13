import React, { useState, useEffect, useCallback } from 'react';
import { Application, ApplicationStatus, ApplicationType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SignatureCanvas from './SignatureCanvas';
import { applicationApiService, documentApiService, auditLogApiService } from '@/services/apiServices';
import { 
  ArrowLeft, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Signature,
  Clock,
  User,
  RefreshCw,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

interface ApplicationViewerProps {
  application: Application;
  onBack: () => void;
  onUpdate: (updatedApplication: Application) => void;
}

const ApplicationViewer: React.FC<ApplicationViewerProps> = ({
  application,
  onBack,
  onUpdate
}) => {
  const [statusComment, setStatusComment] = useState('');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(application);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentStep, setShowCommentStep] = useState(false);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [pendingSignatureData, setPendingSignatureData] = useState<{
    dataUrl: string;
    file?: File;
  } | null>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if application is already signed
  const isApplicationSigned = !!(currentApplication as any).signedPdfUrl || !!(currentApplication as any).signed || signatureCompleted;

  const refreshApplicationData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const freshApp = await applicationApiService.getApplicationById(currentApplication.id);
      const updatedApp = (freshApp as any).data || freshApp;
      
      setCurrentApplication(updatedApp);
      onUpdate(updatedApp);
      
      const [docs, logs] = await Promise.all([
        documentApiService.getDocumentsForApplication(currentApplication.id),
        auditLogApiService.getAuditLogsForApplication(currentApplication.id)
      ]);
      
      setDocuments(docs || []);
      setAuditLogs(logs || []);
      
    } catch (error) {
      console.error('Failed to refresh application data:', error);
      toast.error('Failed to refresh application data');
    } finally {
      setIsRefreshing(false);
    }
  }, [currentApplication.id, onUpdate]);

  useEffect(() => {
    setCurrentApplication(application);
    // Check if already signed
    if ((application as any).signedPdfUrl || (application as any).signed) {
      setSignatureCompleted(true);
    }
  }, [application]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoadingDocs(true);
      try {
        const [docs, logs] = await Promise.all([
          documentApiService.getDocumentsForApplication(currentApplication.id),
          auditLogApiService.getAuditLogsForApplication(currentApplication.id)
        ]);
        
        if (!mounted) return;
        
        setDocuments(docs || []);
        setAuditLogs(logs || []);
      } catch (err) {
        console.error('Failed to load documents/audit logs', err);
        if (mounted) {
          setDocuments((currentApplication as any).attachments || []);
          setAuditLogs([]);
        }
      } finally {
        if (mounted) setIsLoadingDocs(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentApplication.id]);

  // Handle signature from canvas - just store it and show comment step
  const handleSignatureCapture = async(signatureDataUrl: string, signatureFile?: File) => {
    console.log('Signature captured, showing comment step...');
    setPendingSignatureData({ dataUrl: signatureDataUrl, file: signatureFile });
    setShowCommentStep(true);
    setIsSignatureModalOpen(false);
    toast.success("Signature captured! Now add your comment and submit.");
  };

  // Handle the complete submission (sign + comment + status)
  const handleCompleteSubmission = async (newStatus: ApplicationStatus) => {
    if (!statusComment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    if (newStatus === ApplicationStatus.APPROVED_BY_GN && !pendingSignatureData && !isApplicationSigned) {
      toast.error('Signature is required for approval');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let updatedApp = currentApplication;
      
      // Step 1: Sign the document if we have pending signature data
      if (pendingSignatureData) {
        console.log('Submitting signature...');
        const formData = new FormData();
        formData.append("applicationId", currentApplication.id.toString());

        if (pendingSignatureData.file) {
          formData.append("signature", pendingSignatureData.file);
        } else {
          const res = await fetch(pendingSignatureData.dataUrl);
          const blob = await res.blob();
          const file = new File([blob], "signature.png", { type: blob.type || "image/png" });
          formData.append("signature", file);
        }

        const signResponse = await applicationApiService.signApplication(currentApplication.id, formData);
        updatedApp = (signResponse as any).data || signResponse;
        
        console.log('Signature submitted successfully');
        setSignatureCompleted(true);
        setPendingSignatureData(null);
      }

      // Step 2: Update the status with comment
      console.log('Updating status to:', newStatus);
      const statusPayload = { status: newStatus, comment: statusComment };
      const statusResponse = await applicationApiService.updateApplicationStatus(currentApplication.id, statusPayload as any);
      updatedApp = (statusResponse as any).data || statusResponse;

      // Step 3: Update state and UI
      setCurrentApplication(updatedApp);
      onUpdate(updatedApp);
      setStatusComment('');
      setShowCommentStep(false);
      
      const statusText = newStatus === ApplicationStatus.APPROVED_BY_GN ? 'approved' : 'rejected';
      toast.success(`Application ${statusText} successfully!`);
      
      // Refresh data to get updated audit logs
      setTimeout(() => {
        refreshApplicationData();
      }, 1000);
      
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error('Failed to process application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle rejection without signature
  const handleRejectWithoutSignature = async () => {
    if (!statusComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { status: ApplicationStatus.REJECTED_BY_GN, comment: statusComment };
      const updated = await applicationApiService.updateApplicationStatus(currentApplication.id, payload as any);
      const updatedApp = (updated as any).data || updated;
      
      setCurrentApplication(updatedApp);
      onUpdate(updatedApp);
      setStatusComment('');
      
      toast.success('Application rejected successfully');
      
      setTimeout(() => {
        refreshApplicationData();
      }, 1000);
    } catch (err) {
      console.error('Failed to reject application:', err);
      toast.error('Failed to reject application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSignatureFlow = () => {
    setPendingSignatureData(null);
    setShowCommentStep(false);
    setStatusComment('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Application Details</h1>
          <p className="text-muted-foreground">
            ID: {currentApplication.id.split('-').pop()?.toUpperCase()} • 
            Submitted {currentApplication.createdAt && format((currentApplication.createdAt as any), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshApplicationData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <StatusBadge status={currentApplication.currentStatus} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-base font-medium">{currentApplication.user?.firstName} {currentApplication.user?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mr-4">Application Type</label> 
                  <Badge variant={currentApplication.applicationType === 'new_nic' ? 'default' : 'secondary'}>
                    {currentApplication.applicationType === 'new_nic' ? 'New NIC Application' : 'Document Verification'}
                  </Badge>
                </div>
                {(currentApplication.applicationData && (currentApplication.applicationData.nic || (currentApplication as any).applicantNic)) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">NIC Number</label>
                    <p className="text-base font-mono">{currentApplication.applicationData?.nic || (currentApplication as any).applicantNic}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-base">{currentApplication.user?.phone || (currentApplication as any).applicantPhone}</p>
                </div>
                {currentApplication.applicationType === 'new_nic' && (
                  <div className="md:col-span-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>New NIC Application:</strong> This applicant is applying for their first National Identity Card. 
                        After verification and signature, send to DRP for NIC generation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <CardDescription>Review uploaded documents and photos</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="documents" className="w-full">
                <TabsList>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="documents" className="space-y-4">
                  {isLoadingDocs ? (
                    <div className="text-center py-8">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.filter((doc) => doc.attachmentType !== 'CERTIFY_SIGNATURE').map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {((doc.fileType || '').toLowerCase() === 'pdf' || (doc.fileUrl || '').toLowerCase().endsWith('.pdf')) ? (
                              <FileText className="h-8 w-8 text-red-600" />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-blue-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {doc.fileType === 'pdf' ? 'Birth Certificate (PDF)' : 'Supporting Photo'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded {format(new Date(doc.uploadedAt || doc.createdAt || doc.created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(API_BASE_URL+doc.fileUrl, '_blank')}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = API_BASE_URL+doc.fileUrl;
                                link.setAttribute('download', '');
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Section */}
          {currentApplication.currentStatus === ApplicationStatus.SUBMITTED && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Decision</CardTitle>
                <CardDescription>
                  {showCommentStep 
                    ? "Signature captured! Now add your comment and make your decision." 
                    : isApplicationSigned 
                    ? "Application is signed. Add your comment and make a decision."
                    : "Sign the document for approval, or reject with comment only."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Show signature preview if we have pending signature */}
                {pendingSignatureData && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-800 dark:text-green-200">Signature Captured</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">Signature Preview:</p>
                        <img 
                          src={pendingSignatureData.dataUrl} 
                          alt="Signature Preview" 
                          className="h-16 border border-green-300 rounded bg-white p-2"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={resetSignatureFlow}>
                        Reset Signature
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show current signed status if already signed */}
                {isApplicationSigned && !pendingSignatureData && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">Document Already Signed</p>
                          <p className="text-sm text-green-700 dark:text-green-300">Ready for decision</p>
                        </div>
                      </div>
                      {(currentApplication as any).signedPdfUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(API_BASE_URL + (currentApplication as any).signedPdfUrl, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Signed Document
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Signature button if not signed and not in comment step */}
                {!isApplicationSigned && !showCommentStep && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Signature className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-orange-800 dark:text-orange-200">Sign for Approval</p>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Signature required for approval (optional for rejection)
                          </p>
                        </div>
                      </div>
                      <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Signature className="mr-2 h-4 w-4" />
                            Sign Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Apply Digital Signature</DialogTitle>
                          </DialogHeader>
                          <SignatureCanvas onSign={handleSignatureCapture} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}

                {/* Comment and Action Section */}
                {(showCommentStep || isApplicationSigned || (!isApplicationSigned && !showCommentStep)) && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Review Comments <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Enter your review comments, reason for decision, or additional notes..."
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        rows={4}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Approve Button */}
                      <Button
                        onClick={() => handleCompleteSubmission(ApplicationStatus.APPROVED_BY_GN)}
                        disabled={
                          isSubmitting || 
                          !statusComment.trim() || 
                          (!pendingSignatureData && !isApplicationSigned)
                        }
                        className="h-12"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Processing...' : 'Approve Application'}
                      </Button>

                      {/* Reject Button */}
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (pendingSignatureData) {
                            handleCompleteSubmission(ApplicationStatus.REJECTED_BY_GN);
                          } else {
                            handleRejectWithoutSignature();
                          }
                        }}
                        disabled={isSubmitting || !statusComment.trim()}
                        className="h-12"
                        size="lg"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Processing...' : 'Reject Application'}
                      </Button>
                    </div>

                    {/* Validation Messages */}
                    <div className="space-y-2">
                      {!statusComment.trim() && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200">
                          <AlertTriangle className="h-4 w-4 inline mr-2" />
                          Comment is required for both approval and rejection.
                        </div>
                      )}
                      
                      {statusComment.trim() && !pendingSignatureData && !isApplicationSigned && (
                        <div className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200">
                          <AlertTriangle className="h-4 w-4 inline mr-2" />
                          Sign the document above to enable approval, or reject without signing.
                        </div>
                      )}
                      
                      {statusComment.trim() && (pendingSignatureData || isApplicationSigned) && (
                        <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200">
                          <CheckCircle className="h-4 w-4 inline mr-2" />
                          Ready to approve or reject the application.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Application progress timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No status changes yet</p>
                ) : (
                  auditLogs.map((log, index) => (
                    <div key={log.id} className="flex space-x-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {index < auditLogs.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <StatusBadge status={log.status} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {log.comment}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {log.userName}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Application ID</span>
                <span className="font-mono text-sm">{currentApplication.id.split('-').pop()?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Documents</span>
                <span className="text-sm">{documents.length} files</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Signature Status</span>
                <span className={`text-sm font-medium ${(pendingSignatureData || isApplicationSigned) ? 'text-green-600' : 'text-orange-600'}`}>
                  {pendingSignatureData ? '✓ Ready' : isApplicationSigned ? '✓ Signed' : '⏳ Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="text-sm">{currentApplication.createdAt && format(new Date(currentApplication.createdAt as any), 'MMM d')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{format(new Date(currentApplication.updatedAt), 'MMM d')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationViewer;