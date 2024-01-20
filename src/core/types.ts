export interface CrowleyErrorPayload
{
    errorId: string;
    errorCode: string;
}

export interface CrowleyError
{
    status: "error";
    message: string;
    payload: CrowleyErrorPayload;
    type: "ERROR";
}
export interface CrowleyMessageError extends Omit<CrowleyError, "type">
{
    id: string;
    type: "MESSAGE_ERROR";
}

export type CrowleyErrorResponse = CrowleyError | CrowleyMessageError;

export interface CrowleyMessageSuccess
{
    id: string;
    status: "success";
}

export interface CrowleyRoomMessage<T extends Record<string, unknown> = Record<string, unknown>>
{
    roomId: string;
    payload: T;
}

export type CrowleyMessage = CrowleyRoomMessage | CrowleyMessageSuccess | CrowleyErrorResponse;
