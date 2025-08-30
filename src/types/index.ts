// Core Types for E-Document NIC System

export enum UserRole  { 
  DS = 'DS',
  GN = 'GN',
  STANDARD = 'STANDARD',
};


export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  phone: string;
  currentStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'DEACTIVATED';
  role: UserRole;
  additionalData?: Record<string , unknown>;
  gnDivisionId?: string;
  divisionId?: string;
  gnDivisionName?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CreateGnForm {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  phone: string;
  // currentStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'DEACTIVATED';
  role: UserRole;
  additionalData?: {
    nic?: string;
    [key: string]: any;
  };  
  divisionId?: string;
}

export interface GnDivision {
  id: string;
  code: string; 
  name: string;
  createdAt: string;
}

export type ApplicationStatus = 
  | 'submitted'
  | 'received'
  | 'read'
  | 'confirmed_by_gn'
  | 'sent_to_drp'
  | 'completed'
  | 'hold'
  | 'rejected';

export type ApplicationType = 'new_nic' | 'document_verification' | 'other';

export interface Application {
  id: string;
  applicantName: string;
  applicantNic?: string; // Optional for new NIC applications
  applicantPhone: string;
  applicationType: ApplicationType;
  gnDivisionId: string;
  gnDivisionName?: string;
  status: ApplicationStatus;
  submittedAt: string;
  assignedGnId?: string;
  assignedGnName?: string;
  dsId?: string;
  dsName?: string;
  currentPdfUrl?: string;
  signedPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
  signatures?: Signature[];
  auditLogs?: AuditLog[];
}

export interface Document {
  id: string;
  applicationId: string;
  originalFileUrl: string;
  ocrExtractedJson?: any;
  fileType: 'pdf' | 'image';
  uploadedAt: string;
}

export interface Signature {
  id: string;
  userId: string;
  applicationId: string;
  signatureImageUrl: string;
  signatureHash: string;
  signedAt: string;
  pdfUrl: string;
}

export interface AuditLog {
  id: string;
  applicationId: string;
  userId: string;
  userName?: string;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  applicationId: string;
  toPhone: string;
  toEmail: string;
  type: 'status_change' | 'hold' | 'rejection' | 'completion';
  payload: any;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface StatusUpdateForm {
  toStatus: ApplicationStatus;
  comment?: string;
}


// Theme types
export type Theme = 'light' | 'dark' | 'system';