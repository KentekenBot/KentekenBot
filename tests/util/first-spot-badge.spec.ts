import { FirstSpotBadge } from '../../src/util/first-spot-badge';

describe('FirstSpotBadge.message', () => {
    it('title-cases the brand and model', () => {
        expect(FirstSpotBadge.message('VOLKSWAGEN', 'GOLF')).toBe(
            'Niemand in deze server had de **Volkswagen Golf** al gespot!'
        );
    });

    it('trims a trailing space when the model is empty', () => {
        expect(FirstSpotBadge.message('TESLA', '')).toBe('Niemand in deze server had de **Tesla** al gespot!');
    });
});
