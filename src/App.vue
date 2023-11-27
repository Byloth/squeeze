<script setup lang="ts">
    import AlertsHandler from "./components/handlers/AlertsHandler.vue";
</script>

<template>
    <RouterView v-slot="context">
        <Transition name="fade" mode="out-in">
            <Component :is="context.Component" :key="context.route.path" />
        </Transition>
    </RouterView>
    <AlertsHandler />
</template>

<style lang="scss">
    @import "@/assets/scss/index";

    #app
    {
        height: 100%;

        & > .fade-enter-from,
        & > .fade-leave-to
        {
            opacity: 0;
        }
        & > .fade-enter-active,
        & > .fade-leave-active
        {
            transition: opacity 250ms linear;
        }
        & > .fade-enter-to,
        & > .fade-leave-from
        {
            opacity: 1;
        }
    }
</style>
