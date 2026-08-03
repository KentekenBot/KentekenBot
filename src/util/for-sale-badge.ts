import { ForSaleListing } from '../types/marketplace.types';
import { formatCurrency } from './format-currency';

export class ForSaleBadge {
    public static message(listing: ForSaleListing): string {
        const label = listing.priceCents !== null ? formatCurrency(listing.priceCents / 100) : 'Marktplaats';

        return `Deze auto staat **te koop** — [${label}](${listing.url})`;
    }

    // Drawn into the card itself, so it carries the price: the image travels on its own
    // once it is screenshotted or forwarded, where the message text does not follow.
    public static tag(listing: ForSaleListing): string {
        if (listing.priceCents === null) {
            return 'TE KOOP';
        }

        return `TE KOOP · ${formatCurrency(listing.priceCents / 100)}`;
    }
}
