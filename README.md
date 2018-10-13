# react-intl-number-input
A React component for masked and formatted number input.

[Demo](https://nandorip.github.io/react-intl-number-input/example/dist/)

## Install

```
npm install react-intl-number-input
```

## Usage

```javascript
import React from 'react'
import { render } from 'react-dom';
import IntlNumberInput from 'react-intl-number-input';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 0,
      maskedValue: 0,
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, value, maskedValue) {
    event.preventDefault();
    this.setState({ value, maskedValue });
  }

  render() {
    return (
      <div>
        <p>
          <IntlNumberInput onChange={this.handleChange} />
        </p>
        <p>
          value: {this.state.value}
        </p>
        <p>
          maskedValue: {this.state.maskedValue}
        </p>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
```

## Properties

| Name | Type | Default Value | Description |
| --- | --- | :---: | --- |
| value | number or string | 0 | Initial numeric value |
| locale | string | 'en-US' | BCP 47 language tag. Defines a language code and a country or region code.<br>[Intl Locale Identification](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation) *e.g.* 'de-DE', 'pt-BR' and 'ja-JP' |
| prefix | string | '' | String used as prefix for the masked value |
| suffix | string  | '' | String used as suffix for the masked value |
| precision | number | 2 | Number of fraction digits to use |
| onChange | function | n/a | `(event, value, maskedValue) => {}`<br>Callback function to handle value changes |

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
    <IntlNumberInput
      locale="pt-BR"
      prefix="R$ "
      precision={2}
    />
```
