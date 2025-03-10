import { WebSocketServer, WebSocket } from "ws";
import { useRoomStore } from "./store";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New client connected!");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    const { addUserToRoom} = useRoomStore.getState();

    if (data.type === "join-room") {
      const roomId = data.roomId;
      addUserToRoom(roomId, ws);
      console.log(`Client joined room: ${roomId}`);
    }

    if (data.type === "message") {
      const { roomId, message } = data;
      useRoomStore.getState().rooms.get(roomId)?.forEach((client) => {
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