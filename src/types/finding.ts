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

export const defaultValues: FindingDetailFormData = {
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
  findDate: "",
  etc: "",
  file: new File([], "placeholder.jpg", { type: "image/jpeg" }),
  memberId: 1,
  nickname: "",
  title: "",
  situation: "",
  shelterId: 0,
  pathUrl: "",
  detailAddr: ""
};

export interface FindingDetailFormData {
  id: number;

  // 유저 정보
  memberId: number;
  nickname: string;

  // 필수 값
  breed: string; // 품종
  location: string; // 지역
  x: number; // Point.getX() 대신 사용
  y: number; // Point.getY() 대신 사용
  file: File | string;
  pathUrl: string;
  // 선택 값
  name: string; // 이름
  serialNumber: string;
  color: string;
  gender: number; // 성별
  age: number; // 나이
  neutered: number; // 중성화 유무
  etc: string; // 기타 특징
  findDate: string; // 발견 시간 (ISO 문자열: "YYYY-MM-DDTHH:mm:ss")
  detailAddr: string;
  // 고유 finding 값
  title: string; // 제목
  situation: string; // 발견 상황
  shelterId: number; // 보호소 id
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
  name: string; // 이름
  serialNumber: string;
  color: string;
  gender: number; // 성별
  age: number; // 나이
  neutered: number; // 중성화 유무
  etc: string; // 기타 특징
  findDate: string; // 발견 시간 (ISO 문자열: "YYYY-MM-DDTHH:mm:ss")
  detailAddr: string;

  // 고유 finding 값
  title: string; // 제목
  situation: string; // 발견 상황
  shelterId: number; // 보호소 id
}
