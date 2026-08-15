import { useState } from 'react';
import { Court } from '@/types';
import Modal from './Modal';
import { useAuthStore } from '@/store/authStore';
import { useCourtGames } from '@/hooks/useCourtGames';
import { useJoinGame, useDeleteGame } from '@/hooks/useGameMutations';
import { formatToKST } from '@/lib/dateUtils';
import XIcon from '@/assets/x-circle.svg';

interface CourtGamesModalProps {
  court: Court | null;
  // games: Game[];
  onClose: () => void;
  onCreateGame: () => void;
}

export default function CourtGamesModal({
  court,
  // games,
  onClose,
  onCreateGame,
}: CourtGamesModalProps) {
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // React Query hooks
  const { data: courtGames = [], isLoading } = useCourtGames(court?.courtId);
  const joinGameMutation = useJoinGame();
  const deleteGameMutation = useDeleteGame();

  // 게임 필터링 및 정렬: 게임_종료만 제외, 시간 오름차순
  const filteredGames = courtGames
    .filter((game) => game.status !== '게임_종료')
    .sort((a, b) => {
      // 시간 오름차순 정렬 (가까운 시간부터)
      const timeA = new Date(
        a.scheduledTime.endsWith('Z') ? a.scheduledTime : `${a.scheduledTime}Z`,
      );
      const timeB = new Date(
        b.scheduledTime.endsWith('Z') ? b.scheduledTime : `${b.scheduledTime}Z`,
      );
      return timeA.getTime() - timeB.getTime();
    });

  const handleJoinGame = async (gameId: number, role: 'player' | 'referee' | 'spectator') => {
    setError(null);

    try {
      await joinGameMutation.mutateAsync({
        gameId,
        userId: user?.id || 0,
        role,
      });
      alert(
        role === 'player'
          ? '게임에 참가자로 참여했습니다!'
          : role === 'referee'
            ? '게임에 심판으로 참여했습니다!'
            : '게임에 관전자로 참여했습니다!',
      );
      setSelectedGameId(null); // 슬라이드 닫기
    } catch (err: any) {
      setError(err.response?.data?.message || '참여에 실패했습니다.');
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setError(null);

    try {
      await deleteGameMutation.mutateAsync(gameId);
      alert('게임이 삭제되었습니다.');
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const loading = isLoading || joinGameMutation.isPending || deleteGameMutation.isPending;

  if (!court) return null;

  return (
    <Modal isOpen={!!court} onClose={onClose} title={court.courtName}>
      <div className="flex flex-col flex-1 gap-4 min-h-0">
        {/* 농구장 정보 */}
        <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{court.isIndoor ? '🏢 실내' : '🌤️ 실외'}</span>
            <span className="text-sm text-gray-600">게임 {filteredGames.length}개</span>
          </div>
        </div>

        {/* 게임 리스트 */}
        <div className="flex flex-col flex-1 min-h-0">
          <h3 className="flex-shrink-0 mb-2 text-sm font-semibold text-gray-700">진행 중인 게임</h3>

          {filteredGames.length === 0 ? (
            <div className="flex flex-col flex-1 justify-center items-center py-8 text-center">
              <p className="mb-4 text-gray-500">아직 게임이 없습니다</p>
              <button onClick={onCreateGame} className="btn-primary">
                첫 게임 만들기
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 space-y-2">
              {filteredGames.map((game) => {
                const isHost = user?.name === game.hostName;
                const isFull = game.currentPlayers >= game.maxPlayers;
                const isParticipating =
                  game.playerNames.includes(user?.name || '') || game.referee === user?.name;
                const canJoin = !isHost && !isFull && game.status === '모집_중' && !isParticipating;
                const isSelected = selectedGameId === game.gameId;

                const displayTime = formatToKST(game.scheduledTime, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={game.gameId}
                    className="overflow-hidden relative rounded-lg border border-gray-200"
                  >
                    {/* 슬라이드 배경 (버튼들) */}
                    {canJoin && (
                      <div className="flex absolute inset-0 flex-col gap-2 justify-center items-start pl-4 bg-gray-100">
                        <button
                          onClick={() => handleJoinGame(game.gameId, 'player')}
                          disabled={loading}
                          className="w-[80px] p-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-sm font-semibold rounded transition-colors"
                        >
                          참가자 참여
                        </button>
                        <button
                          onClick={() => handleJoinGame(game.gameId, 'referee')}
                          disabled={loading}
                          className="w-[80px] p-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm font-semibold rounded transition-colors"
                        >
                          심판 참여
                        </button>
                        <button
                          onClick={() => handleJoinGame(game.gameId, 'spectator')}
                          disabled={loading}
                          className="w-[80px] p-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white text-sm font-semibold rounded transition-colors"
                        >
                          관전자 참여
                        </button>
                      </div>
                    )}

                    {/* 슬라이드 가능한 콘텐츠 */}
                    <div
                      onClick={() => {
                        if (canJoin) {
                          setSelectedGameId(isSelected ? null : game.gameId);
                        }
                      }}
                      className={`relative bg-white p-3 transition-transform duration-300 ${
                        canJoin ? 'cursor-pointer hover:border-orange-300' : ''
                      } ${isSelected ? 'translate-x-28' : 'translate-x-0'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex gap-2 items-center mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                game.status === '모집_중'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {game.status === '모집_중' ? '모집 중' : game.status}
                            </span>
                            <span className="text-xs text-gray-600">
                              {game.currentPlayers} / {game.maxPlayers}명{' '}
                            </span>
                            <span>
                              {game.hasBall ? (
                                '🏀'
                              ) : (
                                <img src={XIcon} alt="basketball" className="w-4 h-4" />
                              )}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{displayTime}</p>
                          {game.hostName && (
                            <p className="mt-1 text-xs text-gray-500">호스트: {game.hostName}</p>
                          )}
                        </div>
                        {game.status === '게임_종료' ? (
                          <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                            게임 종료
                          </span>
                        ) : isHost ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGame(game.gameId);
                            }}
                            disabled={loading}
                            className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded transition-colors hover:bg-red-700 disabled:bg-gray-400"
                          >
                            삭제
                          </button>
                        ) : isParticipating ? (
                          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded">
                            참여중
                          </span>
                        ) : isFull ? (
                          <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                            마감
                          </span>
                        ) : game.status === '모집_완료' ? (
                          <span className="px-3 py-1 text-xs font-semibold text-yellow-600 bg-yellow-50 rounded">
                            모집 완료
                          </span>
                        ) : null}
                      </div>

                      {game.playerNames.length > 0 && (
                        <div className="pt-2 mt-2 text-xs text-gray-500 border-t border-gray-100">
                          참가자: {game.playerNames.join(', ')}
                        </div>
                      )}
                      {game.spectatorNames.length > 0 && (
                        <div className="pt-0 mt-2 text-xs text-gray-500">
                          관전자: {game.spectatorNames.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex-shrink-0 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex flex-shrink-0 gap-2 pt-2">
          {filteredGames.length > 0 && (
            <button onClick={onCreateGame} className="flex-1 btn-primary">
              새 게임 만들기
            </button>
          )}
          <button onClick={onClose} className="flex-1 btn-secondary">
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
