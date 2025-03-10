import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import axios from 'axios';
import {backUrl} from '@/constants';
import {PetList} from '@/types/mypet.ts';
import {useMapLocation} from "@/contexts/MapLocationContext.tsx";
import {useRadius} from "@/contexts/RadiusContext.tsx";

// 검색 모드 타입
type SearchMode = '전체' | '반경';

// 검색 필터 타입
type SearchFilter = '전체' | '잃어버렸개' | '발견했개' | "My";

// 검색 카테고리 타입
type SearchCategory = '전체' | '지역' | '품종';

// Context에서 제공할 데이터 및 메서드 타입
// Context 인터페이스에 searchPets 추가
interface PetContext {
    // 데이터
    missingPets: PetList[];
    findingPets: PetList[];

    // 상태
    searchMode: SearchMode;
    activeFilter: SearchFilter;
    searchCategory: SearchCategory;
    isLoading: boolean;
    missingHasMore: boolean;
    findingHasMore: boolean;

    // 메서드
    setSearchMode: (mode: SearchMode) => void;
    setActiveFilter: (filter: SearchFilter) => void;
    setSearchCategory: (category: SearchCategory) => void;
    loadMorePets: () => Promise<void>;
    refreshPets: () => Promise<void>;
    searchPets: (params: SearchParams) => Promise<void>; // 추가된 함수
}

// 검색 파라미터 타입 정의
interface SearchParams {
    query: string;
    category: SearchCategory;
    mode: SearchMode;
    filter: SearchFilter;
}

export interface SearchResponse {
    id: string;
    postId: number;
    pathUrl: string;
    breed: string;
    location: string;
    x: number;
    y: number;
    type: 0 | 1; // 0 = 실종, 1 = 발견
    etc?: string; // 선택값
}

// Context 생성
const PetContext = createContext<PetContext | undefined>(undefined);

// Context Provider 컴포넌트
export const PetProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    // 상태 관리
    const [missingPets, setMissingPets] = useState<PetList[]>([]);
    const [findingPets, setFindingPets] = useState<PetList[]>([]);

    const [searchMode, setSearchMode] = useState<SearchMode>('전체');
    const [activeFilter, setActiveFilter] = useState<SearchFilter>('전체');
    const [searchCategory, setSearchCategory] = useState<SearchCategory>('전체');

    const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
    const [lastSearchCategory, setLastSearchCategory] = useState<SearchCategory>('전체');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [missingHasMore, setMissingHasMore] = useState<boolean>(true);
    const [findingHasMore, setFindingHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);

    const {userLocation} = useMapLocation();
    const {radius} = useRadius();


// 검색 함수 추가
    // searchPets 함수 수정
    const searchPets = async (params: SearchParams) => {
        setIsLoading(true);
        setPage(0);

        try {
            const { query, category, mode } = params;

            if (mode === '전체') {
                if (query && query.trim() !== '') {
                    // 검색어가 있는 경우 /api/v1/search API 사용
                    setLastSearchQuery(query);
                    setLastSearchCategory(category);
                    await searchWithKeyword(query, category);
                } else {
                    // 검색어가 없는 경우 일반 데이터 로드
                    setLastSearchQuery('');
                    setLastSearchCategory('전체');
                    await loadNormalData();
                }
            } else {
                // 반경 모드 검색
                console.log('반경 모드 검색:', params);
                setLastSearchQuery('');
                setLastSearchCategory('전체');
                await loadRadiusData(query, category);
            }
        } catch (error) {
            console.error('검색 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어를 이용한 검색 함수 추가
    const searchWithKeyword = async (keyword: string, category: SearchCategory) => {
        try {
            // 카테고리 매핑 (genre 파라미터에 맞게 변환)
            // API에서는 'genre' 파라미터를 사용하지만, 우리 앱에서는 'category'를 사용
            let genre = '';
            if (category === '품종') {
                genre = 'breed';
            } else if (category === '지역') {
                genre = 'location';
            }

            setMissingHasMore(true);
            setFindingHasMore(true);

            // 검색 API 호출
            const searchResponse = await axios.get(`${backUrl}/api/v1/search`, {
                params: {
                    kw: keyword,
                    genre: genre || undefined, // 전체 카테고리인 경우 genre 파라미터 생략
                    page: 0,
                    size: 10
                },
                withCredentials: true,
            });

            console.log('검색 결과:', searchResponse.data);

            // 검색 결과 처리
            const searchResults = searchResponse.data.data || {};

            // API 응답 구조에 따라 처리 (맞춰서 수정 필요할 수 있음)
            // 예상 응답 구조: { content: [...], last: boolean, ... }
            const results = searchResults.content || [];
            console.log("results : ", results)

            // activeFilter에 따라 결과 필터링
            if (activeFilter === '전체') {
                // 결과를 실종/발견으로 분류
                const missingResults = results.filter((item: SearchResponse) => item.type === 1);
                const findingResults = results.filter((item: SearchResponse) => item.type === 0);

                setMissingPets(missingResults);
                setFindingPets(findingResults);

            } else if (activeFilter === '잃어버렸개') {
                const missingResults = results.filter((item: SearchResponse) => item.type === 1);
                setMissingPets(missingResults);
                setFindingPets([]);

                console.log("검색 결과---------:", missingResults);
            } else if (activeFilter === '발견했개') {
                const findingResults = results.filter((item:SearchResponse) => item.type === 0);
                setMissingPets([]);
                setFindingPets(findingResults);
            }

            // // 더보기 가능 여부 설정
            // setHasMore(!searchResults.last);

        } catch (error) {
            console.error('검색 API 오류:', error);
            // 오류 발생 시 빈 결과 표시
            if (activeFilter === '전체' || activeFilter === '잃어버렸개') {
                setMissingPets([]);
            }
            if (activeFilter === '전체' || activeFilter === '발견했개') {
                setFindingPets([]);
            }
            throw error;
        }
    };

    // 초기 데이터 로드
    useEffect(() => {
        if (activeFilter === "My") {
            setMissingPets([]);
            setFindingPets([]);
        } else {
            refreshPets();
        }
    }, [searchMode, activeFilter, userLocation, radius]);

    useEffect(() => {
        console.log("현재 검색 모드:", searchMode);
    }, [searchMode]);

    useEffect(() => {
        console.log("현재 활성화 탭 :", activeFilter);
        console.log("실종 펫 정보:", missingPets)
        console.log("발견 펫 정보:", findingPets)
    }, [activeFilter]);

    // 기존 refreshPets 함수 수정
    const refreshPets = async () => {
        setIsLoading(true);
        setPage(0);

        try {
            if (searchMode === '전체') {
                // 전체 모드: 일반 페이징 API 사용
                await loadNormalData();
            } else {
                // 반경 모드: 반경 검색 API 사용 (검색어 없이 기본 반경 검색)
                await loadRadiusData('', '');
            }
        } catch (error) {
            console.error('데이터 로드 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadNormalData = async () => {
        try {
            // 실종 동물 데이터 로드
            if (activeFilter === "전체" || activeFilter === "잃어버렸개") {
                const missingResponse = await axios.get(`${backUrl}/api/v1/missings?page=0&size=10`);
                const newMissingPets = missingResponse.data.data.content || [];
                setMissingPets(newMissingPets);
                setMissingHasMore(!missingResponse.data.data.last);
            } else if (activeFilter === "발견했개") {
                // 필터가 '발견했개'일 때는 실종 동물 데이터를 비움
                setMissingPets([]);
            }

            // 발견 동물 데이터 로드
            if (activeFilter === "전체" || activeFilter === "발견했개") {
                const findingResponse = await axios.get(`${backUrl}/api/v1/finding?page=0&size=10`, {
                    withCredentials: true,
                });
                const newFindingPets = findingResponse.data.data.content || [];
                setFindingPets(newFindingPets);
                setFindingHasMore(!findingResponse.data.data.last);
                console.log("로그--------------", findingResponse.data.data.last)

            } else if (activeFilter === "잃어버렸개") {
                // 필터가 '잃어버렸개'일 때는 발견 동물 데이터를 비움
                setFindingPets([]);
            }

        } catch (error) {
            console.error('일반 데이터 로드 오류:', error);
            throw error;
        }
    };

    const loadRadiusData = async (keyword = '', category = '') => {
        try {
            if (!userLocation) {
                console.warn('반경 검색을 위한 위치 정보가 없습니다.');
                return;
            }

            const {_lat: lat, _lng: lng} = userLocation;

            // 카테고리 값을 API 요청에 맞게 변환 (없거나 '전체'인 경우 빈 문자열로)
            const apiCategory = category === '전체' ? '' : category;

            // hasMore 설정 - 반경 검색에서는 페이징이 없으므로 false로 설정
            setHasMore(false);

            // 실종 동물 반경 검색
            if (activeFilter === "전체" || activeFilter === "잃어버렸개") {
                const missingRadiusResponse = await axios.get(`${backUrl}/api/v1/missings/radius`, {
                    params: {
                        lat,
                        lng,
                        radius,
                        keyword,
                        category: apiCategory
                    }
                });
                const radiusMissingPets = missingRadiusResponse.data.data || [];
                setMissingPets(radiusMissingPets);
                console.log("radiusMissingPets:", radiusMissingPets);
            } else {
                setMissingPets([]);
            }

            // 발견 동물 반경 검색
            if (activeFilter === "전체" || activeFilter === "발견했개") {
                const findingRadiusResponse = await axios.get(`${backUrl}/api/v1/finding/radius`, {
                    params: {
                        lat,
                        lng,
                        radius,
                        keyword,
                        category: apiCategory
                    },
                    withCredentials: true,
                });
                const radiusFindingPets = findingRadiusResponse.data.data || [];
                setFindingPets(radiusFindingPets);
                console.log("radiusFindingPets:", radiusFindingPets);
            } else {
                setFindingPets([]);
            }

        } catch (error) {
            console.error('반경 데이터 로드 오류:', error);
            throw error;
        }
    };

    // loadMorePets 함수 업데이트 - 검색 결과에 대한 더 불러오기 지원
    const loadMorePets = async () => {
        if (isLoading || !missingHasMore || !findingHasMore) return;

        setIsLoading(true);
        const nextPage = page + 1;

        try {
            // 현재 검색 중인지 확인 (lastSearchQuery가 있으면 검색 중)
            if (lastSearchQuery && searchMode === '전체') {
                // 검색 결과 더 불러오기
                await loadMoreSearchResults(lastSearchQuery, lastSearchCategory, nextPage);
            } else if (searchMode === '전체') {
                // 일반 전체 모드에서는 페이징을 통해 더 많은 데이터 로드
                let response;

                if (activeFilter === '잃어버렸개' || activeFilter === '전체') {
                    response = await axios.get(`${backUrl}/api/v1/missings?page=${nextPage}&size=10`);

                    const newPets = response.data.data.content || [];
                    setMissingPets(prev => [...prev, ...newPets]);
                    setMissingHasMore(!response.data.data.last);
                    console.log("로그--------------", response.data.data.last)

                }

                if (activeFilter === '발견했개' || activeFilter === '전체') {
                    response = await axios.get(`${backUrl}/api/v1/finding?page=${nextPage}&size=10`);

                    const newPets = response.data.data.content || [];
                    setFindingPets(prev => [...prev, ...newPets]);
                    setFindingHasMore(!response.data.data.last);
                    console.log("로그--------------", response.data.data.last)

                }

                setPage(nextPage);
            }
            // 반경 모드에서는 추가 로드가 없음 (전체 결과를 한 번에 가져옴)
        } catch (error) {
            console.error('추가 데이터 로드 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

// 검색 결과 더 불러오기 함수
    const loadMoreSearchResults = async (keyword: string, category: SearchCategory, nextPage: number) => {
        try {
            // 카테고리 매핑
            let genre = '';
            if (category === '품종') {
                genre = 'breed';
            } else if (category === '지역') {
                genre = 'location';
            }

            // 검색 API 호출
            const searchResponse = await axios.get(`${backUrl}/api/v1/search`, {
                params: {
                    kw: keyword,
                    genre: genre || undefined,
                    page: nextPage,
                    size: 10
                },
                withCredentials: true,
            });

            // 검색 결과 처리
            const searchResults = searchResponse.data.data || {};
            const results = searchResults.content || [];

            // activeFilter에 따라 결과 필터링 및 추가
            if (activeFilter === '전체') {
                const missingResults = results.filter((item : SearchResponse) => item.type === 1);
                const findingResults = results.filter((item : SearchResponse) => item.type === 0);

                setMissingPets(prev => [...prev, ...missingResults]);
                setFindingPets(prev => [...prev, ...findingResults]);
            } else if (activeFilter === '잃어버렸개') {
                const missingResults = results.filter((item : SearchResponse) => item.type === 1);
                setMissingPets(prev => [...prev, ...missingResults]);
            } else if (activeFilter === '발견했개') {
                const findingResults = results.filter((item : SearchResponse) => item.type === 0);
                setFindingPets(prev => [...prev, ...findingResults]);
            }

            // 더보기 가능 여부 설정
            // setHasMore(!searchResults.last);

            // 페이지 업데이트
            setPage(nextPage);

        } catch (error) {
            console.error('검색 추가 로드 오류:', error);
            throw error;
        }
    };

    // Context 값 제공 - value 객체에 searchPets 추가
    const value: PetContext = {
        missingPets,
        findingPets,
        searchMode,
        activeFilter,
        searchCategory,
        isLoading,
        missingHasMore,
        findingHasMore,
        setSearchMode,
        setActiveFilter,
        setSearchCategory,
        loadMorePets,
        refreshPets,
        searchPets // 추가된 함수
    };

    return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
};

// Context 훅
export const usePetContext = () => {
    const context = useContext(PetContext);
    if (context === undefined) {
        throw new Error('usePetContext must be used within a PetProvider');
    }
    return context;
};