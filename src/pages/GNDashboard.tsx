import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getApplicationsForGN, generateMockApplications } from '@/services/mockData';
import { ApplicationStatus } from '@/types';
import { Clock, CheckCircle, AlertTriangle, Eye, ArrowRight, FileText } from 'lucide-react';

const GNDashboard: React.FC = () => {
  const { state } = useAuth();
  const [isLoading] = useState(false);

  const user = state.user!;

  // Get applications for this GN (including mock generated ones for demo)
  const baseApplications = useMemo(() => {
    const assigned = getApplicationsForGN(user.id);
    const generated = generateMockApplications(25).filter(app => app.wasamaId === user.wasamaId);
    return [...assigned, ...generated];
  }, [user.id, user.wasamaId]);

  // Get status counts for statistics
  const statusCounts = useMemo(() => {
    const counts = baseApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);
    
    return {
      total: baseApplications.length,
      pending: (counts.submitted || 0) + (counts.received || 0),
      review: (counts.read || 0),
      confirmed: (counts.confirmed_by_gn || 0),
      hold: (counts.hold || 0)
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
            Welcome back, {user.name} • {user.wasamaName}
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