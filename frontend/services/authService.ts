
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const register = async (userData: any) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const login = async (userData: any) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const parsed = JSON.parse(userStr);
        return parsed.user || parsed;
    }
    return null;
};

export const updateProfile = async (userData: any) => {
    const userStr = localStorage.getItem('user');
    const token = userStr ? JSON.parse(userStr).token : null;

    // Fallback if token is missing (dev mode or error state)
    if (!token) throw new Error("No auth token found");

    const response = await axios.put(`${API_URL.replace('/auth', '')}/user/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` }
    });

    // Update local storage with new user data but keep token
    if (response.data) {
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedStorageData = {
            ...currentUserData,
            user: { ...(currentUserData.user || {}), ...response.data }
        };
        localStorage.setItem('user', JSON.stringify(updatedStorageData));
        return updatedStorageData.user;
    }
    return response.data;
};
