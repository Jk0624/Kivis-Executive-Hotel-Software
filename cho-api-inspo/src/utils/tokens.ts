import jwt from "jsonwebtoken";
import type { AdminRole } from "../generated/prisma/enums.js";

export type TokenType = "user" | "vendor" | "rider" | "admin";

export const generateAccessToken = (id: any, type: TokenType) => {
  // User tokens are short-lived; refresh is in place to keep sessions alive.
  // Vendor/rider middleware does a DB check on every request so 1d is fine there.
  const expiresIn = type === "user" ? "15m" : "1d";
  return jwt.sign({ id: id.toString(), type }, process.env.JWT_SECRET!, {
    expiresIn,
  });
};

export const generateRefreshToken = (id: any, type: TokenType) => {
  return jwt.sign(
    { id: id.toString(), type },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "60d",
    },
  );
};

/**
 * Admin access tokens carry richer claims so the auth middleware can build
 * `req.admin` without hitting the DB. Freshness is enforced at refresh time
 * (every 15 min) — login/refresh handlers re-check `isActive` and pull the
 * current role from the Admin row before minting a new access token.
 */
export interface AdminAccessClaims {
  id: string;
  type: "admin";
  role: AdminRole;
  firstName: string;
  lastName: string;
  email: string;
}

export const generateAdminAccessToken = (admin: {
  id: bigint | string | number;
  role: AdminRole;
  firstName: string;
  lastName: string;
  email: string;
}) => {
  const payload: AdminAccessClaims = {
    id: admin.id.toString(),
    type: "admin",
    role: admin.role,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};
