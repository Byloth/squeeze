import type { GraphQLError } from "graphql";

import GraphQLException from "./core";

export class AuthorizationException extends GraphQLException
{
    public readonly gotoLogin: boolean;

    public constructor(error: GraphQLError, message?: string, name = "AuthorizationException")
    {
        super(error, message, name);

        const { goto_login: gotoLogin } = error.extensions;
        this.gotoLogin = gotoLogin as boolean ?? false;
    }
}
export class AuthenticationException extends AuthorizationException
{
    public readonly forceLogout: boolean;

    public constructor(error: GraphQLError, message?: string, name = "AuthenticationException")
    {
        super(error, message, name);

        const { forceLogout } = error.extensions;
        this.forceLogout = forceLogout as boolean ?? false;
    }
}

export class TooManyRequestsException extends GraphQLException
{
    public readonly waitingTime: number;

    public constructor(error: GraphQLError, message?: string, name = "TooManyRequestsException")
    {
        super(error, message, name);

        const { waitingTime } = error.extensions;
        this.waitingTime = waitingTime as number ?? 0;
    }
}

export class ValidationException extends GraphQLException
{
    public readonly fields: Record<string, string>;

    public constructor(error: GraphQLError, message?: string, name = "ValidationException")
    {
        super(error, message, name);

        const { fields } = error.extensions;
        this.fields = fields as Record<string, string> ?? { };
    }
}

export { GraphQLException };
