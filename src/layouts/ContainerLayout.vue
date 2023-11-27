<script lang="ts" setup>
    import type { Component, PropType } from "vue";

    defineProps({
        is: {
            default: "div",
            type: [String, Object] as PropType<string | Component>
        }
    });
</script>

<template>
    <Component :is="is" class="container">
        <slot></slot>
    </Component>
</template>

<style lang="scss" scoped>
</style>
