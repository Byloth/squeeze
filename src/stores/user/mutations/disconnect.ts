import { gql } from "graphql-tag";

import { GraphQLRequest } from "@/services";

export default class Disconnect extends GraphQLRequest<void, Record<string, never>>
{
    public static readonly Mutation = gql`mutation { disconnect }`;

    public jsonWebToken: string;

    public constructor(jsonWebToken: string)
    {
        super("user");

        this.jsonWebToken = jsonWebToken;
    }

    public execute(): Promise<void>
    {
        return this._mutation(Disconnect.Mutation, { }, { jsonWebToken: this.jsonWebToken });
    }
}
