import Connection from "./connection";
import Messenger from "./messenger";
import Room from "./room";
import type { RoomPayload } from "./room";

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

export class Server
{
    protected _connection: Connection;
    protected _messenger: Messenger;

    public get isConnected(): boolean
    {
        return this._connection.isOpen;
    }

    public constructor(endpoint: string)
    {
        this._connection = new Connection(endpoint);
        this._messenger = new Messenger(this._connection);
        this._messenger.onMessage((message) =>
        {
            // eslint-disable-next-line no-console
            console.warn("Message received without any IDs; not implemented yet.");
        });
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

        return connection;
    }

    public async createRoom(roomType: string)
    {
        const response = await this._messenger.prayAndWait<RoomPayload>("room:create", { roomType });

        return new Room(this._messenger, response.payload);
    }
    public async joinRoomById(roomId: string)
    {
        const response = await this._messenger.prayAndWait<RoomPayload>("room:join:id", { roomId });

        return new Room(this._messenger, response.payload);
    }
    public async joinRoomByType(roomType: string)
    {
        const response = await this._messenger.prayAndWait<RoomPayload>("room:join:type", { roomType });

        return new Room(this._messenger, response.payload);
    }

    public disconnect(code?: number, reason?: string)
    {
        this._connection.close(code, reason);
    }
}
