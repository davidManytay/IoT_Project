import { generateGaussianSensorData } from '../src/logic/sensorUtils';

describe('GaussianNoise (Box-Muller)', () => {
  test('should generate values within expected statistical bounds', () => {
    const mean = 25;
    const stdDev = 2;
    const iterations = 1000;
    
    let sum = 0;
    const values: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const val = generateGaussianSensorData(mean, stdDev);
      sum += val;
      values.push(val);
    }
    
    const calculatedMean = sum / iterations;
    
    // Mean should be close to 25 (allowing 5% margin for 1000 samples)
    expect(calculatedMean).toBeGreaterThan(24);
    expect(calculatedMean).toBeLessThan(26);
    
    // Check spread: Standard deviation check
    const variance = values.reduce((acc, val) => acc + Math.pow(val - calculatedMean, 2), 0) / iterations;
    const calculatedStdDev = Math.sqrt(variance);
    
    // StdDev should be close to 2
    expect(calculatedStdDev).toBeGreaterThan(1.5);
    expect(calculatedStdDev).toBeLessThan(2.5);
  });
});
