import { components } from "./generated/schema";

type ApiErrorBody = components["schemas"]["ApiErrorBodyDto"];

type ApiErrorResponse = components["schemas"]["ApiErrorResponseDto"];

type ApiErrorCode = components["schemas"]["ExceptionCode"];

export class ApiError extends Error {
  readonly name = "ApiError";
  readonly code: ApiErrorCode;

  constructor(
    public readonly status: number,
    public readonly error: ApiErrorBody,
  ) {
    super(error.message);
    this.code = error.code;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: ApiErrorResponse; response: Response }>,
): Promise<T> {
  const { data, error, response } = await promise;
  if (error) throw new ApiError(response.status, error.error);
  return data as T;
}
