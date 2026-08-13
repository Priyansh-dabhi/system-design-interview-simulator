import { z } from "zod";

// Interview routes previously had no validation. Keep this minimal and additive
// so existing clients that omit durationMinutes still pass.
export const startSessionSchema = z.object({
    problem: z.string().trim().min(1, "Problem is required"),
    durationMinutes: z
        .union([
            z.literal(15),
            z.literal(30),
            z.literal(45),
            z.literal(60),
        ])
        .optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
