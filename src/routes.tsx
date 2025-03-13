import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import SignupForm from "@/pages/SignupForm.tsx";
import petsData from "../mocks/data/pets.json";
import { KakaoCallback } from "@/components/kakaoLogin/KakaoCallback.tsx";
import { CheckoutPage } from "@/components/payment/Checkout.tsx";
import { SuccessPage } from "@/components/payment/Success.tsx";
import { FailPage } from "@/components/payment/Fail.tsx";

export default function AppRoutes() {
  console.log("AppRoutes의 petsData:", petsData);

  return (
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/adoption" element={<div>입양 페이지</div>} />
        <Route path="/lost" element={<div>실종 페이지</div>} />
        <Route path="/mypage" element={<div>마이 페이지</div>} />
        <Route path="/settings" element={<div>설정 페이지</div>} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/auth/kakao/callback" element={<KakaoCallback />} />

        {/* 결제 관련 라우트 */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/fail" element={<FailPage />} />
      </Routes>
  );
}