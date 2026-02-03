// List of api routes
// Single source of truth for api endpoints

export const API = {
 AUTH:{
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
   PROFILE: '/api/auth/profile',
  UPDATE_PROFILE: (id: string) => `/api/auth/${id}`,
 },
 ADMIN: {
  LIST_USERS: '/api/admin/users',
  CREATE_USER: '/api/admin/users',
  GET_USER: (id: string) => `/api/admin/users/${id}`,
  UPDATE_USER: (id: string) => `/api/admin/users/${id}`,
  DELETE_USER: (id: string) => `/api/admin/users/${id}`,
 }
};
