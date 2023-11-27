<template>
    <ThemedElement :is="tag"
                   class="btn"
                   name="btn"
                   :class="classes"
                   v-bind="properties">
        <slot></slot>
    </ThemedElement>
</template>

<script lang="ts" setup>
    import { computed } from "vue";

    import ThemedElement from "@/components/core/ThemedElement.vue";

    const props = defineProps({
        href: {
            default: "",
            type: String
        },

        small: {
            default: false,
            type: Boolean
        },
        large: {
            default: false,
            type: Boolean
        }
    });

    const tag = computed((): string => props.href ? "a" : "button");
    const properties = computed((): Record<string, string> => props.href ? { "href": props.href } : { });

    const classes = computed((): Record<string, boolean> => ({
        "btn-sm": props.small,
        "btn-lg": props.large
    }));
</script>
