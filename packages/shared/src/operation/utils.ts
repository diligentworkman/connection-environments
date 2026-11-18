import type { OperationParameters } from "./types.js";

export function defineOperation<Parameters extends OperationParameters, Output>(
  operation: (parameters: Parameters) => Output,
): (parameters: Parameters) => Output {
  return operation;
}
