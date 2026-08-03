import { ForSaleListing } from '../types/marketplace.types';
import { formatCurrency } from './format-currency';

export class ForSaleBadge {
    public static message(listing: ForSaleListing): string {
        const label = listing.priceCents !== null ? formatCurrency(listing.priceCents / 100) : 'Marktplaats';

        return `Deze auto staat **te koop** — [${label}](${listing.url})`;
    }

    public static tag(listing: ForSaleListing): string {
        if (listing.priceCents === null) {
            return 'TE KOOP';
        }

        return `TE KOOP · ${formatCurrency(listing.priceCents / 100)}`;
    }
}
