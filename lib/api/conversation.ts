import axios from './axios';
import { API } from './endpoints';

export interface Message {
  sender: string | { _id?: string; name?: string };
  content: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{ _id: string; name?: string; email?: string }>;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt: string;
}

export const createConversation = async (participantIds: string[]) => {
  const res = await axios.post(API.CONVERSATION.CREATE, { participants: participantIds });
  return res.data as Conversation;
};

export const getConversations = async () => {
  const res = await axios.get(API.CONVERSATION.LIST);
  return res.data as Conversation[];
};

export const getConversation = async (id: string) => {
  const res = await axios.get(API.CONVERSATION.GET(id));
  return res.data as Conversation;
};

export const sendMessage = async (conversationId: string, content: string) => {
  const res = await axios.post(API.CONVERSATION.SEND_MESSAGE(conversationId), { conversationId, content });
  return res.data as Conversation;
};

export default { createConversation, getConversations, getConversation, sendMessage };