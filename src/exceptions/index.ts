import { Exception } from "@byloth/exceptions";

import { MessageStatus } from "@/aziraphale/types";
import type { MessageError } from "@/aziraphale/types";

export class AziraphaleException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "AziraphaleException")
    {
        super(message, cause, name);
    }
}

export class CrowleyException extends AziraphaleException
{
    public static ConnectionClosed(): CrowleyException
    {
        return new CrowleyException(({
            status: MessageStatus.Error,
            message: "Connection closed.",
            details: {
                errorId: "0x21000011",
                errorCode: "CONNECTION_CLOSED"
            },
            type: "aziraphale:error"
        }));
    }

    public readonly id: string;
    public readonly code: string;

    public constructor({ message, details }: MessageError, cause?: unknown, name = "CrowleyException")
    {
        super(message, cause, name);

        this.id = details.errorId;
        this.code = details.errorCode;
    }
}
