import { FirstSpotBadge } from '../../src/util/first-spot-badge';

describe('FirstSpotBadge.message', () => {
    it('title-cases the brand and model', () => {
        expect(FirstSpotBadge.message('VOLKSWAGEN', 'GOLF')).toBe(
            'Je bent de eerste in de server die een **Volkswagen Golf** heeft gespot!'
        );
    });

    it('trims a trailing space when the model is empty', () => {
        expect(FirstSpotBadge.message('TESLA', '')).toBe(
            'Je bent de eerste in de server die een **Tesla** heeft gespot!'
        );
    });
});
