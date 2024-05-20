import { ref } from "vue";
import { defineStore } from "pinia";

import { Subscribers } from "@byloth/core";

import { Server } from "@/aziraphale";
import Room from "@/aziraphale/room";

import type { RoomMessage } from "@/aziraphale/types";

export class ChatRoom extends Room
{
    protected onMessage(message: RoomMessage): void
    {
        console.log("ChatRoom message:", message);
    }

    public sendMessage(message: string): void
    {
        this.fireAndForget("user:message", message);
    }
}
export class GameRoom extends Room
{
    protected _onClickSubscribers: Subscribers<[]>;

    protected onMessage(message: RoomMessage): void
    {
        console.log("GameRoom message:", message);
    }
}

export default defineStore("socket", () =>
{
    const _server = new Server("ws://localhost:8000/squeeze/")
        .register("room:chat", ChatRoom)
        .register("room:game", GameRoom);

    _server.onOpen((evt) =>
    {
        console.log("Connected to server:", evt);

        isConnected.value = true;
    });
    _server.onClose((evt) =>
    {
        console.log("Disconnected from server:", evt);

        isConnected.value = false;
    });
    _server.onError((evt) =>
    {
        console.log("An error occurred:", evt);
    });

    const isConnected = ref(false);

    const connect = (): Promise<void> => _server.connect();
    const disconnect = (): void => _server.disconnect();

    type RoomsMap = (typeof _server) extends Server<infer T> ? T : never;

    const createRoom = async <K extends keyof RoomsMap, V extends RoomsMap[K]>(roomType: K): Promise<V> =>
    {
        return _server.createRoom<K, V>(roomType);
    };
    const joinRoomById = async <K extends keyof RoomsMap, V extends RoomsMap[K]>(roomId: K): Promise<V> =>
    {
        return _server.joinRoomById<K, V>(roomId);
    };
    const joinRoomByType = async <K extends keyof RoomsMap, V extends RoomsMap[K]>(
        roomType: K, createIfNotExists = false): Promise<V> =>
    {
        return _server.joinRoomByType<K, V>(roomType, createIfNotExists);
    };

    const getRoom = <V extends RoomsMap[keyof RoomsMap]>(roomId: string): V => _server.getRoom<V>(roomId);

    return {
        isConnected,

        connect,
        disconnect,

        createRoom,
        joinRoomById,
        joinRoomByType,

        getRoom
    };
});
