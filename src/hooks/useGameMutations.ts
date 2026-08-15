import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gameApi, CreateGameData } from '@/apis/gameApi';
import { queryKeys } from '@/lib/queryClient';

// 게임 생성 mutation
export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGameData) => gameApi.createGame(data),
    onSuccess: (data) => {
      // 해당 농구장의 게임 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.courtGames(data.courtId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games });
    },
  });
};

// 게임 참여 mutation
export const useJoinGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      userId,
      role,
    }: {
      gameId: number;
      userId: number;
      role: 'player' | 'referee' | 'spectator';
    }) => gameApi.joinGame(gameId, userId, role),
    onSuccess: (data) => {
      // 해당 농구장의 게임 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.courtGames(data.courtId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games });
    },
  });
};

// 게임 삭제 mutation
export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: number) => gameApi.deleteGame(gameId),
    onSuccess: () => {
      // 모든 게임 목록 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.games });
      // 모든 농구장의 게임 목록도 무효화
      queryClient.invalidateQueries({ queryKey: ['courtGames'] });
    },
  });
};

// 게임 나가기 mutation
export const useLeaveGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, userId }: { gameId: number; userId: number }) =>
      gameApi.leaveGame(gameId, userId),
    onSuccess: (data) => {
      // data가 null이면 게임이 삭제된 것이므로 모든 쿼리 무효화
      if (data === null) {
        queryClient.invalidateQueries({ queryKey: queryKeys.games });
        queryClient.invalidateQueries({ queryKey: ['courtGames'] });
      } else {
        // 해당 농구장의 게임 목록 무효화
        queryClient.invalidateQueries({ queryKey: queryKeys.courtGames(data.courtId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.games });
      }
    },
  });
};
