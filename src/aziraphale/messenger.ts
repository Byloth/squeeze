import { v4 as uuid4 } from "uuid";

import { Subscribers, TimedPromise } from "@byloth/core";
import type { PromiseResolver, PromiseRejecter } from "@byloth/core";

import { CrowleyException } from "@/exceptions";

import Connection from "./connection";
import { MessageStatus } from "./types";
import type { Message, MessageAck, Payload, RoomMessage, RoomMessagePayload, SimpleMessage } from "./types";

export default class Messenger
{
    public static readonly TIMEOUT = 5000;

    protected _connection: Connection;

    protected _messages: Map<string, [PromiseResolver<MessageAck>, PromiseRejecter<CrowleyException>]>;
    protected _roomListeners: Map<string, (message: RoomMessage) => void>;
    protected _onMessageSubscribers: Subscribers<[SimpleMessage]>;

    public constructor(connection: Connection)
    {
        this._messages = new Map();
        this._roomListeners = new Map();
        this._onMessageSubscribers = new Subscribers();

        this._connection = connection;
        this._connection.onMessage(this._onMessage);
        this._connection.onClose(this._onClose);
    }

    protected _onMessage = (evt: MessageEvent) =>
    {
        const message: Message = JSON.parse(evt.data);

        console.log(message);

        if ("id" in message)
        {
            if (!(this._messages.has(message.id))) { throw new Error("Unknown message ID."); }

            const [resolve, reject] = this._messages.get(message.id)!;

            if (message.status === MessageStatus.Success)
            {
                resolve(message);
            }
            else if (message.status === MessageStatus.Error)
            {
                reject(new CrowleyException(message));
            }

            this._messages.delete(message.id); return;
        }

        if (message.status === MessageStatus.Error) { throw new CrowleyException(message); }
        if (message.type === "room:message")
        {
            const payload = message.payload as RoomMessagePayload;

            if (!(payload.roomId)) { throw new Error("Missing room ID."); }
            if (!(this._roomListeners.has(payload.roomId)))
            {
                throw new Error(`Unknown room ID: ${payload.roomId}`);
            }

            const callback = this._roomListeners.get(payload.roomId)!;

            callback(message as RoomMessage); return;
        }

        this._onMessageSubscribers.call(message);
    };
    protected _onClose = (evt: CloseEvent) =>
    {
        for (const [_i, [_r, reject]] of this._messages)
        {
            reject(CrowleyException.ConnectionClosed());
        }

        this._messages.clear();
    };

    public fireAndForget(type: string, payload: Record<string, unknown>): void
    {
        const content = { type, payload };

        console.log("Sending message:", content);

        this._connection.jsonSend(content);
    }
    public prayAndWait<T extends Payload = Payload>(type: string, payload: Record<string, unknown>)
        : Promise<MessageAck<T>>
    {
        return new TimedPromise<MessageAck<T>>((resolve, reject) =>
        {
            const id = uuid4().replaceAll("-", "");
            const content = { id, type, payload };

            this._messages.set(id, [resolve as PromiseResolver<MessageAck>, reject]);

            try { this._connection.jsonSend(content); }
            catch (error) { reject(error); }

        }, Messenger.TIMEOUT);
    }

    public onRoomMessage(roomId: string, callback: (message: RoomMessage) => void): () => void
    {
        if (this._roomListeners.has(roomId)) { throw new Error("Already listening to this room."); }
        this._roomListeners.set(roomId, callback);

        return () =>
        {
            if (!(this._roomListeners.has(roomId))) { throw new Error("Not listening to this room anymore."); }
            this._roomListeners.delete(roomId);
        };
    }
    public onMessage(callback: (message: SimpleMessage) => void): () => void
    {
        this._onMessageSubscribers.add(callback);
        return () => this._onMessageSubscribers.remove(callback);
    }
}
