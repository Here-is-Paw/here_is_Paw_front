// components/auth/AuthInit.tsx
import { useEffect } from "react";
import axios from "axios";
import { backUrl } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";

export const AuthInit = () => {
  const { login } = useAuth();

  useEffect(() => {
    const fetchAuthData = () => {
      console.log("apiKey : ", document.cookie);
      axios
        .get(`${backUrl}/api/v1/members/me`, { withCredentials: true })
        .then((response) => {
          console.log("응답:", response.data);
          login();
        })
        .catch((error) => {
          if (error.response) {
            console.info(error.response.data);
          } else {
            console.error("요청 중 알 수 없는 오류 발생", error);
          }
        });
      console.log("요청 보냄");
    };

    fetchAuthData();
  }, [login]);

  return null;
};
