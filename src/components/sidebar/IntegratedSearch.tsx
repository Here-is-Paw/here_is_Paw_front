import { FC, useState } from 'react';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { searchService, SearchResult, GlobalResponse } from '@/services/searchService';

interface IntegratedSearchProps {
    onSearchResults?: (results: SearchResult) => void;
    onSearchError?: (error: Error) => void;
    onSearchStart?: () => void;
}

export const IntegratedSearch: FC<IntegratedSearchProps> = ({
                                                                onSearchResults,
                                                                onSearchError,
                                                                onSearchStart
                                                            }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('전체');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            return; // 빈 검색어는 처리하지 않음
        }

        try {
            setIsLoading(true);
            if (onSearchStart) onSearchStart();

            let response: GlobalResponse<SearchResult>;

            // 카테고리에 따라 다른 검색 API 호출
            if (searchCategory === '전체') {
                response = await searchService.searchAll(searchQuery);
            } else {
                response = await searchService.searchByCategory(searchQuery/*, searchCategory*/);
            }

            if (response.status === 200 && onSearchResults) {
                onSearchResults(response.data);
            }
        } catch (error) {
            console.error('검색 오류:', error);
            if (onSearchError && error instanceof Error) {
                onSearchError(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative mb-4">
            <div className="flex w-full rounded-lg bg-white overflow-hidden">
                {/* 셀렉트 부분 */}
                <div className="border-r border-gray-200">
                    <Select value={searchCategory} onValueChange={setSearchCategory}>
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
                        placeholder="장소, 주소 검색"
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
        </div>
    );
};