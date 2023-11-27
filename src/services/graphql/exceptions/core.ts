import type { GraphQLError } from "graphql";
import { Exception } from "@byloth/exceptions";

const PUNCTUATION_REGEX = /[.!?()]$/;

export default class GraphQLException extends Exception
{
    public static PrintError({ message }: GraphQLError): string
    {
        if (!PUNCTUATION_REGEX.test(message))
        {
            message += ".";
        }

        return message;
    }

    public readonly id: string;
    public readonly code: string;
    public readonly type: string;

    public constructor(error: GraphQLError, message?: string, name = "GraphQLException")
    {
        if (message === undefined)
        {
            message = GraphQLException.PrintError(error);
        }

        super(message, undefined, name);

        const { error_id: errorId, error_code: errorCode, error_type: errorType } = error.extensions ?? { };
        this.id = errorId as string ?? "0x00000000";
        this.code = errorCode as string ?? "UNKNOWN_SERVER_ERROR";
        this.type = errorType as string ?? "ERROR";
    }
}
