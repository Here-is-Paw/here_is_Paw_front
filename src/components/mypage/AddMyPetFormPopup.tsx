import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import axios from "axios";
import {backUrl} from "@/constants.ts";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface AddPetFormPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface PetFormData {
    name: string;
    breed: string;
    color?: string;
    serialNumber?: string;
    gender?: number;
    neutered?: boolean;
    age?: number;
    etc?: string;
}

const defaultValues: PetFormData = {
    name: "",
    breed: "",
    color: "",
    serialNumber: "",
    gender: 0,
    neutered: false,
    age: undefined,
    etc: ""
};

export const AddPetFormPopup = ({open, onOpenChange, onSuccess}: AddPetFormPopupProps) => {
    const form = useForm<PetFormData>({
        defaultValues
    });

    // 팝업이 닫힐 때 폼 초기화
    useEffect(() => {
        if (!open) {
            form.reset(defaultValues);
        }
    }, [open, form]);

    // 팝업 닫기 핸들러
    const handleClose = () => {
        form.reset(defaultValues);
        onOpenChange(false);
    };

    const handleSubmit = async (data: PetFormData) => {
        try {
            await axios.post(`${backUrl}/api/v1/members/mypet`, data, { withCredentials: true });

            // 성공 시 폼 초기화 후 팝업 닫기
            form.reset(defaultValues);
            onOpenChange(false);

            // 성공 콜백 호출
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('반려동물 등록 오류:', error);
            alert('반려동물 등록에 실패했습니다');
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!newOpen) {
                    // 팝업이 닫힐 때 폼 초기화
                    form.reset(defaultValues);
                }
                onOpenChange(newOpen);
            }}
        >
            <DialogContent className="max-w-[500px]">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={handleClose}
                >
                    <span className="sr-only">Close</span>
                </Button>
                <Card className="border-none shadow-none">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-2xl font-bold text-primary">
                            반려동물 등록
                        </CardTitle>
                        <CardDescription>
                            반려동물 정보를 입력해주세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 필수 입력 필드 */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        rules={{ required: "반려동물 이름은 필수입니다" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>이름 *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="반려동물 이름" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="breed"
                                        rules={{ required: "품종은 필수입니다" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>품종 *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="품종" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* 선택 입력 필드 */}
                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>색상</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="털 색상" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="serialNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>등록번호</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="마이크로칩 등록번호" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>성별</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                                    defaultValue={field.value?.toString()}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="성별 선택" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="0">선택 안함</SelectItem>
                                                        <SelectItem value="1">수컷</SelectItem>
                                                        <SelectItem value="2">암컷</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="age"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>나이</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="나이"
                                                        min={0}
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="neutered"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>중성화 여부</FormLabel>
                                                <FormDescription>
                                                    반려동물이 중성화 되었는지 선택해주세요
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="etc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>기타 정보</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="반려동물에 대한 추가 정보를 입력하세요"
                                                    className="min-h-[80px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                    >
                                        취소
                                    </Button>
                                    <Button type="submit">등록하기</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};