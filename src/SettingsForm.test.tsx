import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsForm } from "./SettingsForm";

describe("SettingsForm", () => {
  it("renders the initial settings fields", () => {
    render(<SettingsForm />);

    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Dark" })).not.toBeChecked();
    expect(screen.getByLabelText(/Email notifications/i)).toBeChecked();
    expect(screen.getByLabelText(/Product updates/i)).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeEnabled();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SettingsForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Save settings" }));

    const username = screen.getByLabelText("Username");
    const email = screen.getByLabelText("Email");
    const usernameError = await screen.findByText("Username is required");
    const emailError = screen.getByText("Email is required");

    expect(username).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(username).toHaveAttribute("aria-describedby", usernameError.id);
    expect(email).toHaveAttribute("aria-describedby", emailError.id);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid settings and shows a success state", async () => {
    const user = userEvent.setup();
    let finishSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmit = resolve;
        }),
    );

    render(<SettingsForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), "ada_lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.click(screen.getByRole("radio", { name: "Dark" }));
    await user.click(screen.getByLabelText(/Product updates/i));

    await user.click(screen.getByRole("button", { name: "Save settings" }));

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    finishSubmit();

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Settings saved.");
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      username: "ada_lovelace",
      email: "ada@example.com",
      theme: "dark",
      emailNotifications: true,
      productUpdates: true,
    });
    expect(
      screen.getByRole("button", { name: "Save settings" }),
    ).toBeEnabled();
  });
});
