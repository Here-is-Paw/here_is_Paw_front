// services/searchService.ts
import {backUrl} from "@/constants";
import axios from "axios";
import { SearchPet } from "@/types/mypet.ts";

export interface SearchResult {
    "content": SearchPet[],
    "empty": false,
    "first": true,
    "last": true,
    "number": 0,
    "numberOfElements": 1,
    "pageable": {
        "pageNumber": 0,
        "pageSize": 10,
        "sort": {
            "empty": true,
            "unsorted": true,
            "sorted": false
        },
        "offset": 0,
        "paged": true
    },
    "size": 10,
    "sort": {
        "empty": true,
        "unsorted": true,
        "sorted": false
    },
    "totalElements": 1,
    "totalPages": 1
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
            const response = await axios.get(`${backUrl}/api/v1/search?kw=${encodeURIComponent(keyword)}`);

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