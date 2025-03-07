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

export const defaultValues: MissingFormData = {
  id: 0,
  name: "",
  breed: "",
  geo: "",
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
};

export interface MissingData {
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
  pathUrl: string;
}

export const defaultMissingValues: MissingData = {
  id: 0,
  name: "",
  breed: "",
  geo: "",
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
  pathUrl: "",
};

// Gender 상수 정의
export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

// Gender 텍스트 매핑
export const GenderText: Record<Gender, string> = {
  [Gender.UNKNOWN]: "정보없음",
  [Gender.MALE]: "수컷",
  [Gender.FEMALE]: "암컷",
};

// 중성화 상태 상수 정의
export enum NeuteredStatus {
  UNKNOWN = 0,
  NO = 1,
  YES = 2,
}

// 중성화 상태 텍스트 매핑
export const NeuteredText: Record<NeuteredStatus, string> = {
  [NeuteredStatus.UNKNOWN]: "정보없음",
  [NeuteredStatus.NO]: "아니오",
  [NeuteredStatus.YES]: "예",
};

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
export const MissingUtils = {
  // gender 값에 따른 표시 문자열 결정
  getGenderText: (gender: number): string => {
    return GenderText[gender as Gender] || GenderText[Gender.UNKNOWN];
  },

  // neutered 값에 따른 표시 문자열 결정
  getNeuteredText: (neutered: number): string => {
    return (
      NeuteredText[neutered as NeuteredStatus] ||
      NeuteredText[NeuteredStatus.UNKNOWN]
    );
  },

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
