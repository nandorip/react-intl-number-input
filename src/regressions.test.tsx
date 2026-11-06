import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import IntlNumberInput, { ControlsRenderProps } from './index';

const input = () => screen.getByRole('spinbutton') as HTMLInputElement;

test('preserves legacy optimistic editing with an unchanged value prop', () => {
  render(<IntlNumberInput value={10} precision={0} />);
  fireEvent.change(input(), { target: { value: '20' } });
  expect(input()).toHaveValue('20');
  expect(input()).toHaveAttribute('aria-valuenow', '20');
});

test('strict controlled mode rejects edits and button changes when value is unchanged', () => {
  const onChange = jest.fn();
  render(<IntlNumberInput controlled value={10} precision={0} showStepButtons onChange={onChange} />);
  fireEvent.change(input(), { target: { value: '20' } });
  expect(onChange.mock.calls[0].slice(1)).toEqual([20, '20']);
  expect(input()).toHaveValue('10');
  fireEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(onChange.mock.calls[1].slice(1)).toEqual([11, '11']);
  expect(input()).toHaveValue('10');
  expect(input()).toHaveAttribute('aria-valuenow', '10');
});

test('strict controlled mode accepts synchronous parent updates', () => {
  function Parent() {
    const [value, setValue] = useState(10);
    return <IntlNumberInput controlled value={value} precision={0} showStepButtons
      onChange={(_event, next) => setValue(next)} />;
  }
  render(<Parent />);
  fireEvent.change(input(), { target: { value: '20' } });
  expect(input()).toHaveValue('20');
  fireEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(input()).toHaveValue('21');
});

test('uncontrolled input reformats locale and affixes without changing the numeric value', () => {
  const { rerender } = render(<IntlNumberInput />);
  fireEvent.change(input(), { target: { value: '123456' } });
  rerender(<IntlNumberInput locale="pt-BR" prefix="R$ " suffix=" BRL" />);
  expect(input()).toHaveValue('R$ 1.234,56 BRL');
  expect(input()).toHaveAttribute('aria-valuenow', '1234.56');
});

test('bounds clamp existing uncontrolled values and do not revive values when relaxed', () => {
  const { rerender } = render(<IntlNumberInput precision={0} />);
  fireEvent.change(input(), { target: { value: '50' } });
  rerender(<IntlNumberInput precision={0} maxValue={10} />);
  expect(input()).toHaveValue('10');
  expect(input()).toHaveAttribute('aria-valuenow', '10');
  rerender(<IntlNumberInput precision={0} maxValue={100} />);
  expect(input()).toHaveValue('10');
});

test('precision changes do not rescale the numeric value on blur', () => {
  const onBlur = jest.fn();
  const { rerender } = render(<IntlNumberInput onBlur={onBlur} />);
  fireEvent.change(input(), { target: { value: '1234' } });
  rerender(<IntlNumberInput precision={0} onBlur={onBlur} />);
  expect(input()).toHaveValue('12');
  fireEvent.blur(input());
  expect(onBlur.mock.calls[0].slice(1)).toEqual([12.34, '12']);
});

test('readOnly disables built-in controls and keyboard stepping', () => {
  const onChange = jest.fn();
  render(<IntlNumberInput value={10} readOnly showStepButtons onChange={onChange} />);
  for (const button of screen.getAllByRole('button')) {
    expect(button).toBeDisabled();
    fireEvent.click(button);
  }
  fireEvent.keyDown(input(), { key: 'ArrowUp' });
  expect(onChange).not.toHaveBeenCalled();
  expect(input()).toHaveValue('10.00');
});

test('readOnly blocks all custom setters and is available to custom controls', () => {
  const onChange = jest.fn();
  render(<IntlNumberInput value={10} readOnly onChange={onChange}
    renderControls={({ increment, decrement, setValue, readOnly }) =>
      <button onClick={() => { increment(); decrement(); setValue(20); }}>{String(readOnly)}</button>} />);
  fireEvent.click(screen.getByText('true'));
  expect(onChange).not.toHaveBeenCalled();
  expect(input()).toHaveValue('10.00');
});

test.each(['ar-EG', 'zh-Hans-CN-u-nu-hanidec', 'en-US-u-nu-mathbold'])
('localized input and blur preserve value for %s', (locale) => {
  const onChange = jest.fn();
  const onBlur = jest.fn();
  render(<IntlNumberInput locale={locale} onChange={onChange} onBlur={onBlur} />);
  const digits = new Intl.NumberFormat(locale, { useGrouping: false }).format(1234);
  fireEvent.change(input(), { target: { value: digits } });
  expect(onChange.mock.calls[0][1]).toBe(12.34);
  fireEvent.blur(input());
  expect(onBlur.mock.calls[0][1]).toBe(12.34);
});

test.each([
  ['ar-EG', '١٢٣٤', '١٢٫٣٤', 2, 2],
  ['en-US-u-nu-mathbold', '𝟏𝟐𝟑𝟒', '𝟏𝟐.𝟑𝟒', 4, 4],
  ['en-US', '1234567', '12,345.67', 3, 4],
] as const)('caret follows numeric digits for %s', (locale, raw, formatted, selection, expected) => {
  render(<IntlNumberInput locale={locale} />);
  fireEvent.change(input(), { target: { value: raw, selectionStart: selection, selectionEnd: selection } });
  expect(input()).toHaveValue(formatted);
  expect(input().selectionStart).toBe(expected);
});

test('caret ignores digits in affixes', () => {
  render(<IntlNumberInput prefix="V2 " suffix=" x3" />);
  fireEvent.change(input(), { target: { value: 'V2 1234 x3', selectionStart: 5, selectionEnd: 5 } });
  expect(input()).toHaveValue('V2 12.34 x3');
  expect(input().selectionStart).toBe(5);
});

test('repeated decimal steps return the same value that is displayed', () => {
  const onChange = jest.fn();
  render(<IntlNumberInput showStepButtons onChange={onChange} />);
  for (let i = 0; i < 10; i++) fireEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(input()).toHaveValue('0.10');
  expect(onChange.mock.calls[9][1]).toBe(0.1);
  for (let i = 0; i < 10; i++) fireEvent.click(screen.getByRole('button', { name: 'Decrease value' }));
  expect(input()).toHaveValue('0.00');
  expect(onChange.mock.calls[19][1]).toBe(0);
});

test('fractional steps preserve subprecision values', () => {
  const onChange = jest.fn();
  render(<IntlNumberInput value={1.001} step={0.1} onChange={onChange} showStepButtons />);
  fireEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(onChange.mock.calls[0][1]).toBe(1.002);
  expect(input()).toHaveAttribute('aria-valuenow', '1.002');
});

test.each([NaN, Infinity, -Infinity])('nonfinite external values normalize consistently: %s', (value) => {
  render(<IntlNumberInput value={value} renderControls={({ value }) => <span>{String(value)}</span>} />);
  expect(screen.getByText('0')).toBeInTheDocument();
  fireEvent.keyDown(input(), { key: 'ArrowUp' });
  expect(input()).toHaveValue('0.01');
});

test('external values update controls and ARIA when the formatted text is unchanged', () => {
  const controls = ({ value }: ControlsRenderProps) => <span data-testid="numeric">{value}</span>;
  const { rerender } = render(<IntlNumberInput value={1.001} renderControls={controls} />);
  rerender(<IntlNumberInput value={1.002} renderControls={controls} />);
  expect(screen.getByTestId('numeric')).toHaveTextContent('1.002');
  expect(input()).toHaveAttribute('aria-valuenow', '1.002');
});

test('programmatic events expose the input and consistent event methods without duplicate callbacks', () => {
  const onChange = jest.fn((event) => {
    expect(event.target).toBe(input());
    expect(event.currentTarget).toBe(input());
    expect(event.target.getAttribute('name')).toBe('amount');
    expect(event.target.value).toBe('1.01');
    expect(event.bubbles).toBe(true);
    expect(event.isDefaultPrevented()).toBe(false);
    event.preventDefault();
    expect(event.defaultPrevented).toBe(true);
    expect(event.isDefaultPrevented()).toBe(true);
    event.stopPropagation();
    expect(event.isPropagationStopped()).toBe(true);
    event.persist();
  });
  render(<IntlNumberInput value={1} name="amount" showStepButtons onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(onChange).toHaveBeenCalledTimes(1);
});

test.each(['2 12.34 x3', 'V2 12.34 x'])('partial numeric affix deletion preserves the amount: %s', (raw) => {
  const onChange = jest.fn();
  render(<IntlNumberInput value={12.34} prefix="V2 " suffix=" x3" onChange={onChange} />);
  fireEvent.change(input(), { target: { value: raw } });
  expect(onChange.mock.calls[0].slice(1)).toEqual([12.34, 'V2 12.34 x3']);
});

test('bare digit paste still works with numeric affixes', () => {
  const onChange = jest.fn();
  render(<IntlNumberInput prefix="V2 " suffix=" x3" onChange={onChange} />);
  fireEvent.change(input(), { target: { value: '5678' } });
  expect(onChange.mock.calls[0].slice(1)).toEqual([56.78, 'V2 56.78 x3']);
});

test('legacy string values, empty values, sanitization and negative zero remain supported', () => {
  const { rerender } = render(<IntlNumberInput value="1234" />);
  expect(input()).toHaveValue('12.34');
  fireEvent.change(input(), { target: { value: '' } });
  expect(input()).toHaveValue('0.00');
  fireEvent.change(input(), { target: { value: '-' } });
  expect(input()).toHaveValue('-0.00');
  rerender(<IntlNumberInput value="-1234" />);
  expect(input()).toHaveValue('-12.34');
});

test('several control calls in a single event accumulate without stale state', () => {
  render(<IntlNumberInput renderControls={({ increment }) =>
    <button onClick={() => { increment(); increment(); }}>Twice</button>} />);
  fireEvent.click(screen.getByText('Twice'));
  expect(input()).toHaveValue('0.02');
});

test('controlled controls accumulate proposals within one event and reset after rejection', () => {
  const onChange = jest.fn();
  render(<IntlNumberInput controlled value={1} onChange={onChange}
    renderControls={({ increment }) =>
      <button onClick={() => { increment(); increment(); }}>Twice</button>} />);
  fireEvent.click(screen.getByText('Twice'));
  expect(onChange.mock.calls.map((call) => call[1])).toEqual([1.01, 1.02]);
  expect(input()).toHaveValue('1.00');
  fireEvent.click(screen.getByText('Twice'));
  expect(onChange.mock.calls.map((call) => call[1])).toEqual([1.01, 1.02, 1.01, 1.02]);
  expect(input()).toHaveValue('1.00');
});

test('invalid bounds and multipliers do not poison numeric state', () => {
  render(<IntlNumberInput minValue={NaN} maxValue={Infinity}
    renderControls={({ increment }) => <button onClick={() => increment(Infinity)}>Invalid</button>} />);
  fireEvent.click(screen.getByText('Invalid'));
  expect(input()).toHaveValue('0.00');
  expect(input()).not.toHaveAttribute('aria-valuemin');
  expect(input()).not.toHaveAttribute('aria-valuemax');
});
