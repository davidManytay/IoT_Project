/**
 * Sensor Utility Functions
 * Box-Muller Transform: A method for generating independent, standard, 
 * normally distributed (Gaussian) random numbers.
 */

/**
 * Generates a sensor reading using normal distribution.
 * @param mean The average value (e.g., 25°C)
 * @param stdDev The standard deviation (spread of noise)
 * @returns A realistic sensor value with Gaussian noise
 */
export const generateGaussianSensorData = (mean: number, stdDev: number): number => {
  // Box-Muller Transform: Generates two values, we only need one.
  const u1 = Math.random();
  const u2 = Math.random();
  
  // Z0 = sqrt(-2 * ln(u1)) * cos(2 * pi * u2)
  const z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * (u2 || 0.0001));
  
  // Scale and shift: X = Z0 * stdDev + mean
  return z0 * stdDev + mean;
};

export interface SensorReading {
  id: string;
  type: 'temperature' | 'humidity' | 'pressure';
  value: number;
  timestamp: number;
}
