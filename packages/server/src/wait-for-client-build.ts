import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout } from "node:timers/promises";

export async function waitForClientBuild(clientDirectory: string) {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      const [html, revision] = await Promise.all([
        readFile(resolve(clientDirectory, "index.html"), "utf8"),
        readFile(resolve(clientDirectory, ".reload-revision"), "utf8"),
      ]);
      if (
        revision &&
        html.includes(`new EventSource('/__dev/reload?revision=${revision}')`)
      ) {
        return;
      }
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      )) {
        throw error;
      }
    }

    await setTimeout(100);
  }

  throw new Error(
    "Timed out waiting for client development build. Run pnpm dev from workspace root to start all watchers.",
  );
}
