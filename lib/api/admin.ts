// Admin API layer
// Call admin endpoints from backend

import axios from "./axios";
import { API } from "./endpoints";

export const getUsers = async () => {
    try {
        console.log('Fetching users list from admin endpoint');
        const response = await axios.get(API.ADMIN.LIST_USERS);
        console.log('Users response:', response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error('Failed to load users', err);
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to load users";
        throw {
            message: errorMessage,
            status: err.response?.status,
            data: err.response?.data
        };
    }
};

export const getUserById = async (id: string) => {
    try {
        console.log('Fetching user with id:', id);
        const response = await axios.get(API.ADMIN.GET_USER(id));
        console.log('User response:', response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error('Failed to load user', err);
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to load user";
        throw {
            message: errorMessage,
            status: err.response?.status,
            data: err.response?.data
        };
    }
};

export const createUser = async (formData: FormData) => {
    try {
        console.log('Creating user');
        const response = await axios.post(API.ADMIN.CREATE_USER, formData);
        console.log('Create user response:', response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error('Failed to create user', err);
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to create user";
        throw {
            message: errorMessage,
            status: err.response?.status,
            data: err.response?.data
        };
    }
};

export const updateUser = async (id: string, formData: FormData) => {
    try {
        console.log('Updating user with id:', id);
        const response = await axios.put(API.ADMIN.UPDATE_USER(id), formData);
        console.log('Update user response:', response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error('Failed to update user', err);
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to update user";
        throw {
            message: errorMessage,
            status: err.response?.status,
            data: err.response?.data
        };
    }
};

export const deleteUser = async (id: string) => {
    try {
        console.log('Deleting user with id:', id);
        const response = await axios.delete(API.ADMIN.DELETE_USER(id));
        console.log('Delete user response:', response.data);
        return response.data;
    } catch (err: Error | any) {
        console.error('Failed to delete user', err);
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to delete user";
        throw {
            message: errorMessage,
            status: err.response?.status,
            data: err.response?.data
        };
    }
};
