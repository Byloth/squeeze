import type { App, ComponentPublicInstance, Plugin } from "vue";

import { HandledException, HandlerBuilder, NetworkException } from "@byloth/exceptions";
import type { DismissibleAlert } from "@byloth/vuert";

import * as GraphQLExceptions from "@/services/graphql/exceptions";
import useUserStore from "@/stores/user";

const ERROR_ALERT: DismissibleAlert = {
    type: "error",
    icon: "circle-xmark",
    title: "Oh, no! 😱",
    message: "A mysterious error of an unknown nature just interrupted" +
        " the Ancient Ritual of Executing the Holy JavaScript Code.\n" +
        "As you may have already guessed, whatever you were doing" +
        " may have stopped working as intended; please, reload the page.",

    dismissible: true
};

const errorsHandler: Plugin = {
    install(app: App, ...options: undefined[]): void
    {
        const { $vuert, $router } = app.config.globalProperties;

        const _gotoLogin = () =>
        {
            const route = $router.currentRoute.value;

            return $router.replace({
                name: "user-log_in",
                query: { next: route.path }
            });
        };
        const _logOut = () =>
        {
            const $user = useUserStore();

            $user.clear();
        };

        const _handler = new HandlerBuilder()
            .on(NetworkException, (exc) =>
            {
                $vuert.emit({
                    type: "error",
                    icon: "link-slash",
                    title: "Network error!",
                    message: `${exc.message} Please, try again later.`,
                    dismissible: true
                });

                return new HandledException(exc);
            })
            .on(GraphQLExceptions.AuthenticationException, (exc) =>
            {
                let messageAppendix: string;

                if (exc.forceLogout) { _logOut(); }
                if (exc.gotoLogin)
                {
                    _gotoLogin();

                    messageAppendix = "Please, log in again before continuing.";
                }
                else
                {
                    messageAppendix = "Please, try again.";
                }

                $vuert.emit({
                    type: "error",
                    icon: "user-slash",
                    title: "Authentication error!",
                    message: `${exc.message} ${messageAppendix}`,
                    dismissible: true
                });

                return new HandledException(exc);
            })
            .on(GraphQLExceptions.AuthorizationException, (exc) =>
            {
                if (exc.gotoLogin) { _gotoLogin(); }

                $vuert.emit({
                    type: "error",
                    icon: "user-lock",
                    title: "Authorization error!",
                    message: `${exc.message} Please, log in before continuing.`,
                    dismissible: true
                });

                return new HandledException(exc);
            })
            .on(GraphQLExceptions.TooManyRequestsException, (exc) =>
            {
                $vuert.emit({
                    type: "error",
                    icon: "shield-halved",
                    title: "Too many requests!",
                    message: `${exc.message} Please, try again later.`,
                    dismissible: true
                });

                return new HandledException(exc);
            })
            .default((exc) =>
            {
                // eslint-disable-next-line no-console
                console.error(exc);

                $vuert.emit(ERROR_ALERT);
            });

        app.config.errorHandler = (error: unknown, instance: ComponentPublicInstance | null, info: string) =>
        {
            const result = _handler.handle(error);
            if (result instanceof HandledException)
            {
                // eslint-disable-next-line no-console
                console.warn(result);
            }
        };

        window.addEventListener("unhandledrejection", (evt: PromiseRejectionEvent) =>
        {
            evt.preventDefault();

            const result = _handler.handle(evt.reason);
            if (result instanceof HandledException)
            {
                // eslint-disable-next-line no-console
                console.warn(result);
            }
        });
    }
};

export default errorsHandler;
