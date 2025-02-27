import React from 'react';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { FormProps } from '@/types/pet.ts';

export const PetDetailsForm: React.FC<FormProps> = ({ form }) => {
    return (
        <>
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
        </>
    );
};