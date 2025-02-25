import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import SignupForm from "@/pages/SignupForm.tsx";
import petsData from "../mocks/data/pets.json";
import {KakaoCallback} from "@/components/kakaoLogin/KakaoCallback.tsx"; // 경로 확인 필요


export default function AppRoutes() {
  // petsData 확인
  console.log("AppRoutes의 petsData:", petsData);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainPage
            mockLostPets={petsData.lostPets}
            mockFindPets={petsData.findPets}
          />
        }
      />
      <Route path="/adoption" element={<div>입양 페이지</div>} />
      <Route path="/lost" element={<div>실종 페이지</div>} />
      <Route path="/mypage" element={<div>마이 페이지</div>} />
      <Route path="/settings" element={<div>설정 페이지</div>} />
      <Route path="/signup" element={<SignupForm />} />

      <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
    </Routes>
  );
}
