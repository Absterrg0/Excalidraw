import { DrawingColor,StrokeWidth } from "@/components/Canvas";

export type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number,
    color: DrawingColor,
    strokeWidth: StrokeWidth
} | {
    type: "circle",
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    color: DrawingColor,
    strokeWidth: StrokeWidth
} | {
    type: "Line",
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: DrawingColor,
    strokeWidth: StrokeWidth
} | {
    type: "Arrow",
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    arrowSize: number,
    color: DrawingColor,
    strokeWidth: StrokeWidth
} | {
    type: "Diamond",
    x: number,
    y: number,
    width: number,
    height: number,
    color: DrawingColor,
    strokeWidth: StrokeWidth
} | {
    type: "Pencil",
    points: Array<{x: number, y: number}> | undefined,
    color: DrawingColor,
    strokeWidth: StrokeWidth
} | {
    type: "Text",
    x: number,
    y: number,
    text: string,
    fontSize: number,
    color: DrawingColor,
    isEditing?: boolean  // Added to track editing state
} | undefined;

export type possibleShapes = "Rectangle" | "Circle" | "Triangle" | "Arrow" | "Diamond" | "Line" | "Text" | "Pencil" | "Select";
