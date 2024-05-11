<script lang="ts" setup>
    import { ref } from "vue";
    import { useVuert } from "@byloth/vuert";

    import ContainerLayout from "@/layouts/ContainerLayout.vue";

    import { Server } from "@/aziraphale";

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

    const server = new Server("ws://localhost:8000/squeeze/");

    const isConnected = ref(false);

    const roomId = ref("");
    const message = ref("");

    const connect = async () =>
    {
        await server.connect();

        isConnected.value = server.isConnected;
    };

    const createRoom = async (roomType: string) =>
    {
        const response = await server.createRoom(roomType);

        console.log("Room created successfully:", response);
    };
    const joinRoomById = async (_roomId: string) =>
    {
        const response = await server.joinRoomById(_roomId);

        console.log("Room joined successfully:", response);
    };
    const joinRoomByType = async (roomType: string) =>
    {
        const response = await server.joinRoomByType(roomType);

        console.log("Room joined successfully:", response);
    };

    const disconnect = () =>
    {
        server.disconnect();

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
