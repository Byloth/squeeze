<script lang="ts" setup>
    import { ref } from "vue";
    import { useVuert } from "@byloth/vuert";

    import ContainerLayout from "@/layouts/ContainerLayout.vue";

    import Aziraphale from "@/aziraphale";

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

    class Room
    {
        public readonly id: string;
        public readonly type: string;

        public constructor(id: string, type: string)
        {
            this.id = id;
            this.type = type;
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
        const response = await $aziraphale.createRoom(roomType);

        console.log("Room created successfully:", response.payload.roomId);
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
