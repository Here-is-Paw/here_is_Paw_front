import {Plus} from "lucide-react";
import FindLocationPicker from "@/components/navBar/findNcpMap.tsx";
import {useEffect, useState} from "react";
import {usePetContext} from "@/contexts/PetContext.tsx";


interface FindingFormPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const FindingFormPopup = ({
                                     open,
                                     onOpenChange,
                                     onSuccess,
                                 }: FindingFormPopupProps) => {
    // const form = useForm<MissingFormData>({
    //     defaultValues,
    // });
    // const form = useForm<MissingFormData>({
    //     defaultValues,
    // });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [breed, setBreed] = useState("");
    const [geoX, setGeoX] = useState(0);
    const [geoY, setGeoY] = useState(0);
    const [location, setLocation] = useState("");
    const [name, setName] = useState("");
    const [color, setColor] = useState("");
    const [etc, setEtc] = useState("");
    const [situation, setSituation] = useState("");
    const [title, setTitle] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState(0);
    const [neutered, setNeutered] = useState(0);
    const { refreshPets } = usePetContext();

    const handleBreed = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBreed(e.target.value);
    };

    const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleEtc = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEtc(e.target.value);
    };

    const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    const handleSituation = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSituation(e.target.value);
    };

    const handleTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
    };

    const handleGender = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGender(parseInt(e.target.value));
    };

    const handleAge = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAge(e.target.value);
    };

    const handleNeutered = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNeutered(parseInt(e.target.value));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);

            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
        }
    };

    useEffect(() => {
        const savedImage = localStorage.getItem("uploadedImage");
        if (savedImage) {
            setImagePreview(savedImage);
        }
    }, []);

    // ESC 키 이벤트 핸들러 추가
    useEffect(() => {
        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };

        // 모달이 열려있을 때만 이벤트 리스너 추가
        if (open) {
            document.addEventListener('keydown', handleEscKey);
        }

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [open, onOpenChange]);

    const handleLocationSelect = (location: {
        x: number;
        y: number;
        address: string;
    }) => {
        setGeoX(location.x);
        setGeoY(location.y);
        setLocation(location.address);

        console.log("missing geo", location);
    };


    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        localStorage.removeItem("uploadedImage");
    };

    const handleFindSubmit = async () => {
        const formData = new FormData();
        if (imageFile) {
            formData.append("file", imageFile);
        }
        formData.append("title", title);
        formData.append("situation", situation);
        formData.append("breed", breed);
        formData.append("location", location);
        formData.append("x", geoX.toString());
        formData.append("y", geoY.toString());
        formData.append("name", name);
        formData.append("color", color);
        formData.append("etc", etc);
        formData.append("gender", gender.toString());
        formData.append("age", age.toString());
        formData.append("neutered", neutered.toString());
        formData.append("find_date", "2025-02-20T00:00:00");
        formData.append("shelter_id", "1");

        try {
            // await writeFindPost(formData);
            if (onSuccess) onSuccess();

            await refreshPets();

            onOpenChange(false);
        } catch (error) {
            console.error("등록 오류:", error);
        }
    };

    // Modal이 열려있지 않으면 아무것도 렌더링하지 않음
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            ></div>

            <div className="relative w-full max-w-[800px] bg-white rounded-lg shadow-lg p-6 z-50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">반려동물 발견 등록하기</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <p className="mb-4 text-gray-600">
                    등록 게시글 미 연장시, 7일 후 자동 삭제 됩니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px]">
                    <div>
                        <div className="mb-4 ">
                            <label className="block font-medium mb-2">* 제목</label>
                            <textarea
                                className="border p-2 w-full bg-white resize-none"
                                rows={1}
                                placeholder="게시글의 제목을 입력해주세요."
                                onChange={handleTitle}
                                value={title}
                            />
                        </div>

                        {imagePreview ? (
                            <div className="mb-4">
                                <label className="block font-medium mb-2">
                                    반려동물 사진
                                </label>
                                <div className="mt-2 flex">
                                    <img
                                        src={imagePreview}
                                        alt="미리보기"
                                        className="w-60 h-60 object-cover rounded"
                                    />
                                    <div className="mt-[77%]">
                                        <button
                                            className=" bg-red-500 h-4 w-4 "
                                            onClick={handleRemoveImage}
                                        >
                                            <Plus className="text-white rotate-45 absolute top-[54.7%] left-[34%]"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block font-medium mb-2">
                                    반려동물 사진
                                </label>
                                <input
                                    type="file"
                                    className="border p-2 w-full"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        )}

                        <div className="mb-4 ">
                            <label className="block font-medium mb-2 ">* 발견 상황</label>
                            <textarea
                                className="border p-2 w-full bg-white resize-none"
                                rows={2}
                                placeholder="발견 당시 상황을 입력해주세요."
                                onChange={handleSituation}
                                value={situation}
                            />
                        </div>

                        <div className="mb-4 flex justify-between">
                            <div className="mr-4 w-20">
                                <label className="block font-medium mb-2 ">견종</label>
                                <input
                                    className="border p-2 w-full bg-white"
                                    placeholder="견종"
                                    onChange={handleBreed}
                                    value={breed}
                                />
                            </div>
                            <div className="mr-4 w-20">
                                <label className="block font-medium mb-2 ">색상</label>
                                <input
                                    className="border p-2 w-full bg-white"
                                    placeholder="색상"
                                    onChange={handleColor}
                                    value={color}
                                />
                            </div>
                            <div className="w-20">
                                <label className="block font-medium mb-2 ">이름</label>
                                <input
                                    className="border p-2 w-full bg-white"
                                    placeholder="이름"
                                    onChange={handleName}
                                    value={name}
                                />
                            </div>
                        </div>
                        <div className="mb-4 flex justify-between">
                            <div className="mr-4 w-20">
                                <label className="block font-medium mb-2 ">성별</label>
                                <select
                                    className="border p-2 w-full bg-white"
                                    onChange={handleGender}
                                    value={gender}
                                >
                                    <option value="0">미상</option>
                                    <option value="1">수컷</option>
                                    <option value="2">암컷</option>
                                </select>
                            </div>
                            <div className="mr-4 w-20">
                                <label className="block font-medium mb-2 ">중성화</label>
                                <select
                                    className="border p-2 w-full bg-white"
                                    onChange={handleNeutered}
                                    value={neutered}
                                >
                                    <option value="0">미상</option>
                                    <option value="1">중성화 됌</option>
                                    <option value="2">중성화 안됌</option>
                                </select>
                            </div>
                            <div className="w-20">
                                <label className="block font-medium mb-2 ">나이</label>
                                <input
                                    className="border p-2 w-full bg-white"
                                    placeholder="추정 나이"
                                    onChange={handleAge}
                                    value={age}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <FindLocationPicker onLocationSelect={handleLocationSelect}/>
                        <div className="mb-4 ">
                            <label className="block font-medium mb-2 ">특이 사항</label>
                            <textarea
                                className="border p-2 w-full bg-white resize-none"
                                rows={2}
                                placeholder="특징을 설명해주세요."
                                onChange={handleEtc}
                                value={etc}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => onOpenChange(false)}
                    >
                        취소하기
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                        onClick={handleFindSubmit}
                    >
                        등록하기
                    </button>
                </div>
            </div>
        </div>
    );
};