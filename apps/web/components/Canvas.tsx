"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { clearAllShapes, initDraw, updateDrawingMode } from "@/core/canvasLogic"
import { PropertiesPanel } from "./Properties-panel"
import { FloatingDock } from "./ui/floating-dock"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Download,
  Undo,
  Redo,
  Share2,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Diamond,
  Minus,
  Type,
  Pencil,
  MousePointer,
} from "lucide-react"
import { ThemeToggle } from "./Theme"
export type PossibleShapes = "Rectangle" | "Circle" | "Triangle" | "Arrow" | "Diamond" | "Line" | "Text" | "Pencil" | "Select"

export type DrawingColor = "black" | "red" | "blue" | "green" | "yellow" | "purple"

export type StrokeWidth = 1 | 2 | 4 | 6

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedShape, setSelectedShape] = useState<PossibleShapes>("Rectangle")
  const [selectedColor, setSelectedColor] = useState<DrawingColor>("black")
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(2)
  const [showProperties, setShowProperties] = useState(false)
  const [canvasInit, isCanvasInit] = useState(false);

  const shapes = [
    { shape: "Select" as PossibleShapes, icon: <MousePointer className="h-5 w-5" /> },
    { shape: "Rectangle" as PossibleShapes, icon: <Square className="h-5 w-5" /> },
    { shape: "Circle" as PossibleShapes, icon: <Circle className="h-5 w-5" /> },
    { shape: "Arrow" as PossibleShapes, icon: <ArrowRight className="h-5 w-5" /> },
    { shape: "Diamond" as PossibleShapes, icon: <Diamond className="h-5 w-5" /> },
    { shape: "Line" as PossibleShapes, icon: <Minus className="h-5 w-5" /> },
    { shape: "Text" as PossibleShapes, icon: <Type className="h-5 w-5" /> },
    { shape: "Pencil" as PossibleShapes, icon: <Pencil className="h-5 w-5" /> },
  ]

  const initializeCanvas = useCallback(() => {
    if (canvasRef.current && !canvasInit) {
      initDraw(canvasRef.current, selectedShape)
      isCanvasInit(true); 
    }
  }, [selectedShape])

    
  useEffect(() => {
    initializeCanvas()
  }, [initializeCanvas, selectedShape, selectedColor, strokeWidth])

  useEffect(() => {
    if(canvasRef.current && canvasInit) {
        updateDrawingMode(selectedShape, selectedColor, strokeWidth);
    }
  }, [selectedShape, selectedColor, strokeWidth, canvasInit])
  

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      
      <header className="border-b border-border bg-background p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">JustDraw</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm">
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <ThemeToggle />
        </div>
      </header>
      

      <div className="flex flex-1 overflow-hidden">
      { showProperties && (
          <PropertiesPanel
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            onClose={() => setShowProperties(false)}
          />
        )}
        {/* Floating Dock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <FloatingDock
            selectedShape={selectedShape}
            setSelectedShape={setSelectedShape}
            items={shapes.map((item) => ({
              title: item.shape,
              icon: item.icon,
            }))}
            desktopClassName="shadow-lg border border-border"
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden relative bg-[#f5f5f5] dark:bg-zinc-800">
          <canvas
            ref={canvasRef}
            width={2000}
            height={1000}
            className={cn(
              selectedShape === "Select" ? "cursor-default" : "cursor-crosshair", 
              selectedShape === "Pencil" && "cursor-pencil"
            )}
          />
        </div>

        {/* Properties Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-6 right-6 z-10"
          onClick={() => setShowProperties(!showProperties)}
        >
          Properties
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-6 right-32 z-10"
          onClick={() =>clearAllShapes()}
        >
          Clear Canvas
        </Button>
      </div>
    </div>
  )
}