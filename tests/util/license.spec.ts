import { License } from '../../src/util/license';

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

    //
    // it('should return true for valid licenses', () => {
    //     validVariations.forEach((license) => {
    //         expect(License.isValid(license)).toBeTruthy();
    //     });
    // });
    //
    // it('should return true for valid licences without hyphens', () => {
    //     validVariations.forEach((license) => {
    //         License.isValid(license.replace(/-/g, ''));
    //     });
    // });
    //
    // it('should return true for lower cased valid licenses', () => {
    //     validVariations.forEach((license) => {
    //         License.isValid(license.toLowerCase());
    //     });
    // });
    //
    // it('should return true for lower cased valid licenses without hyphens', () => {
    //     validVariations.forEach((license) => {
    //         License.isValid(license.replace(/-/g, ''));
    //     });
    // });
});
