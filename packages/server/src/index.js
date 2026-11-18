import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { waitForClientBuild } from "./wait-for-client-build.js";
export async function startServer(options = {}) {
    const clientDirectory = fileURLToPath(new URL(".", import.meta.resolve(options.developmentReload
        ? "@connection-environments/client/development/index.html"
        : "@connection-environments/client/index.html")));
    if (options.developmentReload) {
        await waitForClientBuild(clientDirectory);
    }
    const app = createApp(clientDirectory, options.developmentReload ?? false);
    return serve({
        fetch: app.fetch,
        port: options.port ?? 3000,
    }, (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    });
}
