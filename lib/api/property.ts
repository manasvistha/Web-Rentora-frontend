import axios from './axios';
import { API } from './endpoints';

export interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  availability: { startDate: string; endDate: string }[];
  images: string[];
  owner: {
    _id?: string;
    name: string;
    email: string;
    id?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'available' | 'assigned' | 'booked';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export const getProperties = async () => {
  const response = await axios.get(API.PROPERTY.LIST);
  return response.data;
};

export const getProperty = async (id: string) => {
  const response = await axios.get(API.PROPERTY.GET(id));
  return response.data;
};

export const getMyProperties = async () => {
  const response = await axios.get(API.PROPERTY.MY_PROPERTIES);
  return response.data;
};

export const createProperty = async (formData: FormData) => {
  // Use the configured axios instance with authentication interceptors
  // The interceptor already handles removing Content-Type for FormData
  const response = await axios.post(API.PROPERTY.CREATE, formData);
  return response.data;
};

export const updateProperty = async (id: string, data: Partial<Property>) => {
  const response = await axios.put(API.PROPERTY.UPDATE(id), data);
  return response.data;
};

export const deleteProperty = async (id: string) => {
  const response = await axios.delete(API.PROPERTY.DELETE(id));
  return response.data;
};

export const searchProperties = async (query: { location?: string; minPrice?: number; maxPrice?: number }) => {
  const response = await axios.get(API.PROPERTY.SEARCH, { params: query });
  return response.data;
};