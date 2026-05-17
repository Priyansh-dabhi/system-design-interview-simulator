export const getErrorMessage = (error: unknown, fallback: string) => {
    if (
        error &&
        typeof error === "object" &&
        "errors" in error &&
        Array.isArray((error as { errors?: unknown[] }).errors) &&
        (error as { errors?: Array<{ message?: unknown }> }).errors?.length
    ) {
        const firstError = (error as { errors: Array<{ message?: unknown }> }).errors[0];
        if (typeof firstError.message === "string" && firstError.message.trim()) {
            return firstError.message;
        }
    }

    if (typeof error === "string" && error.trim()) {
        return error;
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }

    return fallback;
};
