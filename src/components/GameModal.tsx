import { useState } from 'react';
import { Game } from '@/types';
import { gameApi } from '@/apis/gameApi';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import Modal from './Modal';
import { formatToKST } from '@/lib/dateUtils';
import XIcon from '@assets/x-circle.svg';

interface GameModalProps {
  game: Game | null;
  onClose: () => void;
}

export default function GameModal({ game, onClose }: GameModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { updateGame } = useGameStore();

  if (!game) return null;
  console.log(game);

  const isCreator = user?.name === game.hostName;
  const isFull = game.currentPlayers >= game.maxPlayers;
  const canJoin = !isCreator && !isFull && game.status === '모집_중';

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await gameApi.joinGame(game.gameId, user?.id || 0, 'player');
      updateGame(game.gameId, response);
      alert('게임에 참여했습니다!');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '참여에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    setError(null);

    try {
      await gameApi.deleteGame(game.gameId);
      alert('게임이 삭제되었습니다.');
      onClose();
      window.location.reload(); // 간단하게 새로고침
    } catch (err: any) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!game} onClose={onClose} title={game.courtName}>
      <div className="space-y-4">
        {/* 상태 배지 */}
        <div className="flex gap-2 items-center">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              game.status === '모집_중'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {game.status === '모집_중' ? '모집 중' : game.status}
          </span>
          <span className="text-sm text-gray-600">
            {game.currentPlayers} / {game.maxPlayers}명
          </span>
          <span>{game.hasBall ? '🏀' : <XIcon />}</span>
        </div>

        {/* 게임 정보 */}
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">농구장</h3>
            <p className="text-gray-600">{game.courtName}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700">일시</h3>
            <p className="text-gray-600">{formatToKST(game.scheduledTime)}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700">호스트</h3>
            <p className="text-gray-600">{game.hostName || '없음'}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700">심판</h3>
            <p className="text-gray-600">{game.referee || '없음'}</p>
          </div>

          {game.playerNames.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700">참가자</h3>
              <p className="text-gray-600">{game.playerNames.join(', ')}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700">생성 일시</h3>
            <p className="text-gray-600">{formatToKST(game.createdAt)}</p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-4">
          {isCreator ? (
            <>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 font-semibold text-white bg-red-600 rounded-lg transition-colors duration-200 hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? '처리 중...' : '게임 삭제'}
              </button>
              <button onClick={onClose} className="flex-1 btn-secondary">
                닫기
              </button>
            </>
          ) : canJoin ? (
            <>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="flex-1 btn-primary disabled:bg-gray-400"
              >
                {loading ? '처리 중...' : '참여하기'}
              </button>
              <button onClick={onClose} className="flex-1 btn-secondary">
                취소
              </button>
            </>
          ) : (
            <button onClick={onClose} className="flex-1 btn-secondary">
              닫기
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
