import { createRouter, createWebHistory } from "vue-router";

import config from "@/config";
import useUserStore from "@/stores/user";

const router = createRouter({
    history: createWebHistory(),
    routes: config.pages
});

router.beforeEach((to, from) =>
{
    if (to.meta.requiresAuth)
    {
        const $user = useUserStore();
        if (!$user.isLogged)
        {
            router.push({ name: "user-log_in", query: { next: to.path } });
        }
    }
});

export default router;
