import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

export function createApp(clientDirectory: string, developmentReload = false) {
  const app = new Hono();
  const clientRoot = resolve(clientDirectory);

  app.all("/api", (c) => c.notFound());
  app.all("/api/*", (c) => c.notFound());

  if (developmentReload) {
    app.get("/__dev/reload", (c) => {
      const revision = c.req.query("revision");
      if (!revision) {
        return c.text("Missing build revision", 400);
      }
      c.header("Cache-Control", "no-store");
      c.header("X-Accel-Buffering", "no");

      return streamSSE(c, async (stream) => {
        while (!stream.aborted) {
          let currentRevision: string | undefined;
          try {
            currentRevision = await readFile(
              resolve(clientRoot, ".reload-revision"),
              "utf8",
            );
          } catch (error) {
            if (!(
              error instanceof Error &&
              "code" in error &&
              error.code === "ENOENT"
            )) {
              throw error;
            }
          }
          if (currentRevision && currentRevision !== revision) {
            await stream.writeSSE({ event: "reload", data: currentRevision });
            return;
          }
          await stream.write(": heartbeat\n\n");
          await stream.sleep(1000);
        }
      });
    });
  }

  app.get(
    "*",
    serveStatic({
      root: clientRoot,
      onFound: (_path, c) => {
        if (developmentReload) c.header("Cache-Control", "no-store");
      },
    }),
  );

  return app;
}
