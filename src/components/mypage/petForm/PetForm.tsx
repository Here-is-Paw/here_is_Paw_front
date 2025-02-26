import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Form,
} from "@/components/ui/form";

import { PetBasicInfoForm } from './PetBasicInfoForm';
import { PetDetailsForm } from './PetDetailsForm';
import { PetAdditionalInfoForm } from './PetAdditionalInfoForm';
import { PetImageUploader } from './PetImageUploader';
import { PetFormData } from '@/types/pet.ts';

interface PetFormProps {
    form: any;
    onSubmit: (data: PetFormData) => Promise<void>;
    onClose: () => void;
}

export const PetForm: React.FC<PetFormProps> = ({ form, onSubmit, onClose }) => {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* 이미지 업로더 추가 */}
                <PetImageUploader form={form} />

                <div className="grid grid-cols-2 gap-4">
                    <PetBasicInfoForm form={form} />
                    <PetDetailsForm form={form} />
                </div>

                <PetAdditionalInfoForm form={form} />

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        취소
                    </Button>
                    <Button type="submit">등록하기</Button>
                </div>
            </form>
        </Form>
    );
};