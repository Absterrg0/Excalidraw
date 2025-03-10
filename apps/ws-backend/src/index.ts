import { WebSocketServer, WebSocket } from "ws";
import { useRoomStore } from "./store";
import prisma from "@repo/db";
import { chatQueue } from "./queue";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New client connected!");

  ws.on("message", async (message) => {
    const data = JSON.parse(message.toString());
    const { addUserToRoom} = useRoomStore.getState();

    if (data.type === "join-room") {
        
        const roomId = data.roomId;
        
    //   const isValidRoom = await prisma.room.findFirst({
    //     where:{
    //         id:roomId
    //     }
    //   })

    //   if(!isValidRoom){
    //     console.log("Invalid room id found");
    //     ws.close(1000,"Invalid Room")
    //     return;
    //   }
    
      const added = addUserToRoom(roomId, ws);
      if(!added){
        ws.send(JSON.stringify({type:"Error",message:"Already in the room!"}));
      }
      console.log(`Client joined room: ${roomId}`);
    }

    if(data.type==="leave-room"){
        const {roomId}=data;
        useRoomStore.getState().deleteUserFromRoom(roomId,ws);
        console.log(`Client left room ${roomId} successfully`)
    }

    if (data.type === "message") {
        const { roomId, message,userId } = data;
        const room = useRoomStore.getState().rooms.get(roomId);
      
        if (!room || !room.has(ws)) {
          ws.send(JSON.stringify({ type: "error", message: "You are not part of this room" }));
          return;
        }

        chatQueue.addChat({message,roomId,userId})
      
        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "message", roomId, message }));
          }
        });
      }
      
  });

  ws.on("close", () => {
    const { deleteUserFromRoom } = useRoomStore.getState();
    useRoomStore.getState().rooms.forEach((clients, roomId) => {
        deleteUserFromRoom(roomId, ws);
    });

    console.log("Client disconnected successfully");
  });


});

console.log("WebSocket server running on ws://localhost:8080");