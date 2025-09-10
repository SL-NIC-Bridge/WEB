import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/types';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  Send, 
  AlertTriangle, 
  XCircle,
  FileText,
  Award
} from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = true, 
  size = 'default' 
}) => {
  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          variant: 'secondary' as const,
          className: 'status-submitted',
          label: 'Submitted',
          icon: FileText
        };
      case 'SUBMITTED':
        return {
          variant: 'secondary' as const,
          className: 'status-received',
          label: 'Received',
          icon: Clock
        };
      case 'read':
        return {
          variant: 'secondary' as const,
          className: 'status-received',
          label: 'Under Review',
          icon: Eye
        };
      case 'APPROVED_BY_GN':
        return {
          variant: 'default' as const,
          className: 'status-confirmed',
          label: 'GN Confirmed',
          icon: CheckCircle
        };
      case 'SENT_TO_DRP':
        return {
          variant: 'default' as const,
          className: 'status-confirmed',
          label: 'Sent to DRP',
          icon: Send
        };
      case 'completed':
        return {
          variant: 'default' as const,
          className: 'status-confirmed',
          label: 'Completed',
          icon: Award
        };
      case 'ON_HOLD_BY_DS':
        return {
          variant: 'secondary' as const,
          className: 'status-hold',
          label: 'On Hold',
          icon: AlertTriangle
        };
      case 'REJECTED_BY_GN':
        return {
          variant: 'destructive' as const,
          className: 'status-rejected',
          label: 'Rejected',
          icon: XCircle
        };
      default:
        return {
          variant: 'outline' as const,
          className: '',
          label: status,
          icon: FileText
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1.5 font-medium`}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;