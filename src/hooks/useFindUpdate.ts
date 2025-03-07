import { useState } from "react";
import axios from "axios";
import { backUrl } from "@/constants";
import { usePetContext } from "@/contexts/findPetContext";

interface UseFindUpdateReturn {
  loading: boolean;
  error: Error | null;
  updateFindPost: (postId: number, formData: FormData) => Promise<void>;
}

export const useFindUpdate = (): UseFindUpdateReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { incrementSubmissionCount } = usePetContext();

  const updateFindPost = async (postId: number, formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${backUrl}/api/v1/finding/${postId}`, formData, {
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        alert("발견 신고가 성공적으로 수정되었습니다!");
        incrementSubmissionCount();
      } else {
        alert("수정 실패");
      }
    } catch (err) {
      console.error("Failed to update pet details:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateFindPost };
};
