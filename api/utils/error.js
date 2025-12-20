export const errorHandler = (statusCode, message) => {
  const error = new Error();
  error.statusCode = statusCode;  // ✅ fixed here
  error.message = message;
  return error;
};
