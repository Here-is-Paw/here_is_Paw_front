import { Button } from "@/components/ui/button"
import { Hospital } from "lucide-react"
import pawGreen from '../../assets/paw_green.svg'
import pawRed from '../../assets/paw_red.svg'

interface FilterButtonProps {
  buttonStates: {
    lost: boolean;
    found: boolean;
    hospital: boolean;
  };
  toggleButton: (buttonName: 'lost' | 'found' | 'hospital') => void;
}

export function FilterButton({ buttonStates, toggleButton }: FilterButtonProps) {
  return (
    <div className="flex items-center gap-3 flex-auto justify-center">
      <Button 
        variant="ghost" 
        className={`gap-2 ${
          buttonStates.lost ? 'bg-gray-300' : 'bg-red-500'
        } text-white rounded-full hover:bg-red-500 hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => toggleButton('lost')}
      >
        <img src={pawRed} alt="Logo" className="w-6 h-6" /> 
        잃어버렸개
      </Button>
      
      <Button 
        variant="ghost" 
        className={`gap-2 ${
          buttonStates.found ? 'bg-gray-300' : 'bg-green-500'
        } text-white rounded-full hover:bg-green-500 hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => toggleButton('found')}
      >
        <img src={pawGreen} alt="Logo" className="w-6 h-6" /> 
        발견했개
      </Button>
      
      <Button 
        variant="ghost" 
        className={`gap-2 rounded-full ${
          buttonStates.hospital ? 'bg-gray-300 text-white' : 'bg-gray-500 text-white'
        } hover:bg-opacity-100 focus:ring-0 focus:outline-none`}
        onClick={() => toggleButton('hospital')}
      >
        <Hospital /> 
        동물보호센터
      </Button>
    </div>
  )
}
