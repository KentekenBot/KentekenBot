import { SpotSuggestion } from '../../src/util/spot-suggestion';

describe('SpotSuggestion.normalizeQuery', () => {
    it('uppercases and strips dashes and spaces', () => {
        expect(SpotSuggestion.normalizeQuery('ab-123-c')).toBe('AB123C');
        expect(SpotSuggestion.normalizeQuery(' xy 999 z ')).toBe('XY999Z');
    });

    it('returns an empty string for an empty query', () => {
        expect(SpotSuggestion.normalizeQuery('')).toBe('');
    });
});

describe('SpotSuggestion.label', () => {
    it('shows the formatted plate with brand and model', () => {
        expect(SpotSuggestion.label('AB123C', 'VOLKSWAGEN', 'GOLF')).toBe('AB-123-C (Volkswagen Golf)');
    });

    it('falls back to the formatted plate when there is no vehicle data', () => {
        expect(SpotSuggestion.label('AB123C', null, null)).toBe('AB-123-C');
    });

    it('caps the label at 100 characters', () => {
        const label = SpotSuggestion.label('AB123C', 'VOLKSWAGEN', 'X'.repeat(200));
        expect(label.length).toBeLessThanOrEqual(100);
    });
});
