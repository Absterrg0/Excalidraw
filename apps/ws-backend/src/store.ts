import { WebSocket } from "ws";
import { create } from "zustand";

interface RoomStore {
  rooms: Map<string, Set<WebSocket>>;
  addUserToRoom: (roomId: string, ws: WebSocket) => boolean;
  deleteUserFromRoom: (roomId: string, ws: WebSocket) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  rooms: new Map(),

  addUserToRoom: (roomId, ws) => {
    const state = get();
    const existingRoom = state.rooms.get(roomId);

    if (existingRoom?.has(ws)) {
      return false;
    }

    set((state) => {
      const newRooms = new Map(state.rooms);
      if (!newRooms.has(roomId)) {
        newRooms.set(roomId, new Set());
      }
      newRooms.get(roomId)?.add(ws);
      return { rooms: newRooms };
    });

    return true;
  },

  deleteUserFromRoom: (roomId, ws) => {
    set((state) => {
      const newRooms = new Map(state.rooms);
      newRooms.get(roomId)?.delete(ws);
      if (newRooms.get(roomId)?.size === 0) {
        newRooms.delete(roomId);
      }
      return { rooms: newRooms };
    });
  },
}));
