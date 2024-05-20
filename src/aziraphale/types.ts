export enum MessageStatus
{
    Success = "SUCCESS",
    Error = "ERROR"
}

export interface Payload extends Record<string, unknown> { }
export interface MessageSuccess<T extends Payload = Payload>
{
    status: MessageStatus.Success;
    payload: T;
    type: string;
}

export interface ErrorDetails extends Payload
{
    errorId: string;
    errorCode: string;
}
export interface MessageError
{
    status: MessageStatus.Error;
    message: string;
    details: ErrorDetails;
    type: string;
}

export type SimpleMessage<T extends Payload = Payload> = MessageSuccess<T> | MessageError;

export interface MessageAck<T extends Payload = Payload> extends MessageSuccess<T> { id: string; }
export interface MessageNack extends MessageError { id: string; }
export type ResponseMessage<T extends Payload = Payload> = MessageAck<T> | MessageNack;

export interface RoomMessagePayload<T = unknown> extends Payload
{
    roomId: string;
    message: T;
}
export interface RoomMessage<T = unknown> extends MessageSuccess<RoomMessagePayload<T>> { type: "room:message"; }

export type Message<T extends Payload = Payload> = SimpleMessage<T> | RoomMessage<T> | ResponseMessage<T>;
