import { randomUUID } from "node:crypto";
import { rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

export function reloadPlugin(): Plugin {
  let revision = "";
  let outputDirectory = "";

  return {
    name: "connection-environments-reload",
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    buildStart() {
      revision = randomUUID();
    },
    transformIndexHtml() {
      return [
        {
          tag: "script",
          injectTo: "body",
          children: `const events = new EventSource('/__dev/reload?revision=${revision}');
events.addEventListener('reload', () => {
  events.close();
  location.reload();
});`,
        },
      ];
    },
    writeBundle: {
      order: "post",
      sequential: true,
      async handler() {
        const markerPath = resolve(outputDirectory, ".reload-revision");
        const temporaryPath = `${markerPath}.${revision}.tmp`;

        try {
          await writeFile(temporaryPath, revision);
          await rename(temporaryPath, markerPath);
        } finally {
          await rm(temporaryPath, { force: true });
        }
      },
    },
  };
}
