import { SensorReading } from './sensorUtils';

/**
 * Boolean Rule Engine
 * Evaluates logical rules against a data point.
 */

export type RuleOperator = '>' | '<' | '>=' | '<=' | '==';

export interface AlertRule {
  id: string;
  label: string;
  type: 'simple' | 'compound' | 'rateOfChange';
  // Simple Rule Fields
  sensorType?: 'temperature' | 'humidity' | 'pressure';
  operator?: RuleOperator;
  value?: number;
  // Compound Rule Fields
  logicalOperator?: 'AND' | 'OR';
  rules?: AlertRule[];
  // Rate of Change Fields
  windowSize?: number;
  threshold?: number;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  label: string;
  value: number;
  timestamp: number;
}

/**
 * Evaluates if a reading (or state) triggers a specific rule.
 * Now supports recursive compound logic and Rate of Change via history.
 */
export const evaluateRule = (
  reading: SensorReading, 
  rule: AlertRule, 
  getHistory?: (index: number) => number | null
): boolean => {
  if (rule.type === 'simple') {
    if (reading.type !== rule.sensorType) return false;

    switch (rule.operator) {
      case '>': return reading.value > (rule.value ?? 0);
      case '<': return reading.value < (rule.value ?? 0);
      case '>=': return reading.value >= (rule.value ?? 0);
      case '<=': return reading.value <= (rule.value ?? 0);
      case '==': return Math.abs(reading.value - (rule.value ?? 0)) < 0.01;
      default: return false;
    }
  }

  if (rule.type === 'rateOfChange' && getHistory) {
    if (reading.type !== rule.sensorType) return false;
    
    const windowSize = rule.windowSize ?? 10;
    const threshold = rule.threshold ?? 5;
    
    // Relative index (windowSize - 1) is the historical point
    const historicalValue = getHistory(windowSize - 1);
    
    if (historicalValue !== null) {
      const change = reading.value - historicalValue;
      return change > threshold;
    }
    return false;
  }

  if (rule.type === 'compound' && rule.rules && rule.logicalOperator) {
    if (rule.logicalOperator === 'AND') {
      return rule.rules.every(subRule => evaluateRule(reading, subRule, getHistory));
    } else {
      return rule.rules.some(subRule => evaluateRule(reading, subRule, getHistory));
    }
  }

  return false;
};

