import { useState } from "react";
import axios from "axios";
import { backUrl } from "@/constants";
import { usePetContext } from "@/contexts/findPetContext";

interface UseFindWriteReturn {
  loading: boolean;
  error: Error | null;
  writeFindPost: (formData: FormData) => Promise<void>;
}

export const useFindWrite = (): UseFindWriteReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { incrementSubmissionCount } = usePetContext();

  const writeFindPost = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${backUrl}/api/v1/finding/write`, formData, {
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        alert("발견 신고가 성공적으로 등록되었습니다!");
        incrementSubmissionCount();
      } else {
        alert("등록 실패");
      }
    } catch (err) {
      console.error("Failed to register find post:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, writeFindPost };
};
