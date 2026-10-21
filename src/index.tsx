import React, {
  useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef,
  useImperativeHandle, memo, forwardRef,
} from 'react';
import {
  resolveLocale, clampToBounds, createDigitMap, stripAffixes,
  parseNumber, preserveAffixEdit, addStep,
} from './number.js';

export interface ControlsRenderProps {
  increment: (multiplier?: number) => void;
  decrement: (multiplier?: number) => void;
  setValue: (value: number) => void;
  value: number;
  min?: number;
  max?: number;
  disabled: boolean;
  readOnly?: boolean;
  step: number;
  precision: number;
  formattedValue: string;
}

type IntlNumberInputOwnProps = {
  locale?: string;
  prefix?: string;
  suffix?: string;
  precision?: number;
  value?: number | string;
  /** Opt in to keeping value authoritative when the parent rejects an edit. */
  controlled?: boolean;
  showStepButtons?: boolean;
  step?: number;
  minValue?: number;
  maxValue?: number;
  inputMode?: 'numeric' | 'decimal';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: number, maskedValue: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>, value: number, maskedValue: string) => void;
  renderControls?: (props: ControlsRenderProps) => React.ReactNode;
};

export type IntlNumberInputProps = IntlNumberInputOwnProps &
  Omit<React.ComponentPropsWithoutRef<'input'>,
    keyof IntlNumberInputOwnProps | 'value' | 'type' | 'defaultValue' | 'children'>;

// Keep the historical affix normalization for compatibility.
function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/on\w+\s*=\s*["'][^"']*["']/g, '');
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function createChangeEvent(input: HTMLInputElement): React.ChangeEvent<HTMLInputElement> {
  const nativeEvent = new Event('change', { bubbles: true, cancelable: true });
  const event: React.ChangeEvent<HTMLInputElement> & { bubble: boolean } = {
    target: input,
    currentTarget: input,
    nativeEvent,
    bubbles: true,
    bubble: true,
    cancelable: nativeEvent.cancelable,
    get defaultPrevented() { return nativeEvent.defaultPrevented; },
    eventPhase: nativeEvent.eventPhase,
    isTrusted: false,
    timeStamp: nativeEvent.timeStamp,
    type: 'change',
    preventDefault: () => nativeEvent.preventDefault(),
    stopPropagation: () => nativeEvent.stopPropagation(),
    isDefaultPrevented: () => nativeEvent.defaultPrevented,
    isPropagationStopped: () => nativeEvent.cancelBubble,
    persist: () => {},
  };
  return event;
}

const IntlNumberInput = forwardRef<HTMLInputElement, IntlNumberInputProps>(
  function IntlNumberInput({
    locale = 'en-US', prefix = '', suffix = '', precision = 2, value,
    controlled = false, showStepButtons = false, step = 1, minValue, maxValue,
    inputMode: inputModeProp, onChange, onBlur, onKeyDown: onKeyDownProp,
    disabled = false, renderControls, ...inputProps
  }, ref) {
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);
    const safePrecision = typeof precision !== 'number' || Number.isNaN(precision)
      ? 2 : Math.min(Math.max(Math.round(precision), 0), 20);
    const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
    const safePrefix = useMemo(() => sanitizeString(prefix), [prefix]);
    const safeSuffix = useMemo(() => sanitizeString(suffix), [suffix]);
    const resolvedLocale = useMemo(() => resolveLocale(locale), [locale]);
    const digitMap = useMemo(() => createDigitMap(resolvedLocale), [resolvedLocale]);
    const numberFormatter = useMemo(() => new Intl.NumberFormat(resolvedLocale, {
      minimumFractionDigits: safePrecision, maximumFractionDigits: safePrecision,
    }), [resolvedLocale, safePrecision]);
    const [effectiveMin, effectiveMax] = useMemo(() => {
      const min = Number.isFinite(minValue) ? minValue : undefined;
      const max = Number.isFinite(maxValue) ? maxValue : undefined;
      return min !== undefined && max !== undefined && min > max ? [max, min] : [min, max];
    }, [minValue, maxValue]);
    const normalize = useCallback((numeric: number) =>
      clampToBounds(Number.isFinite(numeric) ? numeric : 0, effectiveMin, effectiveMax),
    [effectiveMin, effectiveMax]);
    const getNumberValue = useCallback((text: string) =>
      parseNumber(stripAffixes(text, safePrefix, safeSuffix), digitMap, safePrecision),
    [safePrefix, safeSuffix, digitMap, safePrecision]);
    const fromProp = () => normalize(typeof value === 'string' ? getNumberValue(value) : value ?? 0);
    const [state, setState] = useState(() => ({ source: value, numeric: fromProp() }));
    const [editVersion, setEditVersion] = useState(0);
    // Synchronize changed external values before rendering. An unchanged value retains
    // the optimistic editing behavior of releases before controlled was introduced.
    let numericValue = controlled ? fromProp() : normalize(state.numeric);
    if (!Object.is(state.source, value)) {
      numericValue = value === undefined && !controlled ? normalize(state.numeric) : fromProp();
      setState({ source: value, numeric: numericValue });
    } else if (!controlled && !Object.is(state.numeric, numericValue)) {
      setState({ source: value, numeric: numericValue });
    }
    const formatNumber = useCallback((numeric: number) =>
      `${safePrefix}${numberFormatter.format(numeric)}${safeSuffix}`,
    [safePrefix, safeSuffix, numberFormatter]);
    const maskedValue = formatNumber(numericValue);
    // Cache for several custom-control calls in one event; rendered state is numericValue.
    const numericValueRef = useRef(numericValue);
    const selectionRef = useRef<{ digitsBefore: number } | null>(null);
    const countDigits = (text: string) => Array.from(text).filter((char) => digitMap.has(char)).length;

    useIsomorphicLayoutEffect(() => {
      numericValueRef.current = numericValue;
      if (!selectionRef.current || !innerRef.current) return;
      const input = innerRef.current;
      const { digitsBefore } = selectionRef.current;
      const numericText = stripAffixes(input.value, safePrefix, safeSuffix);
      let position = safePrefix.length;
      let found = 0;
      for (const character of numericText) {
        if (found >= digitsBefore) break;
        position += character.length;
        if (digitMap.has(character)) found++;
      }
      input.setSelectionRange(position, position);
      selectionRef.current = null;
    }, [numericValue, maskedValue, editVersion, safePrefix, safeSuffix, digitMap]);

    const readOnly = !!inputProps.readOnly;
    const commitValue = useCallback((next: number, event?: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly || !Number.isFinite(next)) return;
      const nextValue = normalize(next);
      const nextMasked = formatNumber(nextValue);
      numericValueRef.current = nextValue;
      if (!controlled) {
        setState((previous) => ({ ...previous, numeric: nextValue }));
      }
      // Reapply the caret even if normalization leaves the formatted value unchanged.
      setEditVersion((previous) => previous + 1);
      if (event) {
        onChange?.(event, nextValue, nextMasked);
      } else if (innerRef.current) {
        const input = innerRef.current;
        input.value = nextMasked;
        try {
          onChange?.(createChangeEvent(input), nextValue, nextMasked);
        } finally {
          input.value = controlled ? maskedValue : nextMasked;
        }
      }
    }, [disabled, readOnly, normalize, formatNumber, controlled, onChange, maskedValue]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      const raw = preserveAffixEdit(maskedValue, event.target.value, safePrefix, safeSuffix);
      const numericTextBeforeCaret = stripAffixes(raw.slice(0, event.target.selectionStart ?? 0), safePrefix, '');
      selectionRef.current = { digitsBefore: countDigits(numericTextBeforeCaret) };
      const next = getNumberValue(raw);
      if (!Number.isFinite(next)) {
        selectionRef.current = null;
        return;
      }
      commitValue(next, event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const parsed = raw === maskedValue || disabled || readOnly ? numericValue : getNumberValue(raw);
      const nextValue = normalize(Number.isFinite(parsed) ? parsed : numericValue);
      if (!controlled && !disabled && !readOnly) {
        numericValueRef.current = nextValue;
        setState((previous) => ({ ...previous, numeric: nextValue }));
      }
      onBlur?.(event, nextValue, formatNumber(nextValue));
    };

    const handleStep = useCallback((direction: number, multiplier = 1) => {
      if (!Number.isFinite(multiplier)) return;
      const delta = direction * (safeStep / Math.pow(10, safePrecision)) * multiplier;
      if (!Number.isFinite(delta)) return;
      commitValue(addStep(numericValueRef.current, delta));
    }, [safeStep, safePrecision, commitValue]);
    const increment = useCallback((multiplier = 1) => handleStep(1, multiplier), [handleStep]);
    const decrement = useCallback((multiplier = 1) => handleStep(-1, multiplier), [handleStep]);
    const setValue = useCallback((next: number) => commitValue(next), [commitValue]);
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        handleStep(event.key === 'ArrowUp' ? 1 : -1, event.shiftKey ? 10 : 1);
      }
    };

    const inputElement = <input
      ref={innerRef} type="text" role="spinbutton"
      aria-valuenow={numericValue} aria-valuemin={effectiveMin} aria-valuemax={effectiveMax}
      aria-valuetext={maskedValue}
      inputMode={inputModeProp || (safePrecision > 0 ? 'decimal' : 'numeric')}
      value={maskedValue} disabled={disabled}
      onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown}
      {...inputProps}
    />;
    if (renderControls) {
      return <>{inputElement}{renderControls({
        increment, decrement, setValue, value: numericValue,
        min: effectiveMin, max: effectiveMax, disabled, readOnly,
        step: safeStep, precision: safePrecision, formattedValue: maskedValue,
      })}</>;
    }
    if (!showStepButtons) return inputElement;
    const controlsDisabled = disabled || readOnly;
    const buttonStyle = {
      padding: '4px 8px', cursor: controlsDisabled ? 'not-allowed' : 'pointer',
      opacity: controlsDisabled ? 0.5 : 1,
    };
    return <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <button type="button" onClick={() => decrement()} disabled={controlsDisabled}
        aria-label="Decrease value" style={buttonStyle}>-</button>
      {inputElement}
      <button type="button" onClick={() => increment()} disabled={controlsDisabled}
        aria-label="Increase value" style={buttonStyle}>+</button>
    </div>;
  }
);

IntlNumberInput.displayName = 'IntlNumberInput';
export default memo(IntlNumberInput);
