import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { gameApi } from '@/apis/gameApi';
import { reviewApi } from '@/apis/reviewApi';
import { UserGame, Review, UserRatingSummary } from '@/types';
import ReviewModal from '@/components/ReviewModal';
import { formatToKST } from '@/lib/dateUtils';

export default function MyPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'completed' | 'ongoing'>('completed');
  const [completedGames, setCompletedGames] = useState<UserGame[]>([]);
  const [ongoingGames, setOngoingGames] = useState<UserGame[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatingSummary | null>(null);
  const [selectedGameReviews, setSelectedGameReviews] = useState<Record<number, Review[]>>({});
  const [expandedGames, setExpandedGames] = useState<Set<number>>(new Set());
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // 진행 중인 게임 조회 (모집_중, 모집_완료)
      const ongoing = await gameApi.getOngoingGames(user.id);
      setOngoingGames(ongoing);

      // 과거 게임 조회 (게임_종료)
      const completed = await gameApi.getPastGames(user.id);
      setCompletedGames(completed);

      // 사용자 평점 요약 조회
      const ratingSummary = await reviewApi.getUserRatingSummary(user.id);
      setUserRatings(ratingSummary);
    } catch (err: any) {
      console.error('데이터 로드 실패:', err);
      setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadGameReviews = async (gameId: number) => {
    try {
      const reviews = await reviewApi.getGameReviews(gameId);
      setSelectedGameReviews((prev) => ({
        ...prev,
        [gameId]: reviews,
      }));
    } catch (err) {
      console.error('리뷰 로드 실패:', err);
    }
  };

  const toggleGameExpand = (gameId: number) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
      // 리뷰 로드
      if (!selectedGameReviews[gameId]) {
        loadGameReviews(gameId);
      }
    }
    setExpandedGames(newExpanded);
  };

  const handleLeaveGame = async (gameId: number) => {
    if (!user) return;
    if (!confirm('정말 게임 참여를 취소하시겠습니까?')) return;

    try {
      const response = await gameApi.leaveGame(gameId, user.id);

      // 204 응답이면 게임이 삭제된 것
      if (!response) {
        alert('게임이 삭제되었습니다.');
      } else {
        alert('게임 참여가 취소되었습니다.');
      }

      loadData(); // 데이터 새로고침
    } catch (err: any) {
      // 204 No Content 응답도 여기로 올 수 있음
      if (err.response?.status === 204) {
        alert('게임이 삭제되었습니다.');
        loadData();
      } else {
        alert(err.response?.data?.message || '게임 참여 취소에 실패했습니다.');
      }
    }
  };

  const handleCreateReview = (gameId: number) => {
    setCurrentGameId(gameId);
    setEditingReview(null);
    setIsReviewModalOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setCurrentGameId(review.gameId);
    setEditingReview(review);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = async (ratingId: number, gameId: number) => {
    if (!confirm('정말 이 평점을 삭제하시겠습니까?')) return;

    try {
      await reviewApi.deleteReview(ratingId);
      alert('평점이 삭제되었습니다.');
      // 해당 게임의 리뷰 목록 다시 로드
      loadGameReviews(gameId);
      // 사용자 평점 요약 다시 로드
      if (user) {
        const ratingSummary = await reviewApi.getUserRatingSummary(user.id);
        setUserRatings(ratingSummary);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '평점 삭제에 실패했습니다.');
    }
  };

  const handleReviewSubmit = async (data: {
    revieweeName: string;
    revieweeRole: 'PLAYER' | 'REFEREE';
    rating: number;
    comment?: string;
  }) => {
    if (!currentGameId) return;

    if (editingReview) {
      // 수정
      await reviewApi.updateReview(editingReview.ratingId, {
        rating: data.rating,
        comment: data.comment,
      });
      alert('평점이 수정되었습니다.');
    } else {
      // 생성
      await reviewApi.createReview({
        gameId: currentGameId,
        ...data,
      });
      alert('평점이 작성되었습니다.');
    }

    // 해당 게임의 리뷰 목록 다시 로드
    loadGameReviews(currentGameId);
    // 사용자 평점 요약 다시 로드
    if (user) {
      const ratingSummary = await reviewApi.getUserRatingSummary(user.id);
      setUserRatings(ratingSummary);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-xl">로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <div className="p-4 pt-32 mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          {/* <h1 className="mb-4 text-3xl font-bold">{user.name}님의 마이페이지</h1> */}

          {/* 평점 요약 */}
          {userRatings && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="mb-2 text-sm font-medium text-gray-600">참여자 평점</h3>
                <div className="text-3xl font-bold text-orange-600">
                  {userRatings.playScore.toFixed(1)}
                  <span className="ml-1 text-sm text-gray-500">/ 5.0</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{userRatings.playCount}개의 평가</p>
              </div>

              <div className="p-4 bg-orange-100 rounded-lg">
                <h3 className="mb-2 text-sm font-medium text-gray-600">심판 평점</h3>
                <div className="text-3xl font-bold text-orange-600">
                  {userRatings.refScore.toFixed(1)}
                  <span className="ml-1 text-sm text-gray-500">/ 5.0</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{userRatings.refCount}개의 평가</p>
              </div>
            </div>
          )}
        </div>

        {error && <div className="p-4 mb-6 text-red-600 bg-red-50 rounded-lg">{error}</div>}

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'completed'
                ? 'bg-white text-red-500 shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-800'
            }`}
          >
            게임 종료 ({completedGames.length})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'ongoing'
                ? 'bg-white text-green-600 shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-800'
            }`}
          >
            모집중/모집완료 ({ongoingGames.length})
          </button>
        </div>

        {/* 게임 목록 */}
        <div className="space-y-4">
          {activeTab === 'completed' ? (
            completedGames.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white rounded-lg">
                완료된 게임이 없습니다.
              </div>
            ) : (
              completedGames.map((game) => (
                <div key={game.gameId} className="bg-white rounded-lg shadow-sm">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{game.courtName}</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          방장: {game.hostName}
                          {game.referee && ` | 심판: ${game.referee}`}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-full">
                        게임 종료
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-500">
                      <p>📅 {formatToKST(game.scheduledTime)}</p>
                      <p>
                        👥 {game.currentPlayers} / {game.maxPlayers}
                      </p>
                      <p className="mt-2 text-xs">참여자: {game.playerNames.join(', ')}</p>
                      {game.spectatorNames.length > 0 && (
                        <p className="mt-0 text-xs text-gray-500">
                          관전자: {game.spectatorNames.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => toggleGameExpand(game.gameId)}
                        className="flex-1 px-4 py-2 font-medium text-orange-600 bg-orange-200 rounded-lg transition hover:bg-orange-300"
                      >
                        {expandedGames.has(game.gameId) ? '평점 숨기기' : '평점 보기'}
                      </button>
                      <button
                        onClick={() => handleCreateReview(game.gameId)}
                        className="flex-1 px-4 py-2 font-medium text-white bg-orange-400 rounded-lg transition hover:bg-orange-500"
                      >
                        평점 작성
                      </button>
                    </div>
                  </div>

                  {/* 이 게임의 평점 목록 */}
                  {expandedGames.has(game.gameId) && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <h4 className="mb-3 font-semibold">
                        평점 목록 ({selectedGameReviews[game.gameId]?.length || 0})
                      </h4>

                      {selectedGameReviews[game.gameId]?.length === 0 ? (
                        <p className="text-sm text-gray-500">아직 남겨진 평점이 없습니다.</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedGameReviews[game.gameId]?.map((review) => {
                            const isMyReview = review.reviewerName === user.name;
                            return (
                              <div key={review.ratingId} className="p-3 bg-white rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <div className="flex gap-2 items-center">
                                      <p className="font-medium">
                                        {review.revieweeName} (
                                        {review.revieweeRole === 'PLAYER' ? '참여자' : '심판'})
                                      </p>
                                      {isMyReview && (
                                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                                          내 평점
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      작성자: {review.reviewerName}
                                    </p>
                                    <div className="flex gap-1 items-center mt-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star}>{star <= review.rating ? '⭐' : '☆'}</span>
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600">
                                        {review.rating}점
                                      </span>
                                    </div>
                                  </div>
                                  {isMyReview && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditReview(review)}
                                        className="text-sm text-orange-600 hover:text-orange-800"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteReview(review.ratingId, game.gameId)
                                        }
                                        className="text-sm text-red-600 hover:text-red-800"
                                      >
                                        삭제
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {review.comment && (
                                  <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                                )}
                                <p className="mt-2 text-xs text-gray-400">
                                  {formatToKST(review.createdAt)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )
          ) : ongoingGames.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg">
              진행중인 게임이 없습니다.
            </div>
          ) : (
            ongoingGames.map((game) => (
              <div key={game.gameId} className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{game.courtName}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      방장: {game.hostName}
                      {game.referee && ` | 심판: ${game.referee}`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      game.status === '모집_중'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {game.status === '모집_중' ? '모집중' : '모집완료'}
                  </span>
                </div>

                {/* <div className="space-y-1 text-sm text-gray-500">
                  <p>
                    📅 {formatToKST(game.scheduledTime)}
                  </p>
                  <p>
                    👥 {game.currentPlayers} / {game.maxPlayers}
                  </p>
                  <p className="mt-2 text-xs">
                    참여자: {game.playerNames.join(', ')}
                  </p>
                </div> */}

                <div className="flex justify-between items-center mt-4">
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>📅 {formatToKST(game.scheduledTime)}</p>
                    <p>
                      👥 {game.currentPlayers} / {game.maxPlayers}
                    </p>
                    <p className="mt-2 text-xs">참여자: {game.playerNames.join(', ')}</p>
                    {game.spectatorNames.length > 0 && (
                      <p className="mt-0 text-xs text-gray-500">
                        관전자: {game.spectatorNames.join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleLeaveGame(game.gameId)}
                    className="px-4 py-2 mt-4 w-1/5 text-white bg-red-300 rounded-lg transition-all duration-300 hover:bg-red-600"
                  >
                    참여 취소
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
          setCurrentGameId(null);
        }}
        onSubmit={handleReviewSubmit}
        existingReview={editingReview || undefined}
        isEditing={!!editingReview}
        availableUsers={(() => {
          const game = completedGames.find((g) => g.gameId === currentGameId);
          if (!game) return [];
          const users = [...game.playerNames];
          if (game.referee) users.push(game.referee);
          // 자기 자신은 제외
          return users.filter((userName) => userName !== user?.name);
        })()}
      />
    </div>
  );
}
