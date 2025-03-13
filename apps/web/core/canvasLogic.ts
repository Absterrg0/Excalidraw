import { DrawingColor, StrokeWidth } from "@/components/Canvas";
import { possibleShapes,Shape } from "./canvasType";
import { debouncedSaveToLocalStorage, drawArrowhead,drawDiamond,findShapeUnderCursor,handleKeyDown, loadFromLocalStorage, saveToLocalStorage, } from "./helper-functions";
let cursorBlinkInterval: number | null = null;

export let cursorVisible = true;


export let currentCanvas: HTMLCanvasElement | null = null;
export let ctx: CanvasRenderingContext2D | null = null;
export const drawnShapes: Shape[] = [];
let isDrawing = false;
let startX = 0;
let startY = 0;
let currentShape: possibleShapes = "Rectangle";
let currentColor: DrawingColor = "black";
let currentStrokeWidth: StrokeWidth = 2;

// Text-specific variables
export let isAddingText = false;
let currentFontSize = 20;
export let activeTextShape: Shape | null = null;

// For pencil drawing - initialize with empty array to avoid undefined error
let pencilPoints: Array<{x: number, y: number}> = [];

// For shape editing
export let selectedShapeIndex: number | null = null;
let isDraggingShape = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartPoint = { x: 0, y: 0 };



// Start text editing directly on canvas

// Set up cursor blinking effect
export function setupCursorBlink() {
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


export function startTextEditing(textShape: Shape, x: number, y: number) {
    if (textShape?.type !== "Text" || !currentCanvas) return;
    
    // First, finish any existing text editing
    finishTextEditing();
    
    // Mark this shape as being edited
    textShape.isEditing = true;
    activeTextShape = textShape;
    isAddingText = true;
    
    // Set up cursor blinking
    setupCursorBlink();
    
    // Focus on the canvas to receive keyboard input
    currentCanvas.focus();
}

export function finishTextEditing() {
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
        saveToLocalStorage();

    }
    
    activeTextShape = null;
    isAddingText = false;
    
    if (currentCanvas) {
        clearCanvas(drawnShapes, currentCanvas);
    }
}



export function updateDrawingMode(shape: possibleShapes, color: DrawingColor = "black", strokeWidth: StrokeWidth = 2) {
    // Properly clean up text editing before changing modes
    if (activeTextShape && currentShape === "Text") {
        finishTextEditing();
        
        // Reset isAddingText flag
        isAddingText = false;
        
        // Reset drawing state
        isDrawing = false;
    }
    
    currentShape = shape;
    currentColor = color;
    currentStrokeWidth = strokeWidth;
    
    // Reset selection when changing modes
    if (shape !== "Select") {
        selectedShapeIndex = null;
    }
    
    // Redraw canvas to reflect changes
    if (currentCanvas) {
        clearCanvas(drawnShapes, currentCanvas);
    }
}



export function initDraw(canvas: HTMLCanvasElement, type: possibleShapes) {
    // Clean up any existing text editing
    finishTextEditing();
    
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

    loadFromLocalStorage();

    if(currentCanvas){
        clearCanvas(drawnShapes,currentCanvas);
    }
    
    // Reset drawing state
    isDrawing = false;
    isAddingText = false;
}

// Handle keyboard input for text editing


export function deleteSelectedShape() {
    if (selectedShapeIndex !== null) {
        // Remove the shape from the array
        drawnShapes.splice(selectedShapeIndex, 1);
        
        // Reset selection
        selectedShapeIndex = null;
        
        // Redraw canvas
        if (currentCanvas) {
            clearCanvas(drawnShapes, currentCanvas);
        }
        saveToLocalStorage();
    }
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
        saveToLocalStorage();

        return;
    }
    
    // Don't process if we're not actually drawing or adding text
    if (!isDrawing && !isAddingText) return;
    
    // If we're in text mode, leave it for text editing, don't finish drawing
    if (isAddingText) return;
    
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
            break;
        case "Pencil":
            if (pencilPoints.length > 1) {
                drawnShapes.push({
                    type: "Pencil",
                    points: [...pencilPoints],
                    color: currentColor,
                    strokeWidth: currentStrokeWidth
                });
            }
            pencilPoints = [];
            break;
    }
    saveToLocalStorage();
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
        } else if (shape?.type === "Pencil" && shape.points) {
            // Calculate movement delta
            const deltaX = currentX - dragStartPoint.x;
            const deltaY = currentY - dragStartPoint.y;
            
            // Move all points
            for (let i = 0; i < shape.points.length; i++) {
                if(shape?.points[i]?.x && shape?.points[i]?.y){
                    shape.points[i]!.x += deltaX;
                    shape.points[i]!.y += deltaY;

                }
            }
            
            // Update drag start point for next move
            dragStartPoint = { x: currentX, y: currentY };
        }
        
        clearCanvas(drawnShapes, currentCanvas);
        debouncedSaveToLocalStorage();
        return;
    }
    
    // Don't do drawing preview if we're adding text
    if (isAddingText) return;
    
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
                ctx.moveTo(pencilPoints[0]!.x, pencilPoints[0]!.y);
                
                for (let i = 1; i < pencilPoints.length; i++) {
                    ctx.lineTo(pencilPoints[i]!.x, pencilPoints[i]!.y);
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

export function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement) {
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
        if (!shape) return;
        
        // Set stroke style - use white for black color on dark background
        const shapeColor = shape.color === "black" ? "rgba(255,255,255)" : shape.color;
        localCtx.strokeStyle = shapeColor;
            
        // Set line width
        if(shape.type !== 'Text'){
            localCtx.lineWidth = shape.strokeWidth;
        }
        
        // Highlight selected shape with a different color
        if (index === selectedShapeIndex) {
            localCtx.strokeStyle = "rgba(0, 255, 255, 0.8)"; // Cyan for selected shape
        }
        
        switch(shape.type) {
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
                    localCtx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
                    
                    for (let i = 1; i < shape.points.length; i++) {
                        localCtx.lineTo(shape.points[i]!.x, shape.points[i]!.y);
                    }
                    
                    localCtx.stroke();
                }
                break;
                // Replace the text rendering section in the clearCanvas function with this improved version:

case 'Text':
    // Set text properties
    localCtx.font = `${shape.fontSize}px Arial, sans-serif`;
    localCtx.fillStyle = shapeColor;
    
    // Handle multi-line text
    const lines = shape.text.split('\n');
    let lineY = shape.y;
    
    for (let i = 0; i < lines.length; i++) {
        // Draw each line of text
        localCtx.fillText(lines[i]!, shape.x, lineY);
        
        // Move to next line
        lineY += shape.fontSize * 1.2;
    }
    
    // If this text is being edited, draw cursor
    if (shape.isEditing && cursorVisible) {
        // Calculate cursor position based on text width
        const lastLine = lines[lines.length - 1];
        const textWidth = localCtx.measureText(lastLine!).width;
        
        // Draw cursor at the end of the current line, not the next line
        const cursorY = shape.y + (lines.length - 1) * shape.fontSize * 1.2;
        
        // Draw cursor as a vertical line
        localCtx.beginPath();
        localCtx.moveTo(shape.x + textWidth, cursorY - shape.fontSize);
        localCtx.lineTo(shape.x + textWidth, cursorY);
        localCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        localCtx.lineWidth = 1;
        localCtx.stroke();
    }

    // If this text is selected, draw a highlight box
    if (index === selectedShapeIndex) {
        // Calculate overall width of the text box
        let maxWidth = 0;
        for (const line of lines) {
            const lineWidth = localCtx.measureText(line).width;
            maxWidth = Math.max(maxWidth, lineWidth);
        }

        const totalHeight = lines.length * shape.fontSize * 1.2;

        // Draw selection box from the top of the first line
        localCtx.strokeStyle = "rgba(0, 255, 255, 0.8)";
        localCtx.strokeRect(
            shape.x - 2, 
            shape.y - shape.fontSize - 2,
            maxWidth + 4,
            totalHeight + 4
        );
    }
    break;
}
});
}

export function clearAllShapes(): void {
// Clean up text editing
finishTextEditing();

// Clear all shapes
drawnShapes.length = 0;

// Reset selection
selectedShapeIndex = null;

// Reset all drawing states
isDrawing = false;
isAddingText = false;

// Redraw the canvas
if (currentCanvas) {
clearCanvas(drawnShapes, currentCanvas);
localStorage.removeItem("canvasData");
}
}