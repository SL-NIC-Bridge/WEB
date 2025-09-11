import apiClient from '@/lib/axios';
import { API_PATHS, buildPaginatedUrl, buildQueryString } from '@/lib/apiPaths';
import type {
  User,
  GnDivision,
  Application,
  Document,
  AuditLog,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
  CreateGnForm,
  StatusUpdateForm,
} from '@/types';


interface PendingRegistration extends User {
  division?: {
    id: string;
    name: string;
    code: string;
  };
}
// Authentication API Services
export const authApiService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_PATHS.AUTH.LOGIN,
      credentials
    );
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(API_PATHS.AUTH.ME);
    return response.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_PATHS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_PATHS.AUTH.LOGOUT);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};


export const userApiService = {
  getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const url = buildPaginatedUrl(API_PATHS.USERS.BASE, page, limit);
    const response = await apiClient.get<PaginatedResponse<User>>(url);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      API_PATHS.USERS.GET_BY_ID(id)
    );
    return response.data.data;
  },

  createGN: async (gnData: CreateGnForm): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_PATHS.USERS.CREATE_GN,
      gnData
    );
    return response.data.data;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      API_PATHS.USERS.UPDATE(id),
      userData
    );
    return response.data.data;
  },

    // New method to handle GN creation with signature file upload
  createGNWithSignature: async (formData: FormData): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_PATHS.USERS.CREATE_GN_WITH_SIGNATURE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Update only the profile fields we allow here (firstName, lastName).
   * This convenience method ensures email is not changed by callers.
   */
  updateProfile: async (
    id: string,
    profile: { firstName?: string; lastName?: string }
  ): Promise<User> => {
    const payload: Partial<User> = {};
    if (profile.firstName !== undefined) payload.firstName = profile.firstName;
    if (profile.lastName !== undefined) payload.lastName = profile.lastName;

    // Use the main update endpoint to persist the profile changes.
    const response = await apiClient.put<ApiResponse<User>>(
      API_PATHS.USERS.UPDATE(id),
      payload
    );
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(API_PATHS.USERS.DELETE(id));
  },

  // GN MANAGEMENT METHODS
  getPendingRegistrations: async (): Promise<PendingRegistration[]> => {
    const response = await apiClient.get<ApiResponse<PendingRegistration[]>>(
      API_PATHS.USERS.GET_PENDING_GN
    );
    return response.data.data;
  },

  getAllGNs: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      API_PATHS.USERS.GET_ALL_GN
    );
    return response.data.data;
  },

  updateGNStatus: async (
  userId: string, 
  statusData: { status: string; comment?: string }
): Promise<{ id: string; currentStatus: string; message: string }> => {
  const response = await apiClient.put<ApiResponse<{ id: string; currentStatus: string; message: string }>>(
    API_PATHS.USERS.UPDATE_GN_STATUS(userId),
    {
      currentStatus: statusData.status, // <-- map `status` to `currentStatus`
      comment: statusData.comment,
    }
  );
  return response.data.data;
},


  // CONVENIENCE METHODS (optional - these use the updateGNStatus method internally)
  approveGN: async (userId: string, comment?: string) => {
    return userApiService.updateGNStatus(userId, { 
      status: 'ACTIVE', 
      comment 
    });
  },

  rejectGN: async (userId: string, comment?: string) => {
    return userApiService.updateGNStatus(userId, { 
      status: 'REJECTED', 
      comment 
    });
  },

  deactivateGN: async (userId: string, comment?: string) => {
    return userApiService.updateGNStatus(userId, { 
      status: 'DEACTIVATED', 
      comment 
    });
  },

  reactivateGN: async (userId: string, comment?: string) => {
    return userApiService.updateGNStatus(userId, { 
      status: 'ACTIVE', 
      comment 
    });
  },

  updateGN: async (id: string, gnData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      API_PATHS.USERS.UPDATE_GN(id),
      gnData
    );
    return response.data.data;
  },
};

// GnDivision (Division) API Services
export const divisionApiService = {
  getGnDivisions: async (page = 1, limit = 10): Promise<PaginatedResponse<GnDivision>> => {
    const url = buildPaginatedUrl(API_PATHS.DIVISIONS.BASE, page, limit);
    const response = await apiClient.get<PaginatedResponse<GnDivision>>(url);
    return response.data;
  },

  getGnDivisionById: async (id: string): Promise<GnDivision> => {
    const response = await apiClient.get<ApiResponse<GnDivision>>(
      API_PATHS.DIVISIONS.GET_BY_ID(id)
    );
    return response.data.data;
  },

  createGnDivision: async (divisionData: { name: string; code: string }): Promise<GnDivision> => {
    const response = await apiClient.post<ApiResponse<GnDivision>>(
      API_PATHS.DIVISIONS.CREATE,
      divisionData
    );
    return response.data.data;
  },

  updateGnDivision: async (id: string, wasamaData: Partial<GnDivision>): Promise<GnDivision> => {
    const response = await apiClient.put<ApiResponse<GnDivision>>(
      API_PATHS.DIVISIONS.UPDATE(id),
      wasamaData
    );
    return response.data.data;
  },

  deleteGnDivision: async (id: string): Promise<void> => {
    await apiClient.delete(API_PATHS.DIVISIONS.DELETE(id));
  },
};

// Application API Services
export const applicationApiService = {
  getApplications: async (
    page = 1,
    limit = 10,
    filters?: { status?: string; type?: string; search?: string }
  ): Promise<PaginatedResponse<Application>> => {
    const url = buildPaginatedUrl(API_PATHS.APPLICATIONS.BASE, page, limit, filters);
    const response = await apiClient.get<PaginatedResponse<Application>>(url);
    return response.data;
  },

  getApplicationById: async (id: string): Promise<Application> => {
    const response = await apiClient.get<ApiResponse<Application>>(
      API_PATHS.APPLICATIONS.GET_BY_ID(id)
    );
    return response.data.data;
  },

  getApplicationsForDivision: async (divisionId: string): Promise<Application[]> => {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      API_PATHS.APPLICATIONS.GET_BY_DIVISION(divisionId)
    );
    return response.data.data;
  },

  getApplicationsForDS: async (dsId: string): Promise<Application[]> => {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      API_PATHS.APPLICATIONS.GET_BY_DS(dsId)
    );
    return response.data.data;
  },

  createApplication: async (applicationData: Partial<Application>): Promise<Application> => {
    const response = await apiClient.post<ApiResponse<Application>>(
      API_PATHS.APPLICATIONS.CREATE,
      applicationData
    );
    return response.data.data;
  },

  updateApplicationStatus: async (
    id: string,
    statusData: StatusUpdateForm
  ): Promise<Application> => {
    const response = await apiClient.patch<ApiResponse<Application>>(
      API_PATHS.APPLICATIONS.UPDATE_STATUS(id),
      statusData
    );
    return response.data.data;
  },

  // signApplication: async (id: string, signatureData: any): Promise<Application> => {
  //   const response = await apiClient.post<ApiResponse<Application>>(
  //     API_PATHS.APPLICATIONS.SIGN(id),
  //     signatureData
  //   );
  //   return response.data.data;
  // },

  signApplication: async (id: string, formData: FormData): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    API_PATHS.APPLICATIONS.SIGN,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;

  
},

};

// Document API Services
export const documentApiService = {
  getDocumentsForApplication: async (applicationId: string): Promise<Document[]> => {
    const response = await apiClient.get<ApiResponse<Document[]>>(
      API_PATHS.DOCUMENTS.GET_BY_APPLICATION(applicationId)
    );
    return response.data.data;
  },

  uploadDocument: async (applicationId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', applicationId);

    const response = await apiClient.post<ApiResponse<Document>>(
      API_PATHS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(API_PATHS.DOCUMENTS.DELETE(id));
  },
};

// Audit Log API Services
export const auditLogApiService = {
  getAuditLogsForApplication: async (applicationId: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<ApiResponse<AuditLog[]>>(
      API_PATHS.AUDIT_LOGS.GET_BY_APPLICATION(applicationId)
    );
    return response.data.data;
  },
};

// File Upload API Services
export const fileApiService = {
  uploadFile: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{ url: string; filename: string }>>(
      API_PATHS.FILES.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  deleteFile: async (filename: string): Promise<void> => {
    await apiClient.delete(API_PATHS.FILES.DELETE(filename));
  },
};