import api from './axios';
import { Court, Game } from '@/types';

export const courtApi = {
  getCourts: async () => {
    const response = await api.get<Court[]>('/courts');
    return response.data;
  },

  getCourtGames: async (courtId: number) => {
    const response = await api.get<Game[]>(`/courts/${courtId}/games`);
    return response.data;
  },
};
