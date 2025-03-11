import { DrawingColor, StrokeWidth } from "@/components/Canvas";

type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "circle",
    x: number,
    y: number,
    radius: number
}

export type possibleShapes = "Rectangle" | "Circle" | "Triangle" | "Arrow" | "Diamond" | "Line" | "Text" | "Pencil";

let currentCanvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentShape: possibleShapes = "Rectangle";
let currentColor: DrawingColor = "black";
let currentStrokeWidth: StrokeWidth = 2;
const drawnShapes: Shape[] = []; // Fixed type to Shape[] instead of any[]

export function updateDrawingMode(shape: possibleShapes, color: DrawingColor = "black", strokeWidth: StrokeWidth = 2) {
    currentShape = shape;
    currentColor = color;
    currentStrokeWidth = strokeWidth;
}

export function initDraw(canvas: HTMLCanvasElement, type: possibleShapes) {
    // Assign to global ctx
    ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    currentCanvas = canvas;
    currentShape = type;

    // Set canvas to full page size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize the canvas
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255,255,255)"; // Default to white for now

    // Remove existing event listeners to prevent duplicates
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
    canvas.removeEventListener("mouseout", handleMouseUp);
  
    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseUp);

    // Handle window resize for full-page canvas
    window.addEventListener("resize", () => {
        if (canvas && ctx) {
            // Save existing shapes
            const tempShapes = [...drawnShapes];
            
            // Resize canvas
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Redraw everything
            clearCanvas(tempShapes, canvas);
        }
    });
}

function handleMouseDown(e: MouseEvent) {
    isDrawing = true;
    
    // Get canvas-relative coordinates
    if (currentCanvas) {
        const rect = currentCanvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    }
}

function handleMouseUp(e: MouseEvent) {
    if (!isDrawing || !currentCanvas) return;
    
    isDrawing = false;
    
    // Get canvas-relative coordinates
    const rect = currentCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    switch (currentShape) {
        case "Rectangle":
            const width = currentX - startX;
            const height = currentY - startY;
            drawnShapes.push({
                type: "rect",
                x: startX,
                y: startY,
                width,
                height
            });
            break;
        case "Circle":
            const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            drawnShapes.push({
                type: "circle",
                x: startX,
                y: startY,
                radius
            });
            break;
    }
}

function handleMouseMove(e: MouseEvent) {
    if (!isDrawing || !ctx || !currentCanvas) {
        return;
    }

    // Get canvas-relative coordinates
    const rect = currentCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Clear and redraw
    clearCanvas(drawnShapes, currentCanvas);
    
    // Draw current shape
    ctx.strokeStyle = "rgba(255,255,255)"; // Use white for now
    
    switch (currentShape) {
        case "Rectangle":
            const width = currentX - startX;
            const height = currentY - startY;
            ctx.strokeRect(startX, startY, width, height);
            break;
        case "Circle":
            const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
    }
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement) {
    const localCtx = canvas.getContext("2d");
    if (!localCtx) {
        return;
    }
    
    // Clear and set background
    localCtx.clearRect(0, 0, canvas.width, canvas.height);
    localCtx.fillStyle = "rgba(0,0,0)";
    localCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all saved shapes
    existingShapes.forEach((shape) => {
        localCtx.strokeStyle = "rgba(255,255,255)"; // Use white for now
        
        switch(shape.type) {
            case 'rect':
                localCtx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                break;
            case 'circle':
                localCtx.beginPath();
                localCtx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                localCtx.stroke();
                break;
        }
    });
}

// Add function to export canvas as image (useful for Excalidraw-like app)
export function exportAsImage(format: 'png' | 'jpeg' = 'png'): string | null {
    if (!currentCanvas) return null;
    
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    return currentCanvas.toDataURL(mimeType);
}

// Add function to clear all drawings
export function clearAllDrawings() {
    if (!currentCanvas || !ctx) return;
    
    drawnShapes.length = 0; // Clear the array
    ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
}