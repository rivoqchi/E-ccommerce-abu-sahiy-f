export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  /** Default retail; admin can switch to wholesale */
  priceTier: "retail" | "wholesale";
  isActive: boolean;
  approvalStatus?: "pending" | "approved" | "blocked";
  approvedByName?: string | null;
  approvedAt?: string | null;
  blockedByName?: string | null;
  blockedAt?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = AuthTokens & {
  user: AuthUser;
};

export type SendOtpResponse = {
  sent: boolean;
  phone: string;
  expiresIn: number;
  cooldown: number;
  mock?: boolean;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
};
