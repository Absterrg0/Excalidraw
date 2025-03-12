"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import type { DrawingColor,StrokeWidth } from "./Canvas"
import { cn } from "@/lib/utils"

interface PropertiesPanelProps {
  selectedColor: DrawingColor
  setSelectedColor: (color: DrawingColor) => void
  strokeWidth: StrokeWidth
  setStrokeWidth: (width: StrokeWidth) => void
  onClose: () => void
}

export function PropertiesPanel({
  selectedColor,
  setSelectedColor,
  strokeWidth,
  setStrokeWidth,
  onClose,
}: PropertiesPanelProps) {
  const colors: { color: DrawingColor; className: string; label: string }[] = [
    { color: "black", className: "bg-black dark:bg-white", label: "Black" },
    { color: "red", className: "bg-red-500", label: "Red" },
    { color: "blue", className: "bg-blue-500", label: "Blue" },
    { color: "green", className: "bg-green-500", label: "Green" },
    { color: "yellow", className: "bg-yellow-500", label: "Yellow" },
    { color: "purple", className: "bg-purple-500", label: "Purple" },
  ]

  return (
    <div className="w-64 border-l border-border bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fill Color</h4>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((item) => (
              <button
                key={item.color}
                className={cn(
                  "h-8 w-full rounded-md border border-border",
                  item.className,
                  selectedColor === item.color && "ring-2 ring-primary ring-offset-2",
                )}
                onClick={() => setSelectedColor(item.color)}
                title={item.label}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Stroke Width</h4>
            <span className="text-sm text-muted-foreground">{strokeWidth}px</span>
          </div>
          <Slider
            value={[strokeWidth]}
            min={1}
            max={6}
            step={1}
            onValueChange={(value) => setStrokeWidth(value[0] as StrokeWidth)}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <div className="h-0.5 w-6 bg-foreground rounded-full" />
            <div className="h-1 w-6 bg-foreground rounded-full" />
            <div className="h-1.5 w-6 bg-foreground rounded-full" />
            <div className="h-2 w-6 bg-foreground rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

