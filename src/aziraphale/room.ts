import { Subscribers } from "@byloth/core";

import type Messenger from "./messenger";
import type { MessageAck, Payload, RoomMessage } from "./types";

export interface RoomDetails extends Payload
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

    public constructor(messenger: Messenger, { roomId, roomType }: RoomDetails)
    {
        this._onMessageSubscribers = new Subscribers();

        this._messenger = messenger;
        this._unsubscribe = messenger.onRoomMessage(roomId, this.onMessage);

        this.id = roomId;
        this.type = roomType;
    }

    protected fireAndForget(type: string, payload: unknown): void
    {
        const content = {
            roomId: this.id,
            message: { type, payload }
        };

        this._messenger.fireAndForget("room:message", content);
    }
    protected prayAndWait<T extends Payload = Payload>(type: string, payload: unknown)
        : Promise<MessageAck<T>>
    {
        const content = {
            roomId: this.id,
            message: { type, payload }
        };

        return this._messenger.prayAndWait<T>("room:message", content);
    }

    protected onMessage(message: RoomMessage): void { }

    public leave()
    {
        this._messenger.fireAndForget("room:leave", { roomId: this.id });
        this._unsubscribe();
    }
}
