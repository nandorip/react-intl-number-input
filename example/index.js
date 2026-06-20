import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import IntlNumberInput from '../src';

function DemoCard({ title, description, hint, initialValue = 0, initialMasked, inputProps }) {
  const [value, setValue] = useState(initialValue);
  const [maskedValue, setMaskedValue] = useState(initialMasked);

  const handleChange = (event, nextValue, nextMaskedValue) => {
    setValue(nextValue);
    setMaskedValue(nextMaskedValue);
  };

  return (
    <article className="demo-card">
      <h2>{title}</h2>
      <p>{description}</p>
      {hint ? <p>{hint}</p> : null}
      <IntlNumberInput
        className="demo-input"
        value={value}
        onChange={handleChange}
        {...inputProps}
      />
      <div className="demo-output">
        value
        <span>{value}</span>
        maskedValue
        <span>{maskedValue ?? '—'}</span>
      </div>
    </article>
  );
}

const EXAMPLES = [
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
const root = createRoot(rootElement);
root.render(<App />);