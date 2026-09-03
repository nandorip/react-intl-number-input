import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  memo,
  forwardRef,
} from 'react';

export interface ControlsRenderProps {
  increment: (multiplier?: number) => void;
  decrement: (multiplier?: number) => void;
  setValue: (value: number) => void;
  value: number;
  min?: number;
  max?: number;
  disabled: boolean;
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
  showStepButtons?: boolean;
  step?: number;
  minValue?: number;
  maxValue?: number;
  inputMode?: 'numeric' | 'decimal';
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: number,
    maskedValue: string
  ) => void;
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement>,
    value: number,
    maskedValue: string
  ) => void;
  renderControls?: (props: ControlsRenderProps) => React.ReactNode;
};

export type IntlNumberInputProps = IntlNumberInputOwnProps &
  Omit<
    React.ComponentPropsWithoutRef<'input'>,
    keyof IntlNumberInputOwnProps | 'value' | 'type' | 'defaultValue' | 'children'
  >;

function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/on\w+\s*=\s*["'][^"']*["']/g, '');
}

function resolveLocale(locale: string): string {
  try {
    const supported = Intl.NumberFormat.supportedLocalesOf([locale]);
    return supported.length > 0 ? supported[0] : 'en-US';
  } catch {
    return 'en-US';
  }
}

function isValidNumber(value: number): boolean {
  return Number.isFinite(value) && !Number.isNaN(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampToBounds(
  value: number,
  min: number | undefined,
  max: number | undefined
): number {
  let result = value;

  if (min !== undefined && result < min) {
    result = min;
  }

  if (max !== undefined && result > max) {
    result = max;
  }

  return result;
}

const IntlNumberInput = forwardRef<HTMLInputElement, IntlNumberInputProps>(
  function IntlNumberInput(
    {
      locale = 'en-US',
      prefix = '',
      suffix = '',
      precision = 2,
      value,
      showStepButtons = false,
      step = 1,
      minValue,
      maxValue,
      inputMode: inputModeProp,
      onChange,
      onBlur,
      disabled = false,
      renderControls,
      ...inputProps
    },
    ref
  ) {
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const safePrecision = useMemo(() => {
      if (typeof precision !== 'number' || Number.isNaN(precision)) return 2;
      return clamp(Math.round(precision), 0, 20);
    }, [precision]);

    const safeStep = useMemo(() => {
      if (typeof step !== 'number' || Number.isNaN(step) || step <= 0) return 1;
      return step;
    }, [step]);

    const [effectiveMin, effectiveMax] = useMemo(() => {
      if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
        return [maxValue, minValue] as const;
      }
      return [minValue, maxValue] as const;
    }, [minValue, maxValue]);

    const getPrecisionValue = useCallback((p: number) => {
      return Math.pow(10, p);
    }, []);

    const getNumberValue = useCallback(
      (strValue: string): number => {
        const inputValue = String(strValue || '');
        const hasNegativeSign = inputValue.startsWith('-');

        const onlyDigits = inputValue.replace(/[^0-9]/g, '');

        if (!onlyDigits) {
          return hasNegativeSign ? -0 : 0;
        }

        const numberValue = Number(onlyDigits);
        const parsedValue = numberValue / getPrecisionValue(safePrecision);

        return hasNegativeSign ? -parsedValue : parsedValue;
      },
      [getPrecisionValue, safePrecision]
    );

    const numberFormatter = useMemo(() => {
      const options = {
        style: 'decimal' as const,
        minimumFractionDigits: safePrecision,
        maximumFractionDigits: safePrecision,
      };

      const resolvedLocale = resolveLocale(locale);
      return new Intl.NumberFormat(resolvedLocale, options);
    }, [locale, safePrecision]);

    const formatNumber = useCallback(
      (val: number | string): string => {
        let numberValue: number;

        if (typeof val === 'string') {
          numberValue = getNumberValue(val);
        } else {
          numberValue = val;
        }

        if (!isValidNumber(numberValue)) {
          numberValue = 0;
        }

        numberValue = clampToBounds(numberValue, effectiveMin, effectiveMax);

        const formattedNumber = numberFormatter.format(numberValue);
        const safePrefix = sanitizeString(prefix);
        const safeSuffix = sanitizeString(suffix);

        return `${safePrefix}${formattedNumber}${safeSuffix}`;
      },
      [getNumberValue, numberFormatter, prefix, suffix, effectiveMin, effectiveMax]
    );

    const getInitialValue = useCallback(() => {
      const initial = value !== undefined ? value : 0;
      return formatNumber(initial);
    }, [value, formatNumber]);

    const getInitialNumericValue = useCallback(() => {
      const initial = value !== undefined ? value : 0;
      if (typeof initial === 'string') {
        return getNumberValue(initial);
      }
      return initial;
    }, [value, getNumberValue]);

    const [maskedValue, setMaskedValue] = useState<string>(getInitialValue);
    const numericValueRef = useRef<number>(getInitialNumericValue());
    const selectionRef = useRef<{ digitsBefore: number } | null>(null);

    const useIsomorphicLayoutEffect =
      typeof window !== 'undefined' ? useLayoutEffect : useEffect;

    useIsomorphicLayoutEffect(() => {
      if (selectionRef.current && innerRef.current) {
        const { digitsBefore } = selectionRef.current;
        const newValue = innerRef.current.value;
        let newPos = 0;
        let digitsFound = 0;

        for (let i = 0; i < newValue.length; i++) {
          if (/\d/.test(newValue[i])) {
            digitsFound++;
          }
          newPos = i + 1;
          if (digitsFound >= digitsBefore) {
            break;
          }
        }

        innerRef.current.setSelectionRange(newPos, newPos);
        selectionRef.current = null;
      }
    }, [maskedValue]);

    useEffect(() => {
      if (value === undefined) return;
      const numericVal = typeof value === 'string' ? getNumberValue(value) : value;
      const clamped = clampToBounds(numericVal, effectiveMin, effectiveMax);
      setMaskedValue(formatNumber(clamped));
      numericValueRef.current = clamped;
    }, [value, formatNumber, getNumberValue, effectiveMin, effectiveMax]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target;
        const selectionStart = input.selectionStart || 0;
        const valueBefore = input.value;
        const digitsBefore = valueBefore.substring(0, selectionStart).replace(/\D/g, '').length;

        selectionRef.current = { digitsBefore };

        const rawValue = event.target.value;
        const newValue = getNumberValue(rawValue);

        if (!isValidNumber(newValue)) {
          return;
        }

        const clampedValue = clampToBounds(newValue, effectiveMin, effectiveMax);
        const newMaskedValue = formatNumber(clampedValue);
        setMaskedValue(newMaskedValue);
        numericValueRef.current = clampedValue;

        if (onChange) {
          onChange(event, clampedValue, newMaskedValue);
        }
      },
      [getNumberValue, formatNumber, effectiveMin, effectiveMax, onChange]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const currentValue = getNumberValue(rawValue);
        const clampedValue = clampToBounds(currentValue, effectiveMin, effectiveMax);
        const formattedValue = formatNumber(clampedValue);

        setMaskedValue(formattedValue);
        numericValueRef.current = clampedValue;

        if (onBlur) {
          onBlur(event, clampedValue, formattedValue);
        }
      },
      [getNumberValue, formatNumber, effectiveMin, effectiveMax, onBlur]
    );

    const handleStep = useCallback(
      (delta: number, multiplier: number = 1) => {
        if (disabled) return;

        const currentValue = numericValueRef.current;
        const stepValue = (safeStep / Math.pow(10, safePrecision)) * multiplier;
        const newValue = clampToBounds(
          currentValue + delta * stepValue,
          effectiveMin,
          effectiveMax
        );

        const newMaskedValue = formatNumber(newValue);
        setMaskedValue(newMaskedValue);
        numericValueRef.current = newValue;

        const syntheticEvent = {
          target: {
            value: newMaskedValue,
            name: inputProps.name || '',
            id: inputProps.id || '',
          },
          currentTarget: {
            value: newMaskedValue,
            name: inputProps.name || '',
            id: inputProps.id || '',
          },
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {},
          bubble: true,
          cancelable: false,
          type: 'change',
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
          onChange(syntheticEvent, newValue, newMaskedValue);
        }
      },
      [
        disabled,
        safeStep,
        safePrecision,
        effectiveMin,
        effectiveMax,
        formatNumber,
        onChange,
        inputProps.name,
        inputProps.id,
      ]
    );

    const increment = useCallback(
      (multiplier: number = 1) => handleStep(1, multiplier),
      [handleStep]
    );

    const decrement = useCallback(
      (multiplier: number = 1) => handleStep(-1, multiplier),
      [handleStep]
    );

    const setValue = useCallback(
      (newValue: number) => {
        const clampedValue = clampToBounds(newValue, effectiveMin, effectiveMax);
        const newMaskedValue = formatNumber(clampedValue);
        setMaskedValue(newMaskedValue);
        numericValueRef.current = clampedValue;

        const syntheticEvent = {
          target: {
            value: newMaskedValue,
            name: inputProps.name || '',
            id: inputProps.id || '',
          },
          currentTarget: {
            value: newMaskedValue,
            name: inputProps.name || '',
            id: inputProps.id || '',
          },
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {},
          bubble: true,
          cancelable: false,
          type: 'change',
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
          onChange(syntheticEvent, clampedValue, newMaskedValue);
        }
      },
      [effectiveMin, effectiveMax, formatNumber, onChange, inputProps.name, inputProps.id]
    );

    const inputMode = useMemo(() => {
      if (inputModeProp) {
        return inputModeProp;
      }
      return safePrecision > 0 ? 'decimal' : 'numeric';
    }, [inputModeProp, safePrecision]);

    const inputElement = (
      <input
        ref={innerRef}
        type="text"
        role="spinbutton"
        aria-valuenow={isValidNumber(numericValueRef.current) ? numericValueRef.current : 0}
        aria-valuemin={effectiveMin}
        aria-valuemax={effectiveMax}
        inputMode={inputMode}
        value={maskedValue}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        {...inputProps}
      />
    );

    if (renderControls) {
      const controlsProps: ControlsRenderProps = {
        increment,
        decrement,
        setValue,
        value: numericValueRef.current,
        min: effectiveMin,
        max: effectiveMax,
        disabled,
        step: safeStep,
        precision: safePrecision,
        formattedValue: maskedValue,
      };

      return (
        <>
          {inputElement}
          {renderControls(controlsProps)}
        </>
      );
    }

    if (!showStepButtons) {
      return inputElement;
    }

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={disabled}
          aria-label="Decrease value"
          style={{
            padding: '4px 8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          -
        </button>
        {inputElement}
        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={disabled}
          aria-label="Increase value"
          style={{
            padding: '4px 8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          +
        </button>
      </div>
    );
  }
);

IntlNumberInput.displayName = 'IntlNumberInput';

export default memo(IntlNumberInput);