import { Subscribers } from "@byloth/core";
import type { Constructor } from "@byloth/core";

import Connection from "./connection";
import Messenger from "./messenger";
import Room from "./room";
import type { RoomDetails } from "./room";

/*
 * TODO:
 *  - Implementare la gestione delle Stanze.
 *  - Implementare un sistema per recuperare la lista delle Stanze pubbliche.
 *  - Implementare un sistema per limitare il numero di Client per Stanza.
 *  - Implementare un sistema per la gestione delle Stanze Private (con password).
 *  - Implementare un sistema per accettare o rifiutare le richieste di ingresso nelle Stanze.
 *  - Implementare un sistema per la gestione di stanze permanenti / temporanee.
 *  - Implementare un sistema per la gestione della Riconnessione del Client.
 *  - Implementare la gestione dello Stato del Client.
 *  - Implementare un sistema per la Sincronizzazione dello Stato del Client (sola lettura).
 *  - Implementare la gestione dello Stato della Stanza.
 *  - Implementare un sistema per la Sincronizzazione dello Stato della Stanza tra tutti i Client (sola lettura).
 *  - Implementare l'invio dei messaggi in formato binario (dovrebbe essere più efficiente).
 *  - Implementare un sistema per permettere all'applicazione di scalare orizzontalmente.
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export class Server<T extends Record<string, Room> = { }>
{
    protected _roomTypes: Map<string, Constructor<Room>>;

    protected _connection: Connection;
    protected _messenger: Messenger;
    protected _rooms: Map<string, Room>;

    protected _onOpenSubscribers: Subscribers<[Event]>;
    protected _onCloseSubscribers: Subscribers<[CloseEvent]>;
    protected _onErrorSubscribers: Subscribers<[Event]>;

    public get isConnected(): boolean
    {
        return this._connection.isOpen;
    }

    public constructor(endpoint: string)
    {
        this._roomTypes = new Map();

        this._connection = new Connection(endpoint);
        this._messenger = new Messenger(this._connection);
        this._messenger.onMessage((message) =>
        {
            // eslint-disable-next-line no-console
            console.warn("Message received without any IDs; not implemented yet.");
        });

        this._rooms = new Map();

        this._onOpenSubscribers = new Subscribers();
        this._onCloseSubscribers = new Subscribers();
        this._onErrorSubscribers = new Subscribers();
    }

    public connect()
    {
        const connection = new Promise<void>((resolve, reject) =>
        {
            const unsubscribeOpen = this._connection.onOpen(() =>
            {
                unsubscribeClose();
                unsubscribeOpen();

                resolve();
            });
            const unsubscribeClose = this._connection.onClose((evt) =>
            {
                unsubscribeClose();
                unsubscribeOpen();

                reject(evt);
            });
        });

        this._connection.open();
        this._connection.onOpen((evt) => this._onOpenSubscribers.call(evt));
        this._connection.onClose((evt) => this._onCloseSubscribers.call(evt));
        this._connection.onError((evt) => this._onErrorSubscribers.call(evt));

        return connection;
    }

    public async createRoom<K extends string, V extends Room = T[K]>(roomType: K): Promise<V>
    {
        const response = await this._messenger.prayAndWait<RoomDetails>("room:create", { roomType });

        const RoomClass = this._roomTypes.get(roomType)!;
        const room = new RoomClass(this._messenger, response.payload) as V;

        this._rooms.set(room.id, room);

        return room;
    }
    public async joinRoomById<K extends string, V extends Room = T[K]>(roomId: K): Promise<V>
    {
        const response = await this._messenger.prayAndWait<RoomDetails>("room:join:id", { roomId });

        const RoomClass = this._roomTypes.get(response.payload.roomType)!;
        const room = new RoomClass(this._messenger, response.payload) as V;

        this._rooms.set(room.id, room);

        return room;
    }
    public async joinRoomByType<K extends string, V extends Room = T[K]>(roomType: K, createIfNotExists = false)
        : Promise<V>
    {
        const payload: Record<string, unknown> = { roomType };

        if (createIfNotExists) { payload.createIfNotExists = true; }

        const response = await this._messenger.prayAndWait<RoomDetails>("room:join:type", payload);

        const RoomClass = this._roomTypes.get(roomType)!;
        const room = new RoomClass(this._messenger, response.payload) as V;

        this._rooms.set(room.id, room);

        return room;
    }

    public getRoom<V extends T[keyof T]>(roomId: string): V
    {
        return this._rooms.get(roomId) as V;
    }

    public disconnect(code?: number, reason?: string)
    {
        this._connection.close(code, reason);
    }

    public onOpen(callback: (evt: Event) => void)
    {
        return this._onOpenSubscribers.add(callback);
    }
    public onClose(callback: (evt: CloseEvent) => void)
    {
        return this._onCloseSubscribers.add(callback);
    }
    public onError(callback: (evt: Event) => void)
    {
        return this._onErrorSubscribers.add(callback);
    }

    public register<K extends string, V extends Room>(roomType: K, RoomClass: Constructor<V>)
    {
        type RoomsMap = T & Record<K, V>;

        if (this._roomTypes.has(roomType)) { throw new Error("Room type already registered."); }
        this._roomTypes.set(roomType, RoomClass);

        return this as Server<{ [L in keyof RoomsMap]: RoomsMap[L] }>;
    }
}
