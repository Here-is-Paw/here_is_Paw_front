import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from "@/pages/LoginPage.tsx";
import SignupForm from "@/pages/SignupForm.tsx";
import AdminLoginPage from "@/pages/AdminLoginPage.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/adoption" element={<div>입양 페이지</div>} />
      <Route path="/lost" element={<div>실종 페이지</div>} />
      <Route path="/mypage" element={<div>마이 페이지</div>} />
      <Route path="/settings" element={<div>설정 페이지</div>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
    </Routes>
  );
}
