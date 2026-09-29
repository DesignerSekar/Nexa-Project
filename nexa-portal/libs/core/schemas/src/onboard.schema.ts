import { z } from 'zod';

/**
 * The legacy User ID field is not required: blank is submitted as the literal string `default`.
 * So there is nothing to validate, and the schema exists only to keep the form typed.
 */
export const OnboardStartSchema = z.object({
  userId: z.string(),
});

export type OnboardStartFormValues = z.infer<typeof OnboardStartSchema>;
