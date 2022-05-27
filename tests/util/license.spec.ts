import { License } from '../../src/util/license';

describe('License util class format method', () => {
    it('should format and uppercase a valid license', function () {
        expect(License.format('x999xx')).toBe('X-999-XX');
        expect(License.format('xx999x')).toBe('XX-999-X');
    });
});

describe('License util class isValid method', () => {
    const validVariations = [
        'XX-99-99',
        '99-99-XX',
        '99-XX-99',
        'XX-99-XX',
        'XX-XX-99',
        '99-XX-XX',
        '99-XXX-9',
        '9-XXX-99',
        'XX-999-X',
        'X-999-XX',
        'XXX-99-X',
        'X-99-XXX',
        '9-XX-999',
        '999-XX-9',
    ];

    validVariations.forEach((license) => {
        it(`should return true for licences in format ${license}`, function () {
            expect(License.isValid(license)).toBeTruthy();
        });
    });

    validVariations.forEach((license) => {
        const check = license.toLowerCase();
        it(`should return true for licences in format ${check} (in lower case)`, function () {
            expect(License.isValid(check)).toBeTruthy();
        });
    });

    validVariations.forEach((license) => {
        const check = license.replace(/-/g, '');
        it(`should return true for licences in format ${check} (no hyphens)`, function () {
            expect(License.isValid(check)).toBeTruthy();
        });
    });

    validVariations.forEach((license) => {
        const check = license.toLowerCase().replace(/-/g, '');
        it(`should return true for licences in format ${check} (lowe case and no hyphens)`, function () {
            expect(License.isValid(check)).toBeTruthy();
        });
    });

    it(`should return false for invalid licenses`, function () {
        expect(License.isValid('X-999-XXX')).toBeFalsy();
    });
});
