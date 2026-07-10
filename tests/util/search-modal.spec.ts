import { SearchModal } from '../../src/util/search-modal';

describe('SearchModal.buttonId', () => {
    it('encodes the filters into the custom id', () => {
        expect(SearchModal.buttonId({ brand: 'Audi', color: 'zwart', fuel: 'diesel' })).toBe(
            'search:refine:Audi:zwart:diesel'
        );
    });

    it('leaves missing filters empty', () => {
        expect(SearchModal.buttonId({ brand: 'Audi' })).toBe('search:refine:Audi::');
        expect(SearchModal.buttonId({})).toBe('search:refine:::');
    });

    it('escapes separators and spaces in values', () => {
        const id = SearchModal.buttonId({ brand: 'alfa romeo', color: 'rood:metallic' });

        expect(id).toBe('search:refine:alfa%20romeo:rood%3Ametallic:');
        expect(SearchModal.parseButtonId(id)).toEqual({
            brand: 'alfa romeo',
            color: 'rood:metallic',
            fuel: undefined,
        });
    });

    it('falls back to the bare prefix when the id would exceed 100 characters', () => {
        const id = SearchModal.buttonId({ brand: 'X'.repeat(50), color: 'Y'.repeat(50) });

        expect(id).toBe('search:refine');
    });
});

describe('SearchModal.parseButtonId', () => {
    it('round-trips filters through the custom id', () => {
        const filters = { brand: 'Audi', color: 'zwart', fuel: 'diesel' };

        expect(SearchModal.parseButtonId(SearchModal.buttonId(filters))).toEqual(filters);
    });

    it('returns empty filters for the bare prefix', () => {
        expect(SearchModal.parseButtonId('search:refine')).toEqual({
            brand: undefined,
            color: undefined,
            fuel: undefined,
        });
    });
});

describe('SearchModal.build', () => {
    it('builds a modal with the three filter inputs', () => {
        const modal = SearchModal.build({ brand: 'Audi' }).toJSON();

        expect(modal.custom_id).toBe('search:modal');
        expect(modal.components).toHaveLength(3);

        const inputs = modal.components.map((row) => row.components[0]);
        expect(inputs.map((input) => input.custom_id)).toEqual(['merk', 'kleur', 'brandstof']);
        expect(inputs[0].value).toBe('Audi');
        expect(inputs[1].value).toBeUndefined();
        expect(inputs.every((input) => input.required === false)).toBe(true);
    });
});
