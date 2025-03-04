import React from 'react';
import { Slider } from "@/components/ui/slider";
import { useRadius } from "@/contexts/RadiusContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RadiusSlider() {
    const { radius, setRadius } = useRadius();

    const handleRadiusChange = (value: number[]) => {
        setRadius(value[0]);
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between">
                    <span>검색 반경</span>
                    <span className="text-green-600 font-medium">{radius}m</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Slider
                    defaultValue={[radius]}
                    max={5000}
                    min={500}
                    step={100}
                    onValueChange={handleRadiusChange}
                    className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>500m</span>
                    <span>5km</span>
                </div>
            </CardContent>
        </Card>
    );
}