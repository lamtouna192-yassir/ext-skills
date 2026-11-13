import { inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";
import posthog from "posthog-js";

const projectToken = import.meta.env.VITE_POSTHOG_KEY;
const apiHost = import.meta.env.VITE_POSTHOG_HOST;

if (inBrowser) {
  if (!projectToken || !apiHost) {
    if (import.meta.env.DEV) {
      const variableName = !projectToken
        ? "VITE_POSTHOG_KEY"
        : "VITE_POSTHOG_HOST";

      throw new Error(
        `${variableName} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variableName} is configured`,
      );
    }
  } else {
    posthog.init(projectToken, {
      api_host: apiHost,
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false,
      },
      logs: {
        serviceName: "ext-skills-documentation",
        environment: import.meta.env.MODE,
      },
    });
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (!inBrowser || !projectToken || !apiHost) {
      return;
    }

    posthog.logger.info("documentation site loaded", {
      page_path: window.location.pathname,
    });

    router.onAfterRouteChanged = (routePath) => {
      posthog.logger.info("documentation route changed", {
        route_path: routePath,
      });
    };
  },
};
