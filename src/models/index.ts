import { Vehicle } from './vehicle';
import { Sighting } from './sighting';

// Initialize the models and define associations
Vehicle.associate();
Sighting.associate();

export { Vehicle, Sighting };
