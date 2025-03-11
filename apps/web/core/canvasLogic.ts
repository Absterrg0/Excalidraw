import { DrawingColor, StrokeWidth } from "@/components/Canvas";

type Shape = {
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

let currentCanvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentShape: possibleShapes = "Rectangle";
let currentColor: DrawingColor = "black";
let currentStrokeWidth: StrokeWidth = 2;
const drawnShapes: Shape[] = [];

// Text-specific variables
let isAddingText = false;
let currentFontSize = 20;
let currentText = "";
let activeTextShape: Shape | null = null;
let cursorVisible = true;
let cursorBlinkInterval: number | null = null;

// For pencil drawing - initialize with empty array to avoid undefined error
let pencilPoints: Array<{x: number, y: number}> = [];

// For shape editing
let selectedShapeIndex: number | null = null;
let isDraggingShape = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartPoint = { x: 0, y: 0 };

// Event callback for shape mode changes
let onModeChangeCallback: ((mode: possibleShapes) => void) | null = null;

export function updateDrawingMode(shape: possibleShapes, color: DrawingColor = "black", strokeWidth: StrokeWidth = 2) {
    currentShape = shape;
    currentColor = color;
    currentStrokeWidth = strokeWidth;
    
    // Reset selection when changing modes
    if (shape !== "Select") {
        selectedShapeIndex = null;
    }
    
    // Cancel text editing if switching from text mode
    if (activeTextShape && shape !== "Text") {
        finishTextEditing();
    }
}

function drawArrowhead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number) {
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

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
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
    canvas.removeEventListener("dblclick", handleDoubleClick);
    window.removeEventListener("keydown", handleKeyDown);
  
    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseUp);
    canvas.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("keydown", handleKeyDown);

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

// Handle keyboard input for text editing
// Handle keyboard input for text editing
function handleKeyDown(e: KeyboardEvent) {
    if (!activeTextShape || activeTextShape.type !== "Text") return;
    
    // Handle special keys
    if (e.key === "Escape") {
        finishTextEditing();
        // Switch to select mode after pressing Escape
        return;
    }
    
    if (e.key === "Enter") {
        // Create a new text element below the current one
        const currentText = activeTextShape.text;
        
        // Store the properties we need before finishing editing the current text
        const previousX = activeTextShape.x;
        const previousY = activeTextShape.y;
        const previousFontSize = activeTextShape.fontSize;
        const previousColor = activeTextShape.color;
        
        const newY = previousY + previousFontSize * 1.2; // Add some line spacing
        
        // Complete the current text
        finishTextEditing();
        
        // Create a new text element
        const newTextShape: Shape = {
            type: "Text",
            x: previousX,
            y: newY,
            text: "",
            fontSize: previousFontSize,
            color: previousColor,
            isEditing: true
        };
        
        drawnShapes.push(newTextShape);
        selectedShapeIndex = drawnShapes.length - 1;
        activeTextShape = newTextShape;
        
        // Start editing the new text
        setupCursorBlink();
        
        // Redraw canvas
        if (currentCanvas) {
            clearCanvas(drawnShapes, currentCanvas);
        }
        
        // Focus on the canvas to receive keyboard input
        if (currentCanvas) {
            currentCanvas.focus();
        }
        
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
}


function distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
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

function isPointInsideShape(x: number, y: number, shape: Shape): boolean {
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
            // Check if point is near any segment of the pencil line
            for (let i = 1; i < shape.points.length; i++) {
                const dist = distanceToLineSegment(
                    x, y,
                    shape.points[i-1].x, shape.points[i-1].y,
                    shape.points[i].x, shape.points[i].y
                );
                if (dist < 10) return true;
            }
            return false;
        case "Text":
            // Estimate the text width based on the font size (approximate)
            const textWidth = shape.text.length * (shape.fontSize * 0.6);
            const textHeight = shape.fontSize;
            
            // Simple bounding box check for text
            return (
                x >= shape.x && 
                x <= shape.x + textWidth && 
                y >= shape.y - textHeight && 
                y <= shape.y
            );
        default:
            return false;
    }
}

function findShapeUnderCursor(x: number, y: number): number | null {
    // Search in reverse order (topmost shape first)
    for (let i = drawnShapes.length - 1; i >= 0; i--) {
        if (isPointInsideShape(x, y, drawnShapes[i])) {
            return i;
        }
    }
    return null;
}

function handleDoubleClick(e: MouseEvent) {
    if (!currentCanvas) return;
    
    const rect = currentCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find shape under cursor
    const shapeIndex = findShapeUnderCursor(x, y);
    
    if (shapeIndex !== null) {
        selectedShapeIndex = shapeIndex;
        
        // If double-clicked on a text shape, enable editing
        const shape = drawnShapes[shapeIndex];
        if (shape?.type === "Text") {
            startTextEditing(shape, x, y);
        }
        
        if (currentCanvas) {
            clearCanvas(drawnShapes, currentCanvas);
        }
    }
}

// Start text editing directly on canvas
function startTextEditing(textShape: Shape, x: number, y: number) {
    if (textShape?.type !== "Text" || !currentCanvas) return;
    
    // First, finish any existing text editing
    finishTextEditing();
    
    // Mark this shape as being edited
    textShape.isEditing = true;
    activeTextShape = textShape;
    
    // Set up cursor blinking
    setupCursorBlink();
    
    // Focus on the canvas to receive keyboard input
    currentCanvas.focus();
}

// Set up cursor blinking effect
function setupCursorBlink() {
    // Clear any existing interval
    if (cursorBlinkInterval) {
        clearInterval(cursorBlinkInterval);
    }
    
    // Start a new interval
    cursorVisible = true;
    cursorBlinkInterval = window.setInterval(() => {
        cursorVisible = !cursorVisible;
        if (currentCanvas) {
            clearCanvas(drawnShapes, currentCanvas);
        }
    }, 500); // Blink every 500ms
}

function finishTextEditing() {
    // Stop cursor blinking
    if (cursorBlinkInterval) {
        clearInterval(cursorBlinkInterval);
        cursorBlinkInterval = null;
    }
    
    if (activeTextShape && activeTextShape.type === "Text") {
        // Remove editing flag
        activeTextShape.isEditing = false;
        
        // If text is empty, remove the shape
        if (activeTextShape.text.trim() === "") {
            const index = drawnShapes.findIndex(shape => shape === activeTextShape);
            if (index !== -1) {
                drawnShapes.splice(index, 1);
            }
        }
    }
    
    activeTextShape = null;
    
    if (currentCanvas) {
        clearCanvas(drawnShapes, currentCanvas);
    }
    
    // Switch to select mode after finishing text editing
}

function handleMouseDown(e: MouseEvent) {
    if (!currentCanvas) return;
    
    // Finish any ongoing text editing
    if (activeTextShape) {
        finishTextEditing();
    }
    
    const rect = currentCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentShape === "Text") {
        // For text, create a new text shape at click position
        isAddingText = true;
        startX = x;
        startY = y;
        
        // Create a new text shape
        const newTextShape: Shape = {
            type: "Text",
            x: x,
            y: y,
            text: "",
            fontSize: currentFontSize,
            color: currentColor,
            isEditing: true
        };
        
        drawnShapes.push(newTextShape);
        selectedShapeIndex = drawnShapes.length - 1;
        activeTextShape = newTextShape;
        
        // Start editing the new text
        setupCursorBlink();
        
        // Focus on the canvas to receive keyboard input
        currentCanvas.focus();
        return;
    }
    
    if (currentShape === "Select") {
        // In select mode, check if we're clicking on a shape
        const shapeIndex = findShapeUnderCursor(x, y);
        
        if (shapeIndex !== null) {
            selectedShapeIndex = shapeIndex;
            const shape = drawnShapes[shapeIndex];
            
            isDraggingShape = true;
            
            // Calculate offset for dragging
            if (shape?.type === "rect" || shape?.type === "Diamond" || shape?.type === "circle" || shape?.type === "Text") {
                dragOffsetX = x - shape.x;
                dragOffsetY = y - shape.y;
            } else if (shape?.type === "Line" || shape?.type === "Arrow") {
                // Store the start point for calculating movement
                dragStartPoint = { x, y };
            } else if (shape?.type === "Pencil") {
                // For pencil, store start point
                dragStartPoint = { x, y };
            }
            
            clearCanvas(drawnShapes, currentCanvas);
            return;
        } else {
            // Clicked on empty space, deselect
            selectedShapeIndex = null;
            clearCanvas(drawnShapes, currentCanvas);
            return;
        }
    }
    
    // Reset selection when starting a new drawing
    selectedShapeIndex = null;
    isDraggingShape = false;
    
    isDrawing = true;
    
    // Get canvas-relative coordinates
    startX = x;
    startY = y;
    
    // For pencil tool, initialize the points array
    if (currentShape === "Pencil") {
        pencilPoints = [{ x: startX, y: startY }];
    }
}

function handleMouseUp(e: MouseEvent) {
    if (!currentCanvas) return;
    
    // If dragging a shape, just stop the drag
    if (isDraggingShape) {
        isDraggingShape = false;
        return;
    }
    
    if (!isDrawing || isAddingText) return;
    
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
                height,
                color: currentColor,
                strokeWidth: currentStrokeWidth
            });
            // Switch to select mode
            break;
        case "Circle":
            const radiusX = Math.abs(currentX - startX);
            const radiusY = Math.abs(currentY - startY);
            drawnShapes.push({
                type: "circle",
                x: startX,
                y: startY,
                radiusX,
                radiusY,
                color: currentColor,
                strokeWidth: currentStrokeWidth
            });
            // Switch to select mode
            break;
        case "Diamond":
            drawnShapes.push({
                type: "Diamond",
                x: (startX + currentX) / 2, // Center X
                y: (startY + currentY) / 2, // Center Y
                width: Math.abs(currentX - startX),
                height: Math.abs(currentY - startY),
                color: currentColor,
                strokeWidth: currentStrokeWidth
            });
            // Switch to select mode
            break;
        case "Line":
            drawnShapes.push({
                type: "Line",
                x1: startX,
                y1: startY,
                x2: currentX,
                y2: currentY,
                color: currentColor,
                strokeWidth: currentStrokeWidth
            });
            // Switch to select mode
            break;
        case "Arrow":
            // Calculate angle for arrowhead
            const dx = currentX - startX;
            const dy = currentY - startY;
            const angle = Math.atan2(dy, dx);
            
            drawnShapes.push({
                type: "Arrow",
                x1: startX,
                y1: startY,
                x2: currentX,
                y2: currentY,
                arrowSize: 15,
                color: currentColor,
                strokeWidth: currentStrokeWidth
            });
            // Switch to select mode
            break;
        case "Pencil":
            if (pencilPoints.length > 1) {
                drawnShapes.push({
                    type: "Pencil",
                    points: [...pencilPoints],
                    color: currentColor,
                    strokeWidth: currentStrokeWidth
                });
                // Switch to select mode
            }
            pencilPoints = [];
            break;
    }
}

function handleMouseMove(e: MouseEvent) {
    if (!ctx || !currentCanvas) return;
    
    const rect = currentCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Handle shape dragging
    if (isDraggingShape && selectedShapeIndex !== null) {
        const shape = drawnShapes[selectedShapeIndex];
        
        if (shape?.type === "rect" || shape?.type === "Diamond" || shape?.type === "circle" || shape?.type === "Text") {
            // Simple position update
            shape.x = currentX - dragOffsetX;
            shape.y = currentY - dragOffsetY;
        } else if (shape?.type === "Arrow" || shape?.type === "Line") {
            // Calculate movement delta
            const deltaX = currentX - dragStartPoint.x;
            const deltaY = currentY - dragStartPoint.y;
            
            // Update all points
            shape.x1 += deltaX;
            shape.y1 += deltaY;
            shape.x2 += deltaX;
            shape.y2 += deltaY;
            
            // Update drag start point for next move
            dragStartPoint = { x: currentX, y: currentY };
        } else if (shape?.type === "Pencil") {
            // Calculate movement delta
            const deltaX = currentX - dragStartPoint.x;
            const deltaY = currentY - dragStartPoint.y;
            
            // Move all points
            for (let i = 0; i < shape.points.length; i++) {
                shape.points[i].x += deltaX;
                shape.points[i].y += deltaY;
            }
            
            // Update drag start point for next move
            dragStartPoint = { x: currentX, y: currentY };
        }
        
        clearCanvas(drawnShapes, currentCanvas);
        return;
    }
    
    if (!isDrawing) {
        // Show cursor as pointer when hovering over a shape in select mode
        if (currentShape === "Select" && currentCanvas) {
            const shapeIndex = findShapeUnderCursor(currentX, currentY);
            currentCanvas.style.cursor = shapeIndex !== null ? 'move' : 'default';
        }
        return;
    }
    
    // Skip drawing preview for text
    if (currentShape === "Text") {
        return;
    }
    
    // Clear and redraw
    clearCanvas(drawnShapes, currentCanvas);
    
    // Draw current shape
    ctx.strokeStyle = currentColor === "black" ? "rgba(255,255,255)" : currentColor; // Default to white if black
    ctx.lineWidth = currentStrokeWidth;
    
    switch (currentShape) {
        case "Rectangle":
            const width = currentX - startX;
            const height = currentY - startY;
            ctx.strokeRect(startX, startY, width, height);
            break;
        case "Circle":
            const radiusX = Math.abs(currentX - startX);
            const radiusY = Math.abs(currentY - startY);
            ctx.beginPath();
            ctx.ellipse(startX, startY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case "Diamond":
            drawDiamond(
                ctx, 
                (startX + currentX) / 2, 
                (startY + currentY) / 2, 
                Math.abs(currentX - startX), 
                Math.abs(currentY - startY)
            );
            break;
        case "Line":
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            break;
        case "Arrow":
            // Draw straight line
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            // Calculate angle for arrowhead
            const dx = currentX - startX;
            const dy = currentY - startY;
            const angle = Math.atan2(dy, dx);
            
            // Draw arrowhead
            drawArrowhead(ctx, currentX, currentY, angle, 15);
            break;
        case "Pencil":
            // Add the current point to the pencil points array
            pencilPoints.push({ x: currentX, y: currentY });
            
            // Draw the pencil stroke
            if (pencilPoints.length > 0) {
                ctx.beginPath();
                ctx.moveTo(pencilPoints[0].x, pencilPoints[0].y);
                
                for (let i = 1; i < pencilPoints.length; i++) {
                    ctx.lineTo(pencilPoints[i].x, pencilPoints[i].y);
                }
                
                ctx.stroke();
            }
            break;
    }
}

function drawStraightArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, arrowSize: number) {
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Calculate angle for arrowhead
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    // Draw arrowhead
    drawArrowhead(ctx, x2, y2, angle, arrowSize);
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
    existingShapes.forEach((shape, index) => {
        // Set stroke style - use white for black color on dark background
        const shapeColor = shape?.color === "black" ? "rgba(255,255,255)" : shape.color;
        localCtx.strokeStyle = shapeColor;
            
        // Set line width
        localCtx.lineWidth = shape.strokeWidth;
        
        // Highlight selected shape with a different color
        if (index === selectedShapeIndex) {
            localCtx.strokeStyle = "rgba(0, 255, 255, 0.8)"; // Cyan for selected shape
        }
        
        switch(shape?.type) {
            case 'rect':
                localCtx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                break;
            case 'circle':
                localCtx.beginPath();
                localCtx.ellipse(shape.x, shape.y, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI);
                localCtx.stroke();
                break;
            case 'Diamond':
                drawDiamond(localCtx, shape.x, shape.y, shape.width, shape.height);
                break;
            case 'Line':
                localCtx.beginPath();
                localCtx.moveTo(shape.x1, shape.y1);
                localCtx.lineTo(shape.x2, shape.y2);
                localCtx.stroke();
                break;
            case 'Arrow':
                drawStraightArrow(
                    localCtx,
                    shape.x1,
                    shape.y1,
                    shape.x2,
                    shape.y2,
                    shape.arrowSize
                );
                break;
            case 'Pencil':
                if (shape.points && shape.points.length > 0) {
                    localCtx.beginPath();
                    localCtx.moveTo(shape.points[0].x, shape.points[0].y);
                    
                    for (let i = 1; i < shape.points.length; i++) {
                        localCtx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    
                    localCtx.stroke();
                }
                break;
            case 'Text':
                // Set text properties
                localCtx.font = `${shape.fontSize}px Arial, sans-serif`;
                localCtx.fillStyle = shapeColor;
                
                // Draw the text
                localCtx.fillText(shape.text, shape.x, shape.y);
                
                // If this text is being edited, draw cursor
                if (shape.isEditing && cursorVisible) {
                    // Calculate cursor position based on text width
                    const textWidth = localCtx.measureText(shape.text).width;
                    
                    // Draw cursor as a vertical line
                    localCtx.beginPath();
                    localCtx.moveTo(shape.x + textWidth, shape.y - shape.fontSize);
                    localCtx.lineTo(shape.x + textWidth, shape.y);
                    localCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                    localCtx.lineWidth = 1;
                    localCtx.stroke();
                }
                
                // If this text is selected, draw a highlight box
                if (index === selectedShapeIndex) {
                    // Use text measurement API for accurate width
                    const textWidth = localCtx.measureText(shape.text).width;
                    
                    localCtx.strokeStyle = "rgba(0, 255, 255, 0.8)";
                    localCtx.strokeRect(
                        shape.x - 2, 
                        shape.y - shape.fontSize - 2,
                        textWidth + 4,
                        shape.fontSize + 4
                    );
                }
                break;
        }
    });
}

export function clearAllShapes(): void {
    // Clear all shapes
    drawnShapes.length = 0;
    
    // Reset selection
    selectedShapeIndex = null;
    
    // Redraw the canvas
    if (currentCanvas) {
        clearCanvas(drawnShapes, currentCanvas);
    }
}
