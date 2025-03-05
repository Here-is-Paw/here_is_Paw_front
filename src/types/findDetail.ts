export interface findDetail {
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

export interface GeoPoint {
  x: number;
  y: number;
}