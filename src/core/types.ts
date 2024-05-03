export enum CrowleyResponseStatus
{
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}

export interface CrowleyErrorDetails
{
    errorId: string;
    errorCode: string;
}
export interface CrowleyError
{
    status: CrowleyResponseStatus.ERROR;
    message: string;
    details: CrowleyErrorDetails;
    type: string;
}

export type Payload = Record<string, unknown>;
export interface CrowleyMessage<P extends Payload = Payload>
{
    status: CrowleyResponseStatus.SUCCESS;
    payload: P;
    type: string;
}

export interface CrowleyMessageAck<P extends Payload = Payload> extends CrowleyMessage<P> { id: string; }
export interface CrowleyMessageNack extends CrowleyError { id: string; }

export type CrowleyErrorResponse = CrowleyError | CrowleyMessageNack;
export type CrowleyMessageResponse<P extends Payload = Payload> = CrowleyMessageAck<P> | CrowleyErrorResponse;
