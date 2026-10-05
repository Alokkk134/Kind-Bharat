import type { z } from "zod";

/** Standard return shape for server actions used with useActionState. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const initialState: ActionState = {};

export function zodErrors(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { error: "Please fix the highlighted fields.", fieldErrors };
}
