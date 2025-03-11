import React from 'react';
import { Button } from "@/components/ui/button.tsx";
import {
    Form,
} from "@/components/ui/form.tsx";

import { PetBasicInfoForm } from './PetBasicInfoForm.tsx';
import { PetDetailsForm } from './PetDetailsForm.tsx';
import { PetAdditionalInfoForm } from './PetAdditionalInfoForm.tsx';
import { PetImageUploader } from './PetImageUploader.tsx';
import { PetFormData } from '@/types/mypet.ts';

interface PetFormProps {
    form: any;
    onSubmit: (data: PetFormData) => Promise<void>;
    onClose: () => void;
    isEditing?: boolean;
}

export const PetForm: React.FC<PetFormProps> = ({ form, onSubmit, onClose, isEditing }) => {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* 이미지 업로더 추가 */}
                <PetImageUploader form={form} isEditing={isEditing}/>

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
                    <Button type="submit">{isEditing ? '수정하기' : '등록하기'}</Button>
                </div>
            </form>
        </Form>
    );
};