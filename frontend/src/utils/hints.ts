/**
 * Returns the maximum number of hints allowed for a given interview duration.
 *
 * Limits:
 *  - 15 min → 2 hints
 *  - 30 min → 2 hints
 *  - 45 min → 5 hints
 *  - 60 min → 5 hints
 */
export const getMaxHints = (durationMinutes: number | null): number => {
    if (!durationMinutes) return 2; // safe fallback for untimed sessions
    if (durationMinutes <= 30) return 2;
    return 5; // 45 and 60 min
};
