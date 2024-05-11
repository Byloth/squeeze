import { Subscribers } from "@byloth/core";

import type Messenger from "./messenger";
import type { MessageAck, Payload, RoomMessage } from "./types";

export interface RoomPayload extends Payload
{
    roomId: string;
    roomType: string;
}

export default class Room
{
    protected _messenger: Messenger;
    protected _onMessageSubscribers: Subscribers<[RoomMessage]>;
    protected _unsubscribe: () => void;

    public readonly id: string;
    public readonly type: string;

    public constructor(messenger: Messenger, { roomId, roomType }: RoomPayload)
    {
        this._onMessageSubscribers = new Subscribers();

        this._messenger = messenger;
        this._unsubscribe = messenger.onRoomMessage(roomId, (message) => this._onMessageSubscribers.call(message));

        this.id = roomId;
        this.type = roomType;
    }

    public fireAndForget(type: string, payload: Record<string, unknown>): void
    {
        this._messenger.fireAndForget(type, payload, this.id);
    }
    public prayAndWait<T extends Payload = Payload>(type: string, payload: Record<string, unknown>)
        : Promise<MessageAck<T>>
    {
        return this._messenger.prayAndWait<T>(type, payload, this.id);
    }

    public onMessage(callback: (message: RoomMessage) => void): () => void
    {
        this._onMessageSubscribers.add(callback);
        return () => this._onMessageSubscribers.remove(callback);
    }

    public leave()
    {
        this._messenger.fireAndForget("room:leave", { roomId: this.id });
        this._unsubscribe();
    }
}
