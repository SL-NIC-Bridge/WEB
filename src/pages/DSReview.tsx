import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { applicationApiService, documentApiService, auditLogApiService } from '@/services/apiServices';
import { Application, ApplicationStatus } from '@/types';

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
  PenTool,
  AlertCircle,
  Building,
  Mail,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

interface ApplicationWithAttachments extends Application {
  signedPdfUrl?: string;
}

interface Attachment {
  id: string;
  attachmentType: string;
  fileName: string;
  fileUrl: string;
  fieldKey: string | null;
  applicationId: string;
  metadata: any;
  createdAt: string;
  uploadedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Extended user interface to include GN signature
interface GNUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  additionalData?: {
    nic?: string;
    signatureUrl?: string;
    [key: string]: any;
  };
  division?: {
    code: string;
    name: string;
  };
}

const DSReview: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Attachment[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [gnUser, setGnUser] = useState<GNUser | null>(null);

  // Load application, documents, and audit logs on mount
  useEffect(() => {
    const loadApplicationData = async () => {
      if (!applicationId) return;

      try {
        setIsLoading(true);
        setError(null);

        const appResponse = await applicationApiService.getApplicationById(applicationId);
        console.log('Application loaded:', appResponse);
        setApplication(appResponse);

        // Set GN user data
        setGnUser(appResponse.user as GNUser);

        // Verify application is in correct status for DS review
        if (appResponse.currentStatus !== ApplicationStatus.APPROVED_BY_GN) {
          setError(`This application is not ready for DS review. Current status: ${appResponse.currentStatus}`);
        }

        // Load documents and audit logs
        await loadDocumentsAndLogs(applicationId);

      } catch (error) {
        console.error('Error loading application:', error);
        setError('Application not found or you don\'t have permission to view it.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationData();
  }, [applicationId]);

  const loadDocumentsAndLogs = async (appId: string) => {
    let mounted = true;
    setIsLoadingDocs(true);

    try {
      const [docsResponse, logsResponse] = await Promise.all([
        documentApiService.getDocumentsForApplication(appId),
        auditLogApiService.getAuditLogsForApplication(appId)
      ]);

      if (!mounted) return;

      // Convert documents to attachment format if needed
      const attachments: Attachment[] = Array.isArray(docsResponse) ? docsResponse.map((doc: any) => ({
        id: doc.id,
        attachmentType: doc.attachmentType || 'APPLICATION_ATTACHMENT',
        fileName: doc.fileName || doc.originalFileUrl?.split('/').pop() || 'Unknown',
        fileUrl: doc.fileUrl || doc.originalFileUrl || '',
        fieldKey: doc.fieldKey || null,
        applicationId: doc.applicationId || appId,
        metadata: doc.metadata || doc.ocrExtractedJson || null,
        createdAt: doc.createdAt || doc.uploadedAt || new Date().toISOString(),
        uploadedByUser: doc.uploadedByUser || undefined
      })) : [];

      setDocuments(attachments);
      setAuditLogs(logsResponse || []);

    } catch (error) {
      console.error('Failed to load documents/audit logs:', error);
      if (mounted) {
        // Fallback to application attachments if available
        const fallbackDocs = (application as any)?.attachments || [];
       // setDocuments(fallbackDocs);
        setAuditLogs([]);
      }
    } finally {
      if (mounted) {
        setIsLoadingDocs(false);
      }
    }

    return () => {
      mounted = false;
    };
  };

  const handleSendToDRP = async () => {
    if (!application) return;
    
    setIsProcessing(true);
    try {
      const updatedApp = await applicationApiService.updateApplicationStatus(application.id, {
        status: ApplicationStatus.SENT_TO_DRP,
        comment: 'Application approved by DS and sent to DRP for final processing'
      });
      
      // Update local state
      const finalApp = (updatedApp as any).data || updatedApp;
      setApplication(finalApp);
      
      // Reload audit logs to show the new status change
      await loadDocumentsAndLogs(application.id);
      
      toast.success('Application successfully sent to DRP for final processing');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/ds');
      }, 2000);
    } catch (error) {
      console.error('Error sending application to DRP:', error);
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
      const updatedApp = await applicationApiService.updateApplicationStatus(application.id, {
        status: ApplicationStatus.REJECTED_BY_GN, // Using existing rejection status
        comment: `Application rejected by DS: ${rejectReason}`
      });
      
      // Update local state
      const finalApp = (updatedApp as any).data || updatedApp;
      setApplication(finalApp);
      
      // Reload audit logs to show the new status change
      await loadDocumentsAndLogs(application.id);
      
      toast.success('Application has been rejected');
      setShowRejectDialog(false);
      setRejectReason('');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/ds');
      }, 2000);
    } catch (error) {
      console.error('Error rejecting application:', error);
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
      const updatedApp = await applicationApiService.updateApplicationStatus(application.id, {
        status: ApplicationStatus.ON_HOLD_BY_DS,
        comment: `Application put on hold by DS: ${holdReason}`
      });
      
      // Update local state
      const finalApp = (updatedApp as any).data || updatedApp;
      setApplication(finalApp);
      
      // Reload audit logs to show the new status change
      await loadDocumentsAndLogs(application.id);
      
      toast.success('Application has been put on hold');
      setShowHoldDialog(false);
      setHoldReason('');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/ds');
      }, 2000);
    } catch (error) {
      console.error('Error holding application:', error);
      toast.error('Failed to hold application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/ds');
  };

  const getApplicationTypeBadge = (type: string) => {
    const typeMap = {
      'new_nic': 'New NIC',
      'replace_nic': 'Replace NIC',
      'correct_nic': 'Correct NIC'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getDocumentTypeIcon = (fileName: string, attachmentType?: string) => {
    const lowerFileName = fileName.toLowerCase();
    const lowerAttachmentType = (attachmentType || '').toLowerCase();
    
    if (lowerFileName.includes('birth') || lowerFileName.includes('certificate') || 
        lowerAttachmentType.includes('birth') || lowerAttachmentType.includes('certificate')) {
      return <FileText className="h-6 w-6 text-blue-600" />;
    } else if (lowerFileName.includes('signature') || lowerAttachmentType.includes('signature')) {
      return <PenTool className="h-6 w-6 text-purple-600" />;
    } else if (lowerFileName.includes('photo') || lowerFileName.includes('id') || 
               lowerFileName.includes('.jpg') || lowerFileName.includes('.png') ||
               lowerAttachmentType.includes('photo')) {
      return <ImageIcon className="h-6 w-6 text-green-600" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getDocumentTypeName = (fileName: string, attachmentType?: string) => {
    const lowerFileName = fileName.toLowerCase();
    const lowerAttachmentType = (attachmentType || '').toLowerCase();
    
    if (lowerFileName.includes('birth') || lowerFileName.includes('certificate') ||
        lowerAttachmentType.includes('birth') || lowerAttachmentType.includes('certificate')) {
      return 'Birth Certificate';
    } else if (lowerFileName.includes('signature') || lowerAttachmentType.includes('signature')) {
      return 'Digital Signature';
    } else if (lowerFileName.includes('photo') || lowerAttachmentType.includes('photo')) {
      return 'Photograph';
    } else if (lowerFileName.includes('.pdf')) {
      return 'PDF Document';
    } else {
      return 'Supporting Document';
    }
  };

  // Get GN signature from attachments (application signature)
  const getGNApplicationSignature = () => {
    return application.attachments.find(doc => 
      doc.attachmentType === 'CERTIFY_SIGNATURE'
    );
  };

  // Safe date formatting function
  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return 'Invalid date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <Alert>
              <AlertDescription className="text-center">
                {error || 'Application not found or you don\'t have permission to view it.'}
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

  const gnApplicationSignature = getGNApplicationSignature();

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
              DS Review for Application #{application.id.slice(-8).toUpperCase()} • 
              Submitted {formatDate(application.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={application.currentStatus} size="lg" />
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
                  <p className="font-medium">{application.user.firstName} {application.user.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mr-4">Application Type</Label>
                  <Badge variant={application.applicationType === 'new_nic' ? 'default' : 'secondary'}>
                    {getApplicationTypeBadge(application.applicationType)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{application.user.phone}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{application.user.email}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Administrative Division</Label>
                  <Badge variant="outline">{application.user.division?.name || 'Unknown Division'}</Badge>
                </div>
                {gnUser?.additionalData?.nic && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">GN NIC</Label>
                    <p className="font-mono text-sm">{gnUser.additionalData.nic}</p>
                  </div>
                )}
              </div>
              
              {application.applicationType === 'new_nic' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>New NIC Application:</strong> This applicant does not have an existing NIC number. 
                    After DS approval, send to DRP for NIC generation.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Application Data */}
          {application.applicationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Application Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.applicationData.name && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name (as per application)</Label>
                      <p className="font-medium">{application.applicationData.name} {application.applicationData.surname}</p>
                    </div>
                  )}
                  {application.applicationData.dateOfBirth && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                      <p className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(application.applicationData.dateOfBirth)}</span>
                      </p>
                    </div>
                  )}
                  {application.applicationData.sex && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                      <p className="capitalize">{application.applicationData.sex}</p>
                    </div>
                  )}
                  {application.applicationData.birthPlace && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Birth Place</Label>
                      <p className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{application.applicationData.birthPlace}</span>
                      </p>
                    </div>
                  )}
                  {application.applicationData.occupation && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                      <p>{application.applicationData.occupation}</p>
                    </div>
                  )}
                  {application.applicationData.birthCertificateNo && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Birth Certificate No</Label>
                      <p className="font-mono text-sm">{application.applicationData.birthCertificateNo}</p>
                    </div>
                  )}
                </div>

                {/* Address Information */}
                {(application.applicationData.street || application.applicationData.city) && (
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <div className="mt-2 text-sm">
                      {application.applicationData.houseNumber && <span>{application.applicationData.houseNumber}, </span>}
                      {application.applicationData.street && <span>{application.applicationData.street}, </span>}
                      {application.applicationData.city && <span>{application.applicationData.city}</span>}
                      {application.applicationData.postalCode && <span> - {application.applicationData.postalCode}</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
              <Tabs defaultValue="documents" className="w-full">
                <TabsList>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="documents" className="space-y-4">
                  { application.attachments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {application.attachments.filter((doc) => doc.attachmentType !== 'CERTIFY_SIGNATURE').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getDocumentTypeIcon(doc.fileName, doc.attachmentType)}
                            <div>
                              <p className="font-medium">
                                {getDocumentTypeName(doc.fileName, doc.attachmentType)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {doc.fileName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded {formatDate(doc.createdAt)}
                              </p>
                              {doc.uploadedByUser && (
                                <p className="text-xs text-muted-foreground">
                                  By: {doc.uploadedByUser.firstName} {doc.uploadedByUser.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`${API_BASE_URL}${doc.fileUrl}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `${API_BASE_URL}${doc.fileUrl}`;
                                link.setAttribute('download', doc.fileName);
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
              <div className="grid grid-cols-1 gap-4">
                {/* Registered GN Signature */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Registered GN Signature
                  </Label>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                    {gnUser?.additionalData?.signatureUrl ? (
                      <div className="text-center w-full">
                        <img 
                          src={`${API_BASE_URL}${gnUser.additionalData.signatureUrl}`}
                          alt="Registered GN Signature"
                          className="mx-auto mb-2 border rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        <div className="hidden text-center">
                          <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Signature not available</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {gnUser.firstName} {gnUser.lastName}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No registered signature</p>
                        {/* <p className="text-xs text-gray-400 mt-1">
                          {gnUser?.firstName} {gnUser?.lastName}
                        </p> */}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Application Signature */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Application Signature
                  </Label>
                  <div className="border rounded-lg p-4 bg-white min-h-[200px] flex items-center justify-center">
                    {gnApplicationSignature ? (
                      <div className="text-center w-full">
                        <img 
                          src={`${API_BASE_URL}${gnApplicationSignature.fileUrl}`}
                          alt="Application Signature"
                          className=" mx-auto mb-2 border rounded"
                          onError={(e) => {
                            console.log('Error loading application signature image', e);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        <div className="hidden text-center">
                          <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Signature not available</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(gnApplicationSignature.createdAt)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                        <p className="text-sm text-red-600">No application signature found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {gnUser?.additionalData?.signatureUrl && gnApplicationSignature ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Signature Status:</strong> Both registered and application signatures are available for verification.
                    Please visually compare the signatures before proceeding.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Signature Warning:</strong> {!gnUser?.additionalData?.signatureUrl && 'Registered signature is missing. '}
                    {!gnApplicationSignature && 'Application signature is missing. '}
                    Please verify signature status before approval.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>GN Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Approved by GN</p>
                  <p className="text-sm text-muted-foreground">
                    Ready for DS review
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm">{formatDate(application.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* DS Actions - Only show if application is in the right status */}
          {application.currentStatus === ApplicationStatus.APPROVED_BY_GN && (
            <Card>
              <CardHeader>
                <CardTitle>DS Actions</CardTitle>
                <CardDescription>
                  Review and approve to send to DRP for final processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This application has been verified by the GN and is ready for DS approval.
                    Once approved, it will be sent to the District Registrar of Properties (DRP).
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
          )}

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              {/* <CardDescription>Application progress timeline</CardDescription> */}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div key={log.id || index} className="flex space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {index < auditLogs.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <StatusBadge status={log.status || log.toStatus} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.comment && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {log.comment}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {log.userName || log.user?.firstName + ' ' + log.user?.lastName || 'System'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Application ID</span>
                <span className="font-mono text-sm">{application.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Documents</span>
                <span className="text-sm">{documents.length} files</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="text-sm">{format(new Date(application.createdAt), 'MMM d')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{format(new Date(application.updatedAt), 'MMM d')}</span>
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }} 
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={isProcessing || !rejectReason.trim()}
              >
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowHoldDialog(false);
                  setHoldReason('');
                }} 
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleHold} 
                disabled={isProcessing || !holdReason.trim()}
              >
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