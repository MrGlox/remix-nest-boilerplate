import { z } from "zod";

// Helper function to create a zod constraint from a zod schema and generate keys to i18n
export const customErrorMap: z.ZodErrorMap = (issue) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined" && issue.expected === "string") {
      return { message: `errors.required` };
    }
  }

  if (issue.code === z.ZodIssueCode.invalid_string) {
    return { message: `errors.bad_format` };
  }

  return { message: `errors.${issue.code}` };
};
