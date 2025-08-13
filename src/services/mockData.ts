// Mock Data for Development and Demo
import { User, Wasama, Application, Document, AuditLog, ApplicationType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock Wasama (Administrative Areas)
export const mockWasamas: Wasama[] = [
  {
    id: 'wasama-1',
    name: 'Colombo North',
    description: 'Northern division of Colombo district',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'wasama-2',
    name: 'Colombo South', 
    description: 'Southern division of Colombo district',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'wasama-3',
    name: 'Gampaha Central',
    description: 'Central division of Gampaha district',
    createdAt: '2024-01-15T08:00:00Z'
  }
];

// Mock Users (1 DS, 2 GNs)
export const mockUsers: User[] = [
  {
    id: 'user-ds-1',
    email: 'admin@ds.gov.lk',
    name: 'Divisional Secretary Perera',
    role: 'DS',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    active: true
  },
  {
    id: 'user-gn-1',
    email: 'gn1@colombo.gov.lk',
    name: 'Grama Niladhari Silva',
    role: 'GN',
    wasamaId: 'wasama-1',
    wasamaName: 'Colombo North',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-12T08:00:00Z',
    active: true
  },
  {
    id: 'user-gn-2',
    email: 'gn2@colombo.gov.lk',
    name: 'Grama Niladhari Fernando',
    role: 'GN',
    wasamaId: 'wasama-2',
    wasamaName: 'Colombo South',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-12T08:00:00Z',
    active: true
  }
];

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    applicationId: 'app-1',
    originalFileUrl: '/mock-files/birth-certificate-1.pdf',
    fileType: 'pdf',
    uploadedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'doc-2',
    applicationId: 'app-1',
    originalFileUrl: '/mock-files/photo-1.jpg',
    fileType: 'image',
    uploadedAt: '2024-01-20T10:32:00Z'
  },
  {
    id: 'doc-3',
    applicationId: 'app-2',
    originalFileUrl: '/mock-files/birth-certificate-2.pdf',
    fileType: 'pdf',
    uploadedAt: '2024-01-18T14:15:00Z'
  }
];

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    applicationId: 'app-1',
    userId: 'user-gn-1',
    userName: 'Grama Niladhari Silva',
    fromStatus: undefined,
    toStatus: 'submitted',
    comment: 'Application submitted by citizen',
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'audit-2', 
    applicationId: 'app-1',
    userId: 'user-gn-1',
    userName: 'Grama Niladhari Silva',
    fromStatus: 'submitted',
    toStatus: 'received',
    comment: 'Application received and assigned to GN',
    createdAt: '2024-01-20T11:00:00Z'
  },
  {
    id: 'audit-3',
    applicationId: 'app-1',
    userId: 'user-gn-1',
    userName: 'Grama Niladhari Silva',
    fromStatus: 'received',
    toStatus: 'read',
    comment: 'Document reviewed by GN',
    createdAt: '2024-01-20T15:30:00Z'
  }
];

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: 'app-1',
    applicantName: 'Kasun Rajapaksa',
    applicantPhone: '+94771234567',
    applicationType: 'new_nic',
    wasamaId: 'wasama-1',
    wasamaName: 'Colombo North',
    status: 'read',
    submittedAt: '2024-01-20T10:30:00Z',
    assignedGnId: 'user-gn-1',
    assignedGnName: 'Grama Niladhari Silva',
    currentPdfUrl: '/mock-files/birth-certificate-1.pdf',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'app-2',
    applicantName: 'Nimal Perera',
    applicantPhone: '+94777654321',
    applicationType: 'new_nic',
    wasamaId: 'wasama-1',
    wasamaName: 'Colombo North',
    status: 'confirmed_by_gn',
    submittedAt: '2024-01-18T14:15:00Z',
    assignedGnId: 'user-gn-1',
    assignedGnName: 'Grama Niladhari Silva',
    currentPdfUrl: '/mock-files/birth-certificate-2.pdf',
    signedPdfUrl: '/mock-files/signed-birth-certificate-2.pdf',
    createdAt: '2024-01-18T14:15:00Z',
    updatedAt: '2024-01-19T09:45:00Z'
  },
  {
    id: 'app-3',
    applicantName: 'Saman Silva',
    applicantPhone: '+94712345678',
    applicationType: 'new_nic',
    wasamaId: 'wasama-2',
    wasamaName: 'Colombo South',
    status: 'submitted',
    submittedAt: '2024-01-22T09:00:00Z',
    assignedGnId: 'user-gn-2',
    assignedGnName: 'Grama Niladhari Fernando',
    currentPdfUrl: '/mock-files/birth-certificate-3.pdf',
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z'
  },
  {
    id: 'app-4',
    applicantName: 'Kamala Jayawardena',
    applicantNic: '197845678901',
    applicantPhone: '+94789876543',
    applicationType: 'document_verification',
    wasamaId: 'wasama-1',
    wasamaName: 'Colombo North',
    status: 'hold',
    submittedAt: '2024-01-15T16:20:00Z',
    assignedGnId: 'user-gn-1',
    assignedGnName: 'Grama Niladhari Silva',
    currentPdfUrl: '/mock-files/birth-certificate-4.pdf',
    createdAt: '2024-01-15T16:20:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  },
  {
    id: 'app-5',
    applicantName: 'Ruwan Kumara',
    applicantPhone: '+94765432109',
    applicationType: 'new_nic',
    wasamaId: 'wasama-2',
    wasamaName: 'Colombo South',
    status: 'sent_to_drp',
    submittedAt: '2024-01-10T11:45:00Z',
    assignedGnId: 'user-gn-2',
    assignedGnName: 'Grama Niladhari Fernando',
    dsId: 'user-ds-1',
    dsName: 'Divisional Secretary Perera',
    currentPdfUrl: '/mock-files/birth-certificate-5.pdf',
    signedPdfUrl: '/mock-files/signed-birth-certificate-5.pdf',
    createdAt: '2024-01-10T11:45:00Z',
    updatedAt: '2024-01-21T14:20:00Z'
  }
];

// Helper functions for getting related data
export const getApplicationsForGN = (gnId: string): Application[] => {
  const gn = mockUsers.find(u => u.id === gnId && u.role === 'GN');
  if (!gn || !gn.wasamaId) return [];
  
  return mockApplications.filter(app => app.wasamaId === gn.wasamaId);
};

export const getDocumentsForApplication = (applicationId: string): Document[] => {
  return mockDocuments.filter(doc => doc.applicationId === applicationId);
};

export const getAuditLogsForApplication = (applicationId: string): AuditLog[] => {
  return mockAuditLogs.filter(log => log.applicationId === applicationId);
};

// Generate additional mock applications for testing
export const generateMockApplications = (count: number = 10): Application[] => {
  const statuses: Application['status'][] = ['submitted', 'received', 'read', 'confirmed_by_gn', 'hold'];
  const applicationTypes: ApplicationType[] = ['new_nic', 'document_verification'];
  const names = ['Sunil', 'Kamani', 'Pradeep', 'Sanduni', 'Chamara', 'Niluka', 'Roshan', 'Madhavi'];
  const surnames = ['Silva', 'Perera', 'Fernando', 'Kumara', 'Jayawardena', 'Rajapaksa', 'Gunasekara'];
  
  return Array.from({ length: count }, (_, i) => {
    const applicationType = applicationTypes[i % applicationTypes.length];
    return {
      id: `generated-app-${i + 1}`,
      applicantName: `${names[i % names.length]} ${surnames[i % surnames.length]}`,
      applicantNic: applicationType === 'document_verification' ? `19${80 + (i % 20)}${String(12345678 + i).slice(-8)}` : undefined,
      applicantPhone: `+9477${String(1000000 + i).slice(-7)}`,
      applicationType,
      wasamaId: mockWasamas[i % mockWasamas.length].id,
      wasamaName: mockWasamas[i % mockWasamas.length].name,
      status: statuses[i % statuses.length],
      submittedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      assignedGnId: mockUsers.find(u => u.role === 'GN' && u.wasamaId === mockWasamas[i % mockWasamas.length].id)?.id,
      assignedGnName: mockUsers.find(u => u.role === 'GN' && u.wasamaId === mockWasamas[i % mockWasamas.length].id)?.name,
      currentPdfUrl: `/mock-files/birth-certificate-${i + 1}.pdf`,
      signedPdfUrl: ['confirmed_by_gn', 'sent_to_drp'].includes(statuses[i % statuses.length]) 
        ? `/mock-files/signed-birth-certificate-${i + 1}.pdf` : undefined,
      createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString()
    };
  });
};