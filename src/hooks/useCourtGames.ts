import { useQuery } from '@tanstack/react-query';
import { courtApi } from '@/apis/courtApi';
import { queryKeys } from '@/lib/queryClient';

export const useCourtGames = (courtId: number | undefined) => {
  return useQuery({
    queryKey: queryKeys.courtGames(courtId || 0),
    queryFn: () => courtApi.getCourtGames(courtId || 0),
    enabled: !!courtId, // courtId가 있을 때만 쿼리 실행
  });
};
