import { RankedVehicle, SuperlativeSpot } from '../types/superlatives';

export class SuperlativesRanker {
    public static byPrice(spots: SuperlativeSpot[], limit: number): RankedVehicle[] {
        const deduped = this.dedupeByPlate(spots);
        const withPrice = deduped.filter((spot) => spot.price !== null);
        withPrice.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

        return this.take(withPrice, limit);
    }

    public static byAge(spots: SuperlativeSpot[], limit: number): RankedVehicle[] {
        const deduped = this.dedupeByPlate(spots);
        const withDate = deduped.filter((spot) => spot.dateFirstAllowed !== null);
        withDate.sort((a, b) => (a.dateFirstAllowed?.getTime() ?? 0) - (b.dateFirstAllowed?.getTime() ?? 0));

        return this.take(withDate, limit);
    }

    private static dedupeByPlate(spots: SuperlativeSpot[]): SuperlativeSpot[] {
        const latestByPlate = new Map<string, SuperlativeSpot>();

        for (const spot of spots) {
            const existing = latestByPlate.get(spot.license);
            if (!existing || spot.spottedAt.getTime() > existing.spottedAt.getTime()) {
                latestByPlate.set(spot.license, spot);
            }
        }

        return [...latestByPlate.values()];
    }

    private static take(spots: SuperlativeSpot[], limit: number): RankedVehicle[] {
        const ranked: RankedVehicle[] = [];

        for (const spot of spots.slice(0, limit)) {
            ranked.push({
                license: spot.license,
                brand: spot.brand,
                tradeName: spot.tradeName,
                price: spot.price,
                dateFirstAllowed: spot.dateFirstAllowed,
                spotterUserId: spot.spotterUserId,
            });
        }

        return ranked;
    }
}
