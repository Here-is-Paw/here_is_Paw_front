import { MissingFormData } from "@/types/missing";
import { defaultValues } from "@/types/pet";
import { useForm } from "react-hook-form";

export function MissingCard() {
  //   const form = useForm<MissingFormData>({
  //     defaultValues,
  //   });

  //   const [date, setDate] = <React className="useState"></React><Date>();

  //   // 팝업이 닫힐 때 폼 초기화
  // useEffect(() => {
  //   if (!open) {
  //     form.reset(defaultValues);
  //   }
  // }, [open, form]);

  return {
    /* <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={missing.imageUrl}
        alt={`${missing.breed} 실종동물`}
        className="w-full h-30 object-cover"
      />
      <div className="p-3">
        <div className="font-medium mb-3">{missing.breed}</div>
        <div className="space-y-1">
          <div className="text-xs flex gap-4">
            <span className="text-gray-600 w-12">특징</span>
            <span className="flex-1 truncate">{missing.features}</span>
          </div>
          <div className="text-xs flex gap-4">
            <span className="text-gray-600 w-12">발견장소</span>
            <span className="flex-1 truncate">{missing.location}</span>
          </div>
        </div>
      </div>
    </div> */
  };
}
