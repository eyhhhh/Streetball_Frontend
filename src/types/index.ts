import { LoginRequest, LoginResponse, LoginCredentials } from './auth.ts';
import { Game, GetNearbyGamesResponse, GameResponse } from './game.ts';
import { Court } from './court.ts';

export type { LoginRequest, LoginResponse, LoginCredentials };
export type { Game, GetNearbyGamesResponse, GameResponse };
export type { Court };

export interface User {
  id: number;
  name: string;
  hasBall: boolean;
  locationLat?: number;
  locationLng?: number;
}

// 사용자 게임 참여 목록 조회용 타입
export type GameStatus = '모집_중' | '모집_완료' | '게임_종료';

export interface UserGame {
  gameId: number;
  courtId: number;
  courtName: string;
  maxPlayers: number;
  currentPlayers: number;
  status: GameStatus;
  scheduledTime: string;
  createdAt: string;
  referee: string | null;
  hostName: string;
  playerNames: string[];
  spectatorNames: string[];
  locationLat: number;
  locationLng: number;
}

export interface Participation {
  id: number;
  game_id: number;
  user_id: number;
  role: 'creator' | 'player';
  joined_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface RegisterData {
  name: string;
  password: string;
  hasBall: boolean;
}

// 리뷰 관련 타입
export type RevieweeRole = 'PLAYER' | 'REFEREE';

export interface Review {
  ratingId: number;
  gameId: number;
  reviewerName: string;
  revieweeName: string;
  revieweeRole: RevieweeRole;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  gameId: number;
  revieweeName: string;
  revieweeRole: RevieweeRole;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
}

export interface UserRatingSummary {
  userId: number;
  userName: string;
  playScore: number;
  playCount: number;
  refScore: number;
  refCount: number;
}
