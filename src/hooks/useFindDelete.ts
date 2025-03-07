import { useState } from "react";
import axios from "axios";
import { backUrl } from "@/constants";
import { usePetContext } from "@/contexts/findPetContext";

interface UseFindDeleteReturn {
  loading: boolean;
  error: Error | null;
  deleteFindPost: (postId: number) => Promise<void>;
}

export const useFindDelete = (): UseFindDeleteReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { incrementSubmissionCount } = usePetContext();

  const deleteFindPost = async (postId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(`${backUrl}/api/v1/finding/${postId}`, {
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        alert("발견 신고가 성공적으로 삭제되었습니다!");
        incrementSubmissionCount();
      } else {
        alert("삭제 실패!");
      }
    } catch (err) {
      console.error("Failed to delete pet details:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteFindPost };
};
