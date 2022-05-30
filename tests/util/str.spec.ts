import { Str } from '../../src/util/str';

describe('Str helper class', () => {
    it('should convert a human string to snake case', () => {
        expect(Str.humanToSnakeCase('snake case')).toBe('snake_case');
    });
    it('should convert a human string to title case', () => {
        expect(Str.toTitleCase('title case')).toBe('Title Case');
    });
    it('should capitalize first letter of a word', () => {
        expect(Str.capitalizeFirst('capitalized')).toBe('Capitalized');
    });
});
