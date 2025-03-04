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
