import { Subscribers } from "@byloth/core";

export default class Connection
{
    protected _isOpen: boolean;
    protected _socket?: WebSocket;

    protected _onOpenSubscribers: Subscribers<[Event], void>;
    protected _onMessageSubscribers: Subscribers<[MessageEvent], void>;
    protected _onErrorSubscribers: Subscribers<[Event], void>;
    protected _onCloseSubscribers: Subscribers<[CloseEvent], void>;

    public readonly endpoint: string;

    public get isOpen(): boolean
    {
        return this._isOpen;
    }

    public constructor(endpoint: string)
    {
        this._isOpen = false;
        this._socket = undefined;

        this._onOpenSubscribers = new Subscribers();
        this._onMessageSubscribers = new Subscribers();
        this._onErrorSubscribers = new Subscribers();
        this._onCloseSubscribers = new Subscribers();

        this.endpoint = endpoint;
    }

    protected _onOpen = (evt: Event) =>
    {
        this._isOpen = true;
        this._onOpenSubscribers.call(evt);
    };
    protected _onMessage = (evt: MessageEvent) => this._onMessageSubscribers.call(evt);
    protected _onError = (evt: Event) => this._onErrorSubscribers.call(evt);
    protected _onClose = (evt: CloseEvent) =>
    {
        this._isOpen = false;
        this._onCloseSubscribers.call(evt);
    };

    public open(): void
    {
        if (this.isOpen) { throw new Error("Already open."); }

        this._socket = new WebSocket(this.endpoint);
        this._socket.addEventListener("open", this._onOpen);
        this._socket.addEventListener("message", this._onMessage);
        this._socket.addEventListener("error", this._onError);
        this._socket.addEventListener("close", this._onClose);
    }
    public jsonSend(payload: Record<string, unknown>): void
    {
        if (!(this.isOpen)) { throw new Error("Not open."); }
        this._socket!.send(JSON.stringify(payload));
    }
    public close(code?: number, reason?: string): void
    {
        if (!(this.isOpen)) { throw new Error("Not open."); }
        this._socket!.close(code, reason);
    }

    public onOpen(callback: (evt: Event) => void): () => void
    {
        this._onOpenSubscribers.add(callback);
        return () => this._onOpenSubscribers.remove(callback);
    }
    public onMessage(callback: (evt: MessageEvent) => void): () => void
    {
        this._onMessageSubscribers.add(callback);
        return () => this._onMessageSubscribers.remove(callback);
    }
    public onError(callback: (evt: Event) => void): () => void
    {
        this._onErrorSubscribers.add(callback);
        return () => this._onErrorSubscribers.remove(callback);
    }
    public onClose(callback: (evt: CloseEvent) => void): () => void
    {
        this._onCloseSubscribers.add(callback);
        return () => this._onCloseSubscribers.remove(callback);
    }
}
