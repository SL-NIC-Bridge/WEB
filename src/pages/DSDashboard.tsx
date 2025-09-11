import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { applicationApiService, userApiService, divisionApiService } from '@/services/apiServices';
import { Application, ApplicationStatus, User, GnDivision } from '@/types';
import { 
  Search, 
  FileText, 
  Users, 
  CheckCircle, 
  Send,
  Building,
  Activity,
  Eye,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const DSDashboard: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for API data - now we store ALL applications
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [allGNs, setAllGNs] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<GnDivision[]>([]);

  const user = state.user!;

  // Filter applications by status on the frontend
  const relevantStatusesForDS = [
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.APPROVED_BY_GN, 
    ApplicationStatus.ON_HOLD_BY_DS, 
    ApplicationStatus.SENT_TO_DRP
  ];

  // Filter applications that are relevant for DS
  const relevantApplications = useMemo(() => {
    return allApplications.filter(app => 
      relevantStatusesForDS.includes(app.currentStatus)
    );
  }, [allApplications]);

  // Applications by status
  const submittedApps = useMemo(() => 
    relevantApplications.filter(app => app.currentStatus === ApplicationStatus.SUBMITTED),
    [relevantApplications]
  );

  const approvedApps = useMemo(() => 
    relevantApplications.filter(app => app.currentStatus === ApplicationStatus.APPROVED_BY_GN),
    [relevantApplications]
  );

  const onHoldApps = useMemo(() => 
    relevantApplications.filter(app => app.currentStatus === ApplicationStatus.ON_HOLD_BY_DS),
    [relevantApplications]
  );

  const sentToDRPApps = useMemo(() => 
    relevantApplications.filter(app => app.currentStatus === ApplicationStatus.SENT_TO_DRP),
    [relevantApplications]
  );

  // Applications ready for DS review (APPROVED_BY_GN status only)
  const applicationsForReview = useMemo(() => {
    return relevantApplications.filter(app => app.currentStatus === ApplicationStatus.APPROVED_BY_GN);
  }, [relevantApplications]);

  // Data source based on active tab
  const getDataSourceForTab = useMemo(() => {
    switch (activeTab) {
      case 'all-applications':
        return relevantApplications;
      case 'review':
        return applicationsForReview;
      case 'overview':
      default:
        return relevantApplications;
    }
  }, [activeTab, relevantApplications, applicationsForReview]);

  // Filter applications based on search
  const filteredApplications = useMemo(() => {
    const dataSource = getDataSourceForTab;
    
    if (!searchQuery.trim()) return dataSource;
    
    const query = searchQuery.toLowerCase();
    return dataSource.filter(app => 
      app.user.firstName.toLowerCase().includes(query) ||
      app.user.lastName.toLowerCase().includes(query) ||
      app.user.phone.includes(query) ||
      app.id.toLowerCase().includes(query)
    );
  }, [getDataSourceForTab, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      totalApplications: relevantApplications.length,
      totalGNs: allGNs.length,
      readyForReview: approvedApps.length,
      sentToDRP: sentToDRPApps.length,
    };
  }, [relevantApplications, allGNs, approvedApps, sentToDRPApps]);

  // Group applications by division
  const applicationsByDivision = useMemo(() => {
  const grouped = applicationsForReview.reduce((acc, app) => {
    // app.divisionId should come from your Application type
    const division = divisions.find(d => d.id === app.user.division?.code || '');
    const divisionName = division?.name || "Unknown Division";

    if (!acc[divisionName]) {
      acc[divisionName] = [];
    }
    acc[divisionName].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  return Object.entries(grouped).map(([divisionName, apps]) => ({
    divisionName,
    applications: apps
  }));
}, [applicationsForReview, divisions]);


  // Pagination for review tab
  const totalReviewPages = Math.ceil(applicationsForReview.length / ITEMS_PER_PAGE);
  const paginatedReviewApplications = useMemo(() => {
    const start = (reviewCurrentPage - 1) * ITEMS_PER_PAGE;
    return applicationsForReview.slice(start, start + ITEMS_PER_PAGE);
  }, [applicationsForReview, reviewCurrentPage]);

  // Pagination for all applications tab
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApplications, currentPage]);

  // Load all data once on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Make single API call to get ALL applications (no status filter)
        const [applicationsResponse, gnsResponse, divisionsResponse] = await Promise.all([
          applicationApiService.getApplications(1, 10000), // Get a large number to get all applications
          userApiService.getAllGNs(),
          divisionApiService.getGnDivisions(1, 1000)
        ]);

        console.log('All Applications loaded:', applicationsResponse.data);
        
        setAllApplications(applicationsResponse.data);
        setAllGNs(gnsResponse);
        setDivisions(divisionsResponse.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []); // Only run once on component mount

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setReviewCurrentPage(1);
  }, [activeTab]);

  const handleSendToDRP = async (applicationId: string) => {
    try {
      await applicationApiService.updateApplicationStatus(applicationId, {
        status: ApplicationStatus.SENT_TO_DRP,
        comment: 'Application approved by DS and sent to DRP'
      });
      
      toast.success('Application sent to DRP successfully');
      
      // Update the specific application in state instead of refetching all
        setAllApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, currentStatus: ApplicationStatus.SENT_TO_DRP, updatedAt: new Date() }
            : app
        )
      );

    } catch (error) {
      console.error('Error sending application to DRP:', error);
      toast.error('Failed to send application to DRP');
    }
  };

  const handleReviewApplication = (applicationId: string) => {
    navigate(`/ds/review/${applicationId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReviewPageChange = (page: number) => {
    setReviewCurrentPage(page);
  };

  const getApplicationTypeBadge = (type: string) => {
    const typeMap = {
      'new_nic': 'New NIC',
      'replace_nic': 'Replace NIC',
      'correct_nic': 'Correct NIC'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</p>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
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
        <div>
          <h1 className="text-2xl font-bold">DS Administrative Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName} • System Overview & Application Management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="px-3 py-1">
            {stats.totalGNs} Active GNs
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ready for Review</p>
                    <p className="text-2xl font-bold">{stats.readyForReview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Send className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sent to DRP</p>
                    <p className="text-2xl font-bold">{stats.sentToDRP}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active GNs</p>
                    <p className="text-2xl font-bold">{stats.totalGNs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="review">Ready for Review ({stats.readyForReview})</TabsTrigger>
              <TabsTrigger value="all-applications">All Applications</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
             <TabsContent value="overview" className="space-y-4">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Applications by Division */}                 <Card>
                  <CardHeader>
                    <CardTitle>Applications by Division</CardTitle>
                    <CardDescription>Applications grouped by administrative division</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {applicationsByDivision.slice(0, 5).map(({ divisionName, applications }) => (
                        <div key={divisionName} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{divisionName}</p>
                            <p className="text-sm text-muted-foreground">
                              {applications.length} application{applications.length !== 1 ? 's' : ''} ready
                            </p>
                          </div>
                          <Badge variant="secondary">{applications.length}</Badge>
                        </div>
                      ))}
                      {applicationsByDivision.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No applications pending review
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Division Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Division Distribution</CardTitle>
                    <CardDescription>Applications by administrative division</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {divisions.map((division) => {
                        // const count = filteredApplications.filter(app => user.division?.id || '').length;
                        // const percentage = filteredApplications.length > 0 ? (count / filteredApplications.length) * 100 : 0;
                        const count = filteredApplications.filter(app => app.user.division?.code === division.id).length;
                        const percentage = filteredApplications.length > 0 
                          ? (count / filteredApplications.length) * 100 
                          : 0;

                        
                        return (
                          <div key={division.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{division.name}</span>
                              <span className="text-muted-foreground">{count} applications</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>



            {/* Ready for Review Tab */}
            <TabsContent value="review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Applications Ready for DS Review</CardTitle>
                  <CardDescription>
                    Applications confirmed by GN and awaiting DS approval to send to DRP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application ID</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Division</TableHead>
                          <TableHead>GN Confirmed</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedReviewApplications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="text-muted-foreground">
                                No applications pending DS review
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedReviewApplications.map((app) => {
                            const division = divisions.find(d => d.id === user.division?.id || '');
                            return (
                              <TableRow key={app.id}>
                                <TableCell>
                                  <div className="font-mono text-sm">
                                    {app.id.slice(-8).toUpperCase()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{app.user.firstName} {app.user.lastName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {app.user.phone}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getApplicationTypeBadge(app.applicationType)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {/* {division?.name || 'Unknown Division'} */}
                                    {app.user.division?.name || 'Unknown Division'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {format(new Date(app.updatedAt), 'MMM d, yyyy h:mm a')}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleReviewApplication(app.id)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      Review
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSendToDRP(app.id)}
                                      className="bg-primary hover:bg-primary-hover"
                                    >
                                      <Send className="mr-2 h-4 w-4" />
                                      Send to DRP
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Review Pagination */}
                  {totalReviewPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handleReviewPageChange(Math.max(1, reviewCurrentPage - 1))}
                              className={reviewCurrentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {[...Array(totalReviewPages)].map((_, index) => {
                            const page = index + 1;
                            if (page === 1 || page === totalReviewPages || Math.abs(page - reviewCurrentPage) <= 1) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handleReviewPageChange(page)}
                                    isActive={reviewCurrentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (page === 2 || page === totalReviewPages - 1) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handleReviewPageChange(Math.min(totalReviewPages, reviewCurrentPage + 1))}
                              className={reviewCurrentPage === totalReviewPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Applications Tab */}
            <TabsContent value="all-applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>
                    Complete overview of all applications relevant to DS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Division</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedApplications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="text-muted-foreground">
                                {searchQuery ? 'No applications found matching your search.' : 'No applications found.'}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedApplications.map((app) => {
                            const division = divisions.find(d => d.id === user.division?.id || '');
                            return (
                              <TableRow key={app.id}>
                                <TableCell>
                                  <div className="font-mono text-sm">
                                    {app.id.slice(-8).toUpperCase()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{app.user.firstName} {app.user.lastName}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {app.user.phone}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getApplicationTypeBadge(app.applicationType)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {app.user.division?.name || 'Unknown Division'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={app.currentStatus} />
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {format(new Date(app.updatedAt), 'MMM d, yyyy h:mm a')}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* All Applications Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1;
                            if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (page === 2 || page === totalPages - 1) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default DSDashboard;