import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 쿼리 키 정의
export const queryKeys = {
  courtGames: (courtId: number) => ['courtGames', courtId] as const,
  courts: ['courts'] as const,
  games: ['games'] as const,
};

