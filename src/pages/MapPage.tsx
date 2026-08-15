import { useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useKakaoMap } from '@/hooks/useKakaoMap';
// import { gameApi } from '@/apis/gameApi';
import CreateGameModal from '@/components/CreateGameModal';
import CourtGamesModal from '@/components/CourtGamesModal';
import { useCourt } from '@/hooks/useCourt';

// Note: 실제 타입 정의 파일 (types.ts)이 필요할 수 있습니다.
// interface Location { latitude: number; longitude: number; }
// interface Game { id: number; latitude: number; longitude: number; /* ... other props */ }

export default function MapPage() {
  const { courts, selectedCourt, setSelectedCourt } = useCourt();
  const { location, error: locationError } = useGeolocation(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // 기본 위치 (서울 시청)
  const defaultLocation = { latitude: 37.5665, longitude: 126.978 };
  const currentLocation = location || defaultLocation;

  const { mapRef, addCourtMarkers } = useKakaoMap({
    center: currentLocation,
    level: 3,
  });

  // // 위치 업데이트 및 근처 게임 가져오기
  // useEffect(() => {
  //   // location이 null이거나 아직 로드되지 않은 상태일 수 있으므로 return 조건 유지
  //   if (!location) return;

  //   const fetchNearbyGames = async () => {
  //     try {
  //       const response = await gameApi.getNearbyGames({
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //         radius: 5, // 5km 반경
  //       });

  //       if (response.success && response.data) {
  //         setGames(response.data);
  //       }
  //     } catch (error) {
  //       console.error('근처 게임 가져오기 실패:', error);
  //     }
  //   };

  //   fetchNearbyGames();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location]);

  // 지도에 농구장 마커 추가
  useEffect(() => {
    if (courts && courts.length > 0) {
      addCourtMarkers(courts, (court) => {
        // 농구장 클릭 시 게임 리스트 모달 표시
        setSelectedCourt(court);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courts]);

  return (
    <div
      className="relative h-[100dvh] w-screen overflow-hidden touch-none"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* 지도 컨테이너: ref={mapRef}를 사용합니다. */}
      <div ref={mapRef} className="absolute top-0 left-0 z-0 w-full h-full touch-auto" />

      {/* 위치 에러 메시지 */}
      {locationError && (
        <div className="absolute right-4 left-4 top-20 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">{locationError}</p>
          <p className="mt-1 text-xs text-yellow-700">기본 위치(서울 시청)를 사용합니다.</p>
        </div>
      )}

      {/* 하단 액션 버튼들 */}
      <div
        className="absolute right-0 bottom-0 left-0 z-10 p-4 pb-safe touch-auto"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full shadow-lg btn-primary touch-auto"
        >
          ➕ 게임 만들기
        </button>
      </div>

      {/* 게임 및 농구장 정보 카드 (하단) */}
      {/* {(games.length > 0 || courts.length > 0) && (
        <div className="absolute right-4 left-4 bottom-32 p-4 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-900">지도 정보</h3>
          </div>
          <div className="space-y-1">
            {courts.length > 0 && (
              <div className="flex items-center text-sm">
                <span className="mr-2 w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-gray-600">농구장 {courts.length}개</span>
              </div>
            )}
            {games.length > 0 && (
              <div className="flex items-center text-sm">
                <span className="mr-2 w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-600">게임 {games.length}개</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            지도의 핀을 클릭하여 자세한 정보를 확인하세요
          </div>
        </div>
      )} */}

      {/* 모달들 */}
      <CourtGamesModal
        court={selectedCourt}
        onClose={() => setSelectedCourt(null)}
        onCreateGame={() => {
          setSelectedCourt(null);
          setIsCreateModalOpen(true);
        }}
      />

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userLocation={currentLocation}
      />
    </div>
  );
}
