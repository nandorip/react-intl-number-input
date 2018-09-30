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
...

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
