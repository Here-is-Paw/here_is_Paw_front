// // hooks/useFindDetail.ts
// import { useState } from "react";
// import axios from "axios";
// import { findDetail } from "@/types/findDetail";
// import { backUrl } from "@/constants";
// import { usePetContext } from "@/contexts/findPetContext";
//
// interface UseFindDetailReturn {
//   findDetail: findDetail | null;
//   loading: boolean;
//   error: Error | null;
//   fetchFindDetail: (postId: number) => Promise<void>;
//   updateFormFields: () => void;
// }
//
// interface FormFields {
//   setImagePreview: (url: string | null) => void;
//   setTitle: (title: string) => void;
//   setAge: (age: number) => void;
//   setBreed: (breed: string) => void;
//   setColor: (color: string) => void;
//   setEtc: (etc: string) => void;
//   setGender: (gender: number) => void;
//   setSituation: (situation: string) => void;
//   setName: (name: string) => void;
//   setLocation: (location: string) => void;
//   setNeutered: (neutered: number) => void;
//   setGeoX: (geoX: number) => void;
//   setGeoY: (geoY: number) => void;
// }
//
// export const useFindDetail = (formFields: FormFields): UseFindDetailReturn => {
//   const [findDetail, setFindDetail] = useState<findDetail | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<Error | null>(null);
//   const { incrementSubmissionCount } = usePetContext();
//
//   const updateFormFields = () => {
//     if (findDetail) {
//       formFields.setImagePreview(findDetail.path_url);
//       formFields.setTitle(findDetail.title);
//       formFields.setAge(findDetail.age);
//       formFields.setBreed(findDetail.breed);
//       formFields.setColor(findDetail.color);
//       formFields.setEtc(findDetail.etc);
//       formFields.setGender(findDetail.gender);
//       formFields.setSituation(findDetail.situation);
//       formFields.setName(findDetail.name);
//       formFields.setNeutered(findDetail.neutered);
//       formFields.setLocation(findDetail.location);
//       formFields.setGeoX(findDetail.x);
//       formFields.setGeoY(findDetail.y);
//     } else {
//       incrementSubmissionCount();
//     }
//   };
//
//   const fetchFindDetail = async (postId: number) => {
//     setLoading(true);
//     setError(null);
//
//     try {
//       const detailResponse = await axios.get(`${backUrl}/api/v1/finding/${postId}`, {});
//       setFindDetail(detailResponse.data.data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Failed to fetch pet details:", err);
//       setError(err instanceof Error ? err : new Error("An unknown error occurred"));
//       setLoading(false);
//     }
//   };
//
//   return {
//     findDetail,
//     loading,
//     error,
//     fetchFindDetail,
//     updateFormFields
//   };
// };