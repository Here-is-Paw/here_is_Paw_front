import React from 'react';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { FormProps } from '@/types/mypet.ts';

export const PetBasicInfoForm: React.FC<FormProps> = ({ form }) => {
    return (
        <>
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
        </>
    );
};