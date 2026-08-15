import api from './axios';
import {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  UserRatingSummary,
} from '@/types';

export const reviewApi = {
  // 평점 생성
  createReview: async (data: CreateReviewRequest) => {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },

  // 평점 조회 (단일)
  getReview: async (ratingId: number) => {
    const response = await api.get<Review>(`/reviews/${ratingId}`);
    return response.data;
  },

  // 내가 특정 게임에서 남긴 평점 목록 조회
  getMyReviewsByGame: async (gameId: number) => {
    const response = await api.get<Review[]>(
      `/reviews/my-reviews/game/${gameId}`,
    );
    return response.data;
  },

  // 특정 게임의 모든 평점 조회
  getGameReviews: async (gameId: number) => {
    const response = await api.get<Review[]>(`/reviews/game/${gameId}`);
    return response.data;
  },

  // 특정 사용자의 평점 요약 조회
  getUserRatingSummary: async (userId: number) => {
    const response = await api.get<UserRatingSummary>(
      `/reviews/user/${userId}/summary`,
    );
    return response.data;
  },

  // 평점 수정
  updateReview: async (ratingId: number, data: UpdateReviewRequest) => {
    const response = await api.put<Review>(`/reviews/${ratingId}`, data);
    return response.data;
  },

  // 평점 삭제
  deleteReview: async (ratingId: number) => {
    await api.delete(`/reviews/${ratingId}`);
  },
};

