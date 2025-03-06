// services/searchService.ts
import {backUrl} from "@/constants";
import axios from "axios";

export interface SearchResult {
    // 검색 결과 인터페이스 정의 (API 응답 구조에 맞게 수정 필요)
    totalCount: number;
    items: any[]; // 실제 타입으로 변경 필요
}

export interface GlobalResponse<T> {
    status: number;
    message: string;
    data: T;
}

export const searchService = {
    // 전체 검색
    searchAll: async (keyword: string): Promise<GlobalResponse<SearchResult>> => {
        try {
            const response = await axios.get(`${backUrl}/api/v1/search?kw=${encodeURIComponent(keyword)}`,
                {
                    withCredentials: true,
                });

            console.log(response.data.data)

            return response.data;
        } catch (error) {
            console.error('검색 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    // 카테고리별 검색 - 나중에 API가 준비되면 구현
    searchByCategory: async (keyword: string, /* category: string */): Promise<GlobalResponse<SearchResult>> => {
        // 현재는 임시로 전체 검색을 호출
        return searchService.searchAll(keyword);

        // 카테고리별 API가 준비되면 아래와 같이 수정
        /*
        try {
          const response = await fetch(`${backUrl}/api/v1/search/${category}?kw=${encodeURIComponent(keyword)}`);

          if (!response.ok) {
            throw new Error('검색 요청이 실패했습니다.');
          }

          return await response.json();
        } catch (error) {
          console.error('검색 중 오류가 발생했습니다:', error);
          throw error;
        }
        */
    }
};