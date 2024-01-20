import { Exception } from "@byloth/exceptions";

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
    public readonly id: string;
    public readonly code: string;

    public constructor({ message, payload }: CrowleyErrorResponse, cause?: unknown, name = "CrowleyException")
    {
        super(message, cause, name);

        this.id = payload.errorId;
        this.code = payload.errorCode;
    }
}
