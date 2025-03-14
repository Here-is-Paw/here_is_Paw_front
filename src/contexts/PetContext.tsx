import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import axios from "axios";
import { backUrl } from "@/constants";
import { PetList } from "@/types/mypet.ts";
import { useMapLocation } from "@/contexts/MapLocationContext.tsx";
import { useRadius } from "@/contexts/RadiusContext.tsx";

// 검색 모드 타입
type SearchMode = "전체" | "반경";

// 검색 필터 타입
type SearchFilter = "전체" | "잃어버렸개" | "발견했개" | "My";

// 검색 카테고리 타입
type SearchCategory = "전체" | "지역" | "품종";

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
    loadMorePets: (type?: "missing" | "finding") => Promise<void>;
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

interface SearchParamsType {
    kw: string;
    page: number;
    size: number;
    genre?: string; // genre를 선택적 속성(optional)으로 정의
}

export interface SearchResponse {
    id: number;
    pathUrl: string;
    breed: string;
    location: string;
    x: number;
    y: number;
    etc?: string; // 선택값
}

// Context 생성
const PetContext = createContext<PetContext | undefined>(undefined);

// Context Provider 컴포넌트
export const PetProvider: React.FC<{ children: ReactNode }> = ({
                                                                   children,
                                                               }) => {
    // 상태 관리
    const [missingPets, setMissingPets] = useState<PetList[]>([]);
    const [findingPets, setFindingPets] = useState<PetList[]>([]);

    const [searchMode, setSearchMode] = useState<SearchMode>("전체");
    const [activeFilter, setActiveFilter] = useState<SearchFilter>("전체");
    const [searchCategory, setSearchCategory] = useState<SearchCategory>("전체");

    const [lastSearchQuery, setLastSearchQuery] = useState<string>("");
    const [lastSearchCategory, setLastSearchCategory] = useState<SearchCategory>("전체");

    // 각 탭별로 독립적인 로딩 상태 관리
    const [missingLoading, setMissingLoading] = useState<boolean>(false);
    const [findingLoading, setFindingLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [missingHasMore, setMissingHasMore] = useState<boolean>(true);
    const [findingHasMore, setFindingHasMore] = useState<boolean>(true);
    const [missingPage, setMissingPage] = useState<number>(0);
    const [findingPage, setFindingPage] = useState<number>(0);

    const { userLocation } = useMapLocation();
    const { radius } = useRadius();

    // SearchResponse에서 PetList로 변환하는 함수
    const convertSearchToPetList = (searchResults: SearchResponse[]): PetList[] => {
        return searchResults.map(item => ({
            id: item.id, // postId를 숫자로 변환하여 PetList의 id에 매핑
            breed: item.breed,
            location: item.location,
            etc: item.etc || '', // etc는 optional이므로 없으면 빈 문자열로 설정
            x: item.x,
            y: item.y,
            pathUrl: item.pathUrl
        }));
    };

    const pageReset = ()=> {
        setMissingPage(0);
        setFindingPage(0);
    }

// 검색 함수 추가
    // searchPets 함수 수정
    const searchPets = async (params: SearchParams) => {
        setIsLoading(true);

        // 페이지 Reset
        pageReset();

        try {
            const { query, category, mode } = params;

            if (mode === "전체") {
                if (query && query.trim() !== "") {
                    // 검색어가 있는 경우 /api/v1/search API 사용
                    setLastSearchQuery(query);
                    setLastSearchCategory(category);
                    await searchWithKeyword(query, category);
                } else {
                    // 검색어가 없는 경우 일반 데이터 로드
                    setLastSearchQuery("");
                    setLastSearchCategory("전체");
                    await loadNormalData();
                }
            } else {
                // 반경 모드 검색
                console.log("반경 모드 검색:", params);
                setLastSearchQuery("");
                setLastSearchCategory("전체");
                await loadRadiusData(query, category);
            }
        } catch (error) {
            console.error("검색 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어를 이용한 검색 함수 수정
    const searchWithKeyword = async (keyword: string, category: SearchCategory) => {
        try {
            // 카테고리 매핑 (genre 파라미터에 맞게 변환)
            let genre = '';
            if (category === '품종') {
                genre = '품종';
            } else if (category === '지역') {
                genre = '지역';
            }

            setMissingHasMore(true);
            setFindingHasMore(true);

            // 각 탭에 맞는 API 요청 준비
            const searchParams = {
                kw: keyword,
                genre: genre,
                page: 0,
                size: 10
            };

            // 병렬 처리를 위한 프로미스 배열
            const promises = [];

            // activeFilter에 따라 적절한 API 호출
            if (activeFilter === '전체' || activeFilter === '잃어버렸개') {
                // 실종 동물 검색 API 호출
                promises.push(
                    axios.get(`${backUrl}/api/v1/searchPost/missing`, {
                        params: searchParams,
                        withCredentials: true,
                    }).then(missingResponse => {
                        const missingResults = missingResponse.data.data?.content || [];
                        const convertedMissingPets = convertSearchToPetList(missingResults);
                        setMissingPets(convertedMissingPets);
                        setMissingHasMore(!missingResponse.data.data?.last);
                        console.log("변환된 실종 검색 결과:", convertedMissingPets);
                    })
                );
            } else {
                setMissingPets([]);
            }

            if (activeFilter === '전체' || activeFilter === '발견했개') {
                // 발견 동물 검색 API 호출
                promises.push(
                    axios.get(`${backUrl}/api/v1/searchPost/finding`, {
                        params: searchParams,
                        withCredentials: true,
                    }).then(findingResponse => {
                        const findingResults = findingResponse.data.data?.content || [];
                        const convertedFindingPets = convertSearchToPetList(findingResults);
                        setFindingPets(convertedFindingPets);
                        setFindingHasMore(!findingResponse.data.data?.last);
                        console.log("변환된 발견 검색 결과:", convertedFindingPets);
                    })
                );
            } else {
                setFindingPets([]);
            }

            // 모든 API 호출 대기
            await Promise.all(promises);

        } catch (error) {
            console.error('검색 API 오류:', error);
            // 오류 발생 시 빈 결과 표시
            setMissingPets([]);
            setFindingPets([]);
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
        // 검색어가 있을 때만 재검색 수행
        if (lastSearchQuery) {
            // 비동기 함수를 만들어 호출
            const reapplySearch = async () => {
                setIsLoading(true);
                try {
                    await searchWithKeyword(lastSearchQuery, lastSearchCategory);
                } catch (error) {
                    console.error("탭 변경 후 재검색 오류:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            reapplySearch();
        }
        // 검색어가 없을 때는 일반 데이터 로드 (기존 useEffect에서 처리됨)
    }, [activeFilter]);

    // 기존 refreshPets 함수 수정
    const refreshPets = async () => {
        setIsLoading(true);
        setMissingPets([]);
        setFindingPets([]);
        pageReset();

        try {
            if (searchMode === "전체") {
                // 전체 모드일 때, 검색어가 있으면 검색 결과를 유지
                if (lastSearchQuery) {
                    await searchWithKeyword(lastSearchQuery, lastSearchCategory);
                } else {
                    // 검색어가 없으면 일반 데이터 로드
                    await loadNormalData();
                }
            } else {
                // 반경 모드: 반경 검색 API 사용
                // 검색어가 있으면 해당 검색어로 반경 검색
                await loadRadiusData(lastSearchQuery, lastSearchCategory);
            }
        } catch (error) {
            console.error("데이터 로드 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadNormalData = async () => {
        try {
            // 병렬 처리를 위한 프로미스 배열
            const promises = [];

            // 실종 동물 데이터 로드
            if (activeFilter === "전체" || activeFilter === "잃어버렸개") {
                promises.push(
                    axios.get(`${backUrl}/api/v1/missings?page=0&size=10`)
                        .then(missingResponse => {
                            const newMissingPets = missingResponse.data.data.content || [];
                            setMissingPets(newMissingPets);
                            setMissingHasMore(!missingResponse.data.data.last);
                        })
                );
            } else if (activeFilter === "발견했개") {
                // 필터가 '발견했개'일 때는 실종 동물 데이터를 비움
                setMissingPets([]);
            }

            // 발견 동물 데이터 로드
            if (activeFilter === "전체" || activeFilter === "발견했개") {
                promises.push(
                    axios.get(`${backUrl}/api/v1/finding?page=0&size=10`, {
                        withCredentials: true,
                    })
                        .then(findingResponse => {
                            const newFindingPets = findingResponse.data.data.content || [];
                            setFindingPets(newFindingPets);
                            setFindingHasMore(!findingResponse.data.data.last);
                        })
                );
            } else if (activeFilter === "잃어버렸개") {
                // 필터가 '잃어버렸개'일 때는 발견 동물 데이터를 비움
                setFindingPets([]);
            }

            // 모든 API 호출 대기
            await Promise.all(promises);
        } catch (error) {
            console.error("일반 데이터 로드 오류:", error);
            throw error;
        }
    };

    const loadRadiusData = async (keyword = "", category = "") => {
        try {
            if (!userLocation) {
                console.warn("반경 검색을 위한 위치 정보가 없습니다.");
                return;
            }

            const { _lat: lat, _lng: lng } = userLocation;

            // 카테고리 값을 API 요청에 맞게 변환 (없거나 '전체'인 경우 빈 문자열로)
            const apiCategory = category === "전체" ? "" : category;

            // hasMore 설정 - 반경 검색에서는 페이징이 없으므로 false로 설정
            setMissingHasMore(false);
            setFindingHasMore(false);

            // 병렬 처리를 위한 프로미스 배열
            const promises = [];

            // 실종 동물 반경 검색
            if (activeFilter === "전체" || activeFilter === "잃어버렸개") {
                promises.push(
                    axios.get(`${backUrl}/api/v1/missings/radius`, {
                        params: {
                            lat,
                            lng,
                            radius,
                            keyword,
                            category: apiCategory,
                        },
                    })
                        .then(missingRadiusResponse => {
                            const radiusMissingPets = missingRadiusResponse.data.data || [];
                            setMissingPets(radiusMissingPets);
                            console.log("radiusMissingPets:", radiusMissingPets);
                        })
                );
            } else {
                setMissingPets([]);
            }

            // 발견 동물 반경 검색
            if (activeFilter === "전체" || activeFilter === "발견했개") {
                promises.push(
                    axios.get(`${backUrl}/api/v1/finding/radius`, {
                        params: {
                            lat,
                            lng,
                            radius,
                            keyword,
                            category: apiCategory,
                        },
                        withCredentials: true,
                    })
                        .then(findingRadiusResponse => {
                            const radiusFindingPets = findingRadiusResponse.data.data || [];
                            setFindingPets(radiusFindingPets);
                            console.log("radiusFindingPets:", radiusFindingPets);
                        })
                );
            } else {
                setFindingPets([]);
            }

            // 모든 API 호출 대기
            await Promise.all(promises);
        } catch (error) {
            console.error("반경 데이터 로드 오류:", error);
            throw error;
        }
    };

    // loadMorePets 함수 업데이트 - type 파라미터 추가하여 각 탭 독립적으로 페이징 처리
    const loadMorePets = async (type?: "missing" | "finding") => {
        // "전체" 탭에서는 타입이 지정되지 않으면 현재 activeFilter에 따라 결정
        if (!type) {
            if (activeFilter === "잃어버렸개") {
                type = "missing";
            } else if (activeFilter === "발견했개") {
                type = "finding";
            } else if (activeFilter === "전체") {
                // 전체 탭일 경우, 둘 다 로드
                if (missingHasMore) {
                    await loadMorePets("missing");
                }
                if (findingHasMore) {
                    await loadMorePets("finding");
                }
                return; // 두 가지 모두 처리했으므로 여기서 종료
            }
        }

        // 현재 검색 모드가 반경 검색이면 더 불러오기 없음
        if (searchMode === "반경") {
            return;
        }

        // 특정 타입에 대한 로딩 중 상태 확인
        if (type === "missing" && missingLoading) return;
        if (type === "finding" && findingLoading) return;

        try {
            // 검색 중일 때 (lastSearchQuery가 있을 때)
            if (lastSearchQuery) {
                // 검색 결과 더 불러오기
                if (type === "missing") {
                    await loadMoreSearchResultsByType("missing", lastSearchQuery, lastSearchCategory, missingPage);
                } else if (type === "finding") {
                    await loadMoreSearchResultsByType("finding", lastSearchQuery, lastSearchCategory, findingPage);
                }
                return;
            }

            // 일반 데이터 더 불러오기
            if (type === "missing") {
                if (!missingHasMore) return;

                setMissingLoading(true);
                const nextPage = missingPage + 1;

                try {
                    const response = await axios.get(`${backUrl}/api/v1/missings?page=${nextPage}&size=10`);
                    const newPets = response.data.data.content || [];
                    setMissingPets((prev) => [...prev, ...newPets]);
                    setMissingHasMore(!response.data.data.last);
                    setMissingPage(nextPage);
                } finally {
                    setMissingLoading(false);
                }
            } else if (type === "finding") {
                if (!findingHasMore) return;

                setFindingLoading(true);
                const nextPage = findingPage + 1;

                try {
                    const response = await axios.get(`${backUrl}/api/v1/finding?page=${nextPage}&size=10`, {
                        withCredentials: true,
                    });
                    const newPets = response.data.data.content || [];
                    setFindingPets((prev) => [...prev, ...newPets]);
                    setFindingHasMore(!response.data.data.last);
                    setFindingPage(nextPage);
                } finally {
                    setFindingLoading(false);
                }
            }
        } catch (error) {
            console.error("추가 데이터 로드 오류:", error);
        }
    };

    // 타입별 검색 결과 더 불러오기 함수
    const loadMoreSearchResultsByType = async (
        type: "missing" | "finding",
        keyword: string,
        category: SearchCategory,
        currentPage: number
    ) => {
        console.log(`loadMoreSearchResultsByType 호출: type=${type}, keyword=${keyword}, category=${category}, page=${currentPage}`);

        // 특정 타입에 대한 로딩 중 상태 확인
        if (type === "missing" && missingLoading) {
            console.log("이미 missing 검색 결과를 로딩 중입니다.");
            return;
        }
        if (type === "finding" && findingLoading) {
            console.log("이미 finding 검색 결과를 로딩 중입니다.");
            return;
        }

        // 더 불러올 수 있는지 확인
        if (type === "missing" && !missingHasMore) {
            console.log("더 불러올 missing 검색 결과가 없습니다.");
            return;
        }
        if (type === "finding" && !findingHasMore) {
            console.log("더 불러올 finding 검색 결과가 없습니다.");
            return;
        }

        try {
            if (type === "missing") {
                setMissingLoading(true);
            } else {
                setFindingLoading(true);
            }

            // 카테고리 매핑
            let genre = "";
            if (category === "품종") {
                genre = "품종";
            } else if (category === "지역") {
                genre = "지역";
            }

            const nextPage = currentPage + 1;
            console.log(`${type} 검색 결과 다음 페이지 로드: ${nextPage}`);

            const searchParams: SearchParamsType = {
                kw: keyword,
                page: nextPage,
                size: 10,
            };
            if (genre !== "") {
                searchParams.genre = genre;
            }

            console.log("검색 파라미터:", searchParams);

            // 타입에 따른 API 호출
            if (type === "missing") {
                const missingResponse = await axios.get(`${backUrl}/api/v1/searchPost/missing`, {
                    params: searchParams,
                    withCredentials: true,
                });

                const missingResults = missingResponse.data.data?.content || [];
                console.log("검색 결과 데이터:", missingResults);

                const convertedMissingPets = convertSearchToPetList(missingResults);
                setMissingPets(prev => [...prev, ...convertedMissingPets]);
                setMissingHasMore(!missingResponse.data.data?.last);
                setMissingPage(nextPage);

                console.log("missing 검색 결과 더 불러오기 완료, 개수:", missingResults.length);
                console.log("더 불러올 데이터 있음:", !missingResponse.data.data?.last);
            } else if (type === "finding") {
                const findingResponse = await axios.get(`${backUrl}/api/v1/searchPost/finding`, {
                    params: searchParams,
                    withCredentials: true,
                });

                const findingResults = findingResponse.data.data?.content || [];
                console.log("검색 결과 데이터:", findingResults);

                const convertedFindingPets = convertSearchToPetList(findingResults);
                setFindingPets(prev => [...prev, ...convertedFindingPets]);
                setFindingHasMore(!findingResponse.data.data?.last);
                setFindingPage(nextPage);

                console.log("finding 검색 결과 더 불러오기 완료, 개수:", findingResults.length);
                console.log("더 불러올 데이터 있음:", !findingResponse.data.data?.last);
            }
        } catch (error) {
            console.error(`${type} 검색 추가 로드 오류:`, error);
        } finally {
            if (type === "missing") {
                setMissingLoading(false);
            } else {
                setFindingLoading(false);
            }
        }
    };

    // Context 값 제공 - value 객체에 searchPets 추가
    const value: PetContext = {
        missingPets,
        findingPets,
        searchMode,
        activeFilter,
        searchCategory,
        isLoading: isLoading || missingLoading || findingLoading, // 어느 하나라도 로딩 중이면 true
        missingHasMore,
        findingHasMore,
        setSearchMode,
        setActiveFilter,
        setSearchCategory,
        loadMorePets,
        refreshPets,
        searchPets, // 추가된 함수
    };

    return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
};

// Context 훅
export const usePetContext = () => {
    const context = useContext(PetContext);
    if (context === undefined) {
        throw new Error("usePetContext must be used within a PetProvider");
    }
    return context;
};