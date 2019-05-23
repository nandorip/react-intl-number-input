
import React from 'react';
import { render } from 'react-dom';
import IntlNumberInput from '../src';

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
        <h3>react-intl-number-input</h3>
        <p>
          <IntlNumberInput onChange={this.handleChange} />
        </p>
        <p>
          <IntlNumberInput
            precision={4}
            onChange={this.handleChange}
          />
        </p>
        <p>
          <IntlNumberInput
            prefix="$"
            onChange={this.handleChange}
          />
        </p>
        <p>
          <IntlNumberInput
            suffix="%"
            precision={0}
            onChange={this.handleChange}
          />
        </p>
        <p>
          <IntlNumberInput
            locale="pt-BR"
            prefix="R$ "
            precision={2}
            onChange={this.handleChange}
          />
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
