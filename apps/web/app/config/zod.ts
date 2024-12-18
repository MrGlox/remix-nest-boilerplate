import { z } from "zod";

// Helper function to create a zod constraint from a zod schema and generate keys to i18n
export const customErrorMap: z.ZodErrorMap = (issue) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined" && issue.expected === "string") {
      return { ...issue, message: `errors.required` };
    }
  }

  if (issue.code === z.ZodIssueCode.invalid_string) {
    return { ...issue, message: `errors.bad_format` };
  }

  if (issue.code === (z.ZodIssueCode.too_small || z.ZodIssueCode.too_big)) {
    return {
      ...issue,
      message: `errors.${issue.code}.${issue.type}.${issue.exact ? "exact" : "inclusive"}`,
    };
  }

  return { ...issue, message: `errors.${issue.code}` };
};
