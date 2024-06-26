import * as z from "zod";

export const TrendValidation = z.object({
  trend: z.string().min(3, { message: "Trend must be at least 3 characters" }),

  accountId: z.string(),
});

export const CommentValidation = z.object({
  trend: z.string().min(3, { message: "Trend must be at least 3 characters" }),

  // accountId: z.string(),
});
