import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// @user: Read only consumer metadata. Missing configuration enables nothing;
// malformed configuration fails clearly. Caller selects project directory.
export async function readEnabledExtensions(
  projectDirectory: string,
): Promise<string[]> {
  const manifestPath = resolve(projectDirectory, "package.json");
  //@agent: but json parse and readfile both can error, no?
  //@agent: ideas for libs we can use for consistent and ergonomic error-handling?
  const manifest: unknown = JSON.parse(await readFile(manifestPath, "utf8"));
  if (
    typeof manifest !== "object" ||
    manifest === null ||
    Array.isArray(manifest)
  ) {
    throw new Error(`Expected an object in ${manifestPath}.`);
  }
  const configuration = (manifest as Record<string, unknown>)[
    "connection-environments"
  ];
  if (configuration === undefined) {
    return [];
  }
  //@agent: we should probably extract the object check into a helper
  if (
    typeof configuration !== "object" ||
    configuration === null ||
    Array.isArray(configuration)
  ) {
    throw new Error('Expected "connection-environments" to be an object.');
  }
  const environment = (configuration as Record<string, unknown>).environment;
  if (environment === undefined) {
    return [];
  }
  if (
    typeof environment !== "object" ||
    environment === null ||
    Array.isArray(environment)
  ) {
    // @agent: and I don't like the fact that we've just been throwing errors willy-nilly
    throw new Error(
      'Expected "connection-environments.environment" to be an object.',
    );
  }
  // @agent: yeah we definitely also need a validator
  const extensions = (environment as Record<string, unknown>).extensions;
  if (extensions === undefined) return [];
  if (!Array.isArray(extensions)) {
    throw new Error(
      'Expected "connection-environments.environment.extensions" to be an array.',
    );
  }
  const enabled: string[] = [];
  for (const extension of extensions) {
    // Accept package names only, not paths, URLs, or package subpaths.
    // @agent: where from this regex?
    // @agent: and why do we need this check here?
    // @agent: the validator would really come in handy for things like this...
    if (
      typeof extension !== "string" ||
      !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(extension)
    ) {
      throw new Error("Each enabled extension must be an npm package name.");
    }
    if (enabled.includes(extension)) {
      throw new Error(`Extension "${extension}" is enabled more than once.`);
    }
    enabled.push(extension);
  }

  return enabled;
}
