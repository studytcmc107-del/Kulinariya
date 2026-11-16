import type { Recipe } from "./types.js";

export type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; recipes: Recipe[] };

export function assertNever(value: never): never {
  throw new Error(`Необработанное состояние: ${JSON.stringify(value)}`);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
