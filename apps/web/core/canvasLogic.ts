
type Shape = {
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
} | {
    type:"circle",
    x:number,
    y:number,
    radius:number
}

export type possibleShapes = "Rectangle" | "Circle" | "Triangle" | "Arrow" | "Diamond";


export function initDraw(canvas:HTMLCanvasElement,type:possibleShapes){
    const ctx = canvas.getContext("2d");
    if(!ctx){
        return;
    }


    let existingShapes:Shape[] = []

    let clicked =false;
    ctx.fillStyle="rgba(0,0,0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    let startX=0;
    let startY=0;
    



    canvas.addEventListener("mousedown",(e)=>{
        clicked=true
        startX=e.clientX;
        startY=e.clientY;
    })


    canvas.addEventListener("mouseup",(e)=>{
        clicked=false;
        switch (type){
            case "Rectangle":
                const width = e.clientX-startX;
                const height = e.clientY-startY;
                existingShapes.push({
                    type:"rect",
                    x:startX,
                    y:startY,
                    width,
                    height
                })
                break;
            case "Circle":
                const radius = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
                existingShapes.push({
                    type: "circle",
                    x: startX,
                    y: startY,
                    radius
                });
                break;
        }

    })

    canvas.addEventListener("mousemove",(e)=>{
        if(clicked){
       
            clearCanvas(existingShapes,canvas)
            ctx.strokeStyle = "rgba(255,255,255)"
            switch (type){
                case "Rectangle":
                    const width = e.clientX-startX;
                    const height = e.clientY-startY;
                    ctx.strokeRect(startX,startY,width,height);
                    break;
                case "Circle":
                    const radius = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
                    ctx.beginPath();
                    ctx.arc(startX,startY,radius,0,2*Math.PI);
                    ctx.stroke();
                    break;

            }

        }
    })
}




function clearCanvas(existingShapes:Shape[],canvas:HTMLCanvasElement){
    const ctx = canvas.getContext("2d");
    if(!ctx){
        return;
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle= "rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    existingShapes.map((shape)=>{
        ctx.strokeStyle = "rgba(255,255,255)"
        switch(shape.type){
            case 'rect':
                ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(shape.x,shape.y,shape.radius,0,2*Math.PI);
                ctx.stroke();
                break;

        }
    })

}