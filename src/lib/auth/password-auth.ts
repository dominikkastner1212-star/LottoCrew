type AuthError = { message: string } | null;
type AuthResponse = Promise<{ error: AuthError }>;

type PasswordAuthClient = {
  auth: {
    signInWithPassword(credentials: { email: string; password: string }): AuthResponse;
    signUp(credentials: {
      email: string;
      password: string;
      options: {
        data: {
          display_name: string;
        };
      };
    }): AuthResponse;
  };
};

type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

export function signInWithEmailPassword(client: PasswordAuthClient, email: string, password: string) {
  return client.auth.signInWithPassword({ email, password });
}

export function registerWithEmailPassword(client: PasswordAuthClient, input: RegisterInput) {
  return client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.displayName.trim(),
      },
    },
  });
}
