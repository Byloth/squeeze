<script lang="ts" setup>
    import { onMounted, ref } from "vue";
    import { useRouter } from "vue-router";
    import { useEventListener, useThrottleFn } from "@vueuse/core";

    import { Pointer } from "@/models";
    import useSocket, { GameRoom } from "@/stores/socket";

    const $router = useRouter();
    const $route = $router.currentRoute.value;

    const $socket = useSocket();

    const pointers = new Map<string, Pointer>();
    const room = $socket.getRoom<GameRoom>($route.params.roomId as string);

    const color = ref("#000000");

    const initialize = (): void =>
    {
        room.onMessage<PointerClickPayload>("click", ({ sessionId, x, y }) =>
        {
            if (sessionId === room.sessionId) { return; }

            const pointer = pointers.get(sessionId)!;

            pointer.click({ x, y });
        });

        room.state.pointers.onAdd((pointer, sessionId) =>
        {
            if (sessionId === room.sessionId)
            {
                color.value = pointer.color;
            }
            else
            {
                pointers.set(sessionId, new Pointer(pointer));
            }
        });
        room.state.pointers.onRemove((pointer, sessionId) =>
        {
            const _pointer = pointers.get(sessionId)!;

            _pointer.destroy();
            pointers.delete(sessionId);
        });

        room.onError((code, message) =>
        {
            console.error("Room error:", code, message);

            gotoHome();
        });
        room.onLeave((code) =>
        {
            console.warn("Room left:", code);

            gotoHome();
        });
    };

    let lastTime = 0;
    const updateLoop = (time: number) =>
    {
        const delta = time - lastTime;

        pointers.forEach((pointer) => pointer.update(delta));

        requestAnimationFrame(updateLoop);

        lastTime = time;
    };

    const updateSettings = () =>
    {
        console.log("Changing color...");

        room.send("settings", { color: color.value });
    };

    initialize();
    onMounted(() =>
    {
        const clickMouse = (evt: MouseEvent) => room.send("click", { x: evt.clientX, y: evt.clientY });

        const _updateMousePosition = (evt: MouseEvent) => room.send("move", { x: evt.clientX, y: evt.clientY });
        const updateMousePosition = useThrottleFn(_updateMousePosition, Pointer.UpdateTime / 2, true);

        useEventListener(window, "click", clickMouse);
        useEventListener(window, "mousemove", updateMousePosition);
        requestAnimationFrame(updateLoop);
    });
</script>

<template>
    <div id="room-page">
        <label>
            Color:
            <input v-model="color"
                   class="form-control form-control-color"
                   type="color"
                   @change="updateSettings" />
        </label>
    </div>
</template>

<style lang="scss" scoped>
    @keyframes blink
    {
        0% { opacity: 1; }
        50% { opacity: 1; }
        75% { opacity: 0; }
    }

    #room-page
    {
        padding: 1rem 1.5rem;
    }
</style>
