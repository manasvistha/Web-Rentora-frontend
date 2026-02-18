export const API = {
 AUTH:{
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
   PROFILE: '/api/auth/profile',
  UPDATE_PROFILE: (id: string) => `/api/auth/${id}`,
  REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
 },
 ADMIN: {
  LIST_USERS: '/api/admin/users',
  CREATE_USER: '/api/admin/users',
  GET_USER: (id: string) => `/api/admin/users/${id}`,
  UPDATE_USER: (id: string) => `/api/admin/users/${id}`,
  DELETE_USER: (id: string) => `/api/admin/users/${id}`,
  PROMOTE_USER: (id: string) => `/api/admin/users/${id}/promote`,
 },
 PROPERTY: {
  LIST: '/api/property',
  CREATE: '/api/property',
  GET: (id: string) => `/api/property/${id}`,
  UPDATE: (id: string) => `/api/property/${id}`,
  DELETE: (id: string) => `/api/property/${id}`,
  SEARCH: '/api/property/search',
  MY_PROPERTIES: '/api/property/my',
 },
 CONVERSATION: {
  LIST: '/api/conversation',
  GET: (id: string) => `/api/conversation/${id}`,
  SEND_MESSAGE: (id: string) => `/api/conversation/${id}/message`,
 },
 NOTIFICATION: {
  LIST: '/api/notification',
  MARK_READ: (id: string) => `/api/notification/${id}/read`,
 },
 BOOKING: {
  CREATE: '/api/booking',
      MY: '/api/booking/my',
      BY_PROPERTY: (propertyId: string) => `/api/booking/property/${propertyId}`,
      UPDATE_STATUS: (id: string) => `/api/booking/${id}/status`,
 },
};
