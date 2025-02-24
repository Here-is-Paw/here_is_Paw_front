import { useState, useEffect } from "react";

export function useScrollDrawer() {
  const [open, setOpen] = useState(false);
  const [activePoint, setActivePoint] = useState<string | number>("0.2");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 아래로 스크롤하면 Drawer를 더 닫기
      if (currentScrollY > lastScrollY + 50) {
        setActivePoint("0.2");
      }
      // 위로 스크롤하면 Drawer를 더 열기
      else if (currentScrollY < lastScrollY - 50) {
        setActivePoint("0.5");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return { open, setOpen, activePoint, setActivePoint };
}
