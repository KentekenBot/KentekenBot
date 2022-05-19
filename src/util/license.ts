export class License {
    public static isValid(license: string): boolean {
        return this.getLicenseRegex().test(license);
    }

    public static getLicenseRegex(): RegExp {
        return /^(([A-Z0-9]{2}-?[A-Z0-9]{2}-?[A-Z0-9]{2})|([0-9]{2}-?[A-Z]{3}-?[0-9])|([0-9]-?[A-Z]{3}-?[0-9]{2})|([A-Z]-?\d{3}-?[A-Z]{2})|([A-Z]{2}-?[0-9]{3}-?[A-Z]))$/;
    }
}
