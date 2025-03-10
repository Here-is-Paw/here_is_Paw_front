import React from 'react';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { FormProps } from '@/types/mypet.ts';

export const PetAdditionalInfoForm: React.FC<FormProps> = ({ form }) => {
    return (
        <>
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
        </>
    );
};