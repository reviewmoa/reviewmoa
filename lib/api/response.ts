import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function paginated<T>(
  data: T,
  meta: NonNullable<ApiSuccess<T>["meta"]>,
  init?: ResponseInit
) {
  return NextResponse.json<ApiSuccess<T>>({ data, meta }, init);
}

export function fail(code: string, message: string, status = 500) {
  return NextResponse.json<ApiError>(
    {
      error: {
        code,
        message
      }
    },
    { status }
  );
}

export function badRequest(message: string) {
  return fail("bad_request", message, 400);
}

export function notFound(message = "Resource not found") {
  return fail("not_found", message, 404);
}

export function unauthorized(message = "Authentication is required") {
  return fail("unauthorized", message, 401);
}

export function forbidden(message = "Admin permission is required") {
  return fail("forbidden", message, 403);
}

export function conflict(message: string) {
  return fail("conflict", message, 409);
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";

  return fail("internal_server_error", message, 500);
}
