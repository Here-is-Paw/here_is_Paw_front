import { FC } from "react";
import { Menu, Search } from "lucide-react";
import paw from "../../assets/paw.svg";

interface SidebarHeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters = ["전체", "잃어버렸개", "발견했개", "My"];

  return (
    <div className="p-4 max-lg:px-2 border-b bg-green-600 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Menu className="w-6 h-6" />
        <div className="text-2xl font-bold">Here'sPaw</div>
        <img src={paw} alt="Logo" className="w-8 h-8" />
      </div>
      <div className="relative mb-4">
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="장소, 주소 검색"
            className="w-full px-4 py-2 bg-white rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Search className="absolute right-3 text-gray-400 w-5 h-5" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              onFilterChange(filter);
            }}
            className={`px-1 rounded-lg text-sm font-medium focus:outline-none ${
              activeFilter === filter
                ? "bg-green-700 text-white"
                : "bg-green-600 text-white hover:bg-green-500 focus:outline-none hover:outline-none"
            } ${
              filter === "전체" || filter === "My" ? "col-span-2" : "col-span-4"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};
