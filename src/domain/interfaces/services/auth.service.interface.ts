import { JwtPayload } from "../security/jwt-payload.interface";

export interface IAuthService {
  verifyToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
  generateToken(payload: JwtPayload): string;
  generateRefreshToken(payload: Omit<JwtPayload, "type">): string;
}
