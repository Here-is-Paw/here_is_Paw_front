import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import axios from "axios";
import { backUrl } from "@/constants";
import { useMapLocation } from "@/contexts/MapLocationContext.tsx";
import { useRadius } from "@/contexts/RadiusContext.tsx";

// 보호소 데이터 타입 정의
export interface CareCenter {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    operatingHours: string;
    x: number; // 경도
    y: number; // 위도
    website?: string; // 선택적 웹사이트 URL
    animalCount?: number; // 보호 중인 동물 수
}

// 검색 모드 타입
type SearchMode = "전체" | "반경";

// 검색 파라미터 타입 정의
interface SearchParams {
    query: string;
    mode: SearchMode;
}

// API 응답 타입
export interface CareSearchResponse {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    operatingHours: string;
    x: number;
    y: number;
    website?: string;
    animalCount?: number;
}

// Context에서 제공할 데이터 및 메서드 타입
interface CareCenterContext {
    // 데이터
    careCenters: CareCenter[];
    
    // 상태
    searchMode: SearchMode;
    isLoading: boolean;
    hasMore: boolean;
    
    // 메서드
    setSearchMode: (mode: SearchMode) => void;
    loadMoreCenters: () => Promise<void>;
    refreshCenters: () => Promise<void>;
    searchCenters: (params: SearchParams) => Promise<void>;
}

// Context 생성
const CareCenterContext = createContext<CareCenterContext | undefined>(undefined);

// Context Provider 컴포넌트
export const CareCenterProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    // 상태 관리
    const [careCenters, setCareCenters] = useState<CareCenter[]>([]);
    const [searchMode, setSearchMode] = useState<SearchMode>("전체");
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    
    const { userLocation } = useMapLocation();
    const { radius } = useRadius();
    
    // API 응답을 CareCenter 객체로 변환하는 함수
    const convertResponseToCareCenter = (results: CareSearchResponse[]): CareCenter[] => {
        return results.map(item => ({
            id: item.id,
            name: item.name,
            address: item.address,
            phoneNumber: item.phoneNumber,
            operatingHours: item.operatingHours,
            x: item.x,
            y: item.y,
            website: item.website,
            animalCount: item.animalCount
        }));
    };
    
    // 검색 함수 - 반경 검색만 사용
    const searchCenters = async (params: SearchParams) => {
        setIsLoading(true);
        setPage(0);
        
        try {
            const { query, mode } = params;
            
            if (mode === "전체") {
                // 전체 모드에서는 이제 검색이 없으므로 빈 배열만 설정
                setCareCenters([]);
                setHasMore(false);
            } else {
                // 반경 모드 검색
                console.log("보호소 반경 모드 검색:", params);
                await loadRadiusData(query);
            }
        } catch (error) {
            console.error("보호소 검색 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // 초기 데이터 로드
    useEffect(() => {
        refreshCenters();
    }, [searchMode, userLocation, radius]);
    
    useEffect(() => {
        console.log("보호소 현재 검색 모드:", searchMode);
    }, [searchMode]);
    
    // 기본 데이터 새로고침 함수
    const refreshCenters = async () => {
        setIsLoading(true);
        setPage(0);
        
        try {
            if (searchMode === "전체") {
                // 전체 모드: 데이터 없음
                setCareCenters([]);
                setHasMore(false);
            } else {
                // 반경 모드: 반경 검색 API 사용
                await loadRadiusData("");
            }
        } catch (error) {
            console.error("보호소 데이터 로드 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // 반경 데이터 로드 함수
    const loadRadiusData = async (keyword = "") => {
        try {
            console.log("보호소 반경 검색 시작:", keyword);
            if (!userLocation) {
                console.warn("반경 검색을 위한 위치 정보가 없습니다.");
                return;
            }
            
            const { _lat, _lng } = userLocation;
            
            // 반경 검색에서는 페이징이 없으므로 false로 설정
            setHasMore(false);
            
            const radiusResponse = await axios.get(
                `${backUrl}/api/v1/care-center/radius`,
                {
                    params: {
                        latitude: _lat,
                        longitude: _lng,
                        radius
                    },
                    withCredentials: true,
                }
            );
            
            const radiusCenters = radiusResponse.data.data || [];
            
            // API 응답 필드명을 컴포넌트가 기대하는 필드명으로 매핑
            const mappedCenters = radiusCenters.map(center => ({
                id: center.id,
                name: center.careNm,
                address: center.careAddr,
                phoneNumber: center.careTel,
                operatingHours: `${center.weekOprStime || ''}-${center.weekOprEtime || ''}`,
                x: center.lng,  // lng를 x로 매핑
                y: center.lat,  // lat를 y로 매핑
                website: '',    // 없는 경우 기본값
                animalCount: 0  // 없는 경우 기본값
            }));
            
            setCareCenters(mappedCenters);
            console.log("반경 내 보호소 결과:", mappedCenters);
        } catch (error) {
            console.error("보호소 반경 데이터 로드 오류:", error);
            throw error;
        }
    };
    
    // 더 많은 데이터 로드 함수 - 이제 반경만 지원하므로 빈 함수
    const loadMoreCenters = async () => {
        // 반경 모드에서는 추가 로드가 없으므로 아무 작업도 수행하지 않음
        return;
    };
    
    // Context 값 제공
    const value: CareCenterContext = {
        careCenters,
        searchMode,
        isLoading,
        hasMore,
        setSearchMode,
        loadMoreCenters,
        refreshCenters,
        searchCenters,
    };
    
    return <CareCenterContext.Provider value={value}>{children}</CareCenterContext.Provider>;
};

export function useCareCenterContext() {
    const context = useContext(CareCenterContext);
    if (context === undefined) {
        throw new Error("useCareCenterContext must be used within a CareCenterProvider");
    }
    return context;
}