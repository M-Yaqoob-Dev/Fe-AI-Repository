import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import {
  DEFAULT_SETTINGS,
  LANGUAGES,
  STORAGE_KEY,
  THEMES,
  TIMEZONES,
  type FieldErrors,
  type FieldName,
  type SettingsFormValues,
  type Theme,
} from "./settings";
import { hasErrors, validateField, validateSettings } from "./validation";

function loadSettings(): SettingsFormValues {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SettingsFormValues>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id} role="alert">
      {message}
    </p>
  );
}

export function SettingsForm() {
  const formId = useId();
  const [values, setValues] = useState<SettingsFormValues>(loadSettings);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  useEffect(() => {
    document.documentElement.dataset.theme = values.theme;
  }, [values.theme]);

  function setField<K extends FieldName>(name: K, value: SettingsFormValues[K]) {
    if (status === "saved") setStatus("idle");
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (submitted || touched[name]) {
        const message = validateField(name, next);
        setErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          if (message) nextErrors[name] = message;
          else delete nextErrors[name];
          if (name === "weeklyDigest") {
            const digestMessage = validateField("digestFrequency", next);
            if (digestMessage) nextErrors.digestFrequency = digestMessage;
            else delete nextErrors.digestFrequency;
          }
          return nextErrors;
        });
      }
      return next;
    });
  }

  function handleBlur(name: FieldName) {
    setTouched((current) => ({ ...current, [name]: true }));
    const message = validateField(name, values);
    setErrors((current) => {
      const next = { ...current };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSettings(values);
    setErrors(nextErrors);
    setSubmitted(true);
    setTouched({
      displayName: true,
      username: true,
      email: true,
      website: true,
      language: true,
      timezone: true,
      theme: true,
      digestFrequency: true,
    });

    if (hasErrors(nextErrors)) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById(`${formId}-${first}`)?.focus();
      return;
    }

    const sanitized: SettingsFormValues = {
      ...values,
      displayName: values.displayName.trim(),
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
      website: values.website.trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    setValues(sanitized);
    setStatus("saved");
  }

  function handleReset() {
    setValues({ ...DEFAULT_SETTINGS });
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setStatus("idle");
    localStorage.removeItem(STORAGE_KEY);
  }

  function describedBy(name: FieldName) {
    return errors[name] ? `${formId}-${name}-error` : undefined;
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit} noValidate>
      <header className="form-header">
        <p className="eyebrow">Account</p>
        <h1>Settings</h1>
        <p className="lede">
          Update how you appear, how the app looks, and which emails you receive.
          Changes are stored in this browser until you save them.
        </p>
      </header>

      {submitted && errorCount > 0 ? (
        <div className="banner banner-error" role="alert">
          Fix {errorCount} {errorCount === 1 ? "field" : "fields"} before saving.
        </div>
      ) : null}

      {status === "saved" ? (
        <div className="banner banner-success" role="status">
          Settings saved.
        </div>
      ) : null}

      <section className="panel" aria-labelledby={`${formId}-profile`}>
        <h2 id={`${formId}-profile`}>Profile</h2>

        <div className="field">
          <label htmlFor={`${formId}-displayName`}>Display name</label>
          <input
            id={`${formId}-displayName`}
            name="displayName"
            type="text"
            autoComplete="name"
            value={values.displayName}
            onChange={(event) => setField("displayName", event.target.value)}
            onBlur={() => handleBlur("displayName")}
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={describedBy("displayName")}
            maxLength={60}
          />
          <FieldError id={`${formId}-displayName-error`} message={errors.displayName} />
        </div>

        <div className="field-grid">
          <div className="field">
            <label htmlFor={`${formId}-username`}>Username</label>
            <input
              id={`${formId}-username`}
              name="username"
              type="text"
              autoComplete="username"
              spellCheck={false}
              value={values.username}
              onChange={(event) => setField("username", event.target.value)}
              onBlur={() => handleBlur("username")}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={describedBy("username")}
              maxLength={20}
            />
            <FieldError id={`${formId}-username-error`} message={errors.username} />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-email`}>Email</label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy("email")}
            />
            <FieldError id={`${formId}-email-error`} message={errors.email} />
          </div>
        </div>

        <div className="field">
          <label htmlFor={`${formId}-website`}>
            Website <span className="optional">optional</span>
          </label>
          <input
            id={`${formId}-website`}
            name="website"
            type="url"
            autoComplete="url"
            placeholder="https://example.com"
            value={values.website}
            onChange={(event) => setField("website", event.target.value)}
            onBlur={() => handleBlur("website")}
            aria-invalid={Boolean(errors.website)}
            aria-describedby={describedBy("website")}
          />
          <FieldError id={`${formId}-website-error`} message={errors.website} />
        </div>
      </section>

      <section className="panel" aria-labelledby={`${formId}-preferences`}>
        <h2 id={`${formId}-preferences`}>Preferences</h2>

        <div className="field-grid">
          <div className="field">
            <label htmlFor={`${formId}-language`}>Language</label>
            <select
              id={`${formId}-language`}
              name="language"
              value={values.language}
              onChange={(event) => setField("language", event.target.value as SettingsFormValues["language"])}
              onBlur={() => handleBlur("language")}
              aria-invalid={Boolean(errors.language)}
              aria-describedby={describedBy("language")}
            >
              <option value="">Select a language</option>
              {LANGUAGES.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
            <FieldError id={`${formId}-language-error`} message={errors.language} />
          </div>

          <div className="field">
            <label htmlFor={`${formId}-timezone`}>Timezone</label>
            <select
              id={`${formId}-timezone`}
              name="timezone"
              value={values.timezone}
              onChange={(event) => setField("timezone", event.target.value as SettingsFormValues["timezone"])}
              onBlur={() => handleBlur("timezone")}
              aria-invalid={Boolean(errors.timezone)}
              aria-describedby={describedBy("timezone")}
            >
              <option value="">Select a timezone</option>
              {TIMEZONES.map((timezone) => (
                <option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </option>
              ))}
            </select>
            <FieldError id={`${formId}-timezone-error`} message={errors.timezone} />
          </div>
        </div>

        <fieldset className="theme-fieldset">
          <legend>Theme</legend>
          <div className="theme-options" role="radiogroup" aria-describedby={describedBy("theme")}>
            {THEMES.map((theme) => (
              <label key={theme} className={values.theme === theme ? "chip selected" : "chip"}>
                <input
                  id={theme === THEMES[0] ? `${formId}-theme` : undefined}
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={values.theme === theme}
                  onChange={() => setField("theme", theme as Theme)}
                />
                {theme}
              </label>
            ))}
          </div>
          <FieldError id={`${formId}-theme-error`} message={errors.theme} />
        </fieldset>
      </section>

      <section className="panel" aria-labelledby={`${formId}-notifications`}>
        <h2 id={`${formId}-notifications`}>Notifications</h2>

        <label className="check-row">
          <input
            type="checkbox"
            name="productUpdates"
            checked={values.productUpdates}
            onChange={(event) => setField("productUpdates", event.target.checked)}
          />
          <span>
            <strong>Product updates</strong>
            <span className="hint">Occasional notes about new features.</span>
          </span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            name="weeklyDigest"
            checked={values.weeklyDigest}
            onChange={(event) => setField("weeklyDigest", event.target.checked)}
          />
          <span>
            <strong>Activity digest</strong>
            <span className="hint">A summary of account activity by email.</span>
          </span>
        </label>

        {values.weeklyDigest ? (
          <div className="field nested">
            <label htmlFor={`${formId}-digestFrequency`}>Digest frequency</label>
            <select
              id={`${formId}-digestFrequency`}
              name="digestFrequency"
              value={values.digestFrequency}
              onChange={(event) =>
                setField("digestFrequency", event.target.value as SettingsFormValues["digestFrequency"])
              }
              onBlur={() => handleBlur("digestFrequency")}
              aria-invalid={Boolean(errors.digestFrequency)}
              aria-describedby={describedBy("digestFrequency")}
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <FieldError id={`${formId}-digestFrequency-error`} message={errors.digestFrequency} />
          </div>
        ) : null}
      </section>

      <div className="actions">
        <button type="submit">Save settings</button>
        <button type="button" className="ghost" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
