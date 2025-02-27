export interface MissingFormData {
  name: string;
  breed: string;
  geo: string;
  location: string;
  color?: string;
  serialNumber?: string;
  gender?: boolean;
  neutered?: boolean;
  age?: number;
  lostDate?: string;
  etc?: string;
  reward?: number;
  missingState?: number;
  file: File;
}

export const defaultValues: MissingFormData = {
  name: "",
  breed: "",
  geo: "",
  location: "",
  color: "",
  serialNumber: "",
  gender: false,
  neutered: false,
  age: 0,
  lostDate: "",
  etc: "",
  reward: 0,
  missingState: 0,
  file: new File([], "placeholder.jpg", { type: "image/jpeg" }),
};
