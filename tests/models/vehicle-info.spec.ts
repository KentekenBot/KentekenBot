import { VehicleInfo } from '../../src/models/vehicle-info';

describe('VehicleInfo model', () => {
    it('should strip the duplicated brand from the trade name without leaving a leading space', () => {
        const vehicle = new VehicleInfo({ merk: 'NISSAN', handelsbenaming: 'NISSAN 350Z' });

        expect(vehicle.handelsbenaming).toBe('350Z');
    });

    it('should keep a trade name that does not repeat the brand', () => {
        const vehicle = new VehicleInfo({ merk: 'NISSAN', handelsbenaming: '350Z' });

        expect(vehicle.handelsbenaming).toBe('350Z');
    });
});
