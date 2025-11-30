export class License {
    public static isValid(license: string): boolean {
        return this.getLicenseRegex().test(license);
    }

    public static isNorwegian(license: string) {
        return new RegExp(/[A-Z]{2} ?\d{5}/, 'i').test(license);
    }

    public static getLicenseRegex(): RegExp {
        const variations = [
            '([A-Z]{2})-?([0-9]{2})-?([0-9]{2})',
            '([0-9]{2})-?([0-9]{2})-?([A-Z]{2})',
            '([0-9]{2})-?([A-Z]{2})-?([0-9]{2})',
            '([A-Z]{2})-?([0-9]{2})-?([A-Z]{2})',
            '([A-Z]{2})-?([A-Z]{2})-?([0-9]{2})',
            '([0-9]{2})-?([A-Z]{2})-?([A-Z]{2})',
            '([0-9]{2})-?([A-Z]{3})-?([0-9])',
            '([0-9])-?([A-Z]{3})-?([0-9]{2})',
            '([A-Z]{2})-?([0-9]{3})-?([A-Z])',
            '([A-Z])-?([0-9]{3})-?([A-Z]{2})',
            '([A-Z]{3})-?([0-9]{2})-?([A-Z])',
            '([A-Z])-?([0-9]{2})-?([A-Z]{3})',
            '([0-9])-?([A-Z]{2})-?([0-9]{3})',
            '([0-9]{3})-?([A-Z]{2})-?([0-9])',
        ].map((variation) => `(?:${variation})`);

        return new RegExp(`(?:${variations.join('|')})$`, 'i');
    }

    public static format(license: string): string {
        return (
            license
                .match(this.getLicenseRegex())
                ?.splice(1)
                .filter((group) => group !== undefined)
                .join('-')
                .toUpperCase() || ''
        );
    }

    public static getVehicleType(license: string): string | null {
        const firstChar = license.charAt(0).toUpperCase();

        const vehicleTypes: { [key: string]: string } = {
            'A': 'Koninklijk Huis',
            'B': 'Zware bedrijfswagens',
            'C': 'Corps Diplomatique',
            'D': 'Bromfiets',
            'F': 'Snorfiets',
            'M': 'Motor',
            'O': 'Oplegger',
            'V': 'Lichte bedrijfswagens',
            'W': 'Caravans of aanhanger > 750 kg.',
        };

        return vehicleTypes[firstChar] || null;
    }
}
