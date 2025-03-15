import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 기본 Swiper 스타일
import "swiper/css";

// 사용 중인 모듈에 대한 스타일
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
