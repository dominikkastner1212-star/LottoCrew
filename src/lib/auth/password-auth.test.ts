import { describe, expect, it, vi } from "vitest";
import { registerWithEmailPassword, signInWithEmailPassword } from "./password-auth";

describe("password auth helpers", () => {
  it("signs in existing users with email and password", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    const client = { auth: { signInWithPassword, signUp: vi.fn() } };

    await signInWithEmailPassword(client, "user@example.com", "secret123");

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    });
  });

  it("registers coworkers with password and personal metadata only", async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null });
    const client = { auth: { signInWithPassword: vi.fn(), signUp } };

    await registerWithEmailPassword(client, {
      displayName: " Dominik ",
      email: "admin@example.com",
      password: "secret123",
    });

    expect(signUp).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "secret123",
      options: {
        data: {
          display_name: "Dominik",
        },
      },
    });
  });
});
