import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { User } from '@/types';

interface GNApprovalListProps {
  pendingGNs: User[];
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
}

const GNApprovalList: React.FC<GNApprovalListProps> = ({
  pendingGNs,
  onApprove,
  onReject,
}) => {
  const handleApprove = async (userId: string) => {
    try {
      await onApprove(userId);
      toast.success('GN account approved successfully');
    } catch (error) {
      toast.error('Failed to approve GN account');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await onReject(userId);
      toast.success('GN account rejected');
    } catch (error) {
      toast.error('Failed to reject GN account');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending GN Approvals</CardTitle>
        <CardDescription>Review and approve new Grama Niladhari registrations</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingGNs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingGNs.map((gn) => (
              <div key={gn.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{gn.name}</h4>
                    <p className="text-sm text-muted-foreground">{gn.email}</p>
                  </div>
                  <Badge variant="outline">{gn.gnDivisionName}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registration Date</span>
                    <span>{format(new Date(gn.createdAt), 'PPP')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GnDivision ID</span>
                    <span className="font-mono">{gn.gnDivisionId}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(gn.id)}
                    className="text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(gn.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GNApprovalList;
