import { useState, useCallback } from 'react';
import { Slider } from "@/components/ui/slider";
import { useRadius } from "@/contexts/RadiusContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { debounce } from 'lodash';

export function RadiusSlider() {
    const { radius, setRadius } = useRadius();
    const [localRadius, setLocalRadius] = useState(radius);

    // 디바운스된 setRadius 함수 생성
    const debouncedSetRadius = useCallback(
        debounce((value: number) => {
            setRadius(value);
        }, 500), // 300ms 동안 대기
        [setRadius]
    );

    const handleRadiusChange = (value: number[]) => {
        const newRadius = value[0];
        setLocalRadius(newRadius); // 즉시 UI 업데이트
        debouncedSetRadius(newRadius); // 디바운스된 반경 업데이트
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between">
                    <span>검색 반경</span>
                    <span className="text-green-600 font-medium">{localRadius}m</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Slider
                    defaultValue={[radius]}
                    max={2000}
                    min={200}
                    step={100}
                    onValueChange={handleRadiusChange}
                    className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>200m</span>
                    <span>2km</span>
                </div>
            </CardContent>
        </Card>
    );
}