import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  memo,
  forwardRef,
} from 'react';

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
};

export type IntlNumberInputProps = IntlNumberInputOwnProps &
  Omit<
    React.ComponentPropsWithoutRef<'input'>,
    keyof IntlNumberInputOwnProps | 'value' | 'type' | 'defaultValue' | 'children'
  >;

function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '');
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
      ...inputProps
    },
    ref
  ) {
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
        const hasNegativeSign = inputValue.includes('-');

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

    const [maskedValue, setMaskedValue] = useState<string>(getInitialValue);

    useEffect(() => {
      setMaskedValue(formatNumber(value ?? 0));
    }, [value, formatNumber]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const newValue = getNumberValue(rawValue);

        if (!isValidNumber(newValue)) {
          return;
        }

        const clampedValue = clampToBounds(newValue, effectiveMin, effectiveMax);
        const newMaskedValue = formatNumber(clampedValue);
        setMaskedValue(newMaskedValue);

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

        if (onBlur) {
          onBlur(event, clampedValue, formattedValue);
        }
      },
      [getNumberValue, formatNumber, effectiveMin, effectiveMax, onBlur]
    );

    const handleStep = useCallback(
      (delta: number) => {
        if (disabled) return;

        const currentValue = getNumberValue(maskedValue);
        const stepValue = safeStep * Math.pow(10, safePrecision);
        const newValue = clampToBounds(
          currentValue + delta * stepValue,
          effectiveMin,
          effectiveMax
        );

        const newMaskedValue = formatNumber(newValue);
        setMaskedValue(newMaskedValue);

        const syntheticEvent = {
          target: {
            value: newMaskedValue,
            name: inputProps.name || '',
            id: inputProps.id || '',
          },
          preventDefault: () => {},
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
          onChange(syntheticEvent, newValue, newMaskedValue);
        }
      },
      [
        disabled,
        getNumberValue,
        maskedValue,
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

    const inputMode = useMemo(() => {
      if (inputModeProp) {
        return inputModeProp;
      }
      return safePrecision > 0 ? 'decimal' : 'numeric';
    }, [inputModeProp, safePrecision]);

    const inputElement = (
      <input
        ref={ref}
        type="text"
        inputMode={inputMode}
        value={maskedValue}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        {...inputProps}
      />
    );

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