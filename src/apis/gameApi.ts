import api from './axios';
import { GetNearbyGamesResponse, GameResponse, UserGame } from '@/types';

export interface CreateGameData {
  courtId: number;
  creatorUserId: number;
  maxPlayers: number;
  scheduledTime: string;
}

export interface NearbyGamesParams {
  latitude: number;
  longitude: number;
  radius?: number; // km 단위
}

const DEFAULT_RADIUS = 5;

export const gameApi = {
  // 근처 게임 검색
  getNearbyGames: async (params: NearbyGamesParams) => {
    const response = await api.get<GetNearbyGamesResponse>(
      `/games/nearby?lat=${params.latitude}&lng=${params.longitude}&radius=${params.radius || DEFAULT_RADIUS}`,
    );
    return response.data;
  },

  // 게임 생성
  createGame: async (data: CreateGameData): Promise<GameResponse> => {
    const response = await api.post<GameResponse>('/games', data);
    return response.data;
  },

  // 게임 상세 조회
  getGame: async (id: number) => {
    const response = await api.get<GameResponse>(`/games/${id}`);
    return response.data;
  },

  // 게임 참여
  joinGame: async (gameId: number, userId: number, role: 'player' | 'referee' | 'spectator') => {
    const response = await api.post<GameResponse>(`/games/${gameId}/join`, {
      userId: userId,
      role: role,
    });
    return response.data;
  },

  // 게임 나가기 (204 응답 시 게임이 삭제되어 null 반환)
  leaveGame: async (gameId: number, userId: number): Promise<GameResponse | null> => {
    const response = await api.delete<GameResponse>(`/games/${gameId}/leave?userId=${userId}`);
    // 204 No Content인 경우 null 반환 (게임 삭제됨)
    if (response.status === 204) {
      return null;
    }
    return response.data;
  },

  // 게임 삭제 (생성자만)
  deleteGame: async (gameId: number) => {
    const response = await api.delete<Promise<null>>(`/games/${gameId}`);
    return response.data;
  },

  // 진행 중인 참여 게임 조회 (모집_중, 모집_완료)
  getOngoingGames: async (userId: number) => {
    const response = await api.get<UserGame[]>(`/users/${userId}/games/ongoing`);
    return response.data;
  },

  // 과거 참여 게임 조회 (게임_종료)
  getPastGames: async (userId: number) => {
    const response = await api.get<UserGame[]>(`/users/${userId}/games/past`);
    return response.data;
  },
};
