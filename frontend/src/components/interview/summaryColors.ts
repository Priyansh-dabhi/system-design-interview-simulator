// Shared score→colour mapping for the rich summary components.
// Hex values match the palette already used in SummarySection.
export const SUCCESS = '#10B981';
export const AMBER = '#F59E0B';
export const DANGER = '#EF4444';
export const INFO = '#3B82F6';

// Map a 0-100 overall score to a colour + human label.
export function overallBand(score: number): { color: string; label: string } {
    if (score >= 75) return { color: SUCCESS, label: 'Strong performance' };
    if (score >= 50) return { color: AMBER, label: 'Solid attempt' };
    return { color: DANGER, label: 'Needs improvement' };
}

// Map a 0-10 dimension score to a colour.
export function dimensionColor(score: number): string {
    if (score >= 7.5) return SUCCESS;
    if (score >= 5) return AMBER;
    return DANGER;
}
