import { ref } from "vue";
import { computed } from "vue";
import { defineStore } from "pinia";

import { jsonStorage } from "@/utils";

import * as Mutations from "./mutations";

export default defineStore("user", () =>
{
    const clear = (): void => _setToken();

    const _token = ref(jsonStorage.read<string>("user:token"));
    const token = computed((): string | undefined => _token.value);

    const _setToken = (value?: string): void =>
    {
        _token.value = value;

        jsonStorage.write("user:token", _token.value);
    };

    const isLogged = computed((): boolean => !!(_token.value));

    async function logIn(username: string, password: string): Promise<void>
    {
        const request = new Mutations.Authenticate({ username, password });
        const response = await request.execute();

        _setToken(response.token);
    }
    async function logOut(): Promise<void>
    {
        const request = new Mutations.Disconnect(_token.value!);

        clear();

        await request.execute();
    }

    async function renewToken(): Promise<void>
    {
        const request = new Mutations.RenewSession(_token.value!);
        const response = await request.execute();

        _setToken(response.token);
    }

    return {
        clear,

        token,
        isLogged,

        logIn,
        logOut,
        renewToken
    };
});
