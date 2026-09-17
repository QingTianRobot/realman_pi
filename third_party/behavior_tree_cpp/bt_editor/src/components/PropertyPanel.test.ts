import { describe, expect, it } from 'vitest';

import type { PortManifest } from '../types';
import { inferWidget } from './PropertyPanel';

function port(overrides: Partial<PortManifest>): PortManifest {
  return {
    name: 'p',
    direction: 'input',
    type_name: 'string',
    default_value: '',
    description: '',
    enum_values: [],
    ...overrides,
  };
}

describe('PropertyPanel port widget inference', () => {
  it('prefers enum widgets when enum values are provided', () => {
    expect(inferWidget(port({ enum_values: ['A', 'B'] }))).toBe('enum');
  });

  it('infers primitive widgets from type names', () => {
    expect(inferWidget(port({ type_name: 'bool' }))).toBe('bool');
    expect(inferWidget(port({ type_name: 'int' }))).toBe('int');
    expect(inferWidget(port({ type_name: 'unsigned long' }))).toBe('int');
    expect(inferWidget(port({ type_name: 'double' }))).toBe('float');
    expect(inferWidget(port({ type_name: 'float' }))).toBe('float');
  });

  it('falls back to text for strings and unknown types', () => {
    expect(inferWidget(port({ type_name: 'std::string' }))).toBe('text');
    expect(inferWidget(port({ type_name: 'Pose2D' }))).toBe('text');
  });
});
