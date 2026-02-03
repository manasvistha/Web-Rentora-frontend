// List of api routes
// Single source of truth for api endpoints

export const API = {
 AUTH:{
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
   PROFILE: '/api/auth/profile',
   CREATE_USER: '/api/auth/user',
   UPDATE_USER: (id: string) => `/api/auth/${id}`,
 }
};
