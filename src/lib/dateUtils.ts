/**
 * 서버에서 받은 시간 문자열을 UTC로 처리하여 한국 시간으로 표시
 * 서버에서 타임존 정보 없이 UTC 시간을 보내는 경우를 처리
 */
export const formatToKST = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  // 타임존 정보가 없으면 Z를 추가하여 UTC로 처리
  const utcTime = dateString.endsWith('Z') || dateString.includes('+') || dateString.includes('T') && dateString.split('T')[1].includes('-')
    ? dateString
    : `${dateString}Z`;

  const date = new Date(utcTime);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Seoul',
    ...options,
  };

  return date.toLocaleString('ko-KR', defaultOptions);
};

