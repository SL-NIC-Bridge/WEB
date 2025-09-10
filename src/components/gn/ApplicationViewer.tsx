import React, { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoadingDocs(true);
      try {
        // try documents endpoint first
        const docs = await documentApiService.getDocumentsForApplication(application.id);
        const logs = await auditLogApiService.getAuditLogsForApplication(application.id);
        if (!mounted) return;
        setDocuments(docs || []);
        setAuditLogs(logs || []);
      } catch (err) {
        console.error('Failed to load documents/audit logs', err);
        // fallback to attachments on application object if available
        if (mounted) {
          setDocuments((application as any).attachments || []);
          setAuditLogs([]);
        }
      } finally {
        if (mounted) setIsLoadingDocs(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [application.id]);

  const allowedNextStatuses = getAllowedStatusTransitions(application.currentStatus);

  function getAllowedStatusTransitions(currentStatus: ApplicationStatus): ApplicationStatus[] {
    // Simplified transitions tailored to backend ApplicationStatus enum
    //console.log('currentStatus', currentStatus);
    switch (currentStatus) {
      case ApplicationStatus.SUBMITTED:
        return [ApplicationStatus.APPROVED_BY_GN, ApplicationStatus.REJECTED_BY_GN];
      case ApplicationStatus.APPROVED_BY_GN:
        return [ApplicationStatus.REJECTED_BY_GN];
      default:
        return [];
    }
  }

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if ((newStatus === ApplicationStatus.REJECTED_BY_GN) && !statusComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const payload = { status: newStatus, comment: statusComment };
      const updated = await applicationApiService.updateApplicationStatus(application.id, payload as any);
      // updated may be ApiResponse-wrapped or raw Application
      const updatedApp: Application = (updated as any).data || updated;
      onUpdate(updatedApp);
      setStatusComment('');
      toast.success('Application status updated');
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update application status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSign = async (signatureDataUrl: string) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await applicationApiService.signApplication(application.id, { signature: signatureDataUrl });
      const updatedApp: Application = (updated as any).data || updated;
      onUpdate(updatedApp);
      setIsSignatureModalOpen(false);
      toast.success('Document signed successfully');
    } catch (err) {
      console.error('Sign failed', err);
      toast.error('Failed to sign document');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusActions = () => {
    return allowedNextStatuses.map((status) => {
      if (status === ApplicationStatus.APPROVED_BY_GN) {
        return (
          <Button key={String(status)} variant="default" onClick={() => handleStatusUpdate(status)} disabled={isUpdatingStatus}>
            <CheckCircle className="mr-2 h-4 w-4" /> Confirm & Approve
          </Button>
        );
      }

      if (status === ApplicationStatus.REJECTED_BY_GN) {
        return (
          <Button key={String(status)} variant="destructive" onClick={() => handleStatusUpdate(status)} disabled={isUpdatingStatus}>
            <XCircle className="mr-2 h-4 w-4" /> Reject Application
          </Button>
        );
      }

      return null;
    });
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
            ID: {application.id.split('-').pop()?.toUpperCase()} • 
            Submitted {application.createdAt && format((application.createdAt as any), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
  <StatusBadge status={application.currentStatus} size="lg" />
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
                  <p className="text-base font-medium">{application.user?.firstName} {application.user?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Application Type</label>
                  <Badge variant={application.applicationType === 'new_nic' ? 'default' : 'secondary'}>
                    {application.applicationType === 'new_nic' ? 'New NIC Application' : 'Document Verification'}
                  </Badge>
                </div>
                {(application.applicationData && (application.applicationData.nic || (application as any).applicantNic)) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">NIC Number</label>
                    <p className="text-base font-mono">{application.applicationData?.nic || (application as any).applicantNic}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-base">{application.user?.phone || (application as any).applicantPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Administrative Area</label>
                  <Badge variant="outline">{(application as any).gnDivisionName || (application as any).user?.division?.name}</Badge>
                </div>
                {application.applicationType === 'new_nic' && (
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
                  <TabsTrigger value="preview">Preview</TabsTrigger>
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
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {((doc.fileType || '').toLowerCase() === 'pdf' || (doc.originalFileUrl || '').toLowerCase().endsWith('.pdf')) ? (
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
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.originalFileUrl || doc.fileUrl, '_blank')}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.originalFileUrl || doc.fileUrl, '_blank')}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4">
                  <div className="border rounded-lg bg-muted/30 aspect-[4/3] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Document preview would appear here</p>
                      <p className="text-sm">PDF and image viewer integration</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Status Actions */}
          {getAllowedStatusTransitions(application.currentStatus).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Update application status or add comments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(allowedNextStatuses.includes(ApplicationStatus.REJECTED_BY_GN)) && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Comment (required for reject)
                    </label>
                    <Textarea
                      placeholder="Provide reason for hold or rejection..."
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {getStatusActions()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* E-Signature Section */}
          {application.currentStatus === ApplicationStatus.SUBMITTED && (
            <Card>
              <CardHeader>
                <CardTitle>Digital Signature</CardTitle>
                <CardDescription>Apply your official signature to the document</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    {(application as any).signedPdfUrl ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Document signed</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Document requires your digital signature before confirmation
                      </p>
                    )}
                  </div>
                  <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        disabled={!!(application as any).signedPdfUrl}
                        className="bg-primary hover:bg-primary-hover"
                      >
                        <Signature className="mr-2 h-4 w-4" />
                        {(application as any).signedPdfUrl ? 'Signed' : 'Sign Document'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Apply Digital Signature</DialogTitle>
                      </DialogHeader>
                      <SignatureCanvas onSign={handleSign} />
                    </DialogContent>
                  </Dialog>
                </div>
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
                {auditLogs.map((log, index) => (
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
                ))}
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
                <span className="font-mono text-sm">{application.id.split('-').pop()?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Documents</span>
                <span className="text-sm">{documents.length} files</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="text-sm">{application.createdAt && format(new Date(application.createdAt as any), 'MMM d')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{format(new Date(application.updatedAt), 'MMM d')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationViewer;