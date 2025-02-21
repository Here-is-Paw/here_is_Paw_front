import { SidebarGroup } from "@/components/ui/sidebar"
import { PetList } from "@/components/petCard/PetList"

import petSampleImage from "@/assets/petSample.jpg"


// 임시 데이터
const tempPets = [
  {
    id: "1",
    imageUrl: petSampleImage,
    date: "2025-02-18",
    breed: "믹스견",
    features: "하기싫어함",
    location: "멋쟁이사자처럼 11층"
  },
  {
    id: "2",
    imageUrl: petSampleImage,
    date: "2025-02-18",
    breed: "믹스견",
    features: "하기싫어함",
    location: "멋쟁이사자처럼 11층"
  },
  {
    id: "3",
    imageUrl: petSampleImage,
    date: "2025-02-18",
    breed: "믹스견",
    features: "하기싫어함",
    location: "멋쟁이사자처럼 11층"
  }
]

export function SidebarMainContent() {
  return (
    <div className="flex-1 overflow-y-auto bg-white md:h-[calc(100vh-120px)]">
    <SidebarGroup className="p-4">
      <h1 className="text-2xl font-bold mb-6">잃어버렸개</h1>
      <PetList pets={tempPets} />
    </SidebarGroup>
    
    <SidebarGroup className="p-4">
      <h1 className="text-2xl font-bold mb-6">발견했개</h1>
      <PetList pets={tempPets} />
    </SidebarGroup>
  
    <div className="p-4 mt-auto text-center text-gray-500">
      <div>© 2025 Here Is Paw</div>
    </div>
  </div>
  )
}
