'use client'
import { initDraw } from "@/core/canvasLogic";
import { useEffect, useRef, useState, useCallback } from "react";
import { possibleShapes } from "@/core/canvasLogic";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconRectangle, IconCircle } from "@tabler/icons-react";

interface itemsProps{
    title:possibleShapes,
    icon:React.ReactNode
}

const items:itemsProps[] = [
    {
        title: "Rectangle",
        icon: <IconRectangle />
    },
    {
        title: "Circle",
        icon: <IconCircle />
    }
];

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedShape, setSelectedShape] = useState< possibleShapes>("Circle");

    const initializeCanvas = useCallback(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, selectedShape);
        }
    }, [selectedShape]);

    useEffect(() => {
        initializeCanvas();
    }, [initializeCanvas]);

    return (
        <div>
            <div className="w-full flex items-center justify-center">
                <FloatingDock selectedShape={selectedShape} setSelectedShape={setSelectedShape} items={items} />
            </div>
            <canvas ref={canvasRef} width={2000} height={1000}></canvas>
        </div>
    );
}
