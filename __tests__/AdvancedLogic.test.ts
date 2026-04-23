import { CircularBuffer } from '../src/logic/CircularBuffer';
import { AlertRule, evaluateRule } from '../src/logic/RuleEngine';
import { SensorReading } from '../src/logic/sensorUtils';

describe('Advanced IoT Logic', () => {
  test('CircularBuffer.at() should return correct historical data', () => {
    const buffer = new CircularBuffer<number>(5);
    buffer.push(10);
    buffer.push(20);
    buffer.push(30);
    expect(buffer.at(0)).toBe(30);
    expect(buffer.at(1)).toBe(20);
    expect(buffer.at(2)).toBe(10);
    expect(buffer.at(3)).toBeNull();
  });

  test('CircularBuffer.at() should handle wrap-around correctly', () => {
    const buffer = new CircularBuffer<number>(3);
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    buffer.push(4);


    expect(buffer.at(0)).toBe(4);
    expect(buffer.at(1)).toBe(3);
    expect(buffer.at(2)).toBe(2);
  });

  test('Compound Rules (AND) should evaluate correctly', () => {
    const compoundRule: AlertRule = {
      id: 'c1',
      label: 'Extreme Heat & Humidity',
      type: 'compound',
      logicalOperator: 'AND',
      rules: [
        { id: 's1', type: 'simple', sensorType: 'temperature', operator: '>', value: 30, label: 'T>30' },
        { id: 's2', type: 'simple', sensorType: 'humidity', operator: '>', value: 80, label: 'H>80' }
      ]
    };

    const reading1: SensorReading = { id: 'r1', type: 'temperature', value: 35, timestamp: 0 };


    const rangeRule: AlertRule = {
      id: 'c2',
      label: 'Dangerous Range',
      type: 'compound',
      logicalOperator: 'AND',
      rules: [
        { id: 's1', type: 'simple', sensorType: 'temperature', operator: '>', value: 30, label: 'T>30' },
        { id: 's2', type: 'simple', sensorType: 'temperature', operator: '<', value: 40, label: 'T<40' }
      ]
    };

    expect(evaluateRule({ id: 'r1', type: 'temperature', value: 35, timestamp: 0 }, rangeRule)).toBe(true);
    expect(evaluateRule({ id: 'r1', type: 'temperature', value: 45, timestamp: 0 }, rangeRule)).toBe(false);
  });
});
