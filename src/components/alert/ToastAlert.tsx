import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastAlertProps {
  open: boolean;
  type: "success" | "error" | "warning"; // warning 타입 추가
  title: string;
  message: string;
  duration?: number; // 밀리초 단위, 기본값은 3000ms (3초)
  onClose?: () => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({
  open,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const [exit, setExit] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 마운트되면 mounted 상태를 true로 설정
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setExit(false);
      const timer = setTimeout(() => {
        setExit(true);
        setTimeout(() => {
          setVisible(false);
          setExit(false);
          if (onClose) onClose();
        }, 300); // 페이드아웃 애니메이션 시간
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!visible || !mounted) return null;

  // 타입에 따른 스타일 및 아이콘 설정
  const getStylesAndIcon = () => {
    switch (type) {
      case "success":
        return {
          borderColor: "border-green-500",
          bgColor: "bg-green-50",
          titleColor: "text-green-700",
          descColor: "text-green-600",
          icon: <CheckCircle className="h-7 w-7 text-green-600" />,
        };
      case "error":
        return {
          borderColor: "border-red-500",
          bgColor: "bg-red-50",
          titleColor: "text-red-700",
          descColor: "text-red-600",
          icon: <XCircle className="h-7 w-7 text-red-600" />,
        };
      case "warning":
        return {
          borderColor: "border-yellow-500",
          bgColor: "bg-yellow-50",
          titleColor: "text-yellow-700",
          descColor: "text-yellow-600",
          icon: <AlertTriangle className="h-7 w-7 text-yellow-600" />,
        };
      default:
        return {
          borderColor: "border-gray-500",
          bgColor: "bg-gray-50",
          titleColor: "text-gray-700",
          descColor: "text-gray-600",
          icon: <AlertTriangle className="h-7 w-7 text-gray-600" />,
        };
    }
  };

  const { borderColor, bgColor, titleColor, descColor, icon } =
    getStylesAndIcon();

  // Portal을 사용하여 DOM의 최상위에 렌더링
  const toastContent = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 99999, // 매우 높은 z-index 값
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none", // 배경이 클릭을 차단하지 않도록 함
      }}
    >
      {/* 배경 오버레이 */}
      <div
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          exit ? "opacity-0" : "opacity-100"
        )}
        style={{ pointerEvents: "auto" }} // 이 요소만 클릭 가능하도록 함
        onClick={() => {
          setExit(true);
          setTimeout(() => {
            setVisible(false);
            setExit(false);
            if (onClose) onClose();
          }, 300);
        }}
      />

      {/* 토스트 알림 - 비율 조정 */}
      <div
        className={cn(
          "relative w-auto max-w-lg mx-auto transform transition-all duration-300",
          exit ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
        style={{ pointerEvents: "auto" }} // 이 요소만 클릭 가능하도록 함
      >
        <Alert
          className={cn(
            "shadow-lg border-l-4 p-5 min-w-[320px] max-w-[400px]",
            bgColor,
            borderColor
          )}
        >
          <div className="flex items-center">
            {/* 아이콘 - 세로 중앙 정렬 */}
            <div className="flex-shrink-0 mr-4 flex items-center justify-center">
              {icon}
            </div>

            {/* 텍스트 콘텐츠 */}
            <div className="flex-1">
              <AlertTitle className={cn("text-xl font-bold", titleColor)}>
                {title}
              </AlertTitle>

              <AlertDescription className={cn("text-base mt-1", descColor)}>
                {message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );

  // createPortal을 사용하여 body 직접 아래에 렌더링
  return createPortal(toastContent, document.body);
};
