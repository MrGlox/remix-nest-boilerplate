import { z } from "zod";

// Helper function to create a zod constraint from a zod schema and generate keys to i18n
export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined" && issue.expected === "string") {
      return { message: `errors.required` };
    }
  }

  return { message: `errors.${issue.code}` };
};
