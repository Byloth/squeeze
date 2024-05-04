import { Exception } from "@byloth/exceptions";

import { CrowleyResponseStatus } from "@/core/types";
import type { CrowleyErrorResponse } from "@/core/types";

export class AziraphaleException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "AziraphaleException")
    {
        super(message, cause, name);
    }
}

export class CrowleyException extends AziraphaleException
{
    public static ConnectionClosed(id: string): CrowleyException
    {
        return new CrowleyException(({
            id: id,
            status: CrowleyResponseStatus.ERROR,
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

    public constructor({ message, details }: CrowleyErrorResponse, cause?: unknown, name = "CrowleyException")
    {
        super(message, cause, name);

        this.id = details.errorId;
        this.code = details.errorCode;
    }
}
