import { NamedVehicle, StatsProfile, StatSpot } from '../types/stats';

export class StatsCalculator {
    public static compute(spots: StatSpot[]): StatsProfile {
        return {
            totalSpots: spots.length,
            uniquePlates: this.countUniquePlates(spots),
            favoriteBrand: this.findFavoriteBrand(spots),
            mostExpensive: this.findMostExpensive(spots),
            oldest: this.findOldest(spots),
            electricCount: this.countElectric(spots),
            fuelCount: this.countCombustion(spots),
            firstSpotAt: this.findFirstSpotAt(spots),
        };
    }

    private static countUniquePlates(spots: StatSpot[]): number {
        const plates = new Set<string>();
        for (const spot of spots) {
            plates.add(spot.license);
        }
        return plates.size;
    }

    private static findFavoriteBrand(spots: StatSpot[]): { name: string; count: number } | null {
        const counts = new Map<string, number>();

        for (const spot of spots) {
            const brand = spot.vehicle?.brand;
            if (!brand) {
                continue;
            }
            counts.set(brand, (counts.get(brand) ?? 0) + 1);
        }

        let favorite: { name: string; count: number } | null = null;
        for (const [name, count] of counts) {
            if (!favorite || count > favorite.count) {
                favorite = { name, count };
            }
        }

        return favorite;
    }

    private static findMostExpensive(spots: StatSpot[]): (NamedVehicle & { price: number }) | null {
        let best: (NamedVehicle & { price: number }) | null = null;

        for (const spot of spots) {
            const vehicle = spot.vehicle;
            if (!vehicle || vehicle.price === null) {
                continue;
            }
            if (!best || vehicle.price > best.price) {
                best = {
                    brand: vehicle.brand,
                    tradeName: vehicle.tradeName,
                    license: spot.license,
                    price: vehicle.price,
                };
            }
        }

        return best;
    }

    private static findOldest(spots: StatSpot[]): (NamedVehicle & { date: Date }) | null {
        let oldest: (NamedVehicle & { date: Date }) | null = null;

        for (const spot of spots) {
            const vehicle = spot.vehicle;
            if (!vehicle || !vehicle.dateFirstAllowed) {
                continue;
            }
            if (!oldest || vehicle.dateFirstAllowed.getTime() < oldest.date.getTime()) {
                oldest = {
                    brand: vehicle.brand,
                    tradeName: vehicle.tradeName,
                    license: spot.license,
                    date: vehicle.dateFirstAllowed,
                };
            }
        }

        return oldest;
    }

    private static countElectric(spots: StatSpot[]): number {
        let count = 0;
        for (const spot of spots) {
            if (spot.vehicle?.primaryFuelType?.toLowerCase() === 'elektriciteit') {
                count++;
            }
        }
        return count;
    }

    private static countCombustion(spots: StatSpot[]): number {
        let count = 0;
        for (const spot of spots) {
            const fuel = spot.vehicle?.primaryFuelType;
            if (fuel && fuel.toLowerCase() !== 'elektriciteit') {
                count++;
            }
        }
        return count;
    }

    private static findFirstSpotAt(spots: StatSpot[]): Date | null {
        let earliest: Date | null = null;
        for (const spot of spots) {
            if (!earliest || spot.createdAt.getTime() < earliest.getTime()) {
                earliest = spot.createdAt;
            }
        }
        return earliest;
    }
}
