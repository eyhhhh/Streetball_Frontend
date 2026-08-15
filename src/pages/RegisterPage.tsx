import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { useAuthStore } from '@/store/authStore';
import { RegisterData } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { location, error: locationError } = useGeolocation();

  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    password: '',
    hasBall: false,
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  // 위치 정보가 로드되면 업데이트
  useEffect(() => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        // locationLat: location.latitude,
        // locationLng: location.longitude,
      }));
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register(formData);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        // navigate('/');
      }
      setTimeout(() => {
        alert('회원가입에 성공했습니다.');
        navigate('/login');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-600 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏀 Streetball</h1>
          <p className="text-orange-100">농구 게임 매칭 플랫폼</p>
        </div>

        {/* Register Form */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="홍길동"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="hasBall"
                checked={formData.hasBall}
                onChange={(e) => setFormData({ ...formData, hasBall: e.target.checked })}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label
                htmlFor="hasBall"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                🏀 공을 가지고 있습니다
              </label>
            </div>

            {locationError && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  📍 위치 정보를 가져올 수 없습니다. 기본 위치로 설정됩니다.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-gray-400"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
