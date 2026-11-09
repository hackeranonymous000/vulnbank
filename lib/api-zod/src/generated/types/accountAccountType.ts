
export type AccountAccountType =
  (typeof AccountAccountType)[keyof typeof AccountAccountType];

export const AccountAccountType = {
  checking: "checking",
  savings: "savings",
  investment: "investment",
} as const;
