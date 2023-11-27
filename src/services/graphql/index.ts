import axios, { AxiosError, isAxiosError } from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { GraphQLError, print } from "graphql";
import type { DocumentNode } from "graphql";

import { NetworkException } from "@byloth/exceptions";

import config from "@/config";

import GraphQLException from "./exceptions/core";
import * as GraphQLExceptions from "./exceptions";

export interface GraphQLConfigs
{
    headers: Record<string, string>;
}
export interface GraphQLOptions
{
    jsonWebToken?: string;
}

export interface GraphQLResponse<T = unknown>
{
    data?: T;
    errors?: GraphQLError[];
}

export default abstract class GraphQLRequest<R = unknown, A = unknown>
{
    private readonly _endpoint: string;

    protected constructor(schema: string)
    {
        this._endpoint = `${config.backendUrl}/graphql/${schema}/`;
    }

    private _composeConfigs(options?: GraphQLOptions): GraphQLConfigs
    {
        const configs: GraphQLConfigs = { headers: { } };

        if (options?.jsonWebToken)
        {
            configs.headers["Authorization"] = `Bearer ${options.jsonWebToken}`;
        }

        return configs;
    }

    private _handleResponse<R = unknown>({ data }: AxiosResponse<GraphQLResponse<R>>): R
    {
        if ((data.errors) || (!data.data))
        {
            throw data;
        }

        return data.data;
    }
    private _handleError(error: unknown): unknown
    {
        if (isAxiosError(error))
        {
            const axiosError = error as AxiosError<GraphQLResponse>;
            if (!axiosError.response)
            {
                return new NetworkException("Unable to establish a connection to the server.", axiosError);
            }

            error = axiosError.response.data;
        }

        const response = error as GraphQLResponse;
        if (response.errors)
        {
            if (response.errors.length > 1)
            {
                // SMELLS: Probabilmente non è un caso pratico da dover gestire.
            }

            const graphQlError = response.errors[0];
            if (graphQlError.extensions)
            {
                const { error_type: errorType } = graphQlError.extensions;

                if (errorType === "AUTHENTICATION_ERROR")
                {
                    return new GraphQLExceptions.AuthenticationException(graphQlError);
                }
                if (errorType === "AUTHORIZATION_ERROR")
                {
                    return new GraphQLExceptions.AuthorizationException(graphQlError);
                }
                if (errorType === "TOO_MANY_REQUESTS_ERROR")
                {
                    return new GraphQLExceptions.TooManyRequestsException(graphQlError);
                }
                if (errorType === "VALIDATION_ERROR")
                {
                    return new GraphQLExceptions.ValidationException(graphQlError);
                }
            }

            return new GraphQLException(graphQlError);
        }

        return error;
    }

    private async _execute<R = unknown, D = unknown>(data: D, configs: AxiosRequestConfig<D>): Promise<R>
    {
        try
        {
            const response = await axios.post<GraphQLResponse<R>>(this._endpoint, data, configs);

            return this._handleResponse(response);
        }
        catch (error)
        {
            throw this._handleError(error);
        }
    }

    protected async _query(query: DocumentNode, options?: GraphQLOptions): Promise<R>
    {
        const data = { query: print(query) };
        const configs = this._composeConfigs(options);

        return this._execute(data, configs);
    }
    protected async _mutation(query: DocumentNode, variables: A, options?: GraphQLOptions) : Promise<R>
    {
        const data = { query: print(query), variables: variables };
        const configs = this._composeConfigs(options);

        return this._execute(data, configs);
    }
}
