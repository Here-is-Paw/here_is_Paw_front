import { FC, useState } from 'react';
import { Menu } from 'lucide-react';
import paw from '../../assets/paw.svg';
import { IntegratedSearch } from './IntegratedSearch';
import { SearchResult } from '@/services/searchService';
// import { useToast } from "@/components/ui/use-toast";

interface SidebarHeaderProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    onSearchResults?: (results: SearchResult) => void;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({
                                                          activeFilter,
                                                          onFilterChange,
                                                          onSearchResults
                                                      }) => {
    const filters = ['전체', '잃어버렸개', '발견했개', 'My'];
    const [isSearching, setIsSearching] = useState(false);
    // const { toast } = useToast();

    const handleSearchResults = (results: SearchResult) => {
        // 만약 결과가 없다면 토스트 메시지 표시
        // if (results.totalCount === 0) {
        //     toast({
        //         title: "검색 결과 없음",
        //         description: "검색 결과가 없습니다. 다른 키워드로 검색해 보세요.",
        //         variant: "destructive",
        //     });
        // }

        // 상위 컴포넌트로 검색 결과 전달
        if (onSearchResults) {
            onSearchResults(results);
        }
    };

    // const handleSearchError = (error: Error) => {
    //     toast({
    //         title: "검색 오류",
    //         description: error.message || "검색 중 오류가 발생했습니다.",
    //         variant: "destructive",
    //     });
    // };

    const handleSearchStart = () => {
        setIsSearching(true);
    };

    return (
        <div className="p-4 border-b bg-green-600 text-white">
            <div className="flex items-center gap-2 mb-4">
                <Menu className="w-6 h-6" />
                <div className="text-2xl font-bold">Here'sPaw</div>
                <img
                    src={paw}
                    alt="Logo"
                    className="w-8 h-8"
                />
            </div>

            {/* 통합형 검색 컴포넌트 */}
            <IntegratedSearch
                onSearchResults={handleSearchResults}
                // onSearchError={handleSearchError}
                onSearchStart={handleSearchStart}
            />

            <div className="grid grid-cols-12 gap-3">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => {
                            onFilterChange(filter);
                        }}
                        className={`px-1 rounded-lg text-sm font-medium focus:outline-none ${
                            activeFilter === filter
                                ? 'bg-green-700 text-white'
                                : "bg-green-600 text-white hover:bg-green-500 focus:outline-none hover:outline-none"
                        } ${
                            filter === '전체' || filter === 'My'
                                ? 'col-span-2'
                                : 'col-span-4'
                        }`}
                        disabled={isSearching}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};