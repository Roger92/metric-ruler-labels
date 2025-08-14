import assert from 'assert';
// Ensure helper functions are available globally or via CommonJS before loading conversionHandlers
import '../scripts/helper.js';
import {convertDistanceString} from '../scripts/conversionHandlers.js';

function test(name, fn){
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}`);
    console.error(e && e.stack || e);
    process.exitCode = 1;
  }
}

const labels = ["ft", "ft.", "feet"]; // search labels

// ===== Basics: simple, single-decimal (US/EU), two-decimal (US/EU), negatives =====

// Simple number
test('Simple number: 42 ft -> 12.6 m', () => {
  const input = '42 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  assert.strictEqual(out, '12.6 m');
});

// Single decimal (US)
test('US single decimal: 10.2 ft -> 3.06 m', () => {
  const input = '10.2 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 10.2 * 0.3 = 3.06 (may be 3.059999.. -> toFixed(2) => 3.06)
  assert.strictEqual(out, '3.06 m');
});

// Single decimal (EU)
test('EU single decimal: 10,2 ft -> 3,06 m', () => {
  const input = '10,2 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 10,2 * 0,3 = 3,06
  assert.strictEqual(out, '3,06 m');
});

// Two decimals (US)
test('US decimal: 10.25 ft -> 3.07 m (floating precision rounding)', () => {
  const input = '10.25 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 10.25 * 0.3 = 3.075 but represented as 3.074999.. -> toFixed(2) => 3.07
  assert.strictEqual(out, '3.07 m');
});

// Two decimals (EU)
test('EU decimal: 10,25 ft -> 3,07 m (floating precision rounding)', () => {
  const input = '10,25 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 10,25 * 0,3 = 3,075 but due to FP representation becomes 3,074999.. -> toFixed(2) => 3,07
  assert.strictEqual(out, '3,07 m');
});

// Negative value
test('Negative number EU: -10,25 ft -> -3,07 m (floating precision rounding)', () => {
  const input = '-10,25 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  assert.strictEqual(out, '-3,07 m');
});

// ===== Thousands only and recognition =====

test('US thousand only: 1,000 ft -> 300 m', () => {
  const input = '1,000 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  assert.strictEqual(out, '300 m');
});

test('EU thousand only: 1.000 ft -> 300 m', () => {
  const input = '1.000 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  assert.strictEqual(out, '300 m');
});

test('US thousand grouping recognition: 1,234 ft -> 370.2 m', () => {
  const input = '1,234 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  assert.strictEqual(out, '370.2 m');
});

// ===== Thousands + decimals (both separators) =====

test('US with thousands and decimals preserved: 12,345.67 ft -> 3,703.7 m', () => {
  const input = '12,345.67 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  assert.strictEqual(out, '3,703.7 m');
});

test('EU with thousands and decimals preserved: 12.345,67 ft -> 3.703,67 m', () => {
  const input = '12.345,67 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  assert.strictEqual(out, '3.703,7 m'); // toFixed(2)=> 3703.70 -> trimmed => 3703,7 with thousand '.'
});

// ===== Thousands preserved in result =====

test('US thousands preserved in result: 3,400 ft -> 1,020 m', () => {
  const input = '3,400 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 3,400 * 0.3 = 1,020 -> thousands separator should be kept (comma)
  assert.strictEqual(out, '1,020 m');
});

test('EU thousands preserved in result: 3.400 ft -> 1.020 m', () => {
  const input = '3.400 ft';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 3.400 * 0.3 = 1.020 -> thousands separator should be kept (dot)
  assert.strictEqual(out, '1.020 m');
});

// ===== Multiple matches and spacing preservation =====

test('Multiple matches with spacing preserved', () => {
  const input = '5  ft [5 ft] x 10 ft [10 ft]';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 5 * 0.3 = 1.5; 10 * 0.3 = 3
  assert.strictEqual(out, '1.5  m [1.5 m] x 3 m [3 m]');
});

test('Multiple matches US with thousands and decimals with spacing preserved', () => {
  const input = '3,400  ft [3,400 ft] x 12,345.67 ft [12,345.67 ft]';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 3,400 * 0.3 = 1,020 and 12,345.67 * 0.3 = 3,703.701 -> toFixed(2)=> 3,703.70 -> trimmed => 3,703.7
  assert.strictEqual(out, '1,020  m [1,020 m] x 3,703.7 m [3,703.7 m]');
});

test('Multiple matches EU with thousands and decimals with spacing preserved', () => {
  const input = '3.400  ft [3.400 ft] x 12.345,67 ft [12.345,67 ft]';
  const out = convertDistanceString(input, labels, 'm', 0.3);
  // 3.400 * 0.3 = 1.020 and 12.345,67 * 0.3 -> 3.703,7 with EU separators
  assert.strictEqual(out, '1.020  m [1.020 m] x 3.703,7 m [3.703,7 m]');
});

if (process.exitCode) {
  process.exit(process.exitCode);
} else {
  console.log('\nAll convertDistanceString tests completed.');
}