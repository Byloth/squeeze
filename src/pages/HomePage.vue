<script lang="ts" setup>
    import { ref } from "vue";
    import { useRouter } from "vue-router";

    import { useVuert } from "@byloth/vuert";

    import ContainerLayout from "@/layouts/ContainerLayout.vue";
    import useSocket from "@/stores/socket";

    const $router = useRouter();
    const $socket = useSocket();
    const $vuert = useVuert();

    const username = ref<string>("");

    const joinTheChat = async () =>
    {
        await $socket.connect();

        const room = await $socket.joinRoomByType("room:chat", true);

        $vuert.emit({
            type: "success",
            title: "Connected established!",
            icon: "link",
            message: "You are now connected to the server.",
            dismissible: true,
            timeout: 2500
        });

        return $router.push({ name: "chat", params: { roomId: room.id } });
    };
    const joinTheGame = async () =>
    {
        await $socket.connect();

        const room = await $socket.joinRoomByType("room:game", true);

        $vuert.emit({
            type: "success",
            title: "Connected established!",
            icon: "link",
            message: "You are now connected to the server.",
            dismissible: true,
            timeout: 2500
        });

        return $router.push({ name: "game", params: { roomId: room.id } });
    };
</script>

<template>
    <ContainerLayout is="main" id="home-page">
        <h1>Home page</h1>
        <div class="row">
            <div class="col">
                <button class="btn btn-success" @click="joinTheChat">
                    Join the Chat
                </button>
            </div>
            <div class="col">
                <hr />
            </div>
            <div class="col">
                <form @submit.prevent="joinTheGame">
                    <label>
                        Username:
                        <input v-model="username"
                               class="form-control"
                               type="text"
                               required />
                    </label>
                    <hr />
                    <button class="btn btn-success" type="submit">
                        Join the Game
                    </button>
                </form>
            </div>
        </div>
    </ContainerLayout>
</template>

<style lang="scss" scoped>
</style>
