export interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  client_id?: string;
  type: "access" | "refresh";
  scopes?: string[];
  iss?: string;
  aud?: string;
  iat?: number;
  exp?: number;
}
