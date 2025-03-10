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

export const petUtils = {
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
}