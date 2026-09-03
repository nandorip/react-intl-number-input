import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import IntlNumberInput, { IntlNumberInputProps } from '../src';

interface DemoCardProps {
  title: string;
  description: string;
  hint?: string;
  initialValue?: number;
  initialMasked?: string;
  inputProps?: Partial<IntlNumberInputProps>;
  renderExtra?: (ref: React.RefObject<HTMLInputElement | null>) => React.ReactNode;
}

function DemoCard({
  title,
  description,
  hint,
  initialValue = 0,
  initialMasked,
  inputProps,
  renderExtra,
}: DemoCardProps) {
  const [value, setValue] = useState(initialValue);
  const [maskedValue, setMaskedValue] = useState(initialMasked);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    nextValue: number,
    nextMaskedValue: string
  ) => {
    setValue(nextValue);
    setMaskedValue(nextMaskedValue);
  };

  return (
    <article className="demo-card">
      <h2>{title}</h2>
      <p>{description}</p>
      {hint ? <p>{hint}</p> : null}
      <IntlNumberInput
        ref={inputRef}
        className="demo-input"
        value={value}
        onChange={handleChange}
        {...inputProps}
      />
      {renderExtra ? renderExtra(inputRef) : null}
      <div className="demo-output">
        value
        <span>{value}</span>
        maskedValue
        <span>{maskedValue ?? '—'}</span>
      </div>
    </article>
  );
}

const EXAMPLES: DemoCardProps[] = [
  {
    title: 'Default',
    description: 'Two decimal places with en-US formatting.',
    hint: 'Type 1234 → 12.34',
    initialValue: 0,
    initialMasked: '0.00',
    inputProps: {},
  },
  {
    title: 'High precision',
    description: 'Four fraction digits for rates or FX.',
    hint: 'Type 123456 → 12.3456',
    initialValue: 0,
    initialMasked: '0.0000',
    inputProps: { precision: 4 },
  },
  {
    title: 'Currency prefix',
    description: 'Dollar prefix before the formatted number.',
    hint: 'Type 1234567 → $1,234,567.00',
    initialValue: 0,
    initialMasked: '$0.00',
    inputProps: { prefix: '$' },
  },
  {
    title: 'Percentage',
    description: 'Suffix with two decimal places.',
    hint: 'Type 1250 → 12.50%',
    initialValue: 0,
    initialMasked: '0.00%',
    inputProps: { suffix: '%', precision: 2 },
  },
  {
    title: 'Brazilian Real',
    description: 'pt-BR locale with comma decimals.',
    hint: 'Type 123456 → R$ 1.234,56',
    initialValue: 0,
    initialMasked: 'R$ 0,00',
    inputProps: { locale: 'pt-BR', prefix: 'R$ ', precision: 2 },
  },
  {
    title: 'Step buttons',
    description: 'Increment and decrement with min/max bounds.',
    hint: 'Starts at 50, step 5, range 0–100',
    initialValue: 50,
    initialMasked: '50',
    inputProps: {
      minValue: 0,
      maxValue: 100,
      step: 5,
      precision: 0,
      showStepButtons: true,
    },
  },
  {
    title: 'Custom controls',
    description: 'renderControls for your own stepper UI and layout.',
    hint: 'Starts at 12.34, step 0.01, range 0–100',
    initialValue: 12.34,
    initialMasked: '12.34',
    inputProps: {
      minValue: 0,
      maxValue: 100,
      step: 1,
      precision: 2,
      renderControls: ({ increment, decrement, formattedValue, disabled }: any) => (
        <div className="demo-controls">
          <button type="button" onClick={() => decrement()} disabled={disabled}>
            −
          </button>
          <span>{formattedValue}</span>
          <button type="button" onClick={() => increment()} disabled={disabled}>
            +
          </button>
        </div>
      ),
    },
  },
  {
    title: 'Ref & Imperative API',
    description: 'Use forwardRef to access the underlying input or focus it.',
    hint: 'Click the button to focus the input programmatically.',
    initialValue: 100,
    initialMasked: '100.00',
    inputProps: { id: 'ref-example' },
    renderExtra: (inputRef: React.RefObject<HTMLInputElement | null>) => (
      <button
        type="button"
        className="demo-button"
        onClick={() => inputRef.current?.focus()}
        style={{ marginTop: '8px', width: '100%' }}
      >
        Focus Input
      </button>
    ),
  },
];

function App() {
  return (
    <div className="demo">
      <header className="demo-header">
        <h1>react-intl-number-input</h1>
        <p>
          Masked number input with locale-aware formatting via{' '}
          <code>Intl.NumberFormat</code>.
        </p>
        <div className="demo-links">
          <a
            href="https://github.com/nandorip/react-intl-number-input"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/react-intl-number-input"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            href="https://github.com/nandorip/react-intl-number-input#readme"
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </a>
        </div>
      </header>

      <p className="demo-tip">
        <strong>How to type:</strong> enter digits only — the decimal separator
        is implied by <code>precision</code>. For <code>precision={'{2}'}</code>,
        typing <code>1250</code> becomes <code>12.50</code>.
      </p>

      <main className="demo-grid">
        {EXAMPLES.map((example) => (
          <DemoCard key={example.title} {...example} />
        ))}
      </main>

      <footer className="demo-footer">
        MIT License ·{' '}
        <a
          href="https://github.com/nandorip/react-intl-number-input"
          target="_blank"
          rel="noreferrer"
        >
          nandorip/react-intl-number-input
        </a>
      </footer>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}