<script lang="ts" setup>
    import { v4 as uuid4 } from "uuid";
    import { ref } from "vue";

    import type { PromiseResolver, PromiseRejecter } from "@byloth/core";
    import { useVuert } from "@byloth/vuert";

    import type { CrowleyMessage } from "@/core/types";
    import { CrowleyException } from "@/exceptions";

    import ContainerLayout from "@/layouts/ContainerLayout.vue";

    const $vuert = useVuert();

    // onMounted(() => $vuert.emit({
    //     type: "success",
    //     title: "It works!",
    //     icon: "thumbs-up",
    //     message: "This application is running properly.",
    //     dismissible: true,
    //     actions: [{
    //         label: "OK",
    //         type: "primary"
    //     }]
    // }));

    class Aziraphale
    {
        protected _isConnected: boolean;
        protected _messages: Map<string, [PromiseResolver, PromiseRejecter]>;

        protected _socket?: WebSocket;

        public readonly endpoint: string;

        public get isConnected(): boolean
        {
            return this._isConnected;
        }

        public constructor(endpoint: string)
        {
            this._isConnected = false;
            this._messages = new Map();

            this.endpoint = endpoint;
        }

        protected _onOpen = (evt: Event) =>
        {
            console.log("Connection established:", evt);

            this._isConnected = true;
        };
        protected _onMessage = (evt: MessageEvent) =>
        {
            const content: CrowleyMessage = JSON.parse(evt.data);
            if ("id" in content)
            {
                if (!(this._messages.has(content.id))) { throw new Error("Unknown message ID."); }

                const [resolve, reject] = this._messages.get(content.id)!;

                if (content.status === "success")
                {
                    console.log(content);

                    resolve();
                }
                else if (content.status === "error")
                {
                    reject(new CrowleyException(content));
                }

                this._messages.delete(content.id);
            }
            else
            {
                console.log("Message received:", content);
            }
        };
        protected _onError = (evt: Event) =>
        {
            console.log("Connection error:", evt);
        };
        protected _onClose = (evt: CloseEvent) =>
        {
            console.log("Connection closed:", evt);

            for (const [_i, [_, reject]] of this._messages)
            {
                reject(new Error("Connection closed."));
            }

            this._isConnected = false;
            this._messages.clear();
        };

        protected _sendRaw(type: string, payload: Record<string, unknown>)
        {
            if (!(this.isConnected)) { throw new Error("Not connected."); }

            return new Promise((resolve, reject) =>
            {
                const id = uuid4().replaceAll("-", "");

                this._messages.set(id, [resolve, reject]);
                this._socket!.send(JSON.stringify({ id, type, payload }));
            });
        }

        public connect()
        {
            if (this.isConnected) { throw new Error("Already connected."); }

            return new Promise((resolve, reject) =>
            {
                this._socket = new WebSocket(this.endpoint);
                this._socket.addEventListener("open", (evt) =>
                {
                    this._onOpen(evt);

                    resolve(evt);
                });
                this._socket.addEventListener("message", this._onMessage);
                this._socket.addEventListener("error", this._onError);
                this._socket.addEventListener("close", (evt) =>
                {
                    this._onClose(evt);

                    reject(evt);
                });
            });
        }

        public async createRoom(roomType: string)
        {
            if (!(this.isConnected)) { throw new Error("Not connected."); }

            return await this._sendRaw("room:create", { roomType });
        }
        public async joinRoomById(roomId: string)
        {
            if (!(this.isConnected)) { throw new Error("Not connected."); }

            return await this._sendRaw("room:join:id", { roomId });
        }
        public async joinRoomByType(roomType: string)
        {
            if (!(this.isConnected)) { throw new Error("Not connected."); }

            return await this._sendRaw("room:join:type", { roomType });
        }

        public disconnect(code?: number | undefined, reason?: string | undefined)
        {
            if (!(this.isConnected)) { throw new Error("Not connected."); }

            this._socket!.close();
        }
    }

    const $aziraphale = new Aziraphale("ws://localhost:8000/squeeze/");

    const isConnected = ref(false);

    const roomId = ref("");
    const message = ref("");

    const connect = async () =>
    {
        await $aziraphale.connect();

        isConnected.value = $aziraphale.isConnected;
    };

    const createRoom = async (roomType: string) =>
    {
        await $aziraphale.createRoom(roomType);

        console.log("Room created successfully.");
    };
    const joinRoomById = async (roomId: string) =>
    {
        await $aziraphale.joinRoomById(roomId);

        console.log("Room joined successfully.");
    };
    const joinRoomByType = async (roomType: string) =>
    {
        await $aziraphale.joinRoomByType(roomType);

        console.log("Room joined successfully.");
    };

    const disconnect = () =>
    {
        $aziraphale.disconnect();

        isConnected.value = false;
    };
</script>

<template>
    <ContainerLayout is="main" id="home-page">
        <h1>Home page</h1>
        <div v-if="isConnected">
            <div class="col">
                <button class="btn btn-primary" @click="createRoom('room.message')">
                    Create new Room
                </button>
            </div>
            <div class="col">
                <button class="btn btn-info" @click="joinRoomByType('room.message')">
                    Join existing Room
                </button>
            </div>
            <hr />
            <div class="col">
                <input v-model="roomId"
                       class="form-control"
                       placeholder="Room ID" />
                <button class="btn btn-info" @click="joinRoomById(roomId)">
                    Join specific Room
                </button>
            </div>
            <hr />
            <div class="col">
                <input v-model="message"
                       class="form-control"
                       placeholder="Write something..." />
                <button class="btn btn-info" @click="joinRoomById(roomId)">
                    Send message
                </button>
            </div>
            <hr />
            <div class="col">
                <button class="btn btn-warning" @click="disconnect">
                    Disconnect
                </button>
            </div>
        </div>
        <div v-else class="row">
            <div class="col">
                <button class="btn btn-success" @click="connect">
                    Connect
                </button>
            </div>
        </div>
    </ContainerLayout>
</template>

<style lang="scss" scoped>
</style>
