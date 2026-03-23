import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload, TokenPair } from "../types";

export function generateTokens(payload: AuthPayload): TokenPair {
  const accessToken = jwt.sign(
    { ...payload },
    env.jwtSecret,
    { algorithm: "HS256", expiresIn: 900 } // 15 minutes
  );

  const refreshToken = jwt.sign(
    { ...payload },
    env.jwtRefreshSecret,
    { algorithm: "HS256", expiresIn: 604800 } // 7 days
  );

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: ["HS256"] }) as AuthPayload;
}
