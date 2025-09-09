// API endpoint paths for backend integration

export const API_PATHS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
  },

  // User management endpoints
  // USERS: {
  //   BASE: '/users',
  //   GET_BY_ID: (id: string) => `/users/${id}`,
  //   UPDATE: (id: string) => `/users/${id}`,
  //   DELETE: (id: string) => `/users/${id}`,
  //   CREATE_GN: '/users',
  //   PENDING_GN: '/users/gn/pending',
  //   APPROVE_GN: (id: string) => `/users/gn/${id}/approve`,
  //   REJECT_GN: (id: string) => `/users/gn/${id}/reject`,
  //   GET_PENDING_GN: '/users/gn/pending',
  //   GET_ALL_GN: '/users/gn/all',
  //   UPDATE_GN: (id: string) => `/users/gn/${id}`,
  // },

  
USERS: {
  BASE: '/users',
  GET_BY_ID: (id: string) => `/users/${id}`,
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
  CREATE_GN: '/users',
  GET_PENDING_GN: '/users/gn/pending',
  GET_ALL_GN: '/users/gn/all',
  UPDATE_GN: (id: string) => `/users/gn/${id}`,
  // NEW: Single endpoint for status updates
  UPDATE_GN_STATUS: (id: string) => `/users/gn/${id}/status`,

},

  // divisions (Division) management endpoints
  DIVISIONS: {
    BASE: '/divisions',
    GET_BY_ID: (id: string) => `/divisions/${id}`,
    CREATE: '/divisions',
    UPDATE: (id: string) => `/divisions/${id}`,
    DELETE: (id: string) => `/divisions/${id}`,
  },

  // Application management endpoints
  APPLICATIONS: {
    BASE: '/applications',
    GET_BY_DIVISION: (divisionId: string) => `/applications/division/${divisionId}`,
    GET_BY_ID: (id: string) => `/applications/${id}`,
    CREATE: '/applications',
    UPDATE: (id: string) => `/applications/${id}`,
    DELETE: (id: string) => `/applications/${id}`,
    UPDATE_STATUS: (id: string) => `/applications/${id}/status`,
    GET_BY_GN: (gnId: string) => `/applications/gn/${gnId}`,
    GET_BY_DS: (dsId: string) => `/applications/ds/${dsId}`,
    UPLOAD_DOCUMENT: (id: string) => `/applications/${id}/documents`,
    SIGN: (id: string) => `/applications/${id}/sign`,
  },

  // Document management endpoints
  DOCUMENTS: {
    BASE: '/documents',
    GET_BY_ID: (id: string) => `/documents/${id}`,
    GET_BY_APPLICATION: (applicationId: string) => `/documents/application/${applicationId}`,
    UPLOAD: '/documents/upload',
    DELETE: (id: string) => `/documents/${id}`,
  },

  // Audit log endpoints
  AUDIT_LOGS: {
    BASE: '/audit-logs',
    GET_BY_APPLICATION: (applicationId: string) => `/audit-logs/application/${applicationId}`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    SEND: '/notifications/send',
    GET_BY_USER: (userId: string) => `/notifications/user/${userId}`,
  },

  // File upload endpoints
  FILES: {
    UPLOAD: '/files/upload',
    GET: (filename: string) => `/files/${filename}`,
    DELETE: (filename: string) => `/files/${filename}`,
  },
} as const;

// Helper function to build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function to build paginated endpoint
export const buildPaginatedUrl = (
  basePath: string, 
  page: number = 1, 
  limit: number = 10, 
  additionalParams?: Record<string, any>
): string => {
  const params = { page, limit, ...additionalParams };
  return `${basePath}${buildQueryString(params)}`;
};