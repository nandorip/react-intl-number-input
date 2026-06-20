# react-intl-number-input

A React component for masked and formatted number input with `Intl.NumberFormat` locale support.

[Demo](https://nandorip.github.io/react-intl-number-input/example/dist/)

## Requirements

- React: `>=16.8.0 <20`

## Install

```bash
npm install react-intl-number-input
```

## Usage

```javascript
import React, { useState } from 'react';
import IntlNumberInput from 'react-intl-number-input';

function App() {
  const [value, setValue] = useState(0);
  const [maskedValue, setMaskedValue] = useState('0.00');

  const handleChange = (event, nextValue, nextMaskedValue) => {
    setValue(nextValue);
    setMaskedValue(nextMaskedValue);
  };

  return (
    <div>
      <IntlNumberInput onChange={handleChange} />
      <p>value: {value}</p>
      <p>maskedValue: {maskedValue}</p>
    </div>
  );
}
```

### TypeScript

```typescript
import IntlNumberInput, { IntlNumberInputProps } from 'react-intl-number-input';

const props: IntlNumberInputProps = {
  locale: 'pt-BR',
  precision: 2,
  onChange: (event, value, maskedValue) => {
    console.log(value, maskedValue);
  },
};
```

React 18+:

```javascript
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

React 16/17:

```javascript
import ReactDOM from 'react-dom';

ReactDOM.render(<App />, document.getElementById('root'));
```

## Properties

| Name | Type | Default | Description |
| --- | --- | :---: | --- |
| value | `number` \| `string` | `0` | Controlled numeric value |
| locale | `string` | `'en-US'` | BCP 47 language tag ([Intl locales](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation)) |
| prefix | `string` | `''` | Prefix shown in the masked value |
| suffix | `string` | `''` | Suffix shown in the masked value |
| precision | `number` | `2` | Fraction digits (clamped to `0`–`20`) |
| onChange | `function` | — | `(event, value, maskedValue) => void` |
| onBlur | `function` | — | `(event, value, maskedValue) => void` |
| disabled | `boolean` | `false` | Disables the input |
| autoFocus | `boolean` | — | Native input autofocus |
| minValue | `number` | — | Minimum allowed value |
| maxValue | `number` | — | Maximum allowed value |
| showStepButtons | `boolean` | `false` | Renders +/- step buttons |
| step | `number` | `1` | Step increment for buttons |
| inputMode | `'numeric'` \| `'decimal'` | auto | Overrides mobile keyboard mode |
| className | `string` | — | Input CSS class |
| style | `object` | — | Input inline styles |
| id | `string` | — | Input id |
| name | `string` | — | Input name |
| placeholder | `string` | — | Input placeholder |
| readOnly | `boolean` | — | Read-only input |
| required | `boolean` | — | Required input |
| tabIndex | `number` | — | Input tab index |

The component also accepts standard `<input>` attributes such as `ref`, `onFocus`, `onKeyDown`, `aria-*`, `data-*`, and `autoComplete`. Custom `onChange` and `onBlur` callbacks receive the clamped numeric value and the formatted masked string.

## Examples

```javascript
// maskedValue: 1,234,567.89
<IntlNumberInput />
```

```javascript
// maskedValue: 12,345.6789
<IntlNumberInput precision={4} />
```

```javascript
// maskedValue: $1,234,567.89
<IntlNumberInput prefix="$" />
```

```javascript
// maskedValue: 1,234%
<IntlNumberInput suffix="%" precision={0} />
```

```javascript
// maskedValue: R$ 1.234.567,89
<IntlNumberInput locale="pt-BR" prefix="R$ " precision={2} />
```

```javascript
// With min/max and step buttons
<IntlNumberInput
  value={50}
  minValue={0}
  maxValue={100}
  step={5}
  precision={0}
  showStepButtons
  onChange={(event, value) => console.log(value)}
/>
```

## How input works

Users type digits; the component applies locale formatting and optional prefix/suffix. For `precision={2}`, typing `1234` becomes `12.34`. Negative values are supported when `-` is present in the input.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing, and publishing instructions.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.