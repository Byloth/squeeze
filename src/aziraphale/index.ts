import { v4 as uuid4 } from "uuid";

import { TimedPromise } from "@byloth/core";
import type { PromiseResolver, PromiseRejecter } from "@byloth/core";

import { CrowleyResponseStatus } from "@/core/types";
import type { CrowleyMessageAck, CrowleyMessageResponse } from "@/core/types";
import { CrowleyException } from "@/exceptions";

export default class Aziraphale
{
    public static readonly TIMEOUT = 5000;

    private _isConnected: boolean;
    private _messages: Map<string, [PromiseResolver<CrowleyMessageAck>, PromiseRejecter<CrowleyException>]>;

    private _socket?: WebSocket;

    private readonly endpoint: string;

    public get isConnected(): boolean
    {
        return this._isConnected;
    }

    public constructor(endpoint: string)
    {
        this._isConnected = false;
        this._messages = new Map();

        this.endpoint = endpoint;
    }

    protected _onOpen = (evt: Event) =>
    {
        console.log("Connection established:", evt);

        this._isConnected = true;
    };
    protected _onMessage = (evt: MessageEvent) =>
    {
        const content: CrowleyMessageResponse = JSON.parse(evt.data);

        console.log("Message received:", content);

        if ("id" in content)
        {
            if (!(this._messages.has(content.id))) { throw new Error("Unknown message ID."); }

            const [resolve, reject] = this._messages.get(content.id)!;

            if (content.status === CrowleyResponseStatus.SUCCESS)
            {
                resolve(content);
            }
            else if (content.status === CrowleyResponseStatus.ERROR)
            {
                reject(new CrowleyException(content));
            }

            this._messages.delete(content.id);
        }
    };
    protected _onError = (evt: Event) =>
    {
        console.log("Connection error:", evt);
    };
    protected _onClose = (evt: CloseEvent) =>
    {
        console.log("Connection closed:", evt);

        for (const [id, [_, reject]] of this._messages)
        {
            reject(CrowleyException.ConnectionClosed(id));
        }

        this._isConnected = false;
        this._messages.clear();
    };

    protected _sendRaw(type: string, payload: Record<string, unknown>)
    {
        if (!(this.isConnected)) { throw new Error("Not connected."); }

        return new TimedPromise<CrowleyMessageAck>((resolve, reject) =>
        {
            const id = uuid4().replaceAll("-", "");

            this._messages.set(id, [resolve, reject]);
            this._socket!.send(JSON.stringify({ id, type, payload }));

        }, Aziraphale.TIMEOUT);
    }

    public connect()
    {
        if (this.isConnected) { throw new Error("Already connected."); }

        return new Promise((resolve, reject) =>
        {
            this._socket = new WebSocket(this.endpoint);
            this._socket.addEventListener("open", (evt) =>
            {
                this._onOpen(evt);

                resolve(evt);
            });
            this._socket.addEventListener("message", this._onMessage);
            this._socket.addEventListener("error", this._onError);
            this._socket.addEventListener("close", (evt) =>
            {
                this._onClose(evt);

                reject(evt);
            });
        });
    }

    public async createRoom(roomType: string)
    {
        if (!(this.isConnected)) { throw new Error("Not connected."); }

        return await this._sendRaw("room:create", { roomType });
    }
    public async joinRoomById(roomId: string)
    {
        if (!(this.isConnected)) { throw new Error("Not connected."); }

        return await this._sendRaw("room:join:id", { roomId });
    }
    public async joinRoomByType(roomType: string)
    {
        if (!(this.isConnected)) { throw new Error("Not connected."); }

        return await this._sendRaw("room:join:type", { roomType });
    }

    public disconnect(code?: number | undefined, reason?: string | undefined)
    {
        if (!(this.isConnected)) { throw new Error("Not connected."); }

        this._socket!.close();
    }
}
