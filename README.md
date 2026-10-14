# react-intl-number-input

A React number input with implied decimal places and locale formatting through `Intl.NumberFormat`. For money-style entry, typing `1234` with two decimal places produces `12.34`.

[Interactive demo](https://nandorip.github.io/react-intl-number-input/)

## Requirements

- React: `>=16.8.0 <20`
- Node.js: `>=20` for installation and local development (declared in the npm package's `engines` field). The component runs in the browser.

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

```tsx
import React, { useState } from 'react';
import IntlNumberInput, {
  IntlNumberInputProps,
} from 'react-intl-number-input';

function App() {
  const [value, setValue] = useState<number>(0);

  const handleChange: IntlNumberInputProps['onChange'] = (event, val, masked) => {
    setValue(val);
    console.log('Numeric:', val, 'Masked:', masked);
  };

  return <IntlNumberInput controlled value={value} onChange={handleChange} locale="pt-BR" />;
}
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
| value | `number` \| `string` | `0` | Initial/synchronized value; numbers use numeric units, strings use implied-decimal parsing |
| controlled | `boolean` | `false` | Keep `value` authoritative, including when the parent rejects an edit |
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
| showStepButtons | `boolean` | `false` | Renders built-in +/- step buttons (ignored when `renderControls` is set) |
| renderControls | `function` | — | `(props: ControlsRenderProps) => ReactNode` — custom stepper UI |
| step | `number` | `1` | Step in scaled digit units: the increment is `step / 10 ** precision` (e.g. `1` with `precision={2}` adds `0.01`) |
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

### Value modes and compatibility

By default, the component preserves its historical behavior: `value` initializes the field and a changed `value` updates it, while local edits remain visible if the parent leaves `value` unchanged. Without `value`, the component manages its own numeric state.

For strict controlled behavior, use `controlled` and update `value` from `onChange`. Rejected edits emit the proposed numeric value and mask, but the input and custom controls retain the parent's value:

```jsx
<IntlNumberInput
  controlled
  value={value}
  onChange={(_event, nextValue) => setValue(nextValue)}
/>
```

The default remains compatible with existing integrations, including those that use a fixed `value` as an initial amount. `controlled` requires no changes to callback signatures.

String values use the same implied-decimal parser as typing: with `precision={2}`, `value="1234"` means `12.34`, while `value={1234}` means `1,234.00`. Prefer numbers for programmatic values. Changing precision reformats existing internal numeric state without rescaling it; rounding for display does not discard hidden fraction digits.

Typing forwards the original React change event. Buttons and custom setters deliver a programmatic change event whose `target` and `currentTarget` are the actual input element, containing the proposed mask during the callback. Use the second and third callback arguments for numeric and formatted values consistently across both kinds of changes. These programmatic callbacks do not dispatch an additional DOM change event.

## Accessibility (a11y)

The component is built with accessibility in mind:
- Uses `role="spinbutton"` to identify as a numeric input.
- Provides `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes.
- Provides the formatted value as `aria-valuetext`, including any prefix and suffix.
- Supports Arrow Up and Arrow Down to adjust by one step; Shift plus an arrow adjusts by ten steps. Your `onKeyDown` handler runs first and can prevent the adjustment.
- Support for `forwardRef` allows linking labels and managing focus programmatically.
- Built-in step buttons have descriptive `aria-label` attributes.

Associate each input with a visible `<label htmlFor="...">`, `aria-labelledby`, or `aria-label`. `readOnly` prevents changes from typing, arrow keys, built-in buttons and custom setters; custom controls also receive `readOnly`.

## Examples

### Basic Usage

```javascript
// maskedValue: 1,234,567.89
<IntlNumberInput value={1234567.89} />
```

```javascript
// maskedValue: 12,345.6789
<IntlNumberInput value={12345.6789} precision={4} />
```

```javascript
// maskedValue: $1,234,567.89
<IntlNumberInput value={1234567.89} prefix="$" />
```

```javascript
// maskedValue: 1,234%
<IntlNumberInput value={1234} suffix="%" precision={0} />
```

```javascript
// maskedValue: 12.50% — type digits only; decimal is implied by precision
<IntlNumberInput value={12.5} suffix="%" precision={2} />
```

```javascript
// maskedValue: R$ 1.234.567,89
<IntlNumberInput value={1234567.89} locale="pt-BR" prefix="R$ " precision={2} />
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

```javascript
// Custom controls (layout is up to you — wrap in a parent div as needed)
<div className="amount-field">
  <IntlNumberInput
    value={12.34}
    precision={2}
    step={1}
    minValue={0}
    maxValue={100}
    onChange={(event, value) => console.log(value)}
    renderControls={({ increment, decrement, setValue, value, formattedValue, min, max, disabled, readOnly }) => (
      <div className="amount-controls">
        <button type="button" onClick={() => decrement()} disabled={disabled || readOnly}>-</button>
        <span>{formattedValue}</span>
        <button type="button" onClick={() => increment()} disabled={disabled || readOnly}>+</button>
        <button type="button" onClick={() => setValue(max ?? value)} disabled={disabled || readOnly}>
          Max
        </button>
      </div>
    )}
  />
</div>
```

### Programmatic Focus (ref)

```javascript
import React, { useRef } from 'react';
import IntlNumberInput from 'react-intl-number-input';

function FocusExample() {
  const inputRef = useRef(null);

  return (
    <>
      <IntlNumberInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>
        Focus Input
      </button>
    </>
  );
}
```

`renderControls` replaces `showStepButtons` when both are provided. The component renders the `<input>` and your controls as siblings (no wrapper), so you control layout in the parent.

## How input works

Users type digits; the component applies locale formatting and optional prefix/suffix. For `precision={2}`, typing `1234` becomes `12.34`. Negative values are supported when `-` is present in the input.

ASCII digits and the locale's digits are accepted, including Arabic-Indic, Han decimal and supplementary-plane digits. Edits confined to the configured prefix or suffix preserve the amount and restore the affix. Prefixes and suffixes are display adornments; a `%` suffix does not multiply or divide the numeric value.

For compatibility, clearing the input produces zero (or the nearest allowed bound). Empty and missing values are not represented separately: `required` cannot detect a missing amount and `placeholder` is normally hidden. Validate absence separately in your form if needed. Bounds apply immediately; typing an intermediate value below the minimum may therefore clamp it before typing is complete.

The numeric API uses JavaScript `number`. Precision controls formatting, not arbitrary-precision arithmetic. Stepping avoids floating-point accumulation when the scaled operands fit safe integers; very large values or high precision retain the limitations of JavaScript numbers.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing, and publishing instructions.

Before publishing, run `npm run check`. It verifies tests, the demo's types, both builds and an installed npm tarball, including its type declarations and runtime entry points.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
