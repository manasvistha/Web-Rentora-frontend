import axios from './axios';
import { API } from './endpoints';

export type NotificationItem = {
  _id: string;
  user: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
};


export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  page: number;
  pages: number;
}

export const getNotifications = async (page = 1, limit = 20): Promise<NotificationListResponse> => {
  const res = await axios.get(API.NOTIFICATION.LIST + `?page=${page}&limit=${limit}`);
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await axios.put(API.NOTIFICATION.MARK_READ(id));
  return res.data;
};

export default {
  getNotifications,
  markNotificationRead,
};
