export const UserErrors = {
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    statusCode: 404,
  },

  USER_INVALID_CREDENTIALS: {
    code: "USER_INVALID_CREDENTIALS",
    message: "Invalid email or password",
    statusCode: 401,
  },

  USER_EMAIL_ALREADY_EXISTS: {
    code: "USER_EMAIL_ALREADY_EXISTS",
    message: "User email already registered",
    statusCode: 409,
  },

  USER_WEAK_PASSWORD: {
    code: "USER_WEAK_PASSWORD",
    message: "Password must contain uppercase letter, number and 8 characters",
    statusCode: 422,
  },

  USER_INVALID_REFRESH_TOKEN: {
    code: "INVALID_REFRESH_TOKEN",
    message: "Refresh token invalid or expired",
    statusCode: 401,
  },

  INVALID_CLIENT_CREDENTIALS: {
    code: "INVALID_CLIENT_CREDENTIALS",
    message: "Invalid client credentials",
    statusCode: 401,
  },

  SERVICE_CLIENT_ALREADY_EXISTS: {
    code: "SERVICE_CLIENT_ALREADY_EXISTS",
    message: "Service client already exists",
    statusCode: 409,
  },

  SERVICE_CLIENT_NOT_FOUND: {
    code: "SERVICE_CLIENT_NOT_FOUND",
    message: "Service client not found",
    statusCode: 404,
  },
};
