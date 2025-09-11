
import codes from "../utils/statusCodes.js";

export default class ApiErrorResponse extends Error {
  constructor(
    message = "Some error occured kindly report if this error persists.",
    code = codes.badRequest,
    payload = {},
    err = {}
  ) {
    super(err.message || message);
    this.code = code;
    this.payload = payload;
    this.success = false;
    this.stack = err.stack || Error.captureStackTrace(this, this.letructor);
  }
  res(dev = true) {
    return {
      message: this.message,
      code: this.code,
      success: this.success,
      payload: this.payload,
      stack: dev ? this.stack : null,
    };
  }
}
