import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { applicationApiService, divisionApiService } from '@/services/apiServices';
import { ApplicationStatus, Application } from '@/types';
import { toast } from 'sonner';
import { Clock, CheckCircle, AlertTriangle, Eye, ArrowRight, FileText } from 'lucide-react';

const GNDashboard: React.FC = () => {
  const { state } = useAuth();
    const user = state.user!;
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [divisionName, setDivisionName] = useState<string | undefined>(user.division?.name);



  // Load division info and applications for this GN's division
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        if (user.division?.id) {
          const [apps, division] = await Promise.all([
            applicationApiService.getApplicationsForDivision(user.division.id),
            divisionApiService.getGnDivisionById(user.division.id)
          ]);
          if (!mounted) return;
          setApplications(apps || []);
          setDivisionName(division?.name || user.division?.name);
        } else {
          // Fallback: load applications for GN by user id
          const apps = await applicationApiService.getApplicationsForDivision(user.division?.id || '');
          if (!mounted) return;
          setApplications(apps || []);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user.id, user.division?.id]);

  const baseApplications = useMemo(() => applications, [applications]);

  // Get status counts for statistics
  const statusCounts = useMemo(() => {
    const counts = baseApplications.reduce((acc, app) => {
      const s = (app as any).currentStatus || (app as any).status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: baseApplications.length,
      pending: (counts['SUBMITTED'] || 0),
      review: (counts['APPROVED_BY_GN'] || 0),
      confirmed: (counts['SENT_TO_DRP'] || 0),
      hold: (counts['ON_HOLD_BY_DS'] || 0)
    };
  }, [baseApplications]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GN Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName} • {divisionName || ''}
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {statusCounts.total} Applications
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">{statusCounts.review}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{statusCounts.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">On Hold</p>
                <p className="text-2xl font-bold">{statusCounts.hold}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Recent Applications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {statusCounts.pending} applications need your attention
                </p>
                <Link to="/gn/applications">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    View All Applications
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{statusCounts.total}</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Frequently used tools and shortcuts
                </p>
                <div className="flex gap-2">
                  <Link to="/gn/applications?tab=received">
                    <Button variant="outline" size="sm">
                      New Applications
                    </Button>
                  </Link>
                  <Link to="/gn/applications?tab=under_review">
                    <Button variant="outline" size="sm">
                      Under Review
                    </Button>
                  </Link>
                </div>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GNDashboard;