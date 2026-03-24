export const ROLES = {
  admin: "admin",
  vendor: "vendor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_COOKIE = "role";

export const isRole = (value: string): value is Role =>
  value === ROLES.admin || value === ROLES.vendor;
