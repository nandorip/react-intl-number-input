import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import IntlNumberInput from '../src';

function App() {
  const [value, setValue] = useState(0);
  const [maskedValue, setMaskedValue] = useState('0.00');

  const handleChange = (event, nextValue, nextMaskedValue) => {
    setValue(nextValue);
    setMaskedValue(nextMaskedValue);
  };

  return (
    <div>
      <h3>react-intl-number-input</h3>
      <p>
        <IntlNumberInput onChange={handleChange} />
      </p>
      <p>
        <IntlNumberInput precision={4} onChange={handleChange} />
      </p>
      <p>
        <IntlNumberInput prefix="$" onChange={handleChange} />
      </p>
      <p>
        <IntlNumberInput suffix="%" precision={0} onChange={handleChange} />
      </p>
      <p>
        <IntlNumberInput
          locale="pt-BR"
          prefix="R$ "
          precision={2}
          onChange={handleChange}
        />
      </p>
      <p>
        <IntlNumberInput
          value={50}
          minValue={0}
          maxValue={100}
          step={5}
          precision={0}
          showStepButtons
          onChange={handleChange}
        />
      </p>
      <p>value: {value}</p>
      <p>maskedValue: {maskedValue}</p>
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);