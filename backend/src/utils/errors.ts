export class AppError extends Error {
    statusCode: number;
    code: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, code: string, statusCode = 500) {
        super(message, statusCode, code);
    }
}
