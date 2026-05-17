export class AuthServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 401) {
        super(message);
        this.name = "AuthServiceError";
        this.statusCode = statusCode;
    }
}
