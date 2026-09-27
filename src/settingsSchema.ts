import { z } from "zod";

export const settingsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only include letters, numbers, and underscores",
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  theme: z.enum(["light", "dark"]),
  emailNotifications: z.boolean(),
  productUpdates: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export const defaultSettings: SettingsFormValues = {
  username: "",
  email: "",
  theme: "light",
  emailNotifications: true,
  productUpdates: false,
};
