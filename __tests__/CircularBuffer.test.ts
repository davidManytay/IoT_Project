import { CircularBuffer } from '../src/logic/CircularBuffer';

describe('CircularBuffer', () => {
  test('should overwrite oldest data when full', () => {
    const size = 3;
    const buffer = new CircularBuffer<number>(size);
    
    // Fill buffer
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    
    // Buffer should be [1, 2, 3] internally (head at 0)
    expect(buffer.toArray()).toEqual([1, 2, 3]);
    
    // Overwrite oldest (1)
    buffer.push(4);
    
    // Buffer should be [2, 3, 4]
    expect(buffer.toArray()).toEqual([2, 3, 4]);
    expect(buffer.last()).toBe(4);
  });

  test('should handle O(1) writes consistently', () => {
    const size = 50;
    const buffer = new CircularBuffer<number>(size);
    
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      buffer.push(i);
    }
    const end = performance.now();
    
    // This is more of a logic check, but it ensures no crash during high-frequency writes
    expect(buffer.toArray().length).toBe(size);
    expect(buffer.last()).toBe(999);
  });
});
