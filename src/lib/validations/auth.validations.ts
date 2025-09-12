import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(16, "Username must be at most 16 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(3, "Password must be at least 3 characters long")
    .max(128, "Password must be at most 128 characters long")
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validate login form data
 */
export function validateLoginData(formData: FormData): {
  success: boolean;
  data?: LoginInput;
  errors?: z.ZodIssue[];
} {
  const data = {
    username: formData.get("username")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  };

  const result = loginSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.issues,
  };
}
