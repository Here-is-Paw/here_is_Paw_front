export interface Finding {
  id: number;
  path_url: string;
  date: string;
  breed: string;
  etc: string;
  location: string;
  lat: number;
  lang: number;
}

export interface FindPets {
  id: string;
  find_date: string;
  breed: string;
  etc: string;
  location: string;
  x: number;
  y: number;
  path_url: string;
  name: string;
  color: string;
  gender: number;
  neutered: number;
  age: number;
  title: string;
  situation: string;
  member_id: number;
}

export interface FindingDetailData {
  id: number;

  // 유저 정보
  memberId: number;
  nickname: string;

  // 필수 값
  breed: string; // 품종
  location: string; // 지역
  x: number; // Point.getX() 대신 사용
  y: number; // Point.getY() 대신 사용
  pathUrl: string;

  // 선택 값
  name?: string; // 이름
  serialNumber?: string;
  color?: string;
  gender?: number; // 성별
  age?: number; // 나이
  neutered?: number; // 중성화 유무
  etc?: string; // 기타 특징
  findDate?: string; // 발견 시간 (ISO 문자열: "YYYY-MM-DDTHH:mm:ss")

  // 고유 finding 값
  title?: string; // 제목
  situation?: string; // 발견 상황
  shelterId?: number; // 보호소 id
}
