import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload, TokenPair } from "../types";

export function generateTokens(payload: AuthPayload): TokenPair {
  const accessOpts: SignOptions = { algorithm: "HS256", expiresIn: env.jwtExpiresIn as any };
  const refreshOpts: SignOptions = { algorithm: "HS256", expiresIn: env.jwtRefreshExpiresIn as any };

  const accessToken = jwt.sign({ ...payload }, env.jwtSecret, accessOpts);
  const refreshToken = jwt.sign({ ...payload }, env.jwtRefreshSecret, refreshOpts);

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: ["HS256"] }) as AuthPayload;
}
