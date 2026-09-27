import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import {
  defaultSettings,
  settingsSchema,
  type SettingsFormValues,
} from "./settingsSchema";

export type SettingsFormProps = {
  defaultValues?: Partial<SettingsFormValues>;
  onSubmit?: (values: SettingsFormValues) => Promise<void> | void;
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function defaultSubmit(_values: SettingsFormValues) {
  await delay(400);
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p className="field-error" id={id} role="alert">
      {message}
    </p>
  );
}

export function SettingsForm({
  defaultValues,
  onSubmit = defaultSubmit,
}: SettingsFormProps) {
  const formId = useId();
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { ...defaultSettings, ...defaultValues },
    mode: "onSubmit",
  });

  const theme = watch("theme");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function submitSettings(values: SettingsFormValues) {
    setSubmitStatus("idle");

    try {
      await onSubmit(values);
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  }

  const usernameErrorId = `${formId}-username-error`;
  const emailErrorId = `${formId}-email-error`;
  const statusId = `${formId}-status`;

  return (
    <form
      className="settings-form"
      onSubmit={handleSubmit(submitSettings)}
      noValidate
      aria-busy={isSubmitting}
      aria-describedby={submitStatus === "idle" ? undefined : statusId}
    >
      <header className="form-header">
        <h1>Settings</h1>
        <p>
          Update your profile, notification preferences, and appearance.
        </p>
      </header>

      {submitStatus === "success" ? (
        <p className="banner banner-success" id={statusId} role="status">
          Settings saved.
        </p>
      ) : null}

      {submitStatus === "error" ? (
        <p className="banner banner-error" id={statusId} role="alert">
          Could not save settings. Try again.
        </p>
      ) : null}

      <section className="panel" aria-labelledby={`${formId}-profile`}>
        <h2 id={`${formId}-profile`}>Profile</h2>

        <div className="field">
          <label htmlFor={`${formId}-username`}>Username</label>
          <input
            id={`${formId}-username`}
            type="text"
            autoComplete="username"
            spellCheck={false}
            disabled={isSubmitting}
            {...register("username", {
              onChange: () => setSubmitStatus("idle"),
            })}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? usernameErrorId : undefined}
          />
          <FieldError id={usernameErrorId} message={errors.username?.message} />
        </div>

        <div className="field">
          <label htmlFor={`${formId}-email`}>Email</label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            {...register("email", {
              onChange: () => setSubmitStatus("idle"),
            })}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? emailErrorId : undefined}
          />
          <FieldError id={emailErrorId} message={errors.email?.message} />
        </div>
      </section>

      <section className="panel" aria-labelledby={`${formId}-appearance`}>
        <h2 id={`${formId}-appearance`}>Appearance</h2>
        <fieldset disabled={isSubmitting}>
          <legend>Theme</legend>
          <div className="theme-options">
            <label className="chip">
              <input type="radio" value="light" {...register("theme")} />
              Light
            </label>
            <label className="chip">
              <input type="radio" value="dark" {...register("theme")} />
              Dark
            </label>
          </div>
        </fieldset>
      </section>

      <section className="panel" aria-labelledby={`${formId}-notifications`}>
        <h2 id={`${formId}-notifications`}>Notifications</h2>

        <label className="check-row" htmlFor={`${formId}-emailNotifications`}>
          <input
            id={`${formId}-emailNotifications`}
            type="checkbox"
            disabled={isSubmitting}
            {...register("emailNotifications")}
          />
          <span>
            <strong>Email notifications</strong>
            <span className="hint">Account activity and security alerts.</span>
          </span>
        </label>

        <label className="check-row" htmlFor={`${formId}-productUpdates`}>
          <input
            id={`${formId}-productUpdates`}
            type="checkbox"
            disabled={isSubmitting}
            {...register("productUpdates")}
          />
          <span>
            <strong>Product updates</strong>
            <span className="hint">Occasional notes about new features.</span>
          </span>
        </label>
      </section>

      <div className="actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
