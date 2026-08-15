import { useCourtStore } from '@/store/courtStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { courtApi } from '@/apis/courtApi';

export const useCourt = () => {
  const { user } = useAuthStore();
  const { courts, selectedCourt, setCourts, setSelectedCourt } = useCourtStore();

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const data = await courtApi.getCourts();
        setCourts(data || []);
      } catch (error) {
        console.error('Courts fetching failed:', error);
        setCourts([]); // 에러 시 빈 배열로 설정
      }
    };
    fetchCourts();
  }, [user, setCourts]);

  return { courts, selectedCourt, setCourts, setSelectedCourt };
};
