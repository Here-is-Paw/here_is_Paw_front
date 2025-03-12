export interface MissingFormData {
  id: number;
  name: string;
  breed: string;
  geo: string;
  location: string;
  color?: string;
  serialNumber?: string;
  gender?: number;
  neutered?: number;
  age?: number;
  lostDate?: string;
  etc?: string;
  reward?: number;
  missingState?: number;
  file: File;
}

export interface MissingDetailFormData {
  id: number;

  // 유저 정보
  memberId: number;
  nickname: string;

  // 필수값
  name: string;
  breed: string;
  location: string;
  x: number; // Point.getX() 대신 사용
  y: number; // Point.getY() 대신 사용
  file: File | string;
  pathUrl: string;

  // 선택 값
  serialNumber?: string;
  color?: string;
  gender?: number;
  age?: number;
  neutered?: number;
  etc?: string;
  lostDate?: string; // ISO 8601 형식의 문자열로 저장 (ex. "2025-03-09T12:00:00Z")
  detailAddr?: string;
  missingState: number;

  // 고유 missing 값
  reward?: number;
}

export const defaultValues: MissingDetailFormData = {
  id: 0,
  name: "",
  breed: "",
  x: 0,
  y: 0,
  location: "",
  color: "",
  serialNumber: "",
  gender: 0,
  neutered: 0,
  age: 0,
  lostDate: "",
  etc: "",
  reward: 0,
  missingState: 0,
  file: new File([], "placeholder.jpg", { type: "image/jpeg" }),
  memberId: 1,
  nickname: "",
  pathUrl: "",
  detailAddr: "",
};
export interface MissingDetailData {
  id: number;

  // 유저 정보
  memberId: number;
  nickname: string;

  // 필수값
  name: string;
  breed: string;
  location: string;
  x: number; // Point.getX() 대신 사용
  y: number; // Point.getY() 대신 사용
  file: File | string;
  pathUrl: string;

  // 선택 값
  serialNumber?: string;
  color?: string;
  gender?: number;
  age?: number;
  neutered?: number;
  etc?: string;
  lostDate?: string; // ISO 8601 형식의 문자열로 저장 (ex. "2025-03-09T12:00:00Z")
  detailAddr?: string;
  missingState: number;

  // 고유 missing 값
  reward?: number;
}

// 실종 상태 상수 정의
export enum MissingState {
  MISSING = 0, // 실종 중
  FOUND = 1, // 찾음
  CANCELED = 2, // 취소됨
}

// 실종 상태 텍스트 매핑
export const MissingStateText: Record<MissingState, string> = {
  [MissingState.MISSING]: "실종중",
  [MissingState.FOUND]: "찾음",
  [MissingState.CANCELED]: "취소됨",
};

// 공통으로 사용되는 유틸리티 함수들
export const missingUtils = {
  // missingState 값에 따른 표시 문자열 결정
  getMissingStateText: (state: number): string => {
    return (
      MissingStateText[state as MissingState] ||
      MissingStateText[MissingState.MISSING]
    );
  },

  // 기타 유틸리티 함수들 추가 가능
  formatDate: (dateString?: string): string => {
    if (!dateString) return "날짜 없음";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString || "날짜 없음";
    }
  },

  formatReward: (reward?: number): string => {
    if (!reward) return "사례금 없음";
    return `${reward.toLocaleString()}원`;
  },
};

export const parseLocation = (locationString: string) => {
  if (!locationString) return { mainAddress: "", detailAddress: "" };

  const parts = locationString.split("&&");

  if (parts.length > 1) {
    return {
      mainAddress: parts[0].trim(),
      detailAddress: parts[1].trim(),
    };
  }

  // If there's no separator, treat the whole string as the main address
  return {
    mainAddress: locationString.trim(),
    detailAddress: "",
  };
};
