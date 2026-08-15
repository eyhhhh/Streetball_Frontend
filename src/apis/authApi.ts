import api from './axios';
import { LoginRequest, LoginResponse, RegisterData } from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/users/login', credentials);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<{ success: boolean; data: { user: any; token: string } }> => {
    const response = await api.post('/users/signup', data);
    return response.data;
  },
};
