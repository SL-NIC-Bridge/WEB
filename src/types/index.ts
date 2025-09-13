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
  divisionId?: string;
  division?:{
    id: string;
    name: string;
    code: string;
  }
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CreateGnForm {
  email: string;
  firstName: string;
  lastName: string;
  //passwordHash: string;
  password: string;
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



export type ApplicationType = 'new_nic' | 'replace_nic' | 'correct_nic' ;

// export interface Application {
//   id: string;
//   applicantName: string;
//   applicantNic?: string; // Optional for new NIC applications
//   applicantPhone: string;
//   applicationType: ApplicationType;
//   gnDivisionId: string;
//   gnDivisionName?: string;
//   status: ApplicationStatus;
//   submittedAt: string;
//   assignedGnId?: string;
//   assignedGnName?: string;
//   dsId?: string;
//   dsName?: string;
//   currentPdfUrl?: string;
//   signedPdfUrl?: string;
//   createdAt: string;
//   updatedAt: string;
//   documents?: Document[];
//   signatures?: Signature[];
//   auditLogs?: AuditLog[];
// }

export enum ApplicationStatus {
  SUBMITTED='SUBMITTED',
  REJECTED_BY_GN = 'REJECTED_BY_GN',
  APPROVED_BY_GN = 'APPROVED_BY_GN',
  REJECTED_BY_DS = 'REJECTED_BY_DS',
  SENT_TO_DRP= 'SENT_TO_DRP',
  ON_HOLD_BY_DS= 'ON_HOLD_BY_DS',
}


export interface Application {
 
  id: string;
  userId: string;
  applicationType: ApplicationType;
  applicationData: any;
  currentStatus: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    division?: {
      code:string;
      name: string;
    };
    additionalData?: {
      nic?: string;
      signature?: string;
      [key: string]: any;
    };
  };
  attachments: {
    id: string;
    attachmentType: string;
    fileName: string;
    fileUrl: string;
    createdAt: Date;
    uploadedByUser?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
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
  status: ApplicationStatus;
  comment?: string;
}


// Theme types
export type Theme = 'light' | 'dark' | 'system';