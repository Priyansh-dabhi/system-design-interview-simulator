import { AppError } from "../utils/errors.js";

export class AuthServiceError extends AppError {
    constructor(message: string, statusCode = 401, code = "AUTH_ERROR") {
        super(message, statusCode, code);
        this.name = "AuthServiceError";
    }
}
