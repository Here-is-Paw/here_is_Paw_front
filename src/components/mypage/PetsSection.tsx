import React from 'react';
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PetData } from "@/types/pet";
import { User } from "@/types/user";

interface PetsSectionProps {
    userPets: PetData[];
    userData: User | null;
    onAddPetClick: () => void;
    onDeletePet: (pet: PetData) => void;
}

export const PetsSection: React.FC<PetsSectionProps> = ({
                                                            userPets,
                                                            userData,
                                                            onAddPetClick,
                                                            onDeletePet
                                                        }) => {
    return (
        <>
            <h2 className="text-xl font-bold mb-3">내 반려동물</h2>

            {userPets.length > 0 ? (
                userPets.map((pet, index) => (
                    <Card key={pet.id || index} className="mb-4 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={() => onDeletePet(pet)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center">
                                    <Avatar className="h-16 w-16 rounded-full">
                                        {pet?.imageUrl && (
                                            <AvatarImage
                                                src={pet.imageUrl}
                                                alt={pet.imageUrl || '사용자'}
                                                className="object-cover w-full h-full"
                                            />
                                        )}
                                        <AvatarFallback>{userData?.nickname?.charAt(0) || '?'}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{pet.name || '이름 없음'}</h3>
                                    <p className="text-gray-500 text-sm">
                                        {pet.breed || '품종 미상'} • {pet.age ? `${pet.age}살` : '나이 미상'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Card className="mb-4">
                    <CardContent className="p-4 text-center text-gray-500">
                        등록된 반려동물이 없습니다.
                    </CardContent>
                </Card>
            )}

            <Button
                className="w-full"
                variant="outline"
                onClick={onAddPetClick}
            >
                반려동물 추가하기
            </Button>
        </>
    );
};