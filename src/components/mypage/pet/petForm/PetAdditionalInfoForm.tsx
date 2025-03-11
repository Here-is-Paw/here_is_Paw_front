import React from 'react';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { FormProps } from '@/types/mypet.ts';

export const PetAdditionalInfoForm: React.FC<FormProps> = ({ form }) => {
    return (
        <>
            <FormField
                control={form.control}
                name="etc"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>기타 정보</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="반려동물에 대한 추가 정보를 입력하세요"
                                className="min-h-[100px] resize-none"
                                {...field}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
        </>
    );
};