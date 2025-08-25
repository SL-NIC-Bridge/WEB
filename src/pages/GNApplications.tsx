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
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ApplicationViewer from '@/components/gn/ApplicationViewer';
import { getApplicationsForGN, generateMockApplications } from '@/services/mockData';
import { Application, ApplicationStatus } from '@/types';
import { Search, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 10;

const GNApplications: React.FC = () => {
  const { state } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading] = useState(false);

  const user = state.user!;

  // Get applications for this GN (including mock generated ones for demo)
  const baseApplications = useMemo(() => {
    const assigned = getApplicationsForGN(user.id);
    const generated = generateMockApplications(25).filter(app => app.gnDivisionId === user.gnDivisionId);
    return [...assigned, ...generated];
  }, [user.id, user.gnDivisionId]);

  // Filter applications based on search and tab
  const filteredApplications = useMemo(() => {
    let filtered = baseApplications;
    
    // Filter by tab
    switch (activeTab) {
      case 'new_nic':
        filtered = filtered.filter(app => app.applicationType === 'new_nic');
        break;
      case 'verification':
        filtered = filtered.filter(app => app.applicationType === 'document_verification');
        break;
      case 'received':
        filtered = filtered.filter(app => ['submitted', 'received'].includes(app.status));
        break;
      case 'under_review':
        filtered = filtered.filter(app => app.status === 'read');
        break;
      case 'on_hold':
        filtered = filtered.filter(app => app.status === 'hold');
        break;
      case 'confirmed':
        filtered = filtered.filter(app => app.status === 'confirmed_by_gn');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicantName.toLowerCase().includes(query) ||
        (app.applicantNic && app.applicantNic.toLowerCase().includes(query)) ||
        app.applicantPhone.includes(query) ||
        app.id.toLowerCase().includes(query) ||
        app.applicationType.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [baseApplications, searchQuery, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApplications, currentPage]);

  // Get counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: baseApplications.length,
      new_nic: baseApplications.filter(app => app.applicationType === 'new_nic').length,
      verification: baseApplications.filter(app => app.applicationType === 'document_verification').length,
      received: baseApplications.filter(app => ['submitted', 'received'].includes(app.status)).length,
      under_review: baseApplications.filter(app => app.status === 'read').length,
      on_hold: baseApplications.filter(app => app.status === 'hold').length,
      confirmed: baseApplications.filter(app => app.status === 'confirmed_by_gn').length,
    };
  }, [baseApplications]);

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setSelectedApplication(updatedApplication);
    // In a real app, this would trigger a refetch of the applications list
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner size="lg" message="Loading applications..." />
      </div>
    );
  }

  // If viewing a specific application
  if (selectedApplication) {
    return (
      <ApplicationViewer
        application={selectedApplication}
        onBack={() => setSelectedApplication(null)}
        onUpdate={handleApplicationUpdate}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Manage document verification requests for {user.gnDivisionName}
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredApplications.length} of {tabCounts.all} Applications
        </Badge>
      </div>

      {/* Applications with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            Review and process applications assigned to your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, application ID, or type..."
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">
                All ({tabCounts.all})
              </TabsTrigger>
              <TabsTrigger value="new_nic">
                New NIC ({tabCounts.new_nic})
              </TabsTrigger>
              <TabsTrigger value="verification">
                Verification ({tabCounts.verification})
              </TabsTrigger>
              <TabsTrigger value="received">
                Received ({tabCounts.received})
              </TabsTrigger>
              <TabsTrigger value="under_review">
                Review ({tabCounts.under_review})
              </TabsTrigger>
              <TabsTrigger value="on_hold">
                On Hold ({tabCounts.on_hold})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed ({tabCounts.confirmed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Applications Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchQuery ? 'No applications found matching your search.' : 'No applications in this category.'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedApplications.map((application) => (
                        <TableRow 
                          key={application.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleApplicationClick(application)}
                        >
                          <TableCell>
                            <div className="font-mono text-sm">
                              {application.id.split('-').pop()?.toUpperCase()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{application.applicantName}</div>
                              <div className="text-sm text-muted-foreground">
                                {application.applicantNic ? `NIC: ${application.applicantNic}` : 'New NIC Application'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={application.applicationType === 'new_nic' ? 'default' : 'secondary'}>
                              {application.applicationType === 'new_nic' ? 'New NIC' : 'Verification'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{application.applicantPhone}</div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={application.status} />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(application.submittedAt), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(application.submittedAt), 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GNApplications;