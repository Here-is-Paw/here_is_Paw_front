import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

export interface PetList {
  id: number;
  breed: string;  // 견종
  location: string;  // 지역
  etc: string;  // 기타 특징
  x: number;  // Point.getX() 대신 사용
  y: number;  // Point.getY() 대신 사용
  pathUrl: string;  // 이미지 경로
}

export interface MyPet {
  id: number;
  age: number;
  breed: string;
  color: string;
  etc: string;
  gender: number;
  name: string;
  neutered: number;
  serialNumber: string;
  imageUrl: string;
  location: string;
  geo: GeoPoint;
  find_date: string;
}

export interface FindPet {
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

export interface PetFormData {
  name: string;
  breed: string;
  color?: string;
  serialNumber?: string;
  gender: number;
  neutered?: boolean;
  age?: number;
  etc?: string;
  profileImage?: File | null; // 이미지 추가
}

export interface FormProps {
  form: {
    control: Control<PetFormData>;
    handleSubmit: (onValid: (data: PetFormData) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: UseFormSetValue<PetFormData>; // 수정된 부분
    watch: UseFormWatch<PetFormData>; // 수정된 부분
  };
}

export const defaultValues: PetFormData = {
  name: "",
  breed: "",
  color: "",
  serialNumber: "",
  gender: 0,
  neutered: false,
  age: undefined,
  etc: "",
  profileImage: null, // 기본값 추가
};

export interface GeoPoint {
  x: number;
  y: number;
}

export interface SearchPet {
  breed: string;
  etc: string;
  id: string;
  imageUrl: string;
  location: string;
  post_id: number;
  type: number;
}