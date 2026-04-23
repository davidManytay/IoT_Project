import { evaluateRule, AlertRule } from '../src/logic/RuleEngine';
import { SensorReading } from '../src/logic/sensorUtils';

describe('RuleEngine', () => {
  const mockReading: SensorReading = {
    id: '1',
    type: 'temperature',
    value: 25,
    timestamp: Date.now(),
  };

  test('Simple Rule: should trigger when threshold is exceeded', () => {
    const rule: AlertRule = {
      id: 'r1',
      label: 'High Temp',
      type: 'simple',
      sensorType: 'temperature',
      operator: '>',
      value: 20,
    };
    expect(evaluateRule(mockReading, rule)).toBe(true);
    
    const ruleLow: AlertRule = { ...rule, value: 30 };
    expect(evaluateRule(mockReading, ruleLow)).toBe(false);
  });

  test('Rate of Change: should trigger when spike is detected in history', () => {
    const rocRule: AlertRule = {
      id: 'r2',
      label: 'Temp Spike',
      type: 'rateOfChange',
      sensorType: 'temperature',
      windowSize: 3,
      threshold: 5,
    };

    // History: [20, 18, 15] (current reading is 25)
    // index 0: 20, index 1: 18, index 2: 15
    // windowSize 3 means we check index 2 (historical point)
    const mockHistory = (index: number) => {
      const history = [20, 18, 15];
      return history[index] ?? null;
    };

    expect(evaluateRule(mockReading, rocRule, mockHistory)).toBe(true); // 25 - 15 = 10 (> 5)

    const mockHistorySmall: (index: number) => number | null = (index) => 24;
    expect(evaluateRule(mockReading, rocRule, mockHistorySmall)).toBe(false); // 25 - 24 = 1
  });

  test('Compound Rule: OR should trigger if any rule is met', () => {
    const orRule: AlertRule = {
      id: 'c1',
      label: 'Multi Alert',
      type: 'compound',
      logicalOperator: 'OR',
      rules: [
        { id: 's1', type: 'simple', sensorType: 'temperature', operator: '>', value: 50, label: 'T>50' },
        { id: 's2', type: 'simple', sensorType: 'temperature', operator: '<', value: 10, label: 'T<10' },
        { id: 's3', type: 'simple', sensorType: 'temperature', operator: '==', value: 25, label: 'T=25' },
      ]
    };

    expect(evaluateRule(mockReading, orRule)).toBe(true); // Matches s3
  });
});
