import { drawnShapes,ctx,activeTextShape,currentCanvas,clearCanvas,finishTextEditing,deleteSelectedShape } from "./canvasLogic";
import { Shape } from "./canvasType";
import { selectedShapeIndex } from "./canvasLogic";
let saveTimeout: number | null = null;
export function drawArrowhead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Draw arrowhead as lines
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size / 2);
    ctx.stroke();
    
    ctx.restore();
}

export function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y - halfHeight); // Top point
    ctx.lineTo(x + halfWidth, y); // Right point
    ctx.lineTo(x, y + halfHeight); // Bottom point
    ctx.lineTo(x - halfWidth, y); // Left point
    ctx.closePath();
    ctx.stroke();
}


export function distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) {
        param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
}

export function isPointInsideShape(x: number, y: number, shape: Shape): boolean {
    switch (shape?.type) {
        case "rect":
            return (
                x >= shape.x && 
                x <= shape.x + shape.width && 
                y >= shape.y && 
                y <= shape.y + shape.height
            );
        case "circle":
            const normalizedX = (x - shape.x) / shape.radiusX;
            const normalizedY = (y - shape.y) / shape.radiusY;
            return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
        case "Diamond":
            // Check if point is inside diamond
            const halfWidth = shape.width / 2;
            const halfHeight = shape.height / 2;
            
            // Transform to diamond-local coordinates
            const localX = Math.abs(x - shape.x);
            const localY = Math.abs(y - shape.y);
            
            return (localX / halfWidth + localY / halfHeight) <= 1;
        case "Line":
            return distanceToLineSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2) < 10;
        case "Arrow":
            return distanceToLineSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2) < 10;
        case "Pencil":
          
            if (!shape.points) return false;
            for (let i = 1; i < shape.points.length; i++) {
                if(!shape.points[i]){
                    return false;
                }
                const dist = distanceToLineSegment(
                    x, y,
                    shape.points[i-1]!.x, shape.points[i-1]!.y,
                    shape.points[i]!.x, shape.points[i]!.y
                );
                if (dist < 10) return true;
            }
            return false;

case "Text":
    if (!ctx) return false;
    
    // Set up font for measurement
    ctx.font = `${shape.fontSize}px Arial, sans-serif`;
    
    // Handle multi-line text
    const lines = shape.text.split('\n');
    let maxWidth = 0;
    
    // Find the widest line
    for (const line of lines) {
        const lineWidth = ctx.measureText(line).width;
        maxWidth = Math.max(maxWidth, lineWidth);
    }
    
    const totalHeight = lines.length * shape.fontSize * 1.2;
    
    // More accurate bounding box check for text
    return (
        x >= shape.x - 2 && 
        x <= shape.x + maxWidth + 4 && 
        y >= shape.y - shape.fontSize - 2 && 
        y <= shape.y - shape.fontSize + totalHeight + 2
    );
        default:
            return false;
    }
}

export function findShapeUnderCursor(x: number, y: number): number | null {
    // Search in reverse order (topmost shape first)
    for (let i = drawnShapes.length - 1; i >= 0; i--) {
        if (isPointInsideShape(x, y, drawnShapes[i])) {
            return i;
        }
    }
    return null;
}



export function handleKeyDown(e: KeyboardEvent) {
    // Handle text editing if active
    if (activeTextShape && activeTextShape.type === "Text") {
        // Prevent the event from affecting other elements
        
        // Handle special keys
        if (e.key === "Escape") {
            finishTextEditing();
            // Switch to select mode after pressing Escape
            return;
        }
        
        if (e.key === "Enter") {
            // Add a newline character to the current text
            activeTextShape.text += "\n";
            
            // Redraw canvas with updated text
            if (currentCanvas) {
                clearCanvas(drawnShapes, currentCanvas);
            }
            
            // Focus on the canvas to receive keyboard input
            if (currentCanvas) {
                currentCanvas.focus();
            }
            debouncedSaveToLocalStorage();
            return;
        }
        
        if (e.key === "Backspace") {
            // Remove the last character
            activeTextShape.text = activeTextShape.text.slice(0, -1);
        } else if (e.key.length === 1) {
            // Add regular characters
            activeTextShape.text += e.key;
        }
        
        // Redraw canvas with updated text
        if (currentCanvas) {
            clearCanvas(drawnShapes, currentCanvas);
        }
        debouncedSaveToLocalStorage();
    } else {
        // If not editing text, handle other keyboard shortcuts
        
        // Delete key pressed and a shape is selected
        if ((e.key === "Delete" || e.key === "Backspace") && selectedShapeIndex !== null) {
            deleteSelectedShape();
            e.preventDefault(); // Prevent browser back navigation on backspace
        }
    }
}



export function debouncedSaveToLocalStorage() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    saveTimeout = window.setTimeout(() => {
        saveToLocalStorage();
    }, 500); // Save after half a second of inactivity
}

// Enhanced saveToLocalStorage with error handling and size checks
export const saveToLocalStorage = () => {
    try {
        const data = JSON.stringify(drawnShapes);
        
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
            console.error('localStorage is not available');
            return;
        }
        
        // Basic size check to avoid quota errors
        if (data.length > 5000000) { // ~5MB limit
            console.warn('Canvas data is very large, may exceed localStorage limits');
        }
        
        localStorage.setItem("canvasData", data);
    } catch (e) {
        console.error('Failed to save canvas data:', e);
        
        // Try to handle quota errors gracefully
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            alert('Canvas could not be saved: Storage quota exceeded');
        }
    }
}

// Enhanced loadFromLocalStorage with proper error handling
export const loadFromLocalStorage = () => {
    try {
        const storedData = localStorage.getItem("canvasData");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (Array.isArray(parsedData)) {
                    drawnShapes.length = 0;
                    drawnShapes.push(...parsedData);
                    console.log(`Loaded ${parsedData.length} shapes from localStorage`);
                } else {
                    console.error('Stored canvas data is not an array');
                }
            } catch (parseError) {
                console.error('Error parsing stored canvas data:', parseError);
            }
        } else {
            console.log('No saved canvas data found');
        }
    } catch (e) {
        console.error('Failed to load canvas data:', e);
    }
}