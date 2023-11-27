<script lang="ts" setup>
    import { onMounted } from "vue";
    import { useVuert } from "@byloth/vuert";

    import ContainerLayout from "@/layouts/ContainerLayout.vue";

    const $vuert = useVuert();

    onMounted(() => $vuert.emit({
        type: "success",
        title: "It works!",
        icon: "thumbs-up",
        message: "This application is running properly.",
        dismissible: true,
        actions: [{
            label: "OK",
            type: "primary"
        }]
    }));
</script>

<template>
    <ContainerLayout is="main">
        <h1>Home page</h1>
    </ContainerLayout>
</template>

<style lang="scss" scoped>
</style>
