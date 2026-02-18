import axios from './axios';
import { API } from './endpoints';

export interface Booking {
  _id: string;
  property: string | { _id: string; title?: string; location?: string; price?: number };
  user: string | { _id: string; name?: string; email?: string };
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export const createBooking = async (payload: { propertyId: string; message?: string }) => {
  const response = await axios.post(API.BOOKING.CREATE, payload);
  return response.data as Booking;
};

export const getMyBookings = async () => {
  const response = await axios.get(API.BOOKING.MY);
  return response.data as Booking[];
};

export const getBookingsByProperty = async (propertyId: string) => {
  const response = await axios.get(API.BOOKING.BY_PROPERTY(propertyId));
  return response.data as Booking[];
};

export const updateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
  const response = await axios.put(API.BOOKING.UPDATE_STATUS(bookingId), { status });
  return response.data as Booking;
};
