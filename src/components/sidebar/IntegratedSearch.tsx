import { FC, useState } from 'react';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePetContext } from '@/contexts/PetContext';
import { useMapLocation } from '@/contexts/MapLocationContext';

interface IntegratedSearchProps {
    onSearchStart?: () => void;
}

export const IntegratedSearch: FC<IntegratedSearchProps> = ({
                                                                onSearchStart
                                                            }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const {
        searchMode,
        activeFilter,
        searchCategory,
        setSearchCategory,
        isLoading,
        searchPets // searchPets 함수 불러오기
    } = usePetContext();

    const { userLocation } = useMapLocation();

    const handleSearch = async () => {
        if (!searchQuery.trim() && searchMode === '반경' && !userLocation) {
            alert('검색어를 입력하거나 지도에서 위치를 선택해주세요.');
            return;
        }

        // 반경 검색 모드에서 위치가 선택되지 않은 경우
        if (searchMode === '반경' && !userLocation) {
            alert('지도에서 위치를 선택해주세요.');
            return;
        }

        try {
            if (onSearchStart) onSearchStart();

            // 검색 파라미터 설정
            const searchParams = {
                query: searchQuery,
                category: searchCategory,
                mode: searchMode,
                filter: activeFilter,
            };

            // Context를 통한 검색 실행
            await searchPets(searchParams);
        } catch (error) {
            console.error('검색 오류:', error);
        }
    };

    return (
        <div className="relative mb-4">
            <div className="flex w-full rounded-lg bg-white overflow-hidden">
                {/* 셀렉트 부분 */}
                <div className="border-r border-gray-200">
                    <Select
                        value={searchCategory}
                        onValueChange={setSearchCategory}
                    >
                        <SelectTrigger className="h-10 w-20 border-0 rounded-none bg-white text-black focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="전체">전체</SelectItem>
                            <SelectItem value="지역">지역</SelectItem>
                            <SelectItem value="품종">품종</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 검색창 부분 */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={searchMode === '반경' ? "반경 내 게시글 검색" : "전체 게시글 검색"}
                        className="w-full h-10 px-4 py-2 border-0 focus:outline-none text-black placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading}
                    >
                        <Search className={`w-5 h-5 ${isLoading ? 'text-gray-300' : 'text-gray-400'}`} />
                    </button>
                </div>
            </div>

            {searchMode === '반경' && (
                <div className="mt-1 text-xs text-white">
                    지도에서 위치를 클릭하고 검색하면 설정된 반경 내에서 검색합니다.
                </div>
            )}
        </div>
    );
};