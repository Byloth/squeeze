<script lang="ts" setup>
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import { useVuert } from "@byloth/vuert";

    import ContainerLayout from "@/layouts/ContainerLayout.vue";

    import useSocket, { ChatRoom } from "@/stores/socket";

    const $router = useRouter();
    const $route = $router.currentRoute.value;

    const $socket = useSocket();
    const $vuert = useVuert();

    const room = $socket.getRoom<ChatRoom>($route.params.roomId as string);

    const chatMessages = ref("");
    const userNextMessage = ref("");

    const send = async () =>
    {
        if (!(userNextMessage.value)) { return; }

        await room.sendMessage(userNextMessage.value);

        userNextMessage.value = "";
    };

    const disconnect = async () =>
    {
        $socket.disconnect();
        $vuert.emit({
            type: "warning",
            title: "Disconnected!",
            icon: "unlink",
            message: "You are now disconnected from the server.",
            dismissible: true,
            timeout: 2500
        });

        return $router.push({ name: "home" });
    };

</script>

<template>
    <ContainerLayout is="main" id="chat-page">
        <h1>Chat room</h1>
        <div class="row">
            <div class="col">
                <textarea class="form-control"
                          rows="15"
                          readonly
                          :value="chatMessages"></textarea>
            </div>
            <hr />
            <div class="col">
                <textarea v-model="userNextMessage"
                          class="form-control"
                          rows="5"></textarea>
            </div>
            <hr />
            <div class="col">
                <button class="btn btn-info" @click="send">
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
    </ContainerLayout>
</template>

<style lang="scss" scoped>
</style>
