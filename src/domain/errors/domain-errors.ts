import { UserErrors } from "./users/users-erros";

export const DomainErrors = {
  PRODUCT_NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    message: "Product not found",
    statusCode: 404,
  },
  PRODUCT_INVALID_DATA: {
    code: "PRODUCT_INVALID_DATA",
    message: "Invalid product data",
    statusCode: 422,
  },
  PRODUCT_ID_MANDATORY: {
    code: "PRODUCT_ID_MANDATORY",
    message: "Product id is mandatory",
    statusCode: 400,
  },
  GENERIC_ID_REQUIRED: {
    code: "GENERIC_ID_REQUIRED",
    message: "Generic id is required",
    statusCode: 400,
  },

  GENERIC_INVALID_NAME: {
    code: "GENERIC_INVALID_NAME",
    message: "Name must have at least 3 characters",
    statusCode: 422,
  },
  POKEMON_NOT_FOUND: {
    code: "POKEMON_NOT_FOUND",
    message: "Pokemon not exist",
    statusCode: 404,
  },
  API_EXTERNAL_ERROR: {
    code: "EXTERNAL_SERVICE_ERROR",
    message: "Extenal API error",
    statusCode: 502,
  },
  ...UserErrors,
};
