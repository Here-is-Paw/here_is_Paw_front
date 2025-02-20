import { FC, useState } from 'react';
import { Menu, Search } from 'lucide-react';
import paw from '../../assets/paw.svg'

export const SidebarHeader: FC = () => {
  const filters = ['전체', '잃어버렸개', '발견했개', 'My'];
  const [activeFilter, setActiveFilter] = useState('전체');

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
      <div className="grid grid-cols-4 gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${activeFilter === filter 
                ? 'bg-white text-green-600' 
                : 'bg-white/10 hover:bg-white/20'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};
