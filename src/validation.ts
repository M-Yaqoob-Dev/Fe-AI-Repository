import {
  DIGEST_FREQUENCIES,
  LANGUAGES,
  THEMES,
  TIMEZONES,
  type FieldErrors,
  type FieldName,
  type SettingsFormValues,
} from "./settings";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}'’.\- ]{0,59}$/u;
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function isLanguage(value: string): boolean {
  return LANGUAGES.some((item) => item.value === value);
}

function isTimezone(value: string): boolean {
  return TIMEZONES.some((item) => item.value === value);
}

export function validateField(
  name: FieldName,
  values: SettingsFormValues,
): string | undefined {
  const trimmed = (value: string) => value.trim();

  switch (name) {
    case "displayName": {
      const displayName = trimmed(values.displayName);
      if (!displayName) return "Enter your display name.";
      if (displayName.length < 2) return "Display name must be at least 2 characters.";
      if (!NAME_PATTERN.test(displayName)) {
        return "Use letters, spaces, hyphens, or apostrophes only.";
      }
      return undefined;
    }
    case "username": {
      const username = trimmed(values.username);
      if (!username) return "Choose a username.";
      if (!USERNAME_PATTERN.test(username)) {
        return "3–20 characters, start with a letter, then letters, numbers, or underscores.";
      }
      return undefined;
    }
    case "email": {
      const email = trimmed(values.email);
      if (!email) return "Enter an email address.";
      if (!EMAIL_PATTERN.test(email)) return "Enter a valid email, such as name@example.com.";
      return undefined;
    }
    case "website": {
      const website = trimmed(values.website);
      if (!website) return undefined;
      if (!URL_PATTERN.test(website)) {
        return "Enter a full URL starting with http:// or https://.";
      }
      return undefined;
    }
    case "language":
      if (!values.language || !isLanguage(values.language)) {
        return "Select a language.";
      }
      return undefined;
    case "timezone":
      if (!values.timezone || !isTimezone(values.timezone)) {
        return "Select a timezone.";
      }
      return undefined;
    case "theme":
      if (!THEMES.includes(values.theme)) return "Select a theme.";
      return undefined;
    case "weeklyDigest":
      return undefined;
    case "productUpdates":
      return undefined;
    case "digestFrequency":
      if (!values.weeklyDigest) return undefined;
      if (!DIGEST_FREQUENCIES.includes(values.digestFrequency as (typeof DIGEST_FREQUENCIES)[number])) {
        return "Choose how often to receive the digest.";
      }
      return undefined;
    default:
      return undefined;
  }
}

export function validateSettings(values: SettingsFormValues): FieldErrors {
  const fields: FieldName[] = [
    "displayName",
    "username",
    "email",
    "website",
    "language",
    "timezone",
    "theme",
    "digestFrequency",
  ];

  return fields.reduce<FieldErrors>((errors, field) => {
    const message = validateField(field, values);
    if (message) errors[field] = message;
    return errors;
  }, {});
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
