import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './app/layout'
import MainPage from './pages/MainPage'

function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          {/* 추가 라우트는 여기에 설정 */}
          <Route path="/adoption" element={<div>입양 페이지</div>} />
          <Route path="/lost" element={<div>실종 페이지</div>} />
          <Route path="/mypage" element={<div>마이 페이지</div>} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  )
}

export default App
