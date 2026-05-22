import { ZodError } from "zod";
import { badRequest } from "./response";

export function validationErrorResponse(error: ZodError) {
  const message = error.issues
    .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
    .join("; ");

  return badRequest(message);
}
