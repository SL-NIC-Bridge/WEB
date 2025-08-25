import React, { useState, useMemo } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import CreateGNForm from '@/components/ds/CreateGNForm';
import { mockApplications, mockUsers, mockGnDivisions, generateMockApplications } from '@/services/mockData';
import { Application, User } from '@/types';
import { 
  Search, 
  FileText, 
  Users, 
  CheckCircle, 
  Send,
  UserPlus,
  Building,
  Activity,
  TrendingUp,
  Eye
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
  const [isCreateGNOpen, setIsCreateGNOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(1);

  const user = state.user!;

  // Get all applications and GNs for DS oversight - only GN confirmed applications
  const allApplications = useMemo(() => {
    const apps = [...mockApplications, ...generateMockApplications(25)];
    return apps.filter(app => app.status === 'confirmed_by_gn' || app.status === 'sent_to_drp');
  }, []);

  const allGNs = useMemo(() => {
    return mockUsers.filter(u => u.role === 'GN');
  }, []);

  // Filter applications based on search
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return allApplications;
    
    const query = searchQuery.toLowerCase();
    return allApplications.filter(app => 
      app.applicantName.toLowerCase().includes(query) ||
      (app.applicantNic && app.applicantNic.toLowerCase().includes(query)) ||
      app.applicantPhone.includes(query) ||
      app.id.toLowerCase().includes(query) ||
      (app.gnDivisionName && app.gnDivisionName.toLowerCase().includes(query))
    );
  }, [allApplications, searchQuery]);

  // Applications ready for DS review (confirmed by GN, not yet sent to DRP)
  const applicationsForReview = useMemo(() => {
    return allApplications.filter(app => app.status === 'confirmed_by_gn');
  }, [allApplications]);

  // Group applications by GN
  const applicationsByGN = useMemo(() => {
    const grouped = applicationsForReview.reduce((acc, app) => {
      const gnName = app.assignedGnName || 'Unknown GN';
      if (!acc[gnName]) {
        acc[gnName] = [];
      }
      acc[gnName].push(app);
      return acc;
    }, {} as Record<string, Application[]>);
    
    return Object.entries(grouped).map(([gnName, apps]) => ({
      gnName,
      applications: apps
    }));
  }, [applicationsForReview]);

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

  // Statistics
  const stats = useMemo(() => {
    const statusCounts = allApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalApplications: allApplications.length,
      totalGNs: allGNs.length,
      readyForReview: applicationsForReview.length,
      sentToDRP: statusCounts.sent_to_drp || 0,
    };
  }, [allApplications, allGNs, applicationsForReview]);

  const handleSendToDRP = async (applicationId: string) => {
    try {
      // In a real app, this would make an API call
      console.log('Sending application to DRP:', applicationId);
      toast.success('Application sent to DRP successfully');
      
      // Here you would normally update the application status in your state management
      // For now, we'll just show the success message
    } catch (error) {
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

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DS Administrative Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName} • System Overview & GN Management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="px-3 py-1">
            {stats.totalGNs} Active GNs
          </Badge>
          {/* <Dialog open={isCreateGNOpen} onOpenChange={setIsCreateGNOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover">
                <UserPlus className="mr-2 h-4 w-4" />
                Create GN Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Grama Niladhari Account</DialogTitle>
              </DialogHeader>
              <CreateGNForm onClose={() => setIsCreateGNOpen(false)} />
            </DialogContent>
          </Dialog> */}
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed Applications</p>
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
          {/* <TabsTrigger value="gn-management">GN Management</TabsTrigger> */}
          <TabsTrigger value="all-applications">All Applications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by GN */}
            <Card>
              <CardHeader>
                <CardTitle>Applications by GN</CardTitle>
                <CardDescription>Applications grouped by Grama Niladhari</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationsByGN.slice(0, 5).map(({ gnName, applications }) => (
                    <div key={gnName} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{gnName}</p>
                        <p className="text-sm text-muted-foreground">
                          {applications.length} application{applications.length !== 1 ? 's' : ''} ready
                        </p>
                      </div>
                      <Badge variant="secondary">{applications.length}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GnDivision Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Area Distribution</CardTitle>
                <CardDescription>Applications by administrative area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGnDivisions.map((gnDivision) => {
                    const count = allApplications.filter(app => app.gnDivisionId === gnDivision.id).length;
                    const percentage = allApplications.length > 0 ? (count / allApplications.length) * 100 : 0;
                    
                    return (
                      <div key={gnDivision.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{gnDivision.name}</span>
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
                      <TableHead>GN / Area</TableHead>
                      <TableHead>GN Confirmed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReviewApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="text-muted-foreground">
                            No applications pending DS review
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReviewApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {app.id.split('-').pop()?.toUpperCase()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{app.applicantName}</div>
                              <div className="text-sm text-muted-foreground">
                                {app.applicantPhone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{app.assignedGnName}</div>
                              <div className="text-xs text-muted-foreground">
                                {app.gnDivisionName}
                              </div>
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
                      ))
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

        {/* GN Management Tab */}
        <TabsContent value="gn-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grama Niladhari Management</CardTitle>
              <CardDescription>
                Manage GN accounts, permissions, and area assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allGNs.map((gn) => {
                      const applicationCount = allApplications.filter(app => app.assignedGnId === gn.id).length;
                      
                      return (
                        <TableRow key={gn.id}>
                          <TableCell>
                            <div className="font-medium">{gn.firstName}</div>
                            <div className="text-sm text-muted-foreground">
                              {applicationCount} applications assigned
                            </div>
                          </TableCell>
                          <TableCell>{gn.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{gn.gnDivisionName}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={gn.active ? "default" : "secondary"}>
                              {gn.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(gn.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Reset Password
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Applications Tab */}
        <TabsContent value="all-applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Confirmed Applications</CardTitle>
              <CardDescription>
                Complete overview of all confirmed applications in the system
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
                      <TableHead>GN / Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchQuery ? 'No applications found matching your search.' : 'No confirmed applications found.'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {app.id.split('-').pop()?.toUpperCase()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{app.applicantName}</div>
                              <div className="text-sm text-muted-foreground">
                                {app.applicantPhone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{app.assignedGnName}</div>
                              <div className="text-xs text-muted-foreground">
                                {app.gnDivisionName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(app.updatedAt), 'MMM d, yyyy h:mm a')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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
    </div>
  );
};

export default DSDashboard;