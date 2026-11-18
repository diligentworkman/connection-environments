import type { AttemptFailure, AttemptResult, AttemptSuccess } from "./types.js";

function attemptValue<T>(value: T): AttemptSuccess<T> {
  return { success: true, value, error: undefined };
}

function attemptError(error: unknown): AttemptFailure {
  return { success: false, value: undefined, error };
}

async function runAttempt<T>(
  operation: () => Promise<T>,
): Promise<AttemptResult<T>> {
  try {
    return attemptValue(await operation());
  } catch (error) {
    return attemptError(error);
  }
}

function runSynchronousAttempt<T>(
  operation: () => T &
    ([Extract<T, PromiseLike<unknown>>] extends [never] ? unknown : never),
): AttemptResult<T> {
  try {
    return attemptValue(operation());
  } catch (error) {
    return attemptError(error);
  }
}

export const attempt = Object.assign(runAttempt, {
  value: attemptValue,
  error: attemptError,
  sync: runSynchronousAttempt,
});

export function isErrorWithCode({
  error,
  code,
}: {
  error: unknown;
  code: string;
}) {
  return error instanceof Error && "code" in error && error.code === code;
}
