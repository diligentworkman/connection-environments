#!/usr/bin/env node

import { Command } from "commander";
import { startServer } from "@connection-environments/server";

interface StartOptions {
  dev: boolean;
}

const program = new Command()
  .name("connection-environments")
  .description("Manage Connection Environments");

program
  .command("start")
  .description("Start the Hono server")
  .option("--dev", "Enable development browser reload", false)
  .action(async (options: StartOptions) => {
    const server = await startServer({ developmentReload: options.dev });

    const shutdown = () => {
      if ("closeAllConnections" in server) server.closeAllConnections();
      server.close((error) => {
        if (error) {
          console.error(error);
          process.exitCode = 1;
        }
      });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });

try {
  await program.parseAsync();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
