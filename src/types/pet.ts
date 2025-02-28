import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";

export interface Pet {
  id: string;
  imageUrl: string;
  date: string;
  breed: string;
  features: string;
  location: string;
  lat: number;
  lang: number;
}

export enum PetGender {
  Unknown = 0,
  Male = 1,
  Female = 2
}

export interface Pet {
  id: string;
  imageUrl: string;
  date: string;
  breed: string;
  features: string;
  location: string;
  lat: number;
  lang: number;
}

export interface MyPet {
  id: number;
  age: number;
  breed: string;
  color: string;
  etc: string;
  gender: number;
  name: string;
  neutered: boolean;
  serialNumber: string;
  imageUrl: string;
  location: string;
  geo: GeoPoint;
  find_date: string;
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
