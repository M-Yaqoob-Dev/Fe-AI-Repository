export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
] as const;

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Karachi", label: "Karachi" },
  { value: "Asia/Tokyo", label: "Tokyo" },
] as const;

export const THEMES = ["light", "dark", "system"] as const;
export const DIGEST_FREQUENCIES = ["daily", "weekly"] as const;

export type Language = (typeof LANGUAGES)[number]["value"];
export type Timezone = (typeof TIMEZONES)[number]["value"];
export type Theme = (typeof THEMES)[number];
export type DigestFrequency = (typeof DIGEST_FREQUENCIES)[number];

export type SettingsFormValues = {
  displayName: string;
  username: string;
  email: string;
  website: string;
  language: Language | "";
  timezone: Timezone | "";
  theme: Theme;
  productUpdates: boolean;
  weeklyDigest: boolean;
  digestFrequency: DigestFrequency | "";
};

export type FieldName = keyof SettingsFormValues;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const DEFAULT_SETTINGS: SettingsFormValues = {
  displayName: "",
  username: "",
  email: "",
  website: "",
  language: "en",
  timezone: "UTC",
  theme: "system",
  productUpdates: true,
  weeklyDigest: false,
  digestFrequency: "weekly",
};

export const STORAGE_KEY = "fe-ai-account-settings";
