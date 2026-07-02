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
          group_name: string;
          monthly_amount: number;
          invite_code: string;
        };
      };
    }): AuthResponse;
  };
};

type RegisterInput = {
  displayName: string;
  email: string;
  groupName: string;
  monthlyAmount: string;
  password: string;
  inviteCode?: string;
};

export function normalizeMonthlyAmount(value: string) {
  const normalizedAmount = Number(value.replace(",", "."));
  return Number.isFinite(normalizedAmount) ? normalizedAmount : 24;
}

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
        group_name: input.groupName.trim(),
        monthly_amount: normalizeMonthlyAmount(input.monthlyAmount),
        invite_code: (input.inviteCode ?? "").trim().toUpperCase(),
      },
    },
  });
}
