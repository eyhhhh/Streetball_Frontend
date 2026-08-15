import { useEffect, useRef, useState } from 'react';
import { Location, Game, Court } from '@/types';

import mapPin from '@/assets/map-pin.svg';

declare global {
  interface Window {
    kakao: any;
  }
}

interface UseKakaoMapProps {
  center: Location;
  level?: number;
}

export const useKakaoMap = ({ center, level = 3 }: UseKakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [gameMarkers, setGameMarkers] = useState<any[]>([]);
  const [courtMarkers, setCourtMarkers] = useState<any[]>([]);

  // 지도 초기화
  useEffect(() => {
    // ref가 아직 할당되지 않았거나 이미 map 객체가 생성되었다면 return
    if (!mapRef.current || map) return;

    console.log('🧭 useKakaoMap 초기화 이펙트 실행');

    const initMap = () => {
      // 이 시점에서는 window.kakao.maps가 존재한다고 가정
      const container = mapRef.current;
      if (!container) return; // 만약 컨테이너가 사라졌다면 종료

      const options = {
        center: new window.kakao.maps.LatLng(center.latitude, center.longitude),
        level,
      };

      console.log('🗺️ 지도 초기화 중...', options);
      try {
        const mapInstance = new window.kakao.maps.Map(container, options);
        console.log('✅ 지도 초기화 완료!', mapInstance);
        setMap(mapInstance);
      } catch (e) {
        console.error('❌ 카카오맵 객체 생성 실패:', e);
      }
    };

    if (window.kakao && window.kakao.maps) {
      // 카카오맵 SDK가 이미 로드되어 있으면 바로 초기화
      initMap();
    } else {
      const scriptId = 'kakao-map-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
          import.meta.env.VITE_KAKAO_MAP_API_KEY
        }&autoload=false`;
        script.async = true;
        script.onload = () => {
          window.kakao.maps.load(() => {
            initMap();
          });
        };
        document.head.appendChild(script);
      } else {
        const checkKakao = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            clearInterval(checkKakao);
            window.kakao.maps.load(() => {
              initMap();
            });
          }
        }, 100);
        return () => clearInterval(checkKakao);
      }
    }
  }, [map]); // map이 null일 때만 실행되도록 의존성 배열에 map 추가

  // 중심 위치 변경
  useEffect(() => {
    if (!map || !center) return;

    const moveLatLon = new window.kakao.maps.LatLng(center.latitude, center.longitude);
    map.setCenter(moveLatLon);
  }, [map, center]);

  // 게임 마커 추가
  const addMarkers = (games: Game[], onClick: (game: Game) => void) => {
    if (!map || !window.kakao || !window.kakao.maps) {
      console.warn(
        '⚠️ 지도 객체(map) 또는 카카오맵 라이브러리가 준비되지 않아 마커를 추가할 수 없습니다.',
      );
      return;
    }

    // 기존 게임 마커 제거
    gameMarkers.forEach((marker) => marker.setMap(null));

    // 새 게임 마커 생성 (빨간색)
    const newMarkers = games.map((game) => {
      const position = new window.kakao.maps.LatLng(game.locationLat, game.locationLng);

      const marker = new window.kakao.maps.Marker({
        position,
        map,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onClick(game);
      });

      return marker;
    });

    setGameMarkers(newMarkers);
  };

  // 농구장 마커 추가
  const addCourtMarkers = (courts: Court[], onClick?: (court: Court) => void) => {
    if (!map || !window.kakao || !window.kakao.maps) {
      console.warn(
        '⚠️ 지도 객체(map) 또는 카카오맵 라이브러리가 준비되지 않아 마커를 추가할 수 없습니다.',
      );
      return;
    }

    // 기존 농구장 마커 제거
    courtMarkers.forEach((marker) => marker.setMap(null));

    // 새 농구장 마커 생성 (파란색)
    const newMarkers = courts.map((court) => {
      const position = new window.kakao.maps.LatLng(court.locationLat, court.locationLng);

      // 마커 이미지 생성 (커스텀 마커)
      const imageSrc = mapPin;
      const imageSize = new window.kakao.maps.Size(32, 32);
      const imageOption = { offset: new window.kakao.maps.Point(16, 32) }; // 마커 하단 중앙이 좌표에 위치하도록
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

      const marker = new window.kakao.maps.Marker({
        position,
        map,
        image: markerImage,
        title: court.courtName,
      });

      // 마커 클릭 이벤트
      if (onClick) {
        window.kakao.maps.event.addListener(marker, 'click', () => {
          onClick(court);
        });
      }

      return marker;
    });

    setCourtMarkers(newMarkers);
  };

  // 마커 제거
  const clearMarkers = () => {
    gameMarkers.forEach((marker) => marker.setMap(null));
    courtMarkers.forEach((marker) => marker.setMap(null));
    setGameMarkers([]);
    setCourtMarkers([]);
  };

  return {
    mapRef,
    map,
    addMarkers,
    addCourtMarkers,
    clearMarkers,
  };
};
